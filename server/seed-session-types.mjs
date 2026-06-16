// Run once: node server/seed-session-types.mjs
// Skips any session type whose name already exists.
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) { console.error("No MONGODB_URI in server/.env"); process.exit(1); }

const sessionTypeSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  description:  { type: String, default: "" },
  pricePerHour: { type: Number, default: 0 },
  minHours:     { type: Number, default: 1 },
  maxHours:     { type: Number, default: 4 },
  isActive:     { type: Boolean, default: true },
  order:        { type: Number, default: 0 },
  createdAt:    { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

const SessionType = mongoose.model("SessionType", sessionTypeSchema);

const SESSION_TYPES = [
  {
    name: "Discovery Session",
    description: "A complimentary introductory session to explore your needs, goals, and how Coach Halima can best support your personal journey.",
    order: 1,
  },
  {
    name: "Life / Identity Coaching",
    description: "A deep-dive coaching session to help you uncover your purpose, clarify your sense of self, and build a life that is fully aligned with your values and faith.",
    order: 2,
  },
  {
    name: "Marriage Counseling",
    description: "A guided session for couples or individuals navigating the complexities of marriage — fostering healthier communication, deeper understanding, and stronger bonds.",
    order: 3,
  },
  {
    name: "Family Counseling",
    description: "A supportive session addressing family dynamics, conflict resolution, and building a harmonious home environment rooted in Islamic principles and mutual respect.",
    order: 4,
  },
  {
    name: "Spiritual Development",
    description: "A focused session to strengthen your connection with Allah, develop consistent worship habits, and realign your daily life with your spiritual aspirations.",
    order: 5,
  },
  {
    name: "Hijama Therapy",
    description: "A traditional wet cupping therapy session offering physical detoxification and spiritual renewal, performed in accordance with the Sunnah of the Prophet ﷺ.",
    order: 6,
  },
  {
    name: "The SIRAJ Method™ Certification",
    description: "A structured coaching session built around the SIRAJ Method™ — Coach Halima's transformational framework for achieving clarity, purpose, and sustainable personal growth.",
    order: 7,
  },
  {
    name: "Project 20",
    description: "A goal-focused session designed to help young Muslim women build strong habits, a clear vision, and unstoppable momentum across 20 key areas of their lives.",
    order: 8,
  },
  {
    name: "Strategic Woman Program",
    description: "A power-packed coaching session for ambitious Muslim women who are intentionally building purpose-driven lives, businesses, and lasting legacies.",
    order: 9,
  },
  {
    name: "Marriage, Not the Wedding",
    description: "A pre-marital or marital coaching session that moves beyond the ceremony to help couples build a thriving, faith-centred marriage from the inside out.",
    order: 10,
  },
  {
    name: "The Thriving Muslim Family Blueprint",
    description: "A coaching session that equips families with practical, actionable strategies to create a home culture of love, intentional learning, and deep faith.",
    order: 11,
  },
  {
    name: "Ahlul Jannah Summer Mentorship",
    description: "A seasonal mentorship session focused on spiritual growth, community accountability, and personal transformation — designed to maximise the blessings of the summer period.",
    order: 12,
  },
];

await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
console.log("Connected to MongoDB.\n");

let created = 0;
let skipped = 0;

for (const s of SESSION_TYPES) {
  const exists = await SessionType.findOne({ name: s.name });
  if (exists) {
    console.log(`  SKIP  "${s.name}" (already exists)`);
    skipped++;
    continue;
  }
  await SessionType.create({ ...s, pricePerHour: 0, minHours: 1, maxHours: 4, isActive: true });
  console.log(`  OK    "${s.name}"`);
  created++;
}

console.log(`\nDone. ${created} created, ${skipped} skipped.`);
await mongoose.disconnect();
