import express from "express";
import cors from "cors";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

// ─── File-backed in-memory store ─────────────────────────────────────────────

function loadJson(file, fallback) {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, file), "utf8"));
  } catch {
    return fallback;
  }
}

function saveJson(file, data) {
  writeFileSync(join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

let bookings = loadJson("bookings.json", []);
let availability = loadJson("availability.json", {
  days: ["mon", "tue", "wed", "thu", "fri"],
  startTime: "09:00",
  endTime: "17:00",
  slotMinutes: 60,
  blockedDates: [],
});
let programDates = loadJson("program-dates.json", {});

// ─── App setup ────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:8080", "http://localhost:3000"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ─── Bookings ─────────────────────────────────────────────────────────────────

app.get("/api/bookings", (_req, res) => {
  res.json(bookings);
});

app.post("/api/bookings", (req, res) => {
  const booking = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...req.body,
  };
  bookings = [booking, ...bookings];
  saveJson("bookings.json", bookings);
  res.status(201).json(booking);
});

app.patch("/api/bookings/:id", (req, res) => {
  const idx = bookings.findIndex((b) => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  bookings[idx] = { ...bookings[idx], ...req.body };
  saveJson("bookings.json", bookings);
  res.json(bookings[idx]);
});

app.delete("/api/bookings/:id", (req, res) => {
  const before = bookings.length;
  bookings = bookings.filter((b) => b.id !== req.params.id);
  if (bookings.length === before) return res.status(404).json({ error: "Not found" });
  saveJson("bookings.json", bookings);
  res.json({ ok: true });
});

// ─── Availability ─────────────────────────────────────────────────────────────

app.get("/api/availability", (_req, res) => {
  res.json(availability);
});

app.put("/api/availability", (req, res) => {
  availability = { ...availability, ...req.body };
  saveJson("availability.json", availability);
  res.json(availability);
});

// ─── Program dates ────────────────────────────────────────────────────────────

app.get("/api/program-dates", (_req, res) => {
  res.json(programDates);
});

app.put("/api/program-dates", (req, res) => {
  programDates = req.body;
  saveJson("program-dates.json", programDates);
  res.json(programDates);
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`COHATA API running on port ${PORT}`);
});
