import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Camera,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  MapPin,
} from "lucide-react";
import { authService } from "../../services/authService";
import { reportService } from "../../services/reportService";
import { supabase } from "../../config/supabaseClient";
import logoPeduliNegeri from "../../assets/PeduliNegeri (4).png";

function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // State slider foto laporan warga (konsep persis Landing Page)
  const [reportSlides, setReportSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto-switch slide setiap 5 detik persis seperti landing page
  useEffect(() => {
    if (reportSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % reportSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reportSlides.length]);

  // Ambil laporan publik dari database untuk card foto di sisi kiri
  useEffect(() => {
    let isMounted = true;
    async function loadPublicReports() {
      try {
        const publicReps = await reportService.getPublicReports();
        if (isMounted && Array.isArray(publicReps) && publicReps.length > 0) {
          // Prioritaskan laporan yang memiliki foto bukti
          const withPhotos = publicReps.filter((r) =>
            Boolean(r.imageUrl || r.image_url),
          );
          const chosen =
            withPhotos.length > 0
              ? withPhotos.slice(0, 5)
              : publicReps.slice(0, 5);

          const slides = chosen.map((r) => ({
            id: r.id,
            title: r.title,
            category: r.category,
            location: r.location,
            status: r.status,
            imageUrl: r.imageUrl || r.image_url || null,
          }));

          if (slides.length > 0) {
            setReportSlides(slides);
          }
        }
      } catch {
        // Fallback anggun jika server belum dapat dijangkau
      }
    }

    loadPublicReports();
    return () => {
      isMounted = false;
    };
  }, []);

  // Cek callback redirect setelah user login dengan Google OAuth
  useEffect(() => {
    let isMounted = true;

    async function handleOAuthCallback() {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      const hasOAuthParams =
        hash.includes("access_token") ||
        hash.includes("error") ||
        search.includes("code=") ||
        search.includes("error");

      // PENTING: Hanya jalankan sinkronisasi jika URL benar-benar berasal dari redirect OAuth Google
      if (!hasOAuthParams) {
        return;
      }

      // 1. Cek bila Google/Supabase mengembalikan parameter error
      if (hash.includes("error") || search.includes("error")) {
        const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
        const searchParams = new URLSearchParams(search);
        const errorDesc =
          hashParams.get("error_description") ||
          searchParams.get("error_description") ||
          "Gagal masuk dengan akun Google.";
        setErrorMessage(decodeURIComponent(errorDesc.replace(/\+/g, " ")));
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // 2. Cek sesi Supabase dari hasil redirect OAuth
      if (!supabase) return;

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session && session.user) {
          setGoogleLoading(true);
          const { user: userData } =
            await authService.handleOAuthSession(session);

          if (isMounted) {
            setSuccessMessage(
              `Selamat datang, ${userData.fullName || userData.email}!`,
            );

            if (onLoginSuccess) {
              onLoginSuccess(userData);
            }

            // Bersihkan parameter hash / query URL agar reload tidak memicu auto-login
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            );

            setTimeout(() => {
              if (userData.role === "admin") {
                navigate("/admin");
              } else {
                navigate("/reportPage");
              }
            }, 600);
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(
            err.message || "Gagal memproses autentikasi dengan akun Google.",
          );
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        }
      } finally {
        if (isMounted) {
          setGoogleLoading(false);
        }
      }
    }

    handleOAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, onLoginSuccess]);

  const DEFAULT_SLIDE = {
    id: "default-slide",
    title: "Perbaikan Lampu Jalan Rusak di Jl. Pemuda",
    category: "Infrastruktur",
    location: "Kec. Sukajadi, Kota Bandung",
    status: "Petugas Dikirim ke Lokasi",
    imageUrl: null,
  };

  const activeSlide =
    reportSlides.length > 0 ? reportSlides[currentSlideIndex] : DEFAULT_SLIDE;

  const isSlideResolved =
    activeSlide.status === "Laporan Selesai" || activeSlide.status === "Selesai";
  const slideStepNum = isSlideResolved
    ? 4
    : activeSlide.status === "Petugas Dikirim ke Lokasi"
      ? 3
      : activeSlide.status === "Laporan Diproses" ||
        activeSlide.status === "Sedang Diverifikasi"
        ? 2
        : 1;

  const slideProgressPercent =
    slideStepNum === 4
      ? 100
      : slideStepNum === 3
        ? 75
        : slideStepNum === 2
          ? 50
          : 25;

  const slideStatusLabel =
    activeSlide.status === "Laporan Selesai" || activeSlide.status === "Selesai"
      ? "Laporan Selesai"
      : activeSlide.status === "Petugas Dikirim ke Lokasi"
        ? "Sedang Ditangani"
        : activeSlide.status === "Laporan Diproses" ||
          activeSlide.status === "Sedang Diverifikasi"
          ? "Sedang Diverifikasi"
          : "Laporan Diterima";

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
        err.message ||
        "Gagal masuk. Periksa kembali email/nomor HP dan kata sandi Anda.",
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

  // Handle Google Auth: Mengalihkan ke OAuth Provider Google via Supabase
  const handleGoogleAuth = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setGoogleLoading(true);

    try {
      await authService.signInWithGoogle();
      // Supabase akan mengarahkan browser ke akun Google secara otomatis
    } catch (err) {
      setGoogleLoading(false);
      setErrorMessage(
        err.message ||
        "Gagal menghubungkan ke layanan Google. Pastikan Google Provider sudah diaktifkan di Supabase Dashboard.",
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-[#1E2430]">
      {/* ── SISI KIRI (Visual & Branding) ──────────────────────── */}
      <section
        className="w-full lg:w-[48%] xl:w-[46%] p-6 sm:p-10 lg:p-14 flex flex-col justify-between shrink-0"
        style={{ backgroundColor: "#EB936E" }}
      >
        {/* Logo PeduliNegeri & Tombol Kembali */}
        <div className="flex items-center justify-between gap-3 w-full">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoPeduliNegeri}
              alt="Peduli Negeri"
              className="h-9 sm:h-11 w-auto object-contain drop-shadow-xs"
            />
          </Link>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/30 hover:bg-white/60 text-[#1E2430] border border-[#1E2430]/20 transition shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Card Foto Mockup & Headline (Persis konsep Landing Page) */}
        <div className="my-6 lg:my-8 space-y-6">
          <div className="rounded-2xl border border-[#1E2430]/15 bg-white p-3.5 sm:p-4 shadow-xl max-w-md mx-auto w-full transition-all">
            {/* Foto Display / Smooth Crossfade Slider */}
            {reportSlides.length > 0 && reportSlides.some((s) => s.imageUrl) ? (
              <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden bg-black/10 border border-slate-200/80 group">
                {reportSlides.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className={`absolute inset-0 slider-photo-fade ${
                      idx === currentSlideIndex
                        ? "opacity-100 scale-100 z-10"
                        : "opacity-0 scale-105 z-0 pointer-events-none"
                    }`}
                  >
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover transition-transform duration-1000"
                    />
                  </div>
                ))}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1 shadow-xs z-20">
                  <Camera className="w-3 h-3" />
                  <span>Foto Laporan</span>
                </div>

                {/* Slider Indicator Dots */}
                {reportSlides.length > 1 && (
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xs z-20">
                    {reportSlides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === currentSlideIndex
                          ? "w-4 bg-[#EB936E]"
                          : "w-1.5 bg-white/60 hover:bg-white"
                          }`}
                        aria-label={`Lihat laporan ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full h-44 sm:h-48 rounded-xl bg-[#FADDBA] flex flex-col items-center justify-center p-4 text-center border border-[#1E2430]/10">
                <div className="p-2.5 rounded-xl bg-[#EB936E]/20 text-[#1E2430] mb-2">
                  <Camera className="w-6 h-6 stroke-[1.8]" />
                </div>
                <p className="text-xs font-bold text-[#1E2430]">
                  Foto Bukti Langsung dari Lapangan
                </p>
                <p className="text-[11px] text-[#1E2430]/75 mt-1 max-w-xs leading-relaxed">
                  Kondisi fasilitas publik nyata yang dilaporkan oleh masyarakat.
                </p>

                {reportSlides.length > 1 && (
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/15 backdrop-blur-xs">
                    {reportSlides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentSlideIndex(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === currentSlideIndex
                          ? "w-4 bg-[#EB936E]"
                          : "w-1.5 bg-[#1E2430]/30 hover:bg-[#1E2430]/60"
                          }`}
                        aria-label={`Lihat laporan ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Info Rincian Laporan Dinamis */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded bg-[#FAF5EE] text-[#EB936E] border border-[#1E2430]/10">
                  {activeSlide.category || "Infrastruktur"}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isSlideResolved ? "bg-emerald-600" : "bg-emerald-600 animate-pn-dot"
                      }`}
                  />
                  {slideStatusLabel}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1E2430] line-clamp-1">
                {activeSlide.title}
              </h4>
              <p className="text-[11px] text-[#5C6070] flex items-center gap-1 mt-1 truncate">
                <MapPin className="w-3 h-3 shrink-0 text-[#EB936E]" />
                <span>{activeSlide.location}</span>
              </p>

              {/* Visual Progress Bar Dinamis */}
              <div className="mt-3">
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-[#EB936E] transition-all duration-500"
                    style={{ width: `${slideProgressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-[#5C6070] mt-1 font-medium">
                  <span className={slideStepNum >= 1 ? "font-bold text-[#EB936E]" : ""}>
                    Diterima
                  </span>
                  <span className={slideStepNum >= 2 ? "font-bold text-[#EB936E]" : ""}>
                    Diproses
                  </span>
                  <span className={slideStepNum >= 3 ? "font-bold text-[#EB936E]" : ""}>
                    Petugas Menuju Lokasi
                  </span>
                  <span className={slideStepNum >= 4 ? "font-bold text-emerald-700" : ""}>
                    Selesai
                  </span>
                </div>
              </div>
            </div>
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
        <div className="flex items-center justify-between text-xs sm:text-sm text-[#5C6070] mb-4 gap-2">
          <Link
            to="/"
            className="lg:hidden inline-flex min-h-11 items-center gap-1.5 font-bold text-[#1E2430] hover:text-[#2D3F65] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#EB936E]" />
            <span>Beranda</span>
          </Link>
          <div className="ml-auto">
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
                className="btn-shimmer w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-[#1E2430] shadow-xs flex items-center justify-center gap-2 transition-transform duration-150 active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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
                disabled={googleLoading || loading}
                className="w-full py-3 px-4 rounded-xl border border-[#1E2430] bg-white text-[#1E2430] font-semibold text-xs sm:text-sm hover:bg-slate-50 active:scale-[0.99] transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-2xs"
              >
                {googleLoading ? (
                  <>
                    <LoaderCircle className="w-4 h-4 animate-spin text-[#1E2430]" />
                    <span>Menghubungkan ke Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                    <span>Masuk dengan Google</span>
                  </>
                )}
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
                className={`btn-shimmer w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-[#1E2430] shadow-xs flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer ${agreeTerms && !loading
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
                disabled={googleLoading || loading}
                className="w-full py-3 px-4 rounded-xl border border-[#1E2430] bg-white text-[#1E2430] font-semibold text-xs sm:text-sm hover:bg-slate-50 active:scale-[0.99] transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-2xs"
              >
                {googleLoading ? (
                  <>
                    <LoaderCircle className="w-4 h-4 animate-spin text-[#1E2430]" />
                    <span>Menghubungkan ke Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                    <span>Daftar dengan Google</span>
                  </>
                )}
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
                className="btn-shimmer w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-[#1E2430] shadow-xs flex items-center justify-center gap-2 transition-transform duration-150 active:scale-[0.99] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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
