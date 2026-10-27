import { Router } from "express";
import {
  register,
  login,
  forgotPassword,
  getAllProfiles,
  updateLeaderboardSettings,
} from "../controllers/authController.js";
import { requireUser } from "../middlewares/requireUser.js";

const router = Router();

// Endpoint registrasi akun
router.post("/register", register);

// Endpoint login (user dan admin)
router.post("/login", login);

// Endpoint lupa password
router.post("/forgot-password", forgotPassword);

// Endpoint pengaturan privasi leaderboard
router.patch("/profile/leaderboard", requireUser, updateLeaderboardSettings);

// Endpoint untuk admin dashboard melihat seluruh user
router.get("/users", getAllProfiles);

export default router;
