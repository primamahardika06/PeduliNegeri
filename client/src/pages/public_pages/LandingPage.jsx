import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  ChevronRight,
  ClipboardList,
  MapPin,
  Menu,
  ShieldCheck,
  X,
  Trophy,
  Star,
  Sparkles,
  Users,
  CheckCircle2,
  Map as MapIcon,
} from "lucide-react";
import { reportService } from "../../services/reportService";
import { testimonialService } from "../../services/testimonialService";
import { authService } from "../../services/authService";
import BrandLogo from "../../components/common/BrandLogo";

const steps = [
  ["Daftar / Masuk", "Buat akun atau masuk ke akun yang sudah ada."],
  ["Pilih Kategori", "Tentukan jenis laporan yang ingin disampaikan."],
  ["Isi Detail Laporan", "Lengkapi informasi, lokasi, dan unggah bukti foto."],
  ["Kirim Laporan", "Laporan diteruskan ke pihak terkait untuk ditangani."],
  ["Pantau Perkembangan", "Lihat pembaruan status laporan secara berkala."],
];

const benefits = [
  ["Laporan Beragam", "Pilih kategori infrastruktur, lingkungan, hingga fasilitas umum."],
  ["Aman & Tepercaya", "Informasi dan identitas pelapor terlindungi dengan privasi penuh."],
  ["Status Terpantau", "Pantau 4 tahapan perkembangan laporan secara transparan."],
  ["Kolaborasi Warga", "Sampaikan aspirasi bersama untuk memajukan lingkungan."],
];

export default function LandingPage() {
  const [currentUser] = useState(() => authService.getCurrentUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalReports: 12548,
    resolvedReports: 10321,
    categoryCount: 8,
    cityCount: 34,
    resolutionRate: 83,
  });
  const [trendingReports, setTrendingReports] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto-switch hero slide every 5 seconds
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    let isMounted = true;
    async function loadLandingData() {
      try {
        const [statsData, publicReps, lbData, testData] = await Promise.allSettled([
          reportService.getPublicStats(),
          reportService.getPublicReports(),
          reportService.getLeaderboard(),
          testimonialService.getTestimonials(),
        ]);

        if (isMounted) {
          if (statsData.status === "fulfilled" && statsData.value) {
            setStats(statsData.value);
          }
          if (publicReps.status === "fulfilled" && Array.isArray(publicReps.value)) {
            setTrendingReports(publicReps.value.slice(0, 5));
          }
          if (lbData.status === "fulfilled" && Array.isArray(lbData.value)) {
            setLeaderboard(lbData.value.slice(0, 5));
          }
          if (testData.status === "fulfilled" && Array.isArray(testData.value) && testData.value.length > 0) {
            setTestimonials(testData.value.slice(0, 4));
          } else {
            // Default realistis ulasan warga
            setTestimonials([
              {
                id: "t-1",
                author: "Budi Santoso",
                content: "Laporan jalan berlubang di depan perumahan kami langsung ditindaklanjuti dalam waktu 3 hari oleh petugas dinas PU. Sangat transparan!",
                rating: 5,
                createdAt: new Date().toISOString(),
              },
              {
                id: "t-2",
                author: "Siti Rahma",
                content: "Sangat terbantu dengan aplikasi ini. Lampu jalan yang mati berbulan-bulan akhirnya terang kembali setelah saya foto dan laporkan ke sini.",
                rating: 5,
                createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
              },
              {
                id: "t-3",
                author: "Rian H.",
                content: "Proses pelaporan mudah dan bisa upload bukti foto langsung dari HP. Progress penanganannya ada notifikasi jelas dari awal sampai selesai.",
                rating: 5,
                createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
              },
            ]);
          }

          // ── Ambil Foto Laporan User untuk Slider (Maksimal 5 Laporan Terbaru) ──
          let slides = [];
          if (currentUser) {
            try {
              const myReports = await reportService.getMyReports();
              if (Array.isArray(myReports) && myReports.length > 0) {
                // Utamakan laporan milik akun user yang memiliki foto bukti
                const withPhotos = myReports.filter((r) => Boolean(r.image_url || r.imageUrl));
                const chosen = withPhotos.length > 0 ? withPhotos.slice(0, 5) : myReports.slice(0, 5);
                slides = chosen.map((r) => ({
                  id: r.id,
                  title: r.title,
                  category: r.category,
                  location: r.location,
                  status: r.status,
                  imageUrl: r.image_url || r.imageUrl || null,
                }));
              }
            } catch {
              // Jika belum login atau gagal, fallback ke laporan publik
            }
          }

          // Jika user belum memiliki laporan, ambil 5 laporan publik terbaru yang memiliki foto
          if (slides.length === 0 && publicReps.status === "fulfilled" && Array.isArray(publicReps.value)) {
            const publicWithPhotos = publicReps.value.filter((r) => Boolean(r.imageUrl || r.image_url));
            const chosen = publicWithPhotos.length > 0 ? publicWithPhotos.slice(0, 5) : publicReps.value.slice(0, 5);
            slides = chosen.map((r) => ({
              id: r.id,
              title: r.title,
              category: r.category,
              location: r.location,
              status: r.status,
              imageUrl: r.imageUrl || r.image_url || null,
            }));
          }

          if (slides.length > 0) {
            setHeroSlides(slides);
          }
        }
      } catch {
        // Fallback default states gracefully handled
      }
    }

    loadLandingData();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const closeMenu = () => setMenuOpen(false);

  const DEFAULT_HERO_SLIDE = {
    id: "default-slide",
    title: "Perbaikan Lampu Jalan Rusak di Jl. Pemuda",
    category: "Infrastruktur",
    location: "Kec. Sukajadi, Kota Bandung",
    status: "Petugas Dikirim ke Lokasi",
    imageUrl: null,
  };

  const activeSlide =
    heroSlides.length > 0 ? heroSlides[currentSlideIndex] : DEFAULT_HERO_SLIDE;

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

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-ink)] font-sans min-h-screen">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#fdebe0]/95 backdrop-blur-md border-b border-[#ecd6c8]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4" aria-label="Navigasi utama">
          <Link to="/" onClick={closeMenu}>
            <BrandLogo size="md" />
          </Link>

          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-[var(--color-muted)]">
            <a href="#beranda" className="text-[var(--color-ink)] hover:text-[var(--color-coral-deep)] transition-colors">
              Beranda
            </a>
            <a href="#laporan" className="hover:text-[var(--color-ink)] transition-colors">
              Laporan
            </a>
            <Link to="/peta" className="hover:text-[var(--color-ink)] flex items-center gap-1 transition-colors">
              Peta
            </Link>
            <Link to="/statistik" className="hover:text-[var(--color-ink)] flex items-center gap-1 transition-colors">
              Statistik
            </Link>
            <a href="#peringkat" className="hover:text-[var(--color-ink)] transition-colors">
              Peringkat
            </a>
            <a href="#tentang" className="hover:text-[var(--color-ink)] transition-colors">
              Tentang Kami
            </a>
            <a href="#cara-melapor" className="hover:text-[var(--color-ink)] transition-colors">
              Bantuan
            </a>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to={currentUser.role === "admin" ? "/admin" : "/reportPage"}
                  className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-semibold rounded bg-[var(--color-cream)] border border-[var(--color-line)] hover:bg-[var(--color-apricot)] transition-colors whitespace-nowrap"
                >
                  Dashboard Saya
                </Link>
                <Link
                  to="/laporan/baru"
                  className="px-3 sm:px-3.5 py-1.5 text-xs font-semibold rounded bg-[var(--color-coral)] hover:bg-[#f39770] text-[var(--color-ink)] transition-colors whitespace-nowrap"
                >
                  Laporkan
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  className="px-3 sm:px-4 py-1.5 text-xs font-semibold rounded border border-[var(--color-ink)] hover:bg-[var(--color-cream)] transition-colors whitespace-nowrap"
                  to="/login"
                >
                  Masuk
                </Link>
                <Link
                  className="px-3 sm:px-4 py-1.5 text-xs font-semibold rounded bg-[var(--color-coral)] hover:bg-[#f39770] text-[var(--color-ink)] transition-colors whitespace-nowrap"
                  to="/login"
                >
                  Daftar
                </Link>
              </div>
            )}

            <button
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              className="md:hidden p-2 rounded text-[var(--color-ink)] hover:bg-black/5 transition-colors cursor-pointer shrink-0"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden px-4 py-3 bg-[var(--color-cream)] border-b border-[var(--color-line)] flex flex-col gap-2.5 text-sm font-medium">
            {currentUser && (
              <div className="flex flex-col gap-2 pb-2.5 mb-1 border-b border-[var(--color-line)]">
                <Link
                  to={currentUser.role === "admin" ? "/admin" : "/reportPage"}
                  className="font-bold text-[var(--color-coral-deep)] flex items-center justify-between"
                  onClick={closeMenu}
                >
                  <span>Dashboard Saya</span>
                  <span className="text-xs bg-[var(--color-surface)] px-2 py-0.5 rounded border border-[var(--color-line)]">
                    {currentUser.role === "admin" ? "Admin" : "Warga"}
                  </span>
                </Link>
                <Link
                  to="/laporan/baru"
                  className="font-bold text-[var(--color-ink)]"
                  onClick={closeMenu}
                >
                  + Buat Laporan Baru
                </Link>
              </div>
            )}
            <a href="#beranda" onClick={closeMenu}>Beranda</a>
            <a href="#laporan" onClick={closeMenu}>Laporan</a>
            <Link to="/peta" onClick={closeMenu}>Peta Laporan</Link>
            <Link to="/statistik" onClick={closeMenu}>Statistik Laporan</Link>
            <a href="#peringkat" onClick={closeMenu}>Papan Peringkat</a>
            <a href="#tentang" onClick={closeMenu}>Tentang Kami</a>
            <a href="#cara-melapor" onClick={closeMenu}>Bantuan</a>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-[var(--color-cream)] py-14 sm:py-20 border-b border-[var(--color-line)]" id="beranda">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 items-center gap-10">
            <div className="lg:col-span-7 reveal-slide-left">
              <p className="text-xs sm:text-sm font-bold text-[var(--color-coral-deep)] tracking-wide uppercase mb-3">
                Suara Anda, Perubahan untuk Negeri
              </p>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-[var(--color-ink)]">
                Bersama Wujudkan Indonesia yang Lebih Baik
              </h1>
              <p className="mt-4 mb-7 text-sm sm:text-base text-[var(--color-muted)] leading-relaxed max-w-xl">
                Peduli Negeri adalah platform pelaporan masyarakat terintegrasi
                untuk menyampaikan aspirasi, keluhan, dan perbaikan fasilitas
                publik secara transparan dan akuntabel.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  className="btn-shimmer px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-[var(--color-coral)] hover:bg-[#f39770] text-[var(--color-ink)] inline-flex items-center gap-2 shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0"
                  to="/laporan/baru"
                >
                  Laporkan Sekarang <ArrowRight size={16} />
                </Link>
                <Link
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl border border-[var(--color-ink)] hover:bg-white/60 inline-flex items-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  to="/peta"
                >
                  <MapIcon size={16} /> Buka Peta Interaktif
                </Link>
              </div>
            </div>

            {/* Interactive Preview Mockup Card / Photo Slider */}
            <div className="lg:col-span-5 max-w-md mx-auto w-full reveal-slide-right">
              <div className="rounded-2xl border border-[var(--color-line)] bg-white p-4 shadow-xl hover-lift transition-all">
                {/* Photo Display / Smooth Crossfade Slider */}
                {heroSlides.length > 0 && heroSlides.some((s) => s.imageUrl) ? (
                  <div className="relative w-full h-48 sm:h-52 rounded-xl overflow-hidden bg-black/10 border border-[var(--color-line)]/50 group">
                    {heroSlides.map((slide, idx) => (
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
                      <Camera size={11} />
                      <span>Foto Laporan</span>
                    </div>

                    {/* Slider Indicator Dots */}
                    {heroSlides.length > 1 && (
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xs z-20">
                        {heroSlides.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentSlideIndex(idx)}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                              idx === currentSlideIndex
                                ? "w-4 bg-[var(--color-coral)]"
                                : "w-1.5 bg-white/60 hover:bg-white"
                            }`}
                            aria-label={`Lihat laporan ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-48 sm:h-52 rounded-xl bg-[var(--color-apricot)] flex flex-col items-center justify-center p-4 text-center border border-[var(--color-line)]/50">
                    <Camera size={28} className="text-[var(--color-coral-deep)] mb-2" />
                    <p className="text-xs font-semibold text-[var(--color-ink)]">
                      Foto Bukti Langsung dari Lapangan
                    </p>
                    <p className="text-[11px] text-[var(--color-muted)] mt-1 max-w-xs">
                      Sertakan foto kondisi fasilitas atau isu lingkungan saat membuat laporan.
                    </p>

                    {heroSlides.length > 1 && (
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/15 backdrop-blur-xs">
                        {heroSlides.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentSlideIndex(idx)}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                              idx === currentSlideIndex
                                ? "w-4 bg-[var(--color-coral-deep)]"
                                : "w-1.5 bg-[var(--color-ink)]/30 hover:bg-[var(--color-ink)]/60"
                            }`}
                            aria-label={`Lihat laporan ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Info Rincian Laporan Dinamis */}
                <div className="mt-3.5 pt-3 border-t border-[var(--color-line)] transition-all duration-500">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-[var(--color-cream)] text-[var(--color-coral-deep)] border border-[var(--color-line)]">
                      {activeSlide.category || "Infrastruktur"}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isSlideResolved
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSlideResolved
                            ? "bg-emerald-600"
                            : "bg-emerald-600 animate-pn-dot"
                        }`}
                      />
                      {slideStatusLabel}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--color-ink)] line-clamp-1">
                    {activeSlide.title}
                  </h4>
                  <p className="text-[11px] text-[var(--color-muted)] flex items-center gap-1 mt-1 truncate">
                    <MapPin size={11} className="shrink-0 text-[var(--color-coral-deep)]" />
                    <span>{activeSlide.location}</span>
                  </p>

                  {/* Visual Progress Bar Dinamis */}
                  <div className="mt-3">
                    <div className="w-full h-1.5 rounded-full bg-[var(--color-line)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-coral-deep)] transition-all duration-700 ease-out"
                        style={{ width: `${slideProgressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-[var(--color-muted)] mt-1 font-medium">
                      <span className={slideStepNum >= 1 ? "font-bold text-[var(--color-coral-deep)]" : ""}>
                        Diterima
                      </span>
                      <span className={slideStepNum >= 2 ? "font-bold text-[var(--color-coral-deep)]" : ""}>
                        Diproses
                      </span>
                      <span className={slideStepNum >= 3 ? "font-bold text-[var(--color-coral-deep)]" : ""}>
                        Petugas Menuju Lokasi
                      </span>
                      <span className={slideStepNum >= 4 ? "font-bold text-emerald-700" : ""}>
                        Selesai
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-[var(--color-apricot)] border-b border-[var(--color-coral-deep)]/20 py-6 reveal-on-scroll" aria-label="Statistik platform">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-coral-deep)]/15">
            <div className="text-center pt-2 sm:pt-0">
              <strong className="block text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)]">
                {stats.totalReports.toLocaleString()}
              </strong>
              <span className="text-xs text-[var(--color-muted)] font-medium mt-0.5 block">
                Total Laporan Masuk
              </span>
            </div>
            <div className="text-center pt-2 sm:pt-0">
              <strong className="block text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)]">
                {stats.resolvedReports.toLocaleString()}
              </strong>
              <span className="text-xs text-[var(--color-muted)] font-medium mt-0.5 block">
                Laporan Selesai ({stats.resolutionRate}%)
              </span>
            </div>
            <div className="text-center pt-2 sm:pt-0">
              <strong className="block text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)]">
                {stats.categoryCount}
              </strong>
              <span className="text-xs text-[var(--color-muted)] font-medium mt-0.5 block">
                Kategori Layanan
              </span>
            </div>
            <div className="text-center pt-2 sm:pt-0">
              <strong className="block text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)]">
                {stats.cityCount}+
              </strong>
              <span className="text-xs text-[var(--color-muted)] font-medium mt-0.5 block">
                Kota & Wilayah Se-Indonesia
              </span>
            </div>
          </div>
        </section>

        {/* Trending Issues Section */}
        <section className="py-14 sm:py-20 border-b border-[var(--color-line)]" id="laporan">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 reveal-on-scroll">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] tracking-tight">
                  Isu yang Sedang Jadi Perhatian
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-muted)] mt-1.5 max-w-xl">
                  Daftar laporan terbaru dari warga yang saat ini dalam proses tindak lanjut oleh pihak dinas terkait.
                </p>
              </div>
              <Link className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-periwinkle-deep)] hover:underline" to="/peta">
                Lihat di Peta Interaktif <ArrowRight size={14} />
              </Link>
            </div>

            <div className="rounded-2xl border border-[var(--color-line)] bg-white divide-y divide-[var(--color-line)] overflow-hidden shadow-xs reveal-scale hover-lift">
              {trendingReports.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--color-muted)]">
                  Belum ada laporan publik untuk ditampilkan saat ini.
                </div>
              ) : (
                trendingReports.map((item, index) => {
                  const isResolved = item.status === "Laporan Selesai" || item.status === "Selesai";
                  return (
                    <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--color-surface)] transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold text-[var(--color-muted)] w-5 pt-0.5">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--color-cream)] text-[var(--color-coral-deep)] border border-[var(--color-line)]">
                              {item.category}
                            </span>
                            <span className="text-[11px] text-[var(--color-muted)] flex items-center gap-1">
                              <MapPin size={11} /> {item.location}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-[var(--color-ink)]">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-[var(--color-muted)] line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:self-center pl-8 sm:pl-0">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                          isResolved ? "bg-emerald-100 text-emerald-800" : "bg-[var(--color-apricot)] text-[var(--color-ink)]"
                        }`}>
                          {item.status}
                        </span>
                        <Link
                          to="/peta"
                          className="text-xs font-semibold text-[var(--color-coral-deep)] hover:underline inline-flex items-center gap-1"
                        >
                          Titik Peta <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Leaderboard Section (FEATURE #1) */}
        <section className="bg-[var(--color-cream)] py-14 sm:py-20 border-b border-[var(--color-line)]" id="peringkat">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10 reveal-on-scroll">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold mb-2">
                <Trophy size={13} className="text-amber-600" /> Papan Peringkat Pelapor
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] tracking-tight">
                Apresiasi Warga Peduli Lingkungan
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-muted)] mt-2">
                Peringkat warga yang paling aktif menyampaikan laporan terverifikasi demi perbaikan fasilitas publik di Indonesia.
              </p>
            </div>

            <div className="max-w-4xl mx-auto rounded-2xl border border-[var(--color-line)] bg-white overflow-hidden shadow-xs reveal-scale hover-lift">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--color-surface)] border-b border-[var(--color-line)] text-[var(--color-muted)] uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4 w-16">Peringkat</th>
                      <th className="py-3 px-4">Nama Pelapor</th>
                      <th className="py-3 px-4">Kota</th>
                      <th className="py-3 px-4 text-center">Laporan Terverifikasi</th>
                      <th className="py-3 px-4 text-center">Terselesaikan</th>
                      <th className="py-3 px-4 text-center">Lencana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-line)]">
                    {leaderboard.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-6 text-center text-[var(--color-muted)]">
                          Belum ada data peringkat yang ditampilkan.
                        </td>
                      </tr>
                    ) : (
                      leaderboard.map((user, idx) => (
                        <tr key={user.id || idx} className="hover:bg-[var(--color-surface)] transition-colors">
                          <td className="py-3.5 px-4 font-bold">
                            {idx === 0 ? (
                              <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-extrabold text-[11px] shadow-xs">
                                1
                              </span>
                            ) : idx === 1 ? (
                              <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center font-extrabold text-[11px] shadow-xs">
                                2
                              </span>
                            ) : idx === 2 ? (
                              <span className="w-6 h-6 rounded-full bg-amber-700/60 text-white flex items-center justify-center font-extrabold text-[11px] shadow-xs">
                                3
                              </span>
                            ) : (
                              <span className="text-[var(--color-muted)] pl-2">{idx + 1}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-full bg-[var(--color-cream)] text-[var(--color-coral-deep)] font-extrabold flex items-center justify-center text-xs border border-[var(--color-line)]">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                              <span className="font-bold text-[var(--color-ink)]">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-[var(--color-muted)]">{user.city}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-[var(--color-ink)]">
                            {user.verifiedCount}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                            {user.resolvedCount}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-cream)] text-[var(--color-coral-deep)] border border-[var(--color-line)]">
                              <Sparkles size={10} /> Warga Teladan
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center mt-5 text-xs text-[var(--color-muted)] reveal-on-scroll">
              <span>Ingin nama/username Anda tampil di sini? </span>
              <Link to="/reportPage" className="text-[var(--color-coral-deep)] font-bold hover:underline">
                Atur Opsi Privasi di Halaman Laporan Saya →
              </Link>
            </div>
          </div>
        </section>

        {/* Tentang Peduli Negeri */}
        <section className="py-14 sm:py-20 border-b border-[var(--color-line)]" id="tentang">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 reveal-slide-left">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] tracking-tight">
                  Tentang Peduli Negeri
                </h2>
                <p className="mt-3 text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed">
                  Peduli Negeri adalah jembatan digital antara masyarakat dan instansi pemerintah dalam mendeteksi serta menindaklanjuti kerusakan infrastruktur, kebersihan lingkungan, dan sarana publik.
                </p>
                <div className="mt-5">
                  <a href="#cara-melapor" className="btn-shimmer inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[var(--color-ink)] text-white hover:bg-black transition-all hover:-translate-y-0.5">
                    Pelajari Alur Laporan <ArrowRight size={14} />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 reveal-slide-right">
                <div className="p-5 rounded-2xl border border-[var(--color-line)] bg-white shadow-xs hover-lift">
                  <h4 className="text-sm font-bold text-[var(--color-ink)] mb-1">Mudah Digunakan</h4>
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                    Formulir pelaporan dirancang ringkas dengan dukungan upload foto bukti kamera langsung.
                  </p>
                </div>
                <div className="p-5 rounded-2xl border border-[var(--color-line)] bg-white shadow-xs hover-lift">
                  <h4 className="text-sm font-bold text-[var(--color-ink)] mb-1">Transparan & Akuntabel</h4>
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                    Setiap laporan memiliki 4 tahapan status yang dapat dipantau perkembangannya secara live.
                  </p>
                </div>
                <div className="p-5 rounded-2xl border border-[var(--color-line)] bg-white shadow-xs hover-lift">
                  <h4 className="text-sm font-bold text-[var(--color-ink)] mb-1">Bersama Bangun Negeri</h4>
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                    Aspirasi warga langsung dipetakan ke koordinat wilayah untuk tindakan cepat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5-Step Guide: Cara Melapor */}
        <section className="bg-[var(--color-ink)] text-[#fff6ef] py-14 sm:py-20" id="cara-melapor">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-12 reveal-on-scroll">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Cara Melapor di Peduli Negeri
              </h2>
              <p className="text-xs sm:text-sm text-[#d3d0d1] mt-2">
                Hanya butuh beberapa menit untuk menyampaikan aspirasi dan keluhan lingkungan Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {steps.map(([title, desc], idx) => (
                <div key={title} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between hover-lift reveal-scale">
                  <div>
                    <span className="text-2xl font-extrabold text-[var(--color-coral)] block mb-3">
                      0{idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-white mb-1.5">{title}</h4>
                    <p className="text-xs text-[#d3d0d1] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials (FEATURE #4: Ulasan Laporan yang Telah Selesai) */}
        <section className="py-14 sm:py-20 bg-[var(--color-surface)] border-b border-[var(--color-line)]" id="testimoni">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 reveal-on-scroll">
              <div>
                <span className="text-xs font-bold text-[var(--color-coral-deep)] uppercase tracking-wide">
                  Ulasan & Testimoni
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] tracking-tight mt-1">
                  Apa Kata Pengguna?
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-muted)] mt-1 max-w-xl">
                  Pengalaman nyata warga setelah laporannya berhasil ditindaklanjuti dan diselesaikan oleh pihak terkait.
                </p>
              </div>
              <Link to="/reportPage" className="text-xs font-bold text-[var(--color-coral-deep)] hover:underline inline-flex items-center gap-1">
                Beri Ulasan Laporan Anda <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((t) => (
                <div key={t.id} className="p-5 rounded-2xl border border-[var(--color-line)] bg-white shadow-xs flex flex-col justify-between hover-lift reveal-on-scroll">
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-3">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-xs text-[var(--color-muted)] italic leading-relaxed mb-4">
                      "{t.content}"
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[var(--color-line)] flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--color-ink)]">{t.author}</span>
                    <span className="text-[10px] text-[var(--color-muted)]">
                      {t.createdAt
                        ? new Date(t.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Kenapa Memilih Peduli Negeri */}
        <section className="py-14 sm:py-20 border-b border-[var(--color-line)] bg-[var(--color-cream)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] tracking-tight text-center mb-10 reveal-on-scroll">
              Kenapa Memilih Peduli Negeri?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {benefits.map(([title, desc], idx) => (
                <div key={title} className="p-5 rounded-2xl border border-[var(--color-line)] bg-white shadow-xs hover-lift reveal-scale">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-cream)] text-[var(--color-coral-deep)] flex items-center justify-center mb-3">
                    {idx === 0 ? <ClipboardList size={18} /> : idx === 1 ? <ShieldCheck size={18} /> : idx === 2 ? <CheckCircle2 size={18} /> : <Users size={18} />}
                  </div>
                  <h4 className="text-sm font-bold text-[var(--color-ink)] mb-1">{title}</h4>
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="bg-[var(--color-coral)] py-10 reveal-scale">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--color-ink)]">
                Ada masalah di lingkungan Anda?
              </h2>
              <p className="text-xs sm:text-sm text-[var(--color-ink)]/80 mt-1">
                Jangan diamkan. Suarakan sekarang dan pantau proses penanganannya secara transparan.
              </p>
            </div>
            <Link
              to="/laporan/baru"
              className="px-6 py-3 text-xs sm:text-sm font-bold rounded bg-[var(--color-ink)] hover:bg-black text-white shadow-md transition-transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              Laporkan Sekarang
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--color-ink)] text-[#fff6ef] pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10 text-xs">
          <div className="md:col-span-5">
            <div className="mb-3">
              <BrandLogo size="md" isDark={true} />
            </div>
            <p className="text-[#c9c7cd] text-xs leading-relaxed max-w-sm mb-4">
              Platform partisipasi publik untuk melaporkan kerusakan sarana umum, isu lingkungan, dan aspirasi masyarakat demi Indonesia yang lebih baik.
            </p>
          </div>

          <div className="md:col-span-2">
            <h5 className="font-bold text-white uppercase text-[11px] mb-3">Tautan Cepat</h5>
            <ul className="space-y-2 text-[#c9c7cd]">
              <li><a href="#beranda" className="hover:text-[var(--color-coral)]">Beranda</a></li>
              <li><Link to="/laporan" className="hover:text-[var(--color-coral)]">Daftar Laporan</Link></li>
              <li><Link to="/peta" className="hover:text-[var(--color-coral)]">Peta Interaktif</Link></li>
              <li><Link to="/statistik" className="hover:text-[var(--color-coral)]">Statistik Laporan</Link></li>
              <li><a href="#peringkat" className="hover:text-[var(--color-coral)]">Papan Peringkat</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h5 className="font-bold text-white uppercase text-[11px] mb-3">Kategori Laporan</h5>
            <ul className="space-y-2 text-[#c9c7cd]">
              <li><Link to="/peta" className="hover:text-[var(--color-coral)]">Infrastruktur</Link></li>
              <li><Link to="/peta" className="hover:text-[var(--color-coral)]">Lingkungan Hidup</Link></li>
              <li><Link to="/peta" className="hover:text-[var(--color-coral)]">Fasilitas Umum</Link></li>
              <li><Link to="/peta" className="hover:text-[var(--color-coral)]">Isu Sosial & Lainnya</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h5 className="font-bold text-white uppercase text-[11px] mb-3">Pusat Bantuan</h5>
            <p className="text-[#c9c7cd] text-xs leading-relaxed mb-3">
              Ada pertanyaan atau butuh bantuan dalam menyampaikan laporan?
            </p>
            <Link
              to="/laporan/baru"
              className="inline-block px-3.5 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
            >
              Mulai Buat Laporan →
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#c9c7cd]">
          <span>© {new Date().getFullYear()} Peduli Negeri. Hak Cipta Dilindungi Undang-Undang.</span>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-white">Kebijakan Privasi</Link>
            <Link to="/" className="hover:text-white">Syarat & Ketentuan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
