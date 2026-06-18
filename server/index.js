import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Resend } from "resend";

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

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
if (!PAYSTACK_SECRET_KEY) {
  console.warn("PAYSTACK_SECRET_KEY env var is not set — paid enrollments will be disabled until it is configured.");
}

const FRONTEND_URL = process.env.FRONTEND_URL || "https://cohatacademy.com";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "COHATA <hello@cohatacademy.com>";
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
if (!resend) {
  console.warn("RESEND_API_KEY env var is not set — booking confirmation emails will be disabled.");
}

const TERMII_API_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || "COHATA";
if (!TERMII_API_KEY) {
  console.warn("TERMII_API_KEY env var is not set — booking confirmation SMS will be disabled.");
}

// Normalizes Nigerian numbers (+234..., 0..., 234..., with spaces/dashes) to Termii's
// expected "234XXXXXXXXXX" format.
function normalizeNigerianPhone(phone) {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return `234${digits.slice(1)}`;
  if (digits.length === 10) return `234${digits}`;
  return digits;
}

mongoose.set("bufferCommands", false);
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 })
  .then(() => console.log("MongoDB connected"))
  .catch((e) => console.error("MongoDB connection error:", e.message));

// ─── Schemas ──────────────────────────────────────────────────────────────────

const bookingSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  phone:            { type: String, required: true },
  email:            String,
  program:          { type: String, required: true },
  status:           { type: String, default: "Pending" },
  enrollmentDate:   String,
  sessionDate:      String,
  sessionTime:      String,
  notes:            String,
  hours:            Number,   // selected hours (for per-hour session types)
  amountDue:        Number,   // pricePerHour × hours, in Naira; 0 = free
  paymentStatus:    String,   // "pending" | "paid" | "failed"
  paymentReference: String,
  amountPaid:       Number,   // in Naira
  currency:         String,
  paidAt:           String,
  createdAt:        { type: String, default: () => new Date().toISOString() },
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
  amount:          { type: Number, default: 0 },   // ₦, shown on site and used for Paystack charge — 0 means free enrollment
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

// Session Types (admin-managed, shown on booking page)
const sessionTypeSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  description:   { type: String, default: "" },
  pricePerHour:  { type: Number, default: 0 },    // ₦ per hour; 0 = free
  minHours:      { type: Number, default: 1 },
  maxHours:      { type: Number, default: 4 },
  isActive:      { type: Boolean, default: true },
  order:         { type: Number, default: 0 },
  createdAt:     { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

sessionTypeSchema.set("toJSON", {
  transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret._id; return ret; },
});

const SessionType = mongoose.model("SessionType", sessionTypeSchema);

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

// ─── Paystack ─────────────────────────────────────────────────────────────────

async function paystackRequest(path, options = {}) {
  const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!res.ok || json.status === false) {
    throw new Error(json.message || "Paystack request failed");
  }
  return json.data;
}

// Marks a booking paid from a verified Paystack transaction. Idempotent — safe to
// call from both the verify endpoint and the webhook for the same reference.
async function markBookingPaid(tx) {
  const booking = await Booking.findOne({ paymentReference: tx.reference });
  if (!booking || booking.paymentStatus === "paid") return booking;
  booking.paymentStatus = "paid";
  booking.amountPaid = tx.amount / 100;
  booking.currency = tx.currency;
  booking.paidAt = new Date().toISOString();
  if (booking.status === "Pending") booking.status = "Approved";
  await booking.save();
  await notifyNewBooking(booking);
  return booking;
}

// ─── Email ────────────────────────────────────────────────────────────────────
// Edit the HTML/copy below to change what either email says.

function bookingDetailsHtml(booking) {
  const isSession = !!(booking.sessionDate && booking.sessionTime);
  const detailsHtml = isSession
    ? `<p style="margin:4px 0;"><strong>Session:</strong> ${booking.program}</p>
       <p style="margin:4px 0;"><strong>Date:</strong> ${booking.sessionDate}</p>
       <p style="margin:4px 0;"><strong>Time:</strong> ${booking.sessionTime}${booking.hours ? ` &middot; ${booking.hours} ${booking.hours === 1 ? "hour" : "hours"}` : ""}</p>`
    : `<p style="margin:4px 0;"><strong>Program:</strong> ${booking.program}</p>`;

  const paymentHtml = booking.paymentStatus === "paid"
    ? `<p style="margin:4px 0;"><strong>Amount paid:</strong> ₦${Number(booking.amountPaid || 0).toLocaleString("en-NG")}</p>`
    : "";

  return { isSession, detailsHtml, paymentHtml };
}

// Sent to the client who made the booking/enrollment.
async function sendClientConfirmationEmail(booking) {
  if (!resend || !booking.email) return;
  const { isSession, detailsHtml, paymentHtml } = bookingDetailsHtml(booking);
  const subject = isSession ? `You're booked: ${booking.program}` : `Enrollment received: ${booking.program}`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: booking.email,
      subject,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="color:#0f4c3a; margin-bottom: 4px;">Assalamu Alaikum ${booking.name},</h2>
          <p>${isSession ? "Your session has been booked." : "We've received your enrollment request."}</p>
          <div style="background:#f7f7f5; border-radius:12px; padding:16px 20px; margin:20px 0;">
            ${detailsHtml}
            ${paymentHtml}
          </div>
          <p>Our team will reach out shortly with next steps, in shā' Allāh.</p>
          <p style="color:#888; font-size:12px; margin-top:32px;">COHATA &mdash; Coach Halima Transformational Academy</p>
        </div>
      `,
    });
  } catch (e) {
    console.error("Failed to send client confirmation email:", e.message);
  }
}

// Sent to every staff user in Team & Access, regardless of role.
async function sendAdminNotificationEmail(booking) {
  if (!resend) return;
  const staff = await User.find({}, "email");
  const recipients = staff.map((u) => u.email).filter(Boolean);
  if (recipients.length === 0) return;

  const { isSession, detailsHtml, paymentHtml } = bookingDetailsHtml(booking);
  const kind = isSession ? "session booking" : "program enrollment";
  const subject = `New ${kind}: ${booking.name} — ${booking.program}`;

  try {
    await resend.emails.send({
      from: EMAIL_FROM,
      to: recipients,
      subject,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="color:#0f4c3a; margin-bottom: 4px;">New ${kind}</h2>
          <p style="margin:4px 0;"><strong>Client:</strong> ${booking.name}</p>
          <p style="margin:4px 0;"><strong>Phone:</strong> ${booking.phone}</p>
          ${booking.email ? `<p style="margin:4px 0;"><strong>Email:</strong> ${booking.email}</p>` : ""}
          <div style="background:#f7f7f5; border-radius:12px; padding:16px 20px; margin:20px 0;">
            ${detailsHtml}
            ${paymentHtml}
          </div>
          ${booking.notes ? `<p style="margin:4px 0;"><strong>Notes:</strong> ${booking.notes}</p>` : ""}
          <p><a href="${FRONTEND_URL}/admin/dashboard" style="color:#0f4c3a;">Open the admin dashboard &rarr;</a></p>
        </div>
      `,
    });
  } catch (e) {
    console.error("Failed to send admin notification email:", e.message);
  }
}

// Sent to the client via Termii. Edit the message copy below to change what it says.
async function sendClientConfirmationSms(booking) {
  if (!TERMII_API_KEY || !booking.phone) return;
  const isSession = !!(booking.sessionDate && booking.sessionTime);

  const message = isSession
    ? `Asalamu Alaikum ${booking.name}, your ${booking.program} session on ${booking.sessionDate} at ${booking.sessionTime} is confirmed. We'll be in touch with next steps. - COHATA`
    : `Asalamu Alaikum ${booking.name}, your ${booking.program} enrollment has been received. We'll be in touch with next steps. - COHATA`;

  try {
    const res = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TERMII_API_KEY,
        to: normalizeNigerianPhone(booking.phone),
        from: TERMII_SENDER_ID,
        sms: message,
        type: "plain",
        channel: "generic",
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      console.error("Termii SMS not sent:", json);
    }
  } catch (e) {
    console.error("Failed to send confirmation SMS:", e.message);
  }
}

// Call this whenever a booking/enrollment is created or confirmed paid —
// notifies both the client (email + SMS) and every staff user (email) in one go.
async function notifyNewBooking(booking) {
  await Promise.all([
    sendClientConfirmationEmail(booking),
    sendClientConfirmationSms(booking),
    sendAdminNotificationEmail(booking),
  ]);
}

// ─── App ──────────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 3001;

// Open CORS — Netlify proxy is the auth boundary on the deployed site;
// here we accept all origins so cohatacademy.com and localhost both work.
app.use(cors());
// Capture the raw body alongside the parsed JSON so the Paystack webhook can verify its signature.
app.use(express.json({ limit: "15mb", verify: (req, _res, buf) => { req.rawBody = buf; } }));

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

app.patch("/api/users/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    user.passwordHash = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
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
    const bookings = await Booking.find({}, "sessionDate sessionTime status hours");
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
    await notifyNewBooking(booking);
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

// ─── Payments (Paystack) ────────────────────────────────────────────────────────

// Public — starts a paid enrollment. Creates a Pending/unpaid booking, then asks
// Paystack for a hosted checkout link the browser can redirect to.
app.post("/api/payments/initialize", async (req, res) => {
  try {
    if (!PAYSTACK_SECRET_KEY) return res.status(503).json({ error: "Online payments are not configured yet" });
    const { programId, name, email, phone, notes } = req.body;
    if (!programId || !name || !email || !phone) {
      return res.status(400).json({ error: "Program, name, email, and phone are required" });
    }
    const program = await ProgramModel.findById(programId);
    if (!program) return res.status(404).json({ error: "Program not found" });
    if (!program.enrollmentOpen || program.status !== "active") {
      return res.status(400).json({ error: "Enrollment is closed for this program" });
    }
    if (!program.amount || program.amount <= 0) {
      return res.status(400).json({ error: "This program does not require online payment" });
    }

    const reference = `cohata_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;

    const booking = await Booking.create({
      name, phone, email, notes,
      program: program.title,
      status: "Pending",
      enrollmentDate: new Date().toISOString().split("T")[0],
      paymentStatus: "pending",
      paymentReference: reference,
      currency: "NGN",
    });

    const origin = req.headers.origin || FRONTEND_URL;
    try {
      const tx = await paystackRequest("/transaction/initialize", {
        method: "POST",
        body: JSON.stringify({
          email,
          amount: Math.round(program.amount * 100),
          currency: "NGN",
          reference,
          callback_url: `${origin}/payment-callback`,
          metadata: { bookingId: booking._id.toString(), programId: program._id.toString(), programTitle: program.title },
        }),
      });
      res.json({ authorization_url: tx.authorization_url, access_code: tx.access_code, reference });
    } catch (paystackError) {
      await Booking.findByIdAndDelete(booking._id);
      throw paystackError;
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Public — starts a paid session booking via Paystack.
app.post("/api/payments/initialize-session", async (req, res) => {
  try {
    if (!PAYSTACK_SECRET_KEY) return res.status(503).json({ error: "Online payments are not configured yet" });
    const { sessionTypeId, name, email, phone, notes, sessionDate, sessionTime, hours } = req.body;
    if (!sessionTypeId || !name || !email || !phone || !sessionDate || !sessionTime || !hours) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const sessionType = await SessionType.findById(sessionTypeId);
    if (!sessionType) return res.status(404).json({ error: "Session type not found" });
    if (!sessionType.isActive) return res.status(400).json({ error: "This session type is not currently available" });
    const amountDue = sessionType.pricePerHour * Number(hours);
    if (amountDue <= 0) return res.status(400).json({ error: "This session type is free — book directly" });

    const reference = `cohata_sess_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
    const booking = await Booking.create({
      name, phone, email, notes: notes || "",
      program: sessionType.name,
      sessionDate, sessionTime,
      hours: Number(hours),
      amountDue,
      status: "Pending",
      enrollmentDate: new Date().toISOString().split("T")[0],
      paymentStatus: "pending",
      paymentReference: reference,
      currency: "NGN",
    });

    const origin = req.headers.origin || FRONTEND_URL;
    try {
      const tx = await paystackRequest("/transaction/initialize", {
        method: "POST",
        body: JSON.stringify({
          email,
          amount: Math.round(amountDue * 100),
          currency: "NGN",
          reference,
          callback_url: `${origin}/payment-callback`,
          metadata: {
            bookingId: booking._id.toString(),
            sessionTypeId: sessionType._id.toString(),
            sessionTypeName: sessionType.name,
            sessionDate, sessionTime, hours: Number(hours),
          },
        }),
      });
      res.json({ authorization_url: tx.authorization_url, access_code: tx.access_code, reference });
    } catch (paystackError) {
      await Booking.findByIdAndDelete(booking._id);
      throw paystackError;
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Public — called by the payment-callback page after Paystack redirects the user back.
app.get("/api/payments/verify/:reference", async (req, res) => {
  try {
    if (!PAYSTACK_SECRET_KEY) return res.status(503).json({ error: "Online payments are not configured yet" });
    const tx = await paystackRequest(`/transaction/verify/${encodeURIComponent(req.params.reference)}`);
    let booking = null;
    if (tx.status === "success") {
      booking = await markBookingPaid(tx);
    } else {
      booking = await Booking.findOne({ paymentReference: req.params.reference });
      if (booking && booking.paymentStatus !== "paid") {
        booking.paymentStatus = "failed";
        await booking.save();
      }
    }
    res.json({
      status: tx.status,
      program: booking?.program,
      amount: tx.amount / 100,
      sessionDate: booking?.sessionDate ?? null,
      sessionTime: booking?.sessionTime ?? null,
      hours: booking?.hours ?? null,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Paystack webhook — confirms payment server-side even if the user never returns
// to the callback page. Verified via the x-paystack-signature header.
app.post("/api/payments/webhook", async (req, res) => {
  try {
    if (!PAYSTACK_SECRET_KEY) return res.status(503).end();
    const signature = req.headers["x-paystack-signature"];
    const expected = crypto.createHmac("sha512", PAYSTACK_SECRET_KEY).update(req.rawBody).digest("hex");
    if (signature !== expected) return res.status(401).end();

    const event = req.body;
    if (event.event === "charge.success") {
      await markBookingPaid(event.data);
    }
    res.status(200).end();
  } catch (e) {
    console.error("Webhook error:", e.message);
    res.status(500).end();
  }
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

// ─── Session Types ────────────────────────────────────────────────────────────

app.get("/api/session-types", async (_req, res) => {
  try {
    const types = await SessionType.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json(types);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/session-types/all", authenticate, requireRole("admin", "bookings"), async (_req, res) => {
  try {
    const types = await SessionType.find().sort({ order: 1, createdAt: 1 });
    res.json(types);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/session-types", authenticate, requireRole("admin", "bookings"), async (req, res) => {
  try {
    const st = await SessionType.create(req.body);
    res.status(201).json(st);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.patch("/api/session-types/:id", authenticate, requireRole("admin", "bookings"), async (req, res) => {
  try {
    const st = await SessionType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!st) return res.status(404).json({ error: "Not found" });
    res.json(st);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

app.delete("/api/session-types/:id", authenticate, requireRole("admin", "bookings"), async (req, res) => {
  try {
    const result = await SessionType.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => console.log(`COHATA API running on port ${PORT}`));
