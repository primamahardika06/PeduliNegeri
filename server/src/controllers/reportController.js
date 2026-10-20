import { supabaseAdmin } from "../config/supabase.js";

const REPORT_CATEGORIES = [
  "Infrastruktur",
  "Fasilitas Umum",
  "Lingkungan",
  "Lainnya",
];
const REPORT_FIELDS =
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
  const { title, category, description, location } = req.body || {};
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

  const db = getDatabaseClient(res);
  if (!db) return undefined;

  try {
    const { data, error } = await db
      .from("reports")
      .insert({
        user_id: req.authUser.id,
        title: title.trim(),
        category,
        description: description.trim(),
        location: location.trim(),
        status: "Laporan Diterima",
      })
      .select(REPORT_FIELDS)
      .single();

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
    const { data, error } = await db
      .from("reports")
      .select(`${REPORT_FIELDS}, updated_at`)
      .order("created_at", { ascending: false });

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
    const { data, error } = await db
      .from("reports")
      .update({ status })
      .eq("id", req.params.id)
      .select(`${REPORT_FIELDS}, updated_at`)
      .maybeSingle();

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
    const { data, error } = await db
      .from("reports")
      .select(REPORT_FIELDS)
      .eq("user_id", req.authUser.id)
      .order("created_at", { ascending: false });

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
