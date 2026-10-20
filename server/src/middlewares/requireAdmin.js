import { supabaseAdmin } from "../config/supabase.js";

export async function requireAdmin(req, res, next) {
  if (!supabaseAdmin) {
    return res.status(503).json({
      success: false,
      message: "Layanan otorisasi belum tersedia. Hubungi pengelola aplikasi.",
    });
  }

  try {
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", req.authUser.id)
      .maybeSingle();

    if (error) {
      return res
        .status(503)
        .json({
          success: false,
          message: "Hak akses belum dapat diverifikasi.",
        });
    }
    if (profile?.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Akses khusus administrator." });
    }

    return next();
  } catch {
    return res
      .status(503)
      .json({ success: false, message: "Hak akses belum dapat diverifikasi." });
  }
}
