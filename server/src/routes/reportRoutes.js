import { Router } from "express";
import {
  createReport,
  getAllReports,
  getMyReports,
  updateReportStatus,
  getPublicReports,
  getPublicStats,
  getLeaderboard,
  findSimilarReports,
  toggleSupport,
  getReportSupporters,
  getAdminNotifications,
} from "../controllers/reportController.js";
import { requireUser } from "../middlewares/requireUser.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { limitReportSubmissions } from "../middlewares/reportRateLimit.js";

const router = Router();

// Endpoint Publik (Peta, Landing Page, Leaderboard, Stats)
router.get("/public", getPublicReports);
router.get("/stats/public", getPublicStats);
router.get("/leaderboard", getLeaderboard);

// Endpoint Terautentikasi
router.use(requireUser);
router.get("/admin/notifications", requireAdmin, getAdminNotifications);
router.get("/admin", requireAdmin, getAllReports);
router.patch("/:id/status", requireAdmin, updateReportStatus);
router.get("/:id/supporters", getReportSupporters);
router.post("/:id/support", toggleSupport);
router.post("/find-similar", findSimilarReports);
router.get("/", getMyReports);
router.post("/", limitReportSubmissions, createReport);

export default router;
