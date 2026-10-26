import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { authService } from "../../services/authService";
import brandLogo from "../../assets/PeduliNegeri (4).png";
import communityIllustration from "../../assets/PeduliNegeri (4).png";

export default function LoginPages({ onLoginSuccess, initialMode = "login" }) {
  const navigate = useNavigate();

  // State mode tab: 'login' | 'register'
  const [authMode, setAuthMode] = useState(initialMode);

  // Role selection: 'user' | 'admin'
  const [selectedRole, setSelectedRole] = useState("user");

  // Form inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await authService.login({
        email,
        password,
        expectedRole: selectedRole,
      });

      const userData = response.data.user;
      setSuccessMessage(
        `Selamat datang kembali, ${userData.fullName || userData.email}!`,
      );

      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }

      // Navigasi sesuai role setelah jeda singkat
      setTimeout(() => {
        if (userData.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      }, 700);
    } catch (err) {
      setErrorMessage(
        err.message || "Gagal masuk. Periksa kembali email dan password Anda.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!fullName.trim()) {
      setErrorMessage("Nama lengkap wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Kata sandi harus memiliki minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        email,
        password,
        fullName,
        role: selectedRole,
      });

      setSuccessMessage(
        "Akun berhasil dibuat dan tersimpan di database Supabase! Silakan masuk.",
      );
      // Pindahkan ke tab login dengan email yang sudah terisi
      setTimeout(() => {
        setAuthMode("login");
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

  return (
    <div className="theme-light min-h-screen bg-surface font-sans text-ink lg:grid lg:grid-cols-2">
      <aside className="flex min-h-[24rem] flex-col bg-coral px-5 py-5 sm:min-h-[30rem] sm:px-9 sm:py-7 lg:min-h-screen lg:px-10 lg:py-8">
        <Link
          to="/"
          aria-label="Peduli Negeri, beranda"
          className="flex w-fit items-center gap-2.5"
        >
          <img
            src={brandLogo}
            alt="Peduli Negeri"
            className="h-12 w-48 object-contain"
          />
        </Link>

        <div className="mt-7 flex min-h-40 flex-1 items-center justify-center overflow-hidden rounded bg-apricot p-5 sm:mt-8 lg:mt-7 lg:min-h-0">
          <img
            src={communityIllustration}
            alt="Ilustrasi warga bekerja sama"
            className="h-full max-h-[26rem] w-full object-contain"
          />
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
            Suara Anda, perubahan untuk negeri.
          </h2>
          <ul className="mt-5 grid grid-cols-3 gap-3 text-xs sm:gap-5">
            <li className="border-t-2 border-ink pt-3">
              <h3 className="font-semibold">Isi detail</h3>
              <p className="mt-1 leading-5">Jelaskan kondisi dan lokasinya.</p>
            </li>
            <li className="border-t-2 border-ink pt-3">
              <h3 className="font-semibold">Kirim laporan</h3>
              <p className="mt-1 leading-5">Sampaikan ke pihak terkait.</p>
            </li>
            <li className="border-t-2 border-ink pt-3">
              <h3 className="font-semibold">Pantau proses</h3>
              <p className="mt-1 leading-5">Ikuti perkembangan status.</p>
            </li>
          </ul>
        </div>
      </aside>

      <main className="flex min-w-0 flex-col px-5 py-5 sm:px-10 sm:py-7 lg:min-h-screen lg:px-14 lg:py-8 xl:px-20">
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
          <div className="flex min-h-10 items-center justify-end gap-1 text-sm text-muted">
            <span>
              {authMode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}
            </span>
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="min-h-10 px-2 font-semibold text-periwinkle-deep underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-periwinkle-deep"
            >
              {authMode === "login" ? "Daftar sekarang" : "Masuk"}
            </button>
          </div>

          <div className="mb-6 mt-8">
            <h1 className="text-3xl font-bold leading-tight text-ink">
              {authMode === "login" ? "Selamat datang kembali" : "Daftar akun"}
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              {authMode === "login"
                ? "Masuk untuk melanjutkan ke akun Peduli Negeri Anda."
                : "Buat akun untuk mulai melaporkan dan mengikuti perkembangan di sekitar Anda."}
            </p>
          </div>

          {/* Auth Card */}
          <div className="rounded border border-line bg-surface p-5 sm:p-8">
            {/* Role Selector: User vs Admin */}
            <div className="mb-5">
              <label className="mb-2 block text-xs font-semibold text-muted">
                {authMode === "login" ? "Masuk sebagai" : "Jenis akun"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole("user")}
                  className={`relative flex min-h-11 items-center justify-center gap-2 rounded border text-sm font-medium transition-colors ${
                    selectedRole === "user"
                      ? "border-coral-deep bg-apricot text-ink"
                      : "border-line bg-surface text-muted hover:border-coral"
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Pengguna</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("admin")}
                  className={`relative flex min-h-11 items-center justify-center gap-2 rounded border text-sm font-medium transition-colors ${
                    selectedRole === "admin"
                      ? "border-periwinkle-deep bg-periwinkle/30 text-ink"
                      : "border-line bg-surface text-muted hover:border-periwinkle"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Administrator</span>
                </button>
              </div>

              {/* Role Notice */}
              <p className="mt-2 text-xs leading-5 text-muted">
                <Sparkles className="mr-1 inline h-3.5 w-3.5 text-coral-deep" />
                {selectedRole === "user"
                  ? "Akses portal pelaporan masyarakat."
                  : "Akses pengelolaan sistem administrator."}
              </p>
            </div>

            {/* Feedback Messages */}
            {errorMessage && (
              <div className="mb-4 flex items-start gap-3 rounded border border-coral/50 bg-cream p-3.5 text-xs text-coral-deep">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-coral-deep" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 flex items-start gap-3 rounded border border-periwinkle/60 bg-periwinkle/15 p-3.5 text-xs text-periwinkle-deep">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-periwinkle-deep" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* FORM: LOGIN */}
            {authMode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-300">
                      Kata Sandi
                    </label>
                    <Link
                      to="/reset-password"
                      className="text-xs font-medium text-periwinkle-deep underline-offset-4 hover:underline"
                    >
                      Lupa kata sandi?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded bg-coral px-4 text-sm font-semibold text-ink transition-colors hover:bg-apricot focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral-deep ${loading ? "cursor-not-allowed opacity-70" : ""}`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        Masuk sebagai{" "}
                        {selectedRole === "admin" ? "Admin" : "User"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* FORM: REGISTER */
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Kata Sandi (Min. 6 Karakter)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Konfirmasi Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded bg-coral px-4 text-sm font-semibold text-ink transition-colors hover:bg-apricot focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral-deep ${loading ? "cursor-not-allowed opacity-70" : ""}`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        Daftarkan Akun (
                        {selectedRole === "admin" ? "Admin" : "User"})
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Database Info Tag */}
            <div className="mt-6 pt-4 border-t border-slate-700/60 text-center">
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <span>Tersinkronisasi otomatis dengan Database</span>
                <span className="font-semibold text-periwinkle-deep">
                  Supabase
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
