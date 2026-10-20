const WINDOW_MS = 15 * 60 * 1000;
const MAX_REPORTS_PER_WINDOW = 5;
const submissions = new Map();

export function limitReportSubmissions(req, res, next) {
  const now = Date.now();
  const userId = req.authUser.id;
  const current = submissions.get(userId);

  if (!current || current.resetAt <= now) {
    submissions.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (current.count >= MAX_REPORTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      message: "Batas pengiriman tercapai. Silakan coba lagi beberapa saat.",
    });
  }

  current.count += 1;
  return next();
}
