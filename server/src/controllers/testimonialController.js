import { supabaseAdmin, supabase } from "../config/supabase.js";

function getDb() {
  return supabaseAdmin || supabase;
}

/**
 * Mengambil daftar testimoni untuk ditampilkan di Landing Page
 */
export async function getTestimonials(req, res) {
  const db = getDb();
  if (!db) {
    return res.status(503).json({
      success: false,
      message: "Layanan database belum siap.",
    });
  }

  try {
    const { data, error } = await db
      .from("testimonials")
      .select("id, report_id, content, rating, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      // Fallback jika tabel testimonials belum dimigrasikan
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Ambil data profile pelapor untuk setiap testimoni (jika ada)
    const userIds = [...new Set((data || []).map((t) => t.user_id).filter(Boolean))];
    let profileMap = {};
    if (userIds.length > 0) {
      const { data: profiles } = await db
        .from("profiles")
        .select("id, full_name, leaderboard_visible, leaderboard_display_type, leaderboard_username")
        .in("id", userIds);

      if (profiles) {
        profiles.forEach((p) => {
          profileMap[p.id] = p;
        });
      }
    }

    // Format data publik (tanpa mengekspos ID sensitif)
    const formatted = (data || []).map((item) => {
      const userProf = profileMap[item.user_id];
      let authorName = "Warga Peduli";
      if (userProf) {
        if (userProf.leaderboard_display_type === "username" && userProf.leaderboard_username) {
          authorName = userProf.leaderboard_username;
        } else if (userProf.full_name) {
          // Tampilkan nama depan atau inisial untuk privasi
          const parts = userProf.full_name.trim().split(" ");
          authorName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
        }
      }

      return {
        id: item.id,
        content: item.content,
        rating: item.rating || 5,
        author: authorName,
        createdAt: item.created_at,
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Gagal memuat testimoni.",
    });
  }
}

/**
 * Menambahkan testimoni untuk laporan yang sudah selesai
 */
export async function createTestimonial(req, res) {
  const db = getDb();
  if (!db) {
    return res.status(503).json({
      success: false,
      message: "Layanan database belum siap.",
    });
  }

  const { report_id, content, rating } = req.body || {};
  if (!report_id || typeof content !== "string" || content.trim().length < 5) {
    return res.status(400).json({
      success: false,
      message: "Mohon isi ulasan/testimoni minimal 5 karakter.",
    });
  }

  const cleanRating = Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : 5;

  try {
    // Pastikan laporan terkait benar-benar ada dan dimiliki user
    const { data: report, error: repError } = await db
      .from("reports")
      .select("id, user_id, status")
      .eq("id", report_id)
      .maybeSingle();

    if (repError || !report) {
      return res.status(404).json({
        success: false,
        message: "Laporan tidak ditemukan.",
      });
    }

    if (report.user_id !== req.authUser.id && req.authUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Anda hanya dapat memberikan ulasan untuk laporan milik Anda.",
      });
    }

    const { data, error } = await db
      .from("testimonials")
      .insert({
        report_id,
        user_id: req.authUser.id,
        content: content.trim(),
        rating: cleanRating,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Gagal menyimpan ulasan. Pastikan tabel telah dimigrasikan.",
      });
    }

    return res.status(201).json({
      success: true,
      data,
      message: "Terima kasih atas ulasan dan masukan Anda!",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Gagal memproses ulasan.",
    });
  }
}

