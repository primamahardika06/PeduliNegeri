import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Check,
  Clock,
  MapPin,
  Camera,
  Search,
  Plus,
  LogOut,
  Globe,
  Map,
  Star,
  X,
  AlertCircle,
  CheckCircle2,
  FileText,
  User,
  Eye,
  Send,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { authService } from "../../services/authService";
import { reportService } from "../../services/reportService";
import { testimonialService } from "../../services/testimonialService";
import BrandLogo from "../../components/common/BrandLogo";

const CATEGORIES = [
  "Semua",
  "Infrastruktur",
  "Fasilitas Umum",
  "Lingkungan",
  "Lainnya",
];

const STEPS = [
  { step: 1, key: "Laporan Diterima", label: "Laporan Diterima" },
  { step: 2, key: "Laporan Diproses", label: "Diverifikasi", altKey: "Diverifikasi" },
  { step: 3, key: "Petugas Dikirim ke Lokasi", label: "Petugas Dikirim ke Lokasi" },
  { step: 4, key: "Laporan Selesai", label: "Laporan Selesai", altKey: "Selesai" },
];

function getStepNumber(status) {
  if (status === "Laporan Selesai" || status === "Selesai") return 4;
  if (status === "Petugas Dikirim ke Lokasi") return 3;
  if (status === "Laporan Diproses") return 2;
  return 1;
}

function formatDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    const day = d.getDate();
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    return `${day} ${months[d.getMonth()]}`;
  } catch {
    return "";
  }
}

function formatFullDateTime(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    const day = d.getDate();
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${months[d.getMonth()]} ${year}, ${hours}.${minutes}`;
  } catch {
    return "";
  }
}

export default function ReportPages({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => currentUser || authService.getCurrentUser());

  // Data state
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportError, setReportError] = useState("");
  const [selectedReportId, setSelectedReportId] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal preview photo
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Leaderboard privacy settings
  const [leaderboardVisible, setLeaderboardVisible] = useState(
    Boolean(user?.leaderboard_visible)
  );
  const [displayType, setDisplayType] = useState(
    user?.leaderboard_display_type === "username" ? "username" : "name"
  );
  const [username, setUsername] = useState(user?.leaderboard_username || "");
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [privacyMessage, setPrivacyMessage] = useState({ text: "", type: "" });

  // Testimonial submission for completed reports
  const [rating, setRating] = useState(5);
  const [testimonialContent, setTestimonialContent] = useState("");
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
  const [testimonialSuccess, setTestimonialSuccess] = useState(false);
  const [testimonialError, setTestimonialError] = useState("");

  // Sync user state if prop changes
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      setLeaderboardVisible(Boolean(currentUser.leaderboard_visible));
      setDisplayType(
        currentUser.leaderboard_display_type === "username" ? "username" : "name"
      );
      setUsername(currentUser.leaderboard_username || "");
    }
  }, [currentUser]);

  // Load user's reports
  useEffect(() => {
    let isActive = true;
    const loadReports = async () => {
      try {
        const items = await reportService.getMyReports();
        if (isActive) {
          setReports(items || []);
          setReportError("");
          // Auto-select first report if none selected or previous selection no longer exists
          setSelectedReportId((prev) => {
            if (prev && items.some((r) => r.id === prev)) return prev;
            return items.length > 0 ? items[0].id : null;
          });
        }
      } catch (err) {
        if (isActive) setReportError(err.message || "Gagal memuat laporan.");
      } finally {
        if (isActive) setIsLoadingReports(false);
      }
    };

    loadReports();
    const intervalId = window.setInterval(loadReports, 15000);
    window.addEventListener("focus", loadReports);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadReports);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    if (onLogout) onLogout();
    navigate("/login");
  };

  // Filtered reports
  const filteredReports = reports.filter((item) => {
    const matchCategory =
      selectedCategory === "Semua" || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.id?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  const selectedReport =
    reports.find((r) => r.id === selectedReportId) || filteredReports[0] || null;

  const currentStep = selectedReport ? getStepNumber(selectedReport.status) : 1;

  // Handle Save Leaderboard Privacy
  const handleSavePrivacy = async () => {
    setSavingPrivacy(true);
    setPrivacyMessage({ text: "", type: "" });
    try {
      await authService.updateLeaderboardSettings({
        leaderboard_visible: leaderboardVisible,
        leaderboard_display_type: displayType,
        leaderboard_username: username,
      });

      const updated = {
        ...user,
        leaderboard_visible: leaderboardVisible,
        leaderboard_display_type: displayType,
        leaderboard_username: username,
      };
      setUser(updated);
      setPrivacyMessage({
        text: "Pengaturan privasi papan peringkat berhasil disimpan!",
        type: "success",
      });
      setTimeout(() => setPrivacyMessage({ text: "", type: "" }), 4000);
    } catch (err) {
      setPrivacyMessage({
        text: err.message || "Gagal menyimpan pengaturan privasi.",
        type: "error",
      });
    } finally {
      setSavingPrivacy(false);
    }
  };

  // Handle Submit Testimonial
  const handleSubmitTestimonial = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    if (!testimonialContent.trim()) {
      setTestimonialError("Mohon isi ulasan atau tanggapan Anda.");
      return;
    }

    setSubmittingTestimonial(true);
    setTestimonialError("");
    try {
      await testimonialService.createTestimonial({
        report_id: selectedReport.id,
        content: testimonialContent.trim(),
        rating,
      });
      setTestimonialSuccess(true);
      setTestimonialContent("");
    } catch (err) {
      setTestimonialError(err.message || "Gagal mengirimkan ulasan.");
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  const displayName =
    user?.fullName || user?.full_name || user?.email?.split("@")[0] || "Warga";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: "var(--color-cream)", color: "var(--color-ink)" }}
    >
      {/* ── Navbar ──────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 backdrop-blur-md border-b border-[var(--color-line)]"
        style={{ backgroundColor: "rgba(253, 235, 224, 0.92)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center select-none group">
              <BrandLogo size="md" />
            </Link>

            {/* Quick Public Links */}
            <nav className="hidden md:flex items-center gap-2 pl-4 border-l border-[var(--color-line)]">
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)] transition"
              >
                <Globe className="w-3.5 h-3.5" />
                Beranda Publik
              </Link>
              <Link
                to="/peta"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)] transition"
              >
                <Map className="w-3.5 h-3.5" />
                Peta Laporan
              </Link>
            </nav>
          </div>

          {/* User Section & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold shadow-xs select-none"
                style={{
                  backgroundColor: "var(--color-apricot)",
                  color: "var(--color-coral-deep)",
                }}
              >
                {userInitial}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold leading-tight truncate max-w-[140px]">
                  {displayName}
                </p>
                <p className="text-[11px] font-semibold text-[var(--color-muted)] uppercase tracking-wider">
                  Warga
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="ml-2 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--color-ink)] bg-white/70 border border-[var(--color-line)] hover:bg-white hover:border-[var(--color-coral)] hover:text-[var(--color-coral-deep)] transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Split-View Content ─────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-8">
        {/* Tombol Kembali ke Beranda khusus tampilan Mobile */}
        <div className="md:hidden mb-4">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/80 border border-[var(--color-line)] text-[var(--color-ink)] hover:bg-white transition shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--color-coral-deep)]" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* ══════════════════════════════════════════════════════ */}
          {/* ── Left Sidebar (List Laporan) ───────────────────── */}
          {/* ══════════════════════════════════════════════════════ */}
          <section className="w-full lg:w-84 xl:w-96 shrink-0 flex flex-col gap-4">
            
            {/* Header: Title + Button "+ Baru" */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold font-display tracking-tight text-[var(--color-ink)]">
                Laporan Saya
              </h1>
              <Link
                to="/laporan/baru"
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                style={{ backgroundColor: "var(--color-coral)" }}
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                Baru
              </Link>
            </div>

            {/* Button: Lihat Riwayat Laporan */}
            <Link
              to="/laporan"
              className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-bold bg-white/80 hover:bg-white border border-[var(--color-line)] text-[var(--color-ink)] transition shadow-2xs block cursor-pointer"
            >
              Lihat Riwayat Laporan
            </Link>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari laporan"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-xs bg-white/70 border border-[var(--color-line)] placeholder-[var(--color-muted)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)] focus:bg-white transition"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-ink)] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)] pointer-events-none" />
              )}
            </div>

            {/* Filter Category Pills */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      isActive
                        ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)] shadow-2xs"
                        : "bg-white/80 text-[var(--color-ink)] border-[var(--color-line)] hover:bg-white"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Report Cards List */}
            <div className="space-y-3">
              {isLoadingReports && (
                <div className="bg-white/60 border border-[var(--color-line)] rounded-2xl py-12 text-center text-xs text-[var(--color-muted)]">
                  Memuat laporan...
                </div>
              )}

              {!isLoadingReports && reportError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-xs">
                  {reportError}
                </div>
              )}

              {!isLoadingReports && !reportError && filteredReports.length === 0 && (
                <div className="bg-white/70 border border-[var(--color-line)] rounded-2xl py-10 px-5 text-center">
                  <FileText className="w-8 h-8 mx-auto text-[var(--color-coral-deep)] opacity-60 mb-2" />
                  <p className="text-xs font-bold text-[var(--color-ink)]">
                    Tidak ada laporan
                  </p>
                  <p className="text-[11px] text-[var(--color-muted)] mt-1">
                    {searchQuery || selectedCategory !== "Semua"
                      ? "Tidak ada laporan yang sesuai dengan filter."
                      : "Anda belum pernah mengirim laporan. Laporkan masalah sekarang!"}
                  </p>
                  <Link
                    to="/laporan/baru"
                    className="inline-flex items-center gap-1 mt-4 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[var(--color-coral)] hover:bg-[var(--color-coral-deep)] transition"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" /> Buat Laporan
                  </Link>
                </div>
              )}

              {!isLoadingReports &&
                !reportError &&
                filteredReports.map((item) => {
                  const isSelected = selectedReport?.id === item.id;
                  const isCompleted =
                    item.status === "Laporan Selesai" || item.status === "Selesai";
                  const isDispatched =
                    item.status === "Petugas Dikirim ke Lokasi";

                  return (
                    <article
                      key={item.id}
                      onClick={() => setSelectedReportId(item.id)}
                      className={`p-4 rounded-2xl transition-all duration-150 cursor-pointer text-left relative border ${
                        isSelected
                          ? "bg-[var(--color-apricot)]/45 border-[var(--color-coral)] shadow-sm"
                          : "bg-white/80 hover:bg-white border-[var(--color-line)] hover:border-[var(--color-coral)]/40 hover:shadow-2xs"
                      }`}
                    >
                      {/* Top: Category & Date */}
                      <div className="flex items-center justify-between text-[11px] mb-2">
                        <span
                          className="px-2 py-0.5 rounded-md font-semibold text-[10px]"
                          style={{
                            backgroundColor: "var(--color-surface)",
                            color: "var(--color-coral-deep)",
                            border: "1px solid var(--color-line)",
                          }}
                        >
                          {item.category}
                        </span>
                        <span className="text-[var(--color-muted)] font-medium">
                          {formatDate(item.created_at)}
                        </span>
                      </div>

                      {/* Middle: Title */}
                      <h3 className="text-xs font-bold text-[var(--color-ink)] leading-snug line-clamp-2 mb-3">
                        {item.title}
                      </h3>

                      {/* Bottom: Status Pill */}
                      <div>
                        {isCompleted ? (
                          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-[var(--color-ink)] text-white shadow-2xs">
                            Laporan Selesai
                          </span>
                        ) : isDispatched ? (
                          <span
                            className="inline-block px-3 py-1 rounded-full text-[10px] font-bold border"
                            style={{
                              borderColor: "var(--color-coral)",
                              color: "var(--color-coral-deep)",
                              backgroundColor: "var(--color-surface)",
                            }}
                          >
                            Petugas Dikirim ke Lokasi
                          </span>
                        ) : (
                          <span
                            className="inline-block px-3 py-1 rounded-full text-[10px] font-bold border"
                            style={{
                              borderColor: "var(--color-line)",
                              color: "var(--color-muted)",
                              backgroundColor: "var(--color-surface)",
                            }}
                          >
                            {item.status}
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════ */}
          {/* ── Right Column (Detail Laporan & Privasi) ───────── */}
          {/* ══════════════════════════════════════════════════════ */}
          <section className="flex-1 min-w-0 w-full space-y-6">
            {selectedReport ? (
              <>
                {/* ── Header Detail ────────────────────────────── */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-bold"
                      style={{
                        backgroundColor: "var(--color-surface)",
                        color: "var(--color-coral-deep)",
                        border: "1px solid var(--color-line)",
                      }}
                    >
                      {selectedReport.category}
                    </span>
                    <span className="text-xs font-mono font-bold tracking-wider text-[var(--color-muted)] uppercase">
                      {selectedReport.id.slice(0, 8)}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--color-ink)] tracking-tight">
                    {selectedReport.title}
                  </h2>

                  {selectedReport.description && (
                    <p className="text-sm sm:text-base text-[var(--color-muted)] leading-relaxed">
                      {selectedReport.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--color-muted)] pt-1">
                    <span className="font-medium text-[var(--color-ink)] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[var(--color-coral)]" />
                      {selectedReport.location}
                    </span>
                    <span>·</span>
                    <span>{formatFullDateTime(selectedReport.created_at)}</span>
                  </div>
                </div>

                {/* ── Card 1: Progres Penanganan & Bukti Foto ── */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--color-line)] shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    
                    {/* Left: Stepper Progres Penanganan */}
                    <div>
                      <div className="flex items-center justify-between pb-6 border-b border-[var(--color-line)] mb-6">
                        <h3 className="text-base font-bold text-[var(--color-ink)]">
                          Progres Penanganan
                        </h3>
                        <span className="text-sm font-extrabold text-[var(--color-ink)] font-mono">
                          {currentStep}/4
                        </span>
                      </div>

                      <div className="relative pl-2 space-y-6">
                        {STEPS.map((s, index) => {
                          const isDone = currentStep > s.step;
                          const isCurrent = currentStep === s.step;
                          const isFuture = currentStep < s.step;
                          const isLast = index === STEPS.length - 1;

                          return (
                            <div key={s.step} className="relative flex items-start gap-4">
                              {/* Connector line between steps */}
                              {!isLast && (
                                <div
                                  className="absolute left-4 top-8 -bottom-6 w-0.5 transition-colors duration-300"
                                  style={{
                                    backgroundColor:
                                      currentStep > s.step
                                        ? "var(--color-ink)"
                                        : "var(--color-line)",
                                  }}
                                />
                              )}

                              {/* Step Icon Badge */}
                              <div className="relative z-10 shrink-0">
                                {isDone ? (
                                  <div className="w-8 h-8 rounded-full bg-[var(--color-ink)] text-white flex items-center justify-center shadow-xs">
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  </div>
                                ) : isCurrent ? (
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm ${
                                      s.step === 4
                                        ? "bg-emerald-600"
                                        : "bg-[var(--color-coral)] animate-pn-blink"
                                    }`}
                                  >
                                    {s.step === 4 ? (
                                      <Check className="w-4 h-4 stroke-[3]" />
                                    ) : (
                                      s.step
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-[var(--color-line)] bg-white text-[var(--color-muted)] flex items-center justify-center font-bold text-xs">
                                    {s.step}
                                  </div>
                                )}
                              </div>

                              {/* Step Label */}
                              <div className="pt-1 min-w-0">
                                <p
                                  className={`text-sm ${
                                    isCurrent
                                      ? "font-bold text-[var(--color-ink)]"
                                      : isDone
                                      ? "font-semibold text-[var(--color-ink)]"
                                      : "font-normal text-[var(--color-muted)]"
                                  }`}
                                >
                                  {s.label}
                                </p>
                                {isCurrent && (
                                  <p
                                    className="text-xs font-semibold mt-0.5"
                                    style={{
                                      color:
                                        s.step === 4
                                          ? "#059669"
                                          : "var(--color-coral-deep)",
                                    }}
                                  >
                                    {s.step === 4 ? "Terselesaikan" : "Sedang berjalan"}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Bukti Foto Container */}
                    <div className="flex flex-col gap-3">
                      <h3 className="text-base font-bold text-[var(--color-ink)]">
                        Bukti Foto
                      </h3>

                      {selectedReport.image_url ? (
                        <div
                          onClick={() =>
                            setPreviewPhoto({
                              url: selectedReport.image_url,
                              title: selectedReport.title,
                              location: selectedReport.location,
                            })
                          }
                          className="relative w-full h-56 rounded-2xl overflow-hidden border border-[var(--color-line)] bg-[var(--color-cream)] cursor-pointer group shadow-2xs"
                        >
                          <img
                            src={selectedReport.image_url}
                            alt={selectedReport.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-[var(--color-ink)]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-semibold text-xs">
                            <Eye className="w-4 h-4" />
                            Klik untuk perbesar
                          </div>
                        </div>
                      ) : (
                        <div
                          className="w-full h-56 rounded-2xl border border-[var(--color-line)] flex items-center justify-center"
                          style={{ backgroundColor: "var(--color-apricot)" }}
                        >
                          <div className="text-center text-[var(--color-coral-deep)]">
                            <Camera className="w-9 h-9 mx-auto opacity-75 mb-1" />
                            <p className="text-xs font-semibold">Tidak ada bukti foto</p>
                          </div>
                        </div>
                      )}

                      {/* Notice Banner */}
                      <div
                        className="rounded-xl p-3.5 text-xs text-left"
                        style={{
                          backgroundColor: "var(--color-cream)",
                          color: "var(--color-muted)",
                          border: "1px solid var(--color-line)",
                        }}
                      >
                        Status akan diperbarui otomatis saat petugas mengubah progres.
                      </div>
                    </div>
                  </div>

                  {/* ── Testimoni Form for Completed Reports ──── */}
                  {(selectedReport.status === "Laporan Selesai" ||
                    selectedReport.status === "Selesai") && (
                    <div className="mt-8 pt-6 border-t border-[var(--color-line)]">
                      <div className="max-w-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-[var(--color-coral)]" />
                          <h4 className="text-sm font-bold text-[var(--color-ink)]">
                            Berikan Ulasan untuk Laporan Selesai
                          </h4>
                        </div>
                        <p className="text-xs text-[var(--color-muted)] mb-4">
                          Laporan Anda telah berhasil diselesaikan oleh petugas. Sampaikan tanggapan
                          atau apresiasi Anda yang dapat tampil di beranda publik.
                        </p>

                        {testimonialSuccess ? (
                          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              Terima kasih! Ulasan Anda berhasil dikirim dan akan ditampilkan di beranda publik.
                            </span>
                          </div>
                        ) : (
                          <form onSubmit={handleSubmitTestimonial} className="space-y-3">
                            {testimonialError && (
                              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                                {testimonialError}
                              </div>
                            )}

                            <div>
                              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                                Penilaian
                              </label>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="p-1 cursor-pointer transition hover:scale-115 text-[var(--color-coral)]"
                                  >
                                    <Star
                                      className={`w-5 h-5 ${
                                        star <= rating
                                          ? "fill-[var(--color-coral)]"
                                          : "stroke-[var(--color-line)] text-transparent"
                                      }`}
                                    />
                                  </button>
                                ))}
                                <span className="ml-2 text-xs font-bold text-[var(--color-coral-deep)]">
                                  {rating} / 5 Bintang
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-[var(--color-ink)] mb-1">
                                Ulasan / Komentar
                              </label>
                              <textarea
                                rows={3}
                                value={testimonialContent}
                                onChange={(e) => setTestimonialContent(e.target.value)}
                                placeholder="Bagaimana tanggapan Anda atas kecepatan dan hasil kerja petugas?..."
                                className="w-full rounded-xl p-3 text-xs bg-[var(--color-surface)] border border-[var(--color-line)] placeholder-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)] transition"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={submittingTestimonial}
                              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-coral)] hover:bg-[var(--color-coral-deep)] transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Send className="w-3.5 h-3.5" />
                              {submittingTestimonial ? "Mengirim..." : "Kirim Ulasan"}
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Card 2: Privasi Papan Peringkat ────────── */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--color-line)] shadow-sm">
                  <div className="mb-6">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--color-ink)]">
                      Privasi Papan Peringkat
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--color-muted)] mt-0.5">
                      Atur apakah dan bagaimana Anda tampil di papan peringkat pelapor yang bisa dilihat publik.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Form (7 cols) */}
                    <div className="lg:col-span-7 space-y-5">
                      
                      {/* Toggle: Tampilkan saya di papan peringkat */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-[var(--color-ink)]">
                            Tampilkan saya di papan peringkat
                          </p>
                          <p className="text-xs text-[var(--color-muted)] mt-0.5">
                            {leaderboardVisible
                              ? "Aktif. Pilih nama yang tampil di papan peringkat publik."
                              : "Nonaktif. Anda tidak akan muncul di papan peringkat publik."}
                          </p>
                        </div>

                        {/* Interactive Toggle Pill */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={leaderboardVisible}
                          onClick={() => setLeaderboardVisible(!leaderboardVisible)}
                          className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            leaderboardVisible
                              ? "bg-[var(--color-ink)]"
                              : "bg-[var(--color-line)]"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              leaderboardVisible ? "translate-x-6" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Radio Cards: Tampil Dengan */}
                      {leaderboardVisible && (
                        <div className="space-y-2.5 pt-1">
                          <label className="block text-xs font-bold text-[var(--color-ink)]">
                            Tampil dengan
                          </label>

                          {/* Option 1: Nama Asli */}
                          <div
                            onClick={() => setDisplayType("name")}
                            className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                              displayType === "name"
                                ? "bg-[var(--color-apricot)]/40 border-[var(--color-coral)]"
                                : "bg-white border-[var(--color-line)] hover:bg-[var(--color-surface)]"
                            }`}
                          >
                            <div className="pt-0.5">
                              <span
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  displayType === "name"
                                    ? "border-[var(--color-ink)]"
                                    : "border-[var(--color-muted)]"
                                }`}
                              >
                                {displayType === "name" && (
                                  <span className="w-2 h-2 rounded-full bg-[var(--color-ink)]" />
                                )}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[var(--color-ink)]">
                                Nama asli
                              </p>
                              <p className="text-[11px] text-[var(--color-muted)]">
                                Nama pada profil Anda ditampilkan.
                              </p>
                            </div>
                          </div>

                          {/* Option 2: Username lain */}
                          <div
                            onClick={() => setDisplayType("username")}
                            className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                              displayType === "username"
                                ? "bg-[var(--color-apricot)]/40 border-[var(--color-coral)]"
                                : "bg-white border-[var(--color-line)] hover:bg-[var(--color-surface)]"
                            }`}
                          >
                            <div className="pt-0.5">
                              <span
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  displayType === "username"
                                    ? "border-[var(--color-ink)]"
                                    : "border-[var(--color-muted)]"
                                }`}
                              >
                                {displayType === "username" && (
                                  <span className="w-2 h-2 rounded-full bg-[var(--color-ink)]" />
                                )}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[var(--color-ink)]">
                                Username lain
                              </p>
                              <p className="text-[11px] text-[var(--color-muted)]">
                                Gunakan nama samaran khusus papan peringkat.
                              </p>
                            </div>
                          </div>

                          {/* Input Buat Username (if displayType === "username") */}
                          {displayType === "username" && (
                            <div className="pt-2 space-y-1">
                              <label className="block text-xs font-bold text-[var(--color-ink)]">
                                Buat username
                              </label>
                              <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--color-muted)]">
                                  @
                                </span>
                                <input
                                  type="text"
                                  value={username}
                                  onChange={(e) =>
                                    setUsername(
                                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "")
                                    )
                                  }
                                  placeholder="contoh: warga_peduli"
                                  className="w-full rounded-xl pl-8 pr-4 py-2.5 text-xs bg-[var(--color-surface)] border border-[var(--color-line)] placeholder-[var(--color-muted)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coral)] transition"
                                />
                              </div>
                              <p className="text-[10px] text-[var(--color-muted)]">
                                Username ini hanya dipakai di papan peringkat.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Feedback message */}
                      {privacyMessage.text && (
                        <div
                          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                            privacyMessage.type === "success"
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                              : "bg-red-50 border border-red-200 text-red-800"
                          }`}
                        >
                          {privacyMessage.type === "success" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                          )}
                          <span>{privacyMessage.text}</span>
                        </div>
                      )}

                      {/* Action Button: Simpan Pengaturan */}
                      <button
                        type="button"
                        onClick={handleSavePrivacy}
                        disabled={savingPrivacy}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
                        style={{ backgroundColor: "var(--color-coral)" }}
                      >
                        {savingPrivacy ? "Menyimpan..." : "Simpan Pengaturan"}
                      </button>
                    </div>

                    {/* Right: Pratinjau di Papan Peringkat (5 cols) */}
                    <div className="lg:col-span-5 space-y-2">
                      <label className="block text-xs font-bold text-[var(--color-ink)]">
                        Pratinjau di papan peringkat
                      </label>

                      <div
                        className="rounded-2xl p-4 text-left border border-[var(--color-line)] min-h-[85px] flex items-center"
                        style={{ backgroundColor: "var(--color-surface)" }}
                      >
                        {!leaderboardVisible ? (
                          <p className="text-xs text-[var(--color-muted)] italic">
                            Profil Anda disembunyikan dan tidak akan muncul pada papan peringkat publik.
                          </p>
                        ) : displayType === "username" ? (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-[var(--color-ink)]">
                              {username ? `@${username}` : "Buat username untuk tampil di papan peringkat."}
                            </p>
                            <p className="text-[10px] text-[var(--color-muted)]">
                              (Sebagai nama samaran pelapor terverifikasi)
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-[var(--color-ink)]">
                              {displayName}
                            </p>
                            <p className="text-[10px] text-[var(--color-muted)]">
                              (Sesuai nama profil asli Anda)
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-[var(--color-muted)]">
                        Alamat Anda tidak pernah ditampilkan.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-[var(--color-line)]">
                <FileText className="w-12 h-12 mx-auto text-[var(--color-coral)] opacity-40 mb-3" />
                <h3 className="text-base font-bold text-[var(--color-ink)]">
                  Pilih Laporan untuk Melihat Detail
                </h3>
                <p className="text-xs text-[var(--color-muted)] max-w-sm mx-auto mt-1 mb-6">
                  Pilih salah satu laporan dari kolom di sebelah kiri untuk memantau tahapan penanganan atau kirim laporan baru sekarang.
                </p>
                <Link
                  to="/laporan/baru"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-coral)] hover:bg-[var(--color-coral-deep)] transition"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" /> Buat Laporan Baru
                </Link>
              </div>
            )}
          </section>

        </div>
      </main>

      {/* ── Modal Preview Bukti Foto ──────────────────────────── */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-5 border border-[var(--color-line)] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-line)]">
              <h3 className="text-sm font-bold truncate pr-4 text-[var(--color-ink)]">
                Bukti Foto: {previewPhoto.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="rounded-full p-1.5 text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-cream)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="my-4 overflow-hidden rounded-2xl bg-[var(--color-cream)] flex items-center justify-center max-h-[60vh]">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.title}
                className="max-h-[58vh] w-auto object-contain"
              />
            </div>
            <p className="text-xs text-[var(--color-muted)]">
              Lokasi: {previewPhoto.location}
            </p>
          </div>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="mt-12 py-6 text-center text-xs text-[var(--color-muted)] border-t border-[var(--color-line)]">
        Peduli Negeri — Portal Partisipasi Publik Indonesia
      </footer>
    </div>
  );
}
