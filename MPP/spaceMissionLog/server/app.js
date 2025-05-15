// server/app.js
const express = require("express");
const cors = require("cors");
const missionsRouter = require("./routes/missionRoutes");
const uploadRouter = require("./routes/uploadRoutes");

const app = express();

// Enable CORS for all origins (or restrict it to your client domain)
app.use(cors());

// Parse JSON request bodies.
app.use(express.json());

// Health check endpoint.
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// API Routes.
app.use("/api/missions", missionsRouter);
app.use(uploadRouter); // For file uploads.

module.exports = app;
