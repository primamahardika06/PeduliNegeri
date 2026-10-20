import { supabase, supabaseAdmin } from "../config/supabase.js";

export async function requireUser(req, res, next) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Silakan masuk kembali untuk melanjutkan.",
      });
  }

  const authClient = supabase || supabaseAdmin;
  if (!authClient) {
    return res
      .status(503)
      .json({ success: false, message: "Layanan autentikasi belum tersedia." });
  }

  try {
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data.user) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Sesi tidak valid. Silakan masuk kembali.",
        });
    }

    req.authUser = data.user;
    return next();
  } catch {
    return res
      .status(503)
      .json({ success: false, message: "Layanan autentikasi belum tersedia." });
  }
}
