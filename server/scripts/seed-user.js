// One-off script to create or update a staff account.
//
// Usage:
//   node --env-file=.env scripts/seed-user.js <email> <password> "<name>" <role>
//
// Roles: admin, finance, bookings, programs

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ROLES = ["admin", "finance", "bookings", "programs"];

const [, , email, password, name, role] = process.argv;

if (!process.env.MONGODB_URI || !email || !password || !name || !role) {
  console.error('Usage: node --env-file=.env scripts/seed-user.js <email> <password> "<name>" <role>');
  console.error(`Roles: ${ROLES.join(", ")}`);
  process.exit(1);
}

if (!ROLES.includes(role)) {
  console.error(`Invalid role "${role}". Must be one of: ${ROLES.join(", ")}`);
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name:         { type: String, required: true },
  role:         { type: String, enum: ROLES, required: true },
  createdAt:    { type: String, default: () => new Date().toISOString() },
}, { versionKey: false });

const User = mongoose.model("User", userSchema);

await mongoose.connect(process.env.MONGODB_URI);

const passwordHash = await bcrypt.hash(password, 10);
const normalizedEmail = email.toLowerCase().trim();
const existing = await User.findOne({ email: normalizedEmail });

if (existing) {
  existing.passwordHash = passwordHash;
  existing.name = name;
  existing.role = role;
  await existing.save();
  console.log(`Updated user: ${normalizedEmail} (${role})`);
} else {
  await User.create({ email: normalizedEmail, passwordHash, name, role });
  console.log(`Created user: ${normalizedEmail} (${role})`);
}

await mongoose.disconnect();
