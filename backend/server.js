require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const apiRouter = require("./routes");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'https://fixora-services.onrender.com'],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH']
}));


app.use(cookieParser());

app.use('/api/v1/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

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
