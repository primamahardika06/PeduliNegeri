import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";

const app = express();

// Konfigurasi CORS agar frontend dapat mengakses endpoint
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Tingkatkan limit body parser agar dapat menerima unggahan foto bukti laporan
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API Peduli Negeri berjalan lancar." });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/testimonials", testimonialRoutes);

export default app;
