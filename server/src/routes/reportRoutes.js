import { Router } from "express";
import {
  createReport,
  getAllReports,
  getMyReports,
  updateReportStatus,
} from "../controllers/reportController.js";
import { requireUser } from "../middlewares/requireUser.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { limitReportSubmissions } from "../middlewares/reportRateLimit.js";

const router = Router();

router.use(requireUser);
router.get("/admin", requireAdmin, getAllReports);
router.patch("/:id/status", requireAdmin, updateReportStatus);
router.get("/", getMyReports);
router.post("/", limitReportSubmissions, createReport);

export default router;
