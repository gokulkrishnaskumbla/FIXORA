const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

// Default to 1 day if JWT_EXPIRES_IN is missing
const maxAge = process.env.JWT_EXPIRES_IN || "1d";

const createToken = (id, role = "user") => {
  if (!process.env.JWT_SECRET) {
    throw new Error("❌ JWT_SECRET is not defined in .env");
  }

  console.log("🔐 Creating token for:", { id, role });

  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: maxAge }
  );
};

module.exports = { createToken };
