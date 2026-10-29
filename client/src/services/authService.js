const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const authService = {
  /**
   * Mendaftar akun baru (khusus akun warga/user)
   * @param {Object} payload { email, password, fullName, phoneNumber }
   */
  async register({ email, password, fullName, phoneNumber }) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, fullName, phoneNumber }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Registrasi gagal. Silakan coba lagi.");
    }
    return data;
  },

  /**
   * Login pengguna (bebas memilih masuk menggunakan Email atau Nomor HP)
   * @param {Object} payload { identifier, email, password }
   */
  async login({ identifier, email, password }) {
    const targetIdentifier = (identifier || email || "").trim();
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: targetIdentifier,
        email: targetIdentifier,
        password,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.message || "Login gagal. Cek email/nomor HP dan kata sandi Anda.",
      );
    }

    // Simpan sesi ke localStorage
    if (data.data?.user) {
      localStorage.setItem("pn_user", JSON.stringify(data.data.user));
      if (data.data.session?.access_token) {
        localStorage.setItem("pn_token", data.data.session.access_token);
      }
    }

    return data;
  },

  /**
   * Kirim email reset password (lupa password)
   * @param {string} email
   */
  async forgotPassword(email) {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Gagal mengirim email reset kata sandi.");
    }
    return data;
  },

  /**
   * Perbarui pengaturan privasi leaderboard akun
   */
  async updateLeaderboardSettings({
    leaderboard_visible,
    leaderboard_display_type,
    leaderboard_username,
  }) {
    const token = localStorage.getItem("pn_token");
    const response = await fetch(`${API_URL}/auth/profile/leaderboard`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        leaderboard_visible,
        leaderboard_display_type,
        leaderboard_username,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.message || "Gagal memperbarui privasi papan peringkat.",
      );
    }

    // Update profil di local storage jika ada
    const current = this.getCurrentUser();
    if (current) {
      const updatedUser = {
        ...current,
        leaderboard_visible,
        leaderboard_display_type,
        leaderboard_username,
      };
      localStorage.setItem("pn_user", JSON.stringify(updatedUser));
    }

    return data;
  },

  /**
   * Logout dan hapus sesi dari localStorage
   */
  logout() {
    localStorage.removeItem("pn_user");
    localStorage.removeItem("pn_token");
  },

  /**
   * Helper internal untuk decode payload token JWT
   */
  decodeToken(token) {
    try {
      if (!token || typeof token !== "string") return null;
      const parts = token.split(".");
      if (parts.length < 2) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  },

  /**
   * Periksa apakah sesi/token saat ini sudah habis masa berlakunya
   */
  isSessionExpired() {
    const user = this.getCurrentUser();
    if (!user) return false;

    const token = localStorage.getItem("pn_token");
    if (!token) return true; // Ada user tapi token tidak ada

    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return false;

    // Kadaluarsa jika waktu saat ini sudah melewati payload.exp (dalam detik)
    return Date.now() >= payload.exp * 1000;
  },

  /**
   * Bersihkan sesi yang kadaluarsa dan otomatis redirect ke landing page (/)
   */
  handleSessionExpired() {
    this.logout();
    window.dispatchEvent(new CustomEvent("pn_session_expired"));

    // Jika bukan di landing page atau halaman login, arahkan ke landing page
    if (window.location.pathname !== "/" && window.location.pathname !== "/login") {
      window.location.href = "/";
    }
  },

  /**
   * Dapatkan user yang sedang aktif dari penyimpanan lokal
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem("pn_user");
      if (!stored) return null;
      const user = JSON.parse(stored);

      // Cek otomatis apakah token sudah kadaluarsa saat membaca user
      const token = localStorage.getItem("pn_token");
      if (token) {
        const payload = this.decodeToken(token);
        if (payload?.exp && Date.now() >= payload.exp * 1000) {
          this.logout();
          return null;
        }
      }
      return user;
    } catch {
      return null;
    }
  },

  /**
   * Dapatkan daftar seluruh user untuk admin dashboard
   */
  async getAllUsers() {
    const response = await fetch(`${API_URL}/auth/users`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Gagal memuat data pengguna.");
    }
    return data.data || [];
  },
};

export default authService;
