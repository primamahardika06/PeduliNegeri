import { supabaseAdmin } from "../config/supabase.js";

const REPORT_CATEGORIES = [
  "Infrastruktur",
  "Fasilitas Umum",
  "Lingkungan",
  "Lainnya",
];
const REPORT_FIELDS =
  "id, title, category, description, location, status, image_url, created_at";
const FALLBACK_REPORT_FIELDS =
  "id, title, category, description, location, status, created_at";
const REPORT_STATUSES = [
  "Laporan Diterima",
  "Laporan Diproses",
  "Petugas Dikirim ke Lokasi",
  "Laporan Selesai",
];

function getDatabaseClient(res) {
  if (!supabaseAdmin) {
    res.status(503).json({
      success: false,
      message:
        "Layanan laporan belum dikonfigurasi. Hubungi pengelola aplikasi.",
    });
    return null;
  }
  return supabaseAdmin;
}

export async function createReport(req, res) {
  const { title, category, description, location, image_url } = req.body || {};
  if (
    typeof title !== "string" ||
    title.trim().length < 5 ||
    title.trim().length > 160 ||
    !REPORT_CATEGORIES.includes(category) ||
    typeof description !== "string" ||
    description.trim().length < 10 ||
    description.trim().length > 3000 ||
    typeof location !== "string" ||
    location.trim().length < 3 ||
    location.trim().length > 250
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Periksa kembali judul, kategori, isi laporan, dan lokasi. Pastikan semua terisi dengan benar.",
    });
  }

  // Validasi format foto bukti jika disertakan
  let cleanImageUrl = null;
  if (typeof image_url === "string" && image_url.trim()) {
    const trimmed = image_url.trim();
    if (
      trimmed.startsWith("data:image/") ||
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://")
    ) {
      cleanImageUrl = trimmed;
    }
  }

  const db = getDatabaseClient(res);
  if (!db) return undefined;

  try {
    const insertPayload = {
      user_id: req.authUser.id,
      title: title.trim(),
      category,
      description: description.trim(),
      location: location.trim(),
      status: "Laporan Diterima",
    };
    if (cleanImageUrl) {
      insertPayload.image_url = cleanImageUrl;
    }

    let { data, error } = await db
      .from("reports")
      .insert(insertPayload)
      .select(REPORT_FIELDS)
      .single();

    // Fallback jika kolom image_url belum dimigrasikan di database
    if (
      error &&
      (error.message?.includes("image_url") ||
        error.code === "PGRST204" ||
        error.code === "42703")
    ) {
      delete insertPayload.image_url;
      const retry = await db
        .from("reports")
        .insert(insertPayload)
        .select(FALLBACK_REPORT_FIELDS)
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Laporan belum dapat disimpan. Silakan coba lagi.",
      });
    }

    return res.status(201).json({ success: true, data });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Laporan belum dapat disimpan. Silakan coba lagi.",
    });
  }
}

export async function getAllReports(req, res) {
  const db = getDatabaseClient(res);
  if (!db) return undefined;

  try {
    let { data, error } = await db
      .from("reports")
      .select(`${REPORT_FIELDS}, updated_at`)
      .order("created_at", { ascending: false });

    // Fallback jika kolom image_url belum ada
    if (
      error &&
      (error.message?.includes("image_url") ||
        error.code === "PGRST204" ||
        error.code === "42703")
    ) {
      const retry = await db
        .from("reports")
        .select(`${FALLBACK_REPORT_FIELDS}, updated_at`)
        .order("created_at", { ascending: false });
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Daftar laporan belum dapat dimuat. Silakan coba lagi.",
      });
    }

    return res.status(200).json({ success: true, data });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Daftar laporan belum dapat dimuat. Silakan coba lagi.",
    });
  }
}

export async function updateReportStatus(req, res) {
  const { status } = req.body || {};
  if (!REPORT_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status laporan tidak valid.",
    });
  }

  const db = getDatabaseClient(res);
  if (!db) return undefined;

  try {
    let { data, error } = await db
      .from("reports")
      .update({ status })
      .eq("id", req.params.id)
      .select(`${REPORT_FIELDS}, updated_at`)
      .maybeSingle();

    if (
      error &&
      (error.message?.includes("image_url") ||
        error.code === "PGRST204" ||
        error.code === "42703")
    ) {
      const retry = await db
        .from("reports")
        .update({ status })
        .eq("id", req.params.id)
        .select(`${FALLBACK_REPORT_FIELDS}, updated_at`)
        .maybeSingle();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Status laporan belum dapat diperbarui. Silakan coba lagi.",
      });
    }
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "Laporan tidak ditemukan." });
    }

    return res.status(200).json({ success: true, data });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Status laporan belum dapat diperbarui. Silakan coba lagi.",
    });
  }
}

export async function getMyReports(req, res) {
  const db = getDatabaseClient(res);
  if (!db) return undefined;

  try {
    let { data, error } = await db
      .from("reports")
      .select(REPORT_FIELDS)
      .eq("user_id", req.authUser.id)
      .order("created_at", { ascending: false });

    if (
      error &&
      (error.message?.includes("image_url") ||
        error.code === "PGRST204" ||
        error.code === "42703")
    ) {
      const retry = await db
        .from("reports")
        .select(FALLBACK_REPORT_FIELDS)
        .eq("user_id", req.authUser.id)
        .order("created_at", { ascending: false });
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Riwayat laporan belum dapat dimuat. Silakan coba lagi.",
      });
    }

    return res.status(200).json({ success: true, data });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Riwayat laporan belum dapat dimuat. Silakan coba lagi.",
    });
  }
}
