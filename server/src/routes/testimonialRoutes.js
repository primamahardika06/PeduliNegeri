import { Router } from "express";
import {
  getTestimonials,
  createTestimonial,
} from "../controllers/testimonialController.js";
import { requireUser } from "../middlewares/requireUser.js";

const router = Router();

// Endpoint publik membaca testimoni untuk landing page
router.get("/", getTestimonials);

// Endpoint privat user memberikan testimoni
router.post("/", requireUser, createTestimonial);

export default router;

