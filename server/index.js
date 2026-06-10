import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ─── DB connection ────────────────────────────────────────────────────────────

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("MONGODB_URI env var is required");
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("JWT_SECRET env var is required");
  process.exit(1);
}

mongoose.set("bufferCommands", false);
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 })
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.error("MongoDB connection error:", e.message));

// ─── Schemas ──────────────────────────────────────────────────────────────────

const bookingSchema = new mongoose.Schema({
  name:           { type: String, required: true },
  phone:          { type: String, required: true },
  email:          String,
  program:        { type: String, required: true },
  status:         { type: String, default: "Pending" },
  enrollmentDate: String,
  sessionDate:    String,
  sessionTime:    String,
  notes:          String,
  createdAt:      { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

// Transform _id → id in every JSON response
bookingSchema.set("toJSON", {
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret._id; return ret; },
});

const Booking = mongoose.model("Booking", bookingSchema);

// Availability and ProgramDates are singleton documents (one per collection)
const settingSchema = new mongoose.Schema({ _id: String, data: mongoose.Schema.Types.Mixed }, { versionKey: false });
const Setting = mongoose.model("Setting", settingSchema);

// Programs (CMS)
const programSchema = new mongoose.Schema({
  title:           { type: String, required: true },
  tag:             { type: String, default: "" },
  description:     { type: String, default: "" },
  fullDescription: { type: String, default: "" },
  duration:        { type: String, default: "" },
  startDate:       { type: String, default: "" },
  price:           { type: String, default: "" },
  imageUrl:        { type: String, default: "" },
  status:          { type: String, default: "active" },   // "active" | "draft"
  enrollmentOpen:  { type: Boolean, default: true },
  order:           { type: Number, default: 0 },
  createdAt:       { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

programSchema.set("toJSON", {
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret._id; return ret; },
});

const ProgramModel = mongoose.model("Program", programSchema);

// ─── Users / roles ────────────────────────────────────────────────────────────

const ROLES = ["admin", "finance", "bookings", "programs"];

const userSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name:         { type: String, required: true },
  role:         { type: String, enum: ROLES, required: true },
  createdAt:    { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

userSchema.set("toJSON", {
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret._id; delete ret.passwordHash; return ret; },
});

const User = mongoose.model("User", userSchema);

// ─── Auth middleware ──────────────────────────────────────────────────────────

function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role, name: payload.name, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

const DEFAULT_AVAILABILITY = {
  days: ["mon", "tue", "wed", "thu", "fri"],
  startTime: "09:00",
  endTime: "17:00",
  slotMinutes: 60,
  blockedDates: [],
};

async function getSetting(key, fallback) {
  const doc = await Setting.findById(key);
  return doc ? doc.data : fallback;
}

async function setSetting(key, data) {
  await Setting.findByIdAndUpdate(key, { data }, { upsert: true, new: true });
  return data;
}

// ─── App ──────────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 3001;

// Open CORS — Netlify proxy is the auth boundary on the deployed site;
// here we accept all origins so cohatacademy.com and localhost both work.
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });
    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "30d" }
    );
    res.json({ token, user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.post("/api/auth/change-password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "Current and new password are required" });
    if (newPassword.length < 8) return res.status(400).json({ error: "New password must be at least 8 characters" });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect" });
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Team / user management (admin only) ──────────────────────────────────────

app.get("/api/users", authenticate, requireRole("admin"), async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: 1 });
    res.json(users);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/users", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name || !role) return res.status(400).json({ error: "Name, email, password, and role are required" });
    if (!ROLES.includes(role)) return res.status(400).json({ error: `Role must be one of: ${ROLES.join(", ")}` });
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email: String(email).toLowerCase().trim(), passwordHash, name, role });
    res.status(201).json(user);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: "A user with that email already exists" });
    res.status(400).json({ error: e.message });
  }
});

app.delete("/api/users/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ error: "You cannot remove your own account" });
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ─── Bookings ─────────────────────────────────────────────────────────────────

// Public — used by the booking page to grey out already-taken slots, without exposing client details.
app.get("/api/booked-slots", async (_req, res) => {
  try {
    const bookings = await Booking.find({}, "sessionDate sessionTime status");
    res.json(bookings);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/bookings", authenticate, requireRole("admin", "finance", "bookings"), async (_req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.patch("/api/bookings/:id", authenticate, requireRole("admin", "bookings"), async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ error: "Not found" });
    res.json(booking);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete("/api/bookings/:id", authenticate, requireRole("admin", "bookings"), async (req, res) => {
  try {
    const result = await Booking.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ─── Availability ─────────────────────────────────────────────────────────────

app.get("/api/availability", async (_req, res) => {
  try {
    res.json(await getSetting("availability", DEFAULT_AVAILABILITY));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/availability", authenticate, requireRole("admin", "bookings"), async (req, res) => {
  try {
    res.json(await setSetting("availability", req.body));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ─── Program dates ────────────────────────────────────────────────────────────

app.get("/api/program-dates", async (_req, res) => {
  try {
    res.json(await getSetting("programDates", {}));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/program-dates", authenticate, requireRole("admin", "bookings", "programs"), async (req, res) => {
  try {
    res.json(await setSetting("programDates", req.body));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ─── Maintenance mode ─────────────────────────────────────────────────────────

app.get("/api/maintenance", async (_req, res) => {
  try {
    res.json(await getSetting("maintenance", { enabled: false }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put("/api/maintenance", authenticate, requireRole("admin"), async (req, res) => {
  try {
    res.json(await setSetting("maintenance", req.body));
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// ─── Programs ─────────────────────────────────────────────────────────────────

app.get("/api/programs", async (req, res) => {
  try {
    const filter = req.query.all === "true" ? {} : { status: "active" };
    const programs = await ProgramModel.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(programs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/programs", authenticate, requireRole("admin", "programs"), async (req, res) => {
  try {
    const program = await ProgramModel.create(req.body);
    res.status(201).json(program);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.patch("/api/programs/:id", authenticate, requireRole("admin", "programs"), async (req, res) => {
  try {
    const program = await ProgramModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!program) return res.status(404).json({ error: "Not found" });
    res.json(program);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete("/api/programs/:id", authenticate, requireRole("admin", "programs"), async (req, res) => {
  try {
    const result = await ProgramModel.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => console.log(`COHATA API running on port ${PORT}`));
