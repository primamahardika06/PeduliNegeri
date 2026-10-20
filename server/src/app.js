import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

// Konfigurasi CORS agar frontend dapat mengakses endpoint
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API Peduli Negeri berjalan lancar." });
});

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);

export default app;
