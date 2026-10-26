import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  KeyRound,
} from "lucide-react";
import logoPeduliNegeri from "../../assets/PeduliNegeri (4).png";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export default function ResetPassword() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    !supabase ? "Konfigurasi Supabase belum tersedia." : "",
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    // Supabase mengirim event SIGNED_IN atau PASSWORD_RECOVERY saat pengguna membuka tautan pemulihan
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword.length < 6) {
      setErrorMessage("Kata sandi baru harus minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (!supabase) {
      setErrorMessage("Konfigurasi Supabase belum tersedia.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage(
        "Kata sandi berhasil diperbarui! Anda akan diarahkan ke halaman masuk.",
      );
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrorMessage(err.message || "Gagal memperbarui kata sandi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-[#1E2430]">
      {/* ── SISI KIRI (Visual & Branding) ──────────────────────── */}
      <section
        className="w-full lg:w-[48%] xl:w-[46%] p-6 sm:p-10 lg:p-14 flex flex-col justify-between shrink-0"
        style={{ backgroundColor: "#EB936E" }}
      >
        {/* Logo PeduliNegeri */}
        <div className="flex items-center gap-3">
          <img
            src={logoPeduliNegeri}
            alt="Peduli Negeri"
            className="h-10 sm:h-12 w-auto object-contain drop-shadow-xs"
          />
        </div>

        {/* Card Ilustrasi & Headline */}
        <div className="my-8 lg:my-10 space-y-6">
          <div
            className="rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center aspect-4/3 max-w-md mx-auto w-full shadow-xs"
            style={{
              backgroundColor: "#FADDBA",
              border: "1px solid rgba(240, 196, 154, 0.6)",
            }}
          >
            <div className="p-3.5 rounded-2xl bg-[#EB936E]/20 text-[#1E2430] mb-3">
              <KeyRound className="w-8 h-8 stroke-[1.7]" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#1E2430] leading-relaxed max-w-xs">
              Keamanan akun Anda adalah prioritas kami dalam menjaga integritas
              aspirasi publik.
            </p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-[#1E2430] tracking-tight leading-tight">
              Perbarui Kata Sandi Akun Anda.
            </h2>
          </div>
        </div>

        {/* 3 Pilar Informasi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#1E2430]/20">
          <div className="space-y-1">
            <div className="h-0.5 w-12 bg-[#1E2430] mb-2" />
            <h3 className="font-bold text-xs sm:text-sm text-[#1E2430]">
              Kata Sandi Kuat
            </h3>
            <p className="text-[11px] sm:text-xs text-[#1E2430]/80 leading-normal">
              Gunakan kombinasi huruf &amp; angka.
            </p>
          </div>

          <div className="space-y-1">
            <div className="h-0.5 w-12 bg-[#1E2430] mb-2" />
            <h3 className="font-bold text-xs sm:text-sm text-[#1E2430]">
              Privasi Terjamin
            </h3>
            <p className="text-[11px] sm:text-xs text-[#1E2430]/80 leading-normal">
              Kredensial Anda dienkripsi penuh.
            </p>
          </div>

          <div className="space-y-1">
            <div className="h-0.5 w-12 bg-[#1E2430] mb-2" />
            <h3 className="font-bold text-xs sm:text-sm text-[#1E2430]">
              Akses Cepat
            </h3>
            <p className="text-[11px] sm:text-xs text-[#1E2430]/80 leading-normal">
              Langsung masuk setelah disimpan.
            </p>
          </div>
        </div>
      </section>

      {/* ── SISI KANAN (Form Reset Password) ────────────────────── */}
      <section
        className="flex-1 p-6 sm:p-10 lg:p-14 flex flex-col justify-between overflow-y-auto"
        style={{ backgroundColor: "#FAF5EE" }}
      >
        <div className="flex justify-end text-xs sm:text-sm text-[#5C6070] mb-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-[#2D3F65] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Halaman Masuk
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-6">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2430] tracking-tight">
              Atur Ulang Kata Sandi
            </h1>
            <p className="text-xs sm:text-sm text-[#5C6070] mt-1.5">
              Masukkan kata sandi baru untuk akun Peduli Negeri Anda.
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-xs sm:text-sm"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-800 text-xs sm:text-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {!sessionReady && !errorMessage && (
            <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900 text-xs sm:text-sm">
              <LoaderCircle className="w-4 h-4 text-amber-700 animate-spin shrink-0 mt-0.5" />
              <span>Memverifikasi tautan pemulihan kata sandi...</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label
                htmlFor="new-password"
                className="block text-xs sm:text-sm font-semibold text-[#1E2430] mb-1.5"
              >
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-4 pr-24 py-3 rounded-xl border border-slate-300 bg-white/80 text-sm text-[#1E2430] placeholder-slate-400 outline-none focus:border-[#1E2430] focus:ring-1 focus:ring-[#1E2430] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#5C6070] hover:text-[#1E2430] cursor-pointer"
                >
                  {showPassword ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs sm:text-sm font-semibold text-[#1E2430] mb-1.5"
              >
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full pl-4 pr-24 py-3 rounded-xl border border-slate-300 bg-white/80 text-sm text-[#1E2430] placeholder-slate-400 outline-none focus:border-[#1E2430] focus:ring-1 focus:ring-[#1E2430] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#5C6070] hover:text-[#1E2430] cursor-pointer"
                >
                  {showConfirmPassword ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !sessionReady}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-[#1E2430] shadow-xs flex items-center justify-center gap-2 transition-transform duration-150 active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ backgroundColor: "#EB936E" }}
            >
              {loading ? (
                <LoaderCircle className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Simpan Kata Sandi Baru</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-[11px] text-[#5C6070] pt-4">
          Peduli Negeri © {new Date().getFullYear()} — Portal Partisipasi Publik
          Indonesia
        </div>
      </section>
    </div>
  );
}
