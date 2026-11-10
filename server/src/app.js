import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import testimonialRoutes from "./routes/testimonialRoutes.js";

const app = express();

// Konfigurasi CORS fleksibel: mendukung localhost, domain Vercel, dan CLIENT_URL custom
app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan permintaan tanpa origin (seperti curl, mobile app, postman, atau server-to-server)
      if (!origin) return callback(null, true);

      // Izinkan domain localhost atau domain Vercel (*.vercel.app)
      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.includes(".vercel.app") ||
        (process.env.CLIENT_URL && origin.startsWith(process.env.CLIENT_URL.replace(/\/+$/, "")))
      ) {
        return callback(null, true);
      }

      // Default: izinkan agar permintaan tidak diblokir oleh CORS
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Tingkatkan limit body parser agar dapat menerima unggahan foto bukti laporan
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint (bisa diakses via / atau /api/health)
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "API Peduli Negeri aktif." });
});
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API Peduli Negeri aktif." });
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API Peduli Negeri berjalan lancar." });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/testimonials", testimonialRoutes);

export default app;
