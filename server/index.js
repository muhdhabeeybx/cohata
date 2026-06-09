import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// ─── DB connection ────────────────────────────────────────────────────────────

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("MONGODB_URI env var is required");
  process.exit(1);
}

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.error("MongoDB connection error (server still running):", e.message));

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

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : ["http://localhost:8080", "http://localhost:3000"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ─── Bookings ─────────────────────────────────────────────────────────────────

app.get("/api/bookings", async (_req, res) => {
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

app.patch("/api/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ error: "Not found" });
    res.json(booking);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete("/api/bookings/:id", async (req, res) => {
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

app.put("/api/availability", async (req, res) => {
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

app.put("/api/program-dates", async (req, res) => {
  try {
    res.json(await setSetting("programDates", req.body));
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

app.post("/api/programs", async (req, res) => {
  try {
    const program = await ProgramModel.create(req.body);
    res.status(201).json(program);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.patch("/api/programs/:id", async (req, res) => {
  try {
    const program = await ProgramModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!program) return res.status(404).json({ error: "Not found" });
    res.json(program);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete("/api/programs/:id", async (req, res) => {
  try {
    const result = await ProgramModel.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => console.log(`COHATA API running on port ${PORT}`));
