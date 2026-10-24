import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  HeartHandshake,
  LogOut,
  FileText,
  PlusCircle,
  Clock,
  CheckCircle,
  MapPin,
  ChevronRight,
  TrendingUp,
  Send,
  Menu,
  X,
  Camera,
  Eye,
} from "lucide-react";
import { authService } from "../../services/authService";
import { reportService } from "../../services/reportService";

const CATEGORIES = [
  "Semua",
  "Infrastruktur",
  "Fasilitas Umum",
  "Lingkungan",
  "Lainnya",
];

const STATUS_STYLES = {
  "Laporan Diterima": {
    bg: "bg-[var(--color-apricot)]",
    text: "text-[var(--color-ink)]",
    border: "border-[var(--color-coral)]",
    dot: "bg-[var(--color-coral)]",
  },
  "Laporan Diproses": {
    bg: "bg-[var(--color-apricot)]",
    text: "text-[var(--color-ink)]",
    border: "border-[var(--color-coral)]",
    dot: "bg-[var(--color-coral)]",
  },
  "Petugas Dikirim ke Lokasi": {
    bg: "bg-[color:var(--color-periwinkle)]/15",
    text: "text-[var(--color-periwinkle-deep)]",
    border: "border-[var(--color-periwinkle)]",
    dot: "bg-[var(--color-periwinkle)]",
  },
  "Laporan Selesai": {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-300",
    dot: "bg-emerald-500",
  },
  Selesai: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-300",
    dot: "bg-emerald-500",
  },
};

const REPORT_PROGRESS = {
  "Laporan Diterima": { step: 1, label: "Laporan diterima" },
  "Laporan Diproses": { step: 2, label: "Sedang diproses" },
  "Petugas Dikirim ke Lokasi": { step: 3, label: "Petugas menuju lokasi" },
  "Laporan Selesai": { step: 4, label: "Laporan selesai" },
  Selesai: { step: 4, label: "Laporan selesai" },
};

function getStatusStyle(status) {
  return (
    STATUS_STYLES[status] || {
      bg: "bg-[var(--color-cream)]",
      text: "text-[var(--color-ink)]",
      border: "border-[var(--color-line)]",
      dot: "bg-[var(--color-muted)]",
    }
  );
}

export default function HomePages({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const user = currentUser || authService.getCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [reportError, setReportError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [previewPhoto, setPreviewPhoto] = useState(null);

  useEffect(() => {
    let isActive = true;
    const loadReports = async () => {
      try {
        const items = await reportService.getMyReports();
        if (isActive) {
          setReports(items);
          setReportError("");
        }
      } catch (error) {
        if (isActive) setReportError(error.message);
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

  const displayName =
    user?.fullName || user?.email?.split("@")[0] || "Pengguna";

  // Filter laporan berdasarkan kategori pada Laporan Terkini
  const filteredReports =
    selectedCategory === "Semua"
      ? reports
      : reports.filter((r) => r.category === selectedCategory);

  const recentReports = filteredReports.slice(0, 5);

  const summaryCards = [
    {
      label: "Total Laporan Anda",
      value: reports.length,
      icon: FileText,
      accent: "black",
      accentBg: "var(--color-coral)",
    },
    {
      label: "Belum Selesai",
      value: reports.filter(
        (report) =>
          report.status !== "Laporan Selesai" && report.status !== "Selesai"
      ).length,
      icon: Clock,
      accent: "var(--color-periwinkle-deep)",
      accentBg: "var(--color-periwinkle)",
    },
    {
      label: "Terselesaikan",
      // BUG FIX: Gunakan "Laporan Selesai" sesuai workflow database agar counter bertambah saat laporan selesai
      value: reports.filter(
        (report) =>
          report.status === "Laporan Selesai" || report.status === "Selesai"
      ).length,
      icon: CheckCircle,
      accent: "#2e7d5b",
      accentBg: "#4ade80",
    },
  ];

  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          backgroundColor: "rgba(255, 246, 239, 0.85)",
          borderBottom: "1px solid var(--color-line)",
        }}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between px-5 h-16">
          {/* Brand */}
          <Link to="/reportPage" className="flex items-center gap-2.5 select-none">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: "var(--color-coral)" }}
            >
              <HeartHandshake className="w-4.5 h-4.5" />
            </span>
            <span
              className="text-lg font-display tracking-tight"
              style={{ color: "var(--color-ink)" }}
            >
              Peduli
              <span style={{ color: "var(--color-coral)" }}>Negeri</span>
            </span>
          </Link>

          {/* Desktop user section */}
          <div className="hidden sm:flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{
                backgroundColor: "var(--color-cream)",
                border: "1px solid var(--color-line)",
              }}
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: "var(--color-apricot)",
                  color: "var(--color-coral-deep)",
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </span>
              <div className="text-left">
                <p
                  className="text-xs font-semibold leading-none"
                  style={{ color: "var(--color-ink)" }}
                >
                  {displayName}
                </p>
                <span
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: "var(--color-muted)" }}
                >
                  Warga
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-200 cursor-pointer"
              style={{
                backgroundColor: "var(--color-cream)",
                color: "var(--color-muted)",
                border: "1px solid var(--color-line)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-coral)";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "var(--color-coral)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-cream)";
                e.currentTarget.style.color = "var(--color-muted)";
                e.currentTarget.style.borderColor = "var(--color-line)";
              }}
              title="Keluar dari akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg"
            style={{ color: "var(--color-ink)" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div
            className="sm:hidden px-5 pb-4 space-y-3"
            style={{ borderTop: "1px solid var(--color-line)" }}
          >
            <div className="flex items-center gap-2 pt-3">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: "var(--color-apricot)",
                  color: "var(--color-coral-deep)",
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </span>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-ink)" }}
                >
                  {displayName}
                </p>
                <span
                  className="text-xs"
                  style={{ color: "var(--color-muted)" }}
                >
                  Warga
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
              style={{
                backgroundColor: "var(--color-cream)",
                color: "var(--color-coral-deep)",
                border: "1px solid var(--color-line)",
              }}
            >
              <LogOut className="w-4 h-4" />
              Keluar dari Akun
            </button>
          </div>
        )}
      </nav>

      <main className="mx-auto max-w-6xl px-5 py-8 space-y-8">
        {/* Hero Section */}
        <section
          className="relative overflow-hidden rounded-3xl p-6 sm:p-10"
          style={{
            background:
              "linear-gradient(135deg, var(--color-cream) 0%, var(--color-apricot) 60%, var(--color-coral) 100%)",
          }}
        >
          <div className="max-w-xl relative z-10 space-y-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: "rgba(255,255,255,0.55)",
                color: "var(--color-coral-deep)",
              }}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ruang Partisipasi Publik</span>
            </div>

            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-display tracking-tight"
              style={{ color: "var(--color-ink)" }}
            >
              Halo, {displayName}!
            </h1>

            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{ color: "var(--color-coral-deep)" }}
            >
              Sampaikan aspirasi dan laporkan kendala fasilitas di lingkungan
              Anda lengkap dengan bukti foto. Pantau proses penyelesaian secara
              transparan.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={() => navigate("/laporan/baru")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                style={{
                  backgroundColor: "var(--color-coral)",
                  boxShadow: "0 4px 14px rgba(161,74,48,0.25)",
                }}
              >
                <PlusCircle className="w-4 h-4" />
                Buat Laporan Baru
              </button>
              <button
                onClick={() => navigate("/laporan")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                style={{
                  backgroundColor: "rgba(255,255,255,0.6)",
                  color: "var(--color-ink)",
                  border: "1px solid var(--color-line)",
                }}
              >
                <FileText className="w-4 h-4" />
                Lihat Riwayat Laporan
              </button>
            </div>
          </div>
          <div
            className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full opacity-30 pointer-events-none"
            style={{ backgroundColor: "var(--color-periwinkle)" }}
          />
        </section>

        {/* Summary Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="flex items-center justify-between p-5 rounded-2xl transition-shadow duration-200 hover:shadow-md"
                style={{
                  backgroundColor: "#fff",
                  border: "1px solid var(--color-line)",
                }}
              >
                <div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {card.label}
                  </p>
                  <p
                    className="text-2xl font-bold mt-1"
                    style={{ color: card.accent }}
                  >
                    {card.value}
                  </p>
                </div>
                <span
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: card.accentBg,
                    opacity: 0.15,
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: card.accent, opacity: 1 }}
                  />
                </span>
              </div>
            );
          })}
        </section>

        <section
          className="rounded-3xl p-6 sm:p-8"
          style={{
            backgroundColor: "#fff",
            border: "1px solid var(--color-line)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2
                className="text-base sm:text-lg font-bold flex items-center gap-2"
                style={{ color: "var(--color-ink)" }}
              >
                <TrendingUp
                  className="w-5 h-5"
                  style={{ color: "var(--color-coral)" }}
                />
                Laporan Terkini
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--color-muted)" }}
              >
                Perkembangan laporan dan aspirasi publik di sekitar Anda
              </p>
            </div>
            <button
              onClick={() => navigate("/laporan")}
              className="text-xs font-medium flex items-center gap-1 transition-colors duration-150 cursor-pointer self-start sm:self-auto"
              style={{ color: "var(--color-coral-deep)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-coral)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-coral-deep)")
              }
            >
              Lihat Riwayat Lengkap <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-5 pb-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-black border-slate-200 hover:bg-slate-50"
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: "var(--color-coral-deep)",
                          borderColor: "var(--color-coral-deep)",
                          color: "#fff",
                        }
                      : {}
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Report list */}
          <div className="space-y-3">
            {isLoadingReports && (
              <p
                role="status"
                className="rounded-2xl py-10 text-center text-sm"
                style={{
                  color: "var(--color-muted)",
                  backgroundColor: "var(--color-cream)",
                }}
              >
                Memuat laporan terkini...
              </p>
            )}
            {!isLoadingReports && reportError && (
              <div
                role="alert"
                className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800"
              >
                {reportError}
              </div>
            )}
            {!isLoadingReports &&
              !reportError &&
              recentReports.length === 0 && (
                <div
                  className="rounded-2xl py-10 text-center"
                  style={{ backgroundColor: "var(--color-cream)" }}
                >
                  <FileText
                    className="mx-auto h-7 w-7"
                    style={{ color: "var(--color-coral-deep)" }}
                  />
                  <p
                    className="mt-2 text-sm font-semibold"
                    style={{ color: "var(--color-ink)" }}
                  >
                    Belum ada laporan {selectedCategory !== "Semua" ? `pada kategori ${selectedCategory}` : ""}
                  </p>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: "var(--color-muted)" }}
                  >
                    Laporan yang Anda kirim akan tampil di sini.
                  </p>
                </div>
              )}
            {!isLoadingReports &&
              !reportError &&
              recentReports.map((item) => {
                const style = getStatusStyle(item.status);
                const progress =
                  REPORT_PROGRESS[item.status] ||
                  REPORT_PROGRESS["Laporan Diterima"];
                const date = new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium",
                }).format(new Date(item.created_at));

                return (
                  <article
                    key={item.id}
                    className="group p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200"
                    style={{
                      backgroundColor: "var(--color-cream)",
                      border: "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-line)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "transparent";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Thumbnail Foto Bukti Jika Ada */}
                      {item.image_url ? (
                        <div
                          onClick={() =>
                            setPreviewPhoto({
                              url: item.image_url,
                              title: item.title,
                              location: item.location,
                            })
                          }
                          className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border border-slate-300 bg-white group/thumb cursor-pointer shadow-2xs"
                          title="Klik untuk melihat foto bukti"
                        >
                          <img
                            src={item.image_url}
                            alt={`Bukti: ${item.title}`}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover/thumb:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      ) : null}

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[11px] font-mono"
                            style={{ color: "var(--color-muted)" }}
                          >
                            {item.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span
                            className="text-[11px] px-2 py-0.5 rounded-md font-medium"
                            style={{
                              backgroundColor: "var(--color-apricot)",
                              color: "var(--color-coral-deep)",
                            }}
                          >
                            {item.category}
                          </span>
                          {item.image_url && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                              <Camera className="w-3 h-3 text-coral-deep" />
                              Foto ada
                            </span>
                          )}
                        </div>
                        <h3
                          className="text-sm font-semibold truncate"
                          style={{ color: "var(--color-ink)" }}
                        >
                          {item.title}
                        </h3>
                        <div
                          className="flex items-center gap-4 text-xs"
                          style={{ color: "var(--color-muted)" }}
                        >
                          <span className="flex items-center gap-1 truncate">
                            <MapPin
                              className="w-3 h-3 shrink-0"
                              style={{ color: "var(--color-coral)" }}
                            />
                            {item.location}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="shrink-0">{date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-center shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-medium ${style.bg} ${style.text} ${style.border}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
                        />
                        {item.status}
                      </span>
                      <span
                        className="flex items-center gap-1 text-xs"
                        style={{ color: "var(--color-muted)" }}
                      >
                        <span className="h-1.5 w-12 overflow-hidden rounded-full bg-white">
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${progress.step * 25}%`,
                              backgroundColor: "var(--color-coral-deep)",
                            }}
                          />
                        </span>
                        {progress.step}/4
                      </span>
                    </div>
                  </article>
                );
              })}
          </div>
        </section>
      </main>

      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-xl w-full bg-slate-900 rounded-3xl p-5 border border-slate-700 text-white shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold truncate pr-4">
                Foto Bukti: {previewPhoto.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="my-4 overflow-hidden rounded-2xl bg-black flex items-center justify-center max-h-[60vh]">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.title}
                className="max-h-[58vh] w-auto object-contain"
              />
            </div>
            <p className="text-xs text-slate-400">
              Lokasi: {previewPhoto.location}
            </p>
          </div>
        </div>
      )}

      <footer
        className="mt-4 py-6 text-center text-xs"
        style={{
          color: "var(--color-muted)",
          borderTop: "1px solid var(--color-line)",
        }}
      >
        Peduli Negeri — Portal Partisipasi Publik Indonesia
      </footer>
    </div>
  );
}
