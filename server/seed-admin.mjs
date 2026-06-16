// Run once to create the first admin user: node server/seed-admin.mjs
// Delete this file after use.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, ".env") });

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) { console.error("No MONGODB_URI in server/.env"); process.exit(1); }

const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  role: String,
  passwordHash: String,
  createdAt: String,
}, { versionKey: false });
const User = mongoose.model("User", userSchema);

await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });

const EMAIL = "admin@cohata.com";
const PASSWORD = "Cohata2024!";
const NAME = "Coach Halima";

const existing = await User.findOne({ email: EMAIL });
if (existing) {
  console.log(`User ${EMAIL} already exists (role: ${existing.role}). Updating password...`);
  existing.passwordHash = await bcrypt.hash(PASSWORD, 10);
  await existing.save();
  console.log("Password updated.");
} else {
  await User.create({
    email: EMAIL,
    name: NAME,
    role: "admin",
    passwordHash: await bcrypt.hash(PASSWORD, 10),
    createdAt: new Date().toISOString(),
  });
  console.log(`Admin user created: ${EMAIL}`);
}

console.log(`\nLogin credentials:\n  Email:    ${EMAIL}\n  Password: ${PASSWORD}\n`);
await mongoose.disconnect();
