import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { authService } from "../../services/authService";
import logoPeduliNegeri from "../../assets/PeduliNegeri (4).png";

export default function LoginPages({ onLoginSuccess }) {
  const navigate = useNavigate();

  // State mode tab: 'login' | 'register' | 'forgot'
  const [authMode, setAuthMode] = useState("login");

  // Form inputs - Login
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Form inputs - Register (Email dan Nomor HP dipisah)
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Form inputs - Forgot Password
  const [forgotEmail, setForgotEmail] = useState("");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const switchMode = (mode) => {
    setAuthMode(mode);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Handle Login: Bebas memilih masuk menggunakan Email ATAU Nomor HP
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!loginIdentifier.trim()) {
      setErrorMessage("Email atau nomor HP wajib diisi.");
      return;
    }

    if (!loginPassword) {
      setErrorMessage("Kata sandi wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({
        identifier: loginIdentifier.trim(),
        password: loginPassword,
      });

      const userData = response.data?.user;
      setSuccessMessage(
        `Selamat datang kembali, ${userData?.fullName || userData?.email}!`,
      );

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }

      // Navigasi otomatis sesuai role akun di database
      setTimeout(() => {
        if (userData?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/reportPage");
        }
      }, 600);
    } catch (err) {
      setErrorMessage(
        err.message || "Gagal masuk. Periksa kembali email/nomor HP dan kata sandi Anda.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Register: Khusus akun role 'user' dengan email dan nomor HP terpisah
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!regFullName.trim()) {
      setErrorMessage("Nama lengkap wajib diisi.");
      return;
    }

    if (!regEmail.trim()) {
      setErrorMessage("Alamat email wajib diisi.");
      return;
    }

    if (!regPhone.trim()) {
      setErrorMessage("Nomor HP wajib diisi.");
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage("Kata sandi harus memiliki minimal 6 karakter.");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (!agreeTerms) {
      setErrorMessage(
        "Anda harus menyetujui Syarat dan Ketentuan serta Kebijakan Privasi.",
      );
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        email: regEmail.trim(),
        phoneNumber: regPhone.trim(),
        password: regPassword,
        fullName: regFullName.trim(),
      });

      setSuccessMessage(
        "Akun berhasil dibuat! Silakan masuk dengan kata sandi Anda.",
      );

      // Pindahkan ke mode login dengan email yang otomatis terisi
      const targetLogin = regEmail.trim();
      setTimeout(() => {
        setAuthMode("login");
        setLoginIdentifier(targetLogin);
        setLoginPassword("");
        setSuccessMessage(
          "Akun Anda siap digunakan. Silakan masukkan kata sandi untuk masuk.",
        );
      }, 1500);
    } catch (err) {
      setErrorMessage(
        err.message || "Gagal mendaftarkan akun. Silakan coba kembali.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!forgotEmail.trim()) {
      setErrorMessage("Masukkan alamat email Anda.");
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(forgotEmail.trim());
      setSuccessMessage(
        "Jika email terdaftar, tautan pemulihan kata sandi telah dikirim. Silakan periksa kotak masuk Anda.",
      );
    } catch (err) {
      setErrorMessage(
        err.message || "Gagal mengirim email reset kata sandi.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Auth (Mock / Placeholder)
  const handleGoogleAuth = () => {
    setErrorMessage(
      "Masuk dengan Google sedang dipersiapkan. Silakan gunakan email dan kata sandi.",
    );
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

        {/* Card Foto Mockup & Headline */}
        <div className="my-8 lg:my-10 space-y-6">
          <div
            className="rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center aspect-4/3 max-w-md mx-auto w-full shadow-xs transition-transform hover:scale-[1.01]"
            style={{
              backgroundColor: "#FADDBA",
              border: "1px solid rgba(240, 196, 154, 0.6)",
            }}
          >
            <div className="p-3.5 rounded-2xl bg-[#EB936E]/20 text-[#1E2430] mb-3">
              <Camera className="w-8 h-8 stroke-[1.7]" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#1E2430] leading-relaxed max-w-xs">
              [FOTO: kondisi lapangan nyata atau warga yang sedang melapor]
            </p>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-[#1E2430] tracking-tight leading-tight">
              {authMode === "login" && (
                <>
                  Suara Anda, Perubahan
                  <br />
                  untuk Negeri.
                </>
              )}
              {authMode === "register" && "Setiap suara memiliki arti."}
              {authMode === "forgot" && (
                <>
                  Aman, Transparan,
                  <br />
                  Terpercaya.
                </>
              )}
            </h2>
          </div>
        </div>

        {/* 3 Pilar Alur Pelaporan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#1E2430]/20">
          <div className="space-y-1">
            <div className="h-0.5 w-12 bg-[#1E2430] mb-2" />
            <h3 className="font-bold text-xs sm:text-sm text-[#1E2430]">
              Isi Detail Laporan
            </h3>
            <p className="text-[11px] sm:text-xs text-[#1E2430]/80 leading-normal">
              Lengkapi informasi dan bukti foto.
            </p>
          </div>

          <div className="space-y-1">
            <div className="h-0.5 w-12 bg-[#1E2430] mb-2" />
            <h3 className="font-bold text-xs sm:text-sm text-[#1E2430]">
              Kirim Laporan
            </h3>
            <p className="text-[11px] sm:text-xs text-[#1E2430]/80 leading-normal">
              Diteruskan ke pihak terkait.
            </p>
          </div>

          <div className="space-y-1">
            <div className="h-0.5 w-12 bg-[#1E2430] mb-2" />
            <h3 className="font-bold text-xs sm:text-sm text-[#1E2430]">
              Pantau Perkembangan
            </h3>
            <p className="text-[11px] sm:text-xs text-[#1E2430]/80 leading-normal">
              Dapatkan notifikasi status.
            </p>
          </div>
        </div>
      </section>

      {/* ── SISI KANAN (Form Interaktif) ────────────────────────── */}
      <section
        className="flex-1 p-6 sm:p-10 lg:p-14 flex flex-col justify-between overflow-y-auto"
        style={{ backgroundColor: "#FAF5EE" }}
      >
        {/* Navigasi Switcher di Pojok Kanan Atas */}
        <div className="flex justify-end text-xs sm:text-sm text-[#5C6070] mb-4">
          {authMode === "login" && (
            <p>
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="font-semibold text-[#2D3F65] hover:underline ml-1 cursor-pointer"
              >
                Daftar Sekarang
              </button>
            </p>
          )}

          {authMode === "register" && (
            <p>
              Sudah punya akun?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-semibold text-[#2D3F65] hover:underline ml-1 cursor-pointer"
              >
                Masuk
              </button>
            </p>
          )}

          {authMode === "forgot" && (
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="inline-flex items-center gap-1.5 font-semibold text-[#2D3F65] hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Masuk
            </button>
          )}
        </div>

        {/* Kontainer Form */}
        <div className="max-w-md w-full mx-auto my-auto py-4 sm:py-6">
          {/* Header Form */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2430] tracking-tight">
              {authMode === "login" && "Selamat Datang Kembali"}
              {authMode === "register" && "Daftar Akun"}
              {authMode === "forgot" && "Lupa Kata Sandi?"}
            </h1>
            <p className="text-xs sm:text-sm text-[#5C6070] mt-1.5">
              {authMode === "login" &&
                "Masuk untuk melanjutkan ke akun Peduli Negeri Anda."}
              {authMode === "register" &&
                "Buat akun untuk mulai melaporkan dan berkontribusi bagi negeri."}
              {authMode === "forgot" &&
                "Masukkan alamat email Anda untuk menerima instruksi pemulihan kata sandi."}
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

          {/* ── FORM 1: MASUK (LOGIN) ─────────────────────────── */}
          {authMode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="login-identifier"
                  className="block text-xs sm:text-sm font-semibold text-[#1E2430] mb-1.5"
                >
                  Email atau Nomor HP
                </label>
                <input
                  id="login-identifier"
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="nama@email.com atau 08xxxxxxxxxx"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/80 text-sm text-[#1E2430] placeholder-slate-400 outline-none focus:border-[#1E2430] focus:ring-1 focus:ring-[#1E2430] transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="text-xs sm:text-sm font-semibold text-[#1E2430]"
                  >
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-xs font-semibold text-[#2D3F65] hover:underline cursor-pointer"
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
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

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#EB936E] focus:ring-[#EB936E] accent-[#EB936E] cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-xs sm:text-sm text-[#1E2430] select-none cursor-pointer"
                >
                  Ingat saya
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-[#1E2430] shadow-xs flex items-center justify-center gap-2 transition-transform duration-150 active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                style={{ backgroundColor: "#EB936E" }}
              >
                {loading ? (
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative px-3 bg-[#FAF5EE] text-xs text-[#5C6070]">
                  atau masuk dengan
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-3 px-4 rounded-xl border border-[#1E2430] text-[#1E2430] font-semibold text-xs sm:text-sm hover:bg-slate-100/70 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                Masuk dengan Google
              </button>

              <p className="text-[11px] sm:text-xs text-[#5C6070] text-center mt-6 leading-relaxed">
                Dengan melanjutkan, Anda menyetujui{" "}
                <span className="font-semibold text-[#1E2430]">
                  Syarat dan Ketentuan
                </span>{" "}
                serta{" "}
                <span className="font-semibold text-[#1E2430]">
                  Kebijakan Privasi
                </span>{" "}
                Peduli Negeri.
              </p>
            </form>
          )}

          {/* ── FORM 2: DAFTAR AKUN (REGISTER USER) ───────────── */}
          {authMode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-xs sm:text-sm font-semibold text-[#1E2430] mb-1.5"
                >
                  Nama Lengkap
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/80 text-sm text-[#1E2430] placeholder-slate-400 outline-none focus:border-[#1E2430] focus:ring-1 focus:ring-[#1E2430] transition"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs sm:text-sm font-semibold text-[#1E2430] mb-1.5"
                >
                  Alamat Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/80 text-sm text-[#1E2430] placeholder-slate-400 outline-none focus:border-[#1E2430] focus:ring-1 focus:ring-[#1E2430] transition"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-phone"
                  className="block text-xs sm:text-sm font-semibold text-[#1E2430] mb-1.5"
                >
                  Nomor HP
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/80 text-sm text-[#1E2430] placeholder-slate-400 outline-none focus:border-[#1E2430] focus:ring-1 focus:ring-[#1E2430] transition"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs sm:text-sm font-semibold text-[#1E2430] mb-1.5"
                >
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
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
                  htmlFor="reg-confirm"
                  className="block text-xs sm:text-sm font-semibold text-[#1E2430] mb-1.5"
                >
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="reg-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full pl-4 pr-24 py-3 rounded-xl border border-slate-300 bg-white/80 text-sm text-[#1E2430] placeholder-slate-400 outline-none focus:border-[#1E2430] focus:ring-1 focus:ring-[#1E2430] transition"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#5C6070] hover:text-[#1E2430] cursor-pointer"
                  >
                    {showConfirmPassword ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#EB936E] focus:ring-[#EB936E] accent-[#EB936E] cursor-pointer"
                />
                <label
                  htmlFor="agreeTerms"
                  className="text-xs sm:text-sm text-[#1E2430] leading-snug cursor-pointer select-none"
                >
                  Saya menyetujui{" "}
                  <span className="font-semibold">Syarat dan Ketentuan</span>{" "}
                  serta{" "}
                  <span className="font-semibold">Kebijakan Privasi</span>{" "}
                  Peduli Negeri.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !agreeTerms}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-[#1E2430] shadow-xs flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer ${
                  agreeTerms && !loading
                    ? "bg-[#EB936E] hover:bg-[#E58862] active:scale-[0.99]"
                    : "bg-[#EAC7B6] opacity-75 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Daftar Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative px-3 bg-[#FAF5EE] text-xs text-[#5C6070]">
                  atau daftar dengan
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-3 px-4 rounded-xl border border-[#1E2430] text-[#1E2430] font-semibold text-xs sm:text-sm hover:bg-slate-100/70 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                Daftar dengan Google
              </button>
            </form>
          )}

          {/* ── FORM 3: LUPA KATA SANDI ───────────────────────── */}
          {authMode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-xs sm:text-sm font-semibold text-[#1E2430] mb-1.5"
                >
                  Alamat Email Terdaftar
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white/80 text-sm text-[#1E2430] placeholder-slate-400 outline-none focus:border-[#1E2430] focus:ring-1 focus:ring-[#1E2430] transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-[#1E2430] shadow-xs flex items-center justify-center gap-2 transition-transform duration-150 active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                style={{ backgroundColor: "#EB936E" }}
              >
                {loading ? (
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Kirim Tautan Pemulihan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => switchMode("login")}
                className="w-full py-3 text-xs sm:text-sm font-semibold text-[#2D3F65] hover:underline transition text-center cursor-pointer"
              >
                Kembali ke Halaman Masuk
              </button>
            </form>
          )}
        </div>

        {/* Footer Kecil Bawah */}
        <div className="text-center text-[11px] text-[#5C6070] pt-4">
          Peduli Negeri © {new Date().getFullYear()} — Platform Gotong Royong
          Masyarakat
        </div>
      </section>
    </div>
  );
}
