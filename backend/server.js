require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const apiRouter = require("./routes");
const cookieParser = require("cookie-parser");

const app = express();

const allowedOrigins = [
  (process.env.FRONTEND_URL || "").trim(),
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
].filter(Boolean).map(url => url.replace(/\/$/, "")); // Remove trailing slashes

app.use(cors({
  origin: function (origin, callback) {

    // Allow non-browser requests (e.g., curl, server-to-server)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.indexOf(origin) !== -1 ||
      (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:'));

    // Controlled debug logging: only when not in production or explicitly enabled
    const debugCors = process.env.DEBUG_CORS === 'true' || process.env.NODE_ENV !== 'production';
    if (debugCors) {
      console.log('[CORS] origin=', origin, 'allowedOrigins=', allowedOrigins, 'allowed=', isAllowed);
    }

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Configure body parsing - webhook needs raw body, others need JSON
app.use('/api/v1/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(cookieParser());

connectDB();

app.get("/", (req, res) => {
  res.send("Backend server is running successfully!");
});

app.use("/api", apiRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
