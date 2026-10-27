import { supabase, supabaseAdmin } from "../config/supabase.js";

/**
 * Controller untuk Registrasi Akun Baru
 * Pendaftaran publik hanya diperbolehkan untuk akun dengan role 'user'.
 * Akun 'admin' hanya dapat dibuat oleh pengembang melalui basis data / skrip administrasi.
 */
export const register = async (req, res) => {
  try {
    const { email, password, fullName, phoneNumber } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan kata sandi wajib diisi.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Kata sandi minimal harus 6 karakter.",
      });
    }

    // Role selalu dikunci sebagai 'user' untuk pendaftaran publik
    const assignedRole = "user";

    // Bersihkan format nomor HP (jika diisi)
    const cleanPhone = (phoneNumber || "").trim().replace(/[\s\-]/g, "");

    const dbClient = supabaseAdmin || supabase;

    // Cek apakah nomor HP sudah pernah digunakan pada akun lain
    if (cleanPhone && dbClient) {
      const phoneVariants = new Set([cleanPhone]);
      if (cleanPhone.startsWith("+62")) {
        const rest = cleanPhone.slice(3);
        phoneVariants.add("0" + rest);
        phoneVariants.add("62" + rest);
      } else if (cleanPhone.startsWith("62")) {
        const rest = cleanPhone.slice(2);
        phoneVariants.add("0" + rest);
        phoneVariants.add("+62" + rest);
      } else if (cleanPhone.startsWith("0")) {
        const rest = cleanPhone.slice(1);
        phoneVariants.add("+62" + rest);
        phoneVariants.add("62" + rest);
      }

      const { data: existingUserWithPhone } = await dbClient
        .from("profiles")
        .select("id")
        .in("phone_number", Array.from(phoneVariants))
        .limit(1)
        .maybeSingle();

      if (existingUserWithPhone) {
        return res.status(400).json({
          success: false,
          message: "Nomor HP sudah terdaftar pada akun lain.",
        });
      }
    }

    let user = null;
    let authError = null;
    let session = null;

    // Jika admin client tersedia, buat user langsung dengan email terverifikasi (agar bisa langsung login)
    if (supabaseAdmin) {
      const { data: adminData, error: adminErr } =
        await supabaseAdmin.auth.admin.createUser({
          email: email.trim(),
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName || "",
            phone_number: cleanPhone,
            role: assignedRole,
          },
        });

      if (adminErr) {
        authError = adminErr;
      } else {
        user = adminData.user;
      }
    }

    // Jika belum berhasil dan ada client publik, coba signUp biasa
    if (!user && !authError && supabase) {
      const { data: signUpData, error: standardErr } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName || "",
              phone_number: cleanPhone,
              role: assignedRole,
            },
          },
        });

      if (standardErr) {
        authError = standardErr;
      } else {
        user = signUpData?.user;
        session = signUpData?.session;
      }
    }

    if (authError) {
      return res.status(400).json({
        success: false,
        message: authError.message,
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Pendaftaran gagal dilakukan.",
      });
    }

    // Pastikan profil tersimpan di tabel public.profiles jika trigger belum berjalan
    let profileData = null;
    if (dbClient) {
      const { data: upsertedProfile } = await dbClient
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email,
            full_name: fullName || "",
            phone_number: cleanPhone,
            role: assignedRole,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        )
        .select()
        .single();
      profileData = upsertedProfile;
    }

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil!",
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: profileData?.full_name || fullName || "",
          phoneNumber: profileData?.phone_number || cleanPhone,
          role: profileData?.role || assignedRole,
        },
        session: session || null,
      },
    });
  } catch (error) {
    console.error("Error saat register:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server saat registrasi.",
    });
  }
};

/**
 * Controller untuk Login
 * Pengguna bebas memilih login menggunakan Email ATAU Nomor HP.
 * Role dibaca langsung dari database akun dan dikembalikan ke klien.
 */
export const login = async (req, res) => {
  try {
    const rawIdentifier = (req.body.identifier || req.body.email || "").trim();
    const password = req.body.password;

    if (!rawIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email / Nomor HP dan kata sandi wajib diisi.",
      });
    }

    const clientToUse = supabase || supabaseAdmin;
    if (!clientToUse) {
      return res.status(500).json({
        success: false,
        message: "Supabase client belum terkonfigurasi pada server.",
      });
    }

    const dbClient = supabaseAdmin || clientToUse;
    let targetEmail = rawIdentifier;
    const isEmail = rawIdentifier.includes("@");

    // Jika bukan email, asumsikan pengguna memasukkan nomor HP
    if (!isEmail) {
      const cleanPhone = rawIdentifier.replace(/[\s\-\(\)]/g, "");
      const phoneVariants = new Set([cleanPhone]);

      if (cleanPhone.startsWith("+62")) {
        const rest = cleanPhone.slice(3);
        phoneVariants.add("0" + rest);
        phoneVariants.add("62" + rest);
      } else if (cleanPhone.startsWith("62")) {
        const rest = cleanPhone.slice(2);
        phoneVariants.add("0" + rest);
        phoneVariants.add("+62" + rest);
      } else if (cleanPhone.startsWith("0")) {
        const rest = cleanPhone.slice(1);
        phoneVariants.add("+62" + rest);
        phoneVariants.add("62" + rest);
      }

      const { data: matchedProfile, error: phoneErr } = await dbClient
        .from("profiles")
        .select("id, email, phone_number")
        .in("phone_number", Array.from(phoneVariants))
        .limit(1)
        .maybeSingle();

      if (phoneErr) {
        console.error("Error mencari profil berdasarkan nomor HP:", phoneErr);
      }

      if (!matchedProfile || !matchedProfile.email) {
        return res.status(401).json({
          success: false,
          message: "Nomor HP tidak terdaftar atau kata sandi salah.",
        });
      }

      targetEmail = matchedProfile.email;
    }

    // Login ke Supabase Auth dengan email dan kata sandi
    const { data: authData, error: authError } =
      await clientToUse.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

    if (authError) {
      return res.status(401).json({
        success: false,
        message: isEmail
          ? "Email atau kata sandi salah."
          : "Nomor HP atau kata sandi salah.",
      });
    }

    const user = authData.user;

    // Ambil data profil dari tabel public.profiles untuk memastikan role & nomor HP
    let { data: profile } = await dbClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Fallback jika belum ada di tabel profiles, ambil dari user metadata
    if (!profile) {
      const metaRole = user.user_metadata?.role || "user";
      const metaName = user.user_metadata?.full_name || "";
      const metaPhone = user.user_metadata?.phone_number || "";

      const { data: newProfile } = await dbClient
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          full_name: metaName,
          phone_number: metaPhone,
          role: metaRole,
        })
        .select()
        .single();

      profile = newProfile || {
        id: user.id,
        email: user.email,
        full_name: metaName,
        phone_number: metaPhone,
        role: metaRole,
      };
    }

    const actualRole = profile?.role || "user";

    return res.status(200).json({
      success: true,
      message: "Login berhasil!",
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: profile?.full_name || user.user_metadata?.full_name || "",
          phoneNumber: profile?.phone_number || user.user_metadata?.phone_number || "",
          role: actualRole,
        },
        session: authData.session,
      },
    });
  } catch (error) {
    console.error("Error saat login:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server saat login.",
    });
  }
};

/**
 * Controller untuk Reset Password (Lupa Password)
 * Mengirim email reset password via Supabase Auth
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email wajib diisi.",
      });
    }

    const clientToUse = supabase || supabaseAdmin;
    if (!clientToUse) {
      return res.status(500).json({
        success: false,
        message: "Supabase client belum terkonfigurasi pada server.",
      });
    }

    const redirectUrl =
      process.env.CLIENT_URL || "http://localhost:5173";

    const { error } = await clientToUse.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectUrl}/reset-password`,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Jika email terdaftar, tautan reset password telah dikirim. Silakan periksa kotak masuk Anda.",
    });
  } catch (error) {
    console.error("Error saat forgot password:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
};

/**
 * Controller untuk mendapatkan seluruh daftar profil (Khusus Admin)
 */
export const getAllProfiles = async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase;
    if (!dbClient) {
      return res
        .status(500)
        .json({ success: false, message: "Database client tidak tersedia." });
    }

    const { data, error } = await dbClient
      .from("profiles")
      .select("id, email, full_name, phone_number, role, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/**
 * Controller untuk memperbarui pengaturan privasi leaderboard pengguna
 */
export const updateLeaderboardSettings = async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase;
    if (!dbClient) {
      return res
        .status(500)
        .json({ success: false, message: "Database client tidak tersedia." });
    }

    const { leaderboard_visible, leaderboard_display_type, leaderboard_username } =
      req.body || {};

    const updatePayload = {
      leaderboard_visible: Boolean(leaderboard_visible),
      leaderboard_display_type:
        leaderboard_display_type === "username" ? "username" : "name",
      leaderboard_username:
        typeof leaderboard_username === "string"
          ? leaderboard_username.trim().slice(0, 30)
          : "",
    };

    const { data, error } = await dbClient
      .from("profiles")
      .update(updatePayload)
      .eq("id", req.authUser.id)
      .select("id, email, full_name, role, leaderboard_visible, leaderboard_display_type, leaderboard_username")
      .maybeSingle();

    if (error) {
      if (error.message && error.message.includes("updated_at")) {
        return res.status(400).json({
          success: false,
          message:
            'Kolom updated_at belum ada di tabel profiles Supabase. Silakan jalankan migrasi 008 di SQL Editor Supabase: ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();',
        });
      }
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(200).json({
      success: true,
      data,
      message: "Pengaturan privasi leaderboard berhasil disimpan.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
