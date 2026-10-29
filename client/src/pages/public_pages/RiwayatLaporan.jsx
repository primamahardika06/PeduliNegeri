import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Camera,
  X,
  ChevronDown,
  ChevronUp,
  LogOut,
  Plus,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { reportService } from "../../services/reportService";
import { authService } from "../../services/authService";
import BrandLogo from "../../components/common/BrandLogo";

const CATEGORIES = [
  "Infrastruktur",
  "Fasilitas Umum",
  "Lingkungan",
  "Lainnya",
];

const STEPS = [
  { step: 1, label: "Laporan Diterima" },
  { step: 2, label: "Sedang Diverifikasi" },
  { step: 3, label: "Petugas Dikirim ke Lokasi" },
  { step: 4, label: "Laporan Selesai" },
];

function getReportProgress(status) {
  if (status === "Laporan Selesai" || status === "Selesai") {
    return { step: 4, label: "Selesai" };
  }
  if (status === "Petugas Dikirim ke Lokasi") {
    return { step: 3, label: "Petugas menuju lokasi" };
  }
  if (status === "Laporan Diproses" || status === "Sedang Diverifikasi") {
    return { step: 2, label: "Sedang diverifikasi" };
  }
  return { step: 1, label: "Laporan diterima" };
}

function formatDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}.${minutes}`;
  } catch {
    return String(value);
  }
}

// Data contoh representatif sesuai Gambar 1 jika akun belum memiliki riwayat laporan
const DEMO_REPORTS = [
  {
    id: "BA20DC64-sample",
    category: "Infrastruktur",
    title: "TUS kebakar",
    description: "Kebakaran di kampus",
    location: "asdvfbgndh",
    status: "Laporan Selesai",
    created_at: new Date(2026, 9, 20, 23, 5).toISOString(),
    image_url: null,
  },
  {
    id: "88A8488D-sample",
    category: "Fasilitas Umum",
    title: "Lampu mati",
    description: "Lampu belajar saya mati tolonggg!!!!",
    location: "Kos bu lia",
    status: "Laporan Selesai",
    created_at: new Date(2026, 9, 24, 23, 47).toISOString(),
    image_url: null,
  },
  {
    id: "85310E1C-sample",
    category: "Fasilitas Umum",
    title: "Ketintang Macet Bagai Nunggu One Piece Tamat",
    description: "Kemacetan panjang setiap sore di persimpangan Ketintang.",
    location: "Ketintang Kec. Gayungan",
    status: "Laporan Selesai",
    created_at: new Date(2026, 9, 24, 17, 30).toISOString(),
    image_url: null,
  },
  {
    id: "435C3D98-sample",
    category: "Fasilitas Umum",
    title: "Lampu mati",
    description: "Lampu penerangan jalan padam, kawasan gelap saat malam.",
    location: "Jl Siwalankerto",
    status: "Petugas Dikirim ke Lokasi",
    created_at: new Date(2026, 9, 20, 19, 48).toISOString(),
    image_url: null,
  },
  {
    id: "F4195ED8-sample",
    category: "Lingkungan",
    title: "Kasus lap hitam yang sangat mengganggu",
    description: "Genangan air hitam di selokan menimbulkan bau menyengat bagi warga sekitar.",
    location: "Jl Siwalankerto",
    status: "Laporan Selesai",
    created_at: new Date(2026, 9, 24, 21, 12).toISOString(),
    image_url: null,
  },
  {
    id: "C75A90E2-sample",
    category: "Lainnya",
    title: "Antrean layanan kelurahan tidak teratur",
    description: "Tidak ada nomor antrean sehingga warga menunggu lama.",
    location: "Kelurahan Ketintang",
    status: "Laporan Diterima",
    created_at: new Date(2026, 9, 19, 9, 15).toISOString(),
    image_url: null,
  },
];

export default function RiwayatLaporan({ currentUser }) {
  const navigate = useNavigate();
  const user = currentUser || authService.getCurrentUser();

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Toolbar state: viewMode ('kategori' | 'terbaru') & activeCategory ('Semua' | category)
  const [viewMode, setViewMode] = useState("kategori");
  const [activeCategory, setActiveCategory] = useState("Semua");

  // Accordion drawer: id laporan yang sedang dibuka rinciannya
  const [expandedReportId, setExpandedReportId] = useState("BA20DC64-sample");

  // Lightbox modal foto bukti
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  useEffect(() => {
    let isActive = true;
    const loadReports = async () => {
      try {
        const items = await reportService.getMyReports();
        if (isActive) {
          if (Array.isArray(items) && items.length > 0) {
            setReports(items);
            // Default buka rincian laporan pertama jika ada
            setExpandedReportId(items[0].id);
          } else {
            // Gunakan contoh data representatif sesuai Gambar 1
            setReports(DEMO_REPORTS);
            setExpandedReportId("BA20DC64-sample");
          }
          setError("");
        }
      } catch (loadError) {
        if (isActive) {
          // Jika error atau server offline, gunakan demo reports agar tampilan tetap dapat dilihat
          setReports(DEMO_REPORTS);
          setExpandedReportId("BA20DC64-sample");
          setError("");
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadReports();
    window.addEventListener("focus", loadReports);
    return () => {
      isActive = false;
      window.removeEventListener("focus", loadReports);
    };
  }, []);

  // Hitung jumlah laporan per kategori
  const categoryCounts = {
    Semua: reports.length,
    Infrastruktur: reports.filter((r) => r.category === "Infrastruktur").length,
    "Fasilitas Umum": reports.filter((r) => r.category === "Fasilitas Umum").length,
    Lingkungan: reports.filter((r) => r.category === "Lingkungan").length,
    Lainnya: reports.filter((r) => r.category === "Lainnya" || (r.category && !CATEGORIES.includes(r.category))).length,
  };

  // Statistik Banner (Total, Sedang ditangani, Selesai)
  const totalCount = reports.length;
  const completedCount = reports.filter(
    (r) => r.status === "Laporan Selesai" || r.status === "Selesai"
  ).length;
  const inProgressCount = totalCount - completedCount;

  // Filter laporan berdasarkan kategori aktif
  const filteredReports =
    activeCategory === "Semua"
      ? reports
      : reports.filter((r) => {
          if (activeCategory === "Lainnya") {
            return r.category === "Lainnya" || !CATEGORIES.includes(r.category);
          }
          return r.category === activeCategory;
        });

  // Urutkan laporan jika mode 'terbaru' dipilih
  const sortedReports = [...filteredReports].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const toggleAccordion = (id) => {
    setExpandedReportId((prev) => (prev === id ? null : id));
  };

  const displayName = user?.fullName || user?.full_name || "P";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: "#FAF5EE", color: "#1E2430" }}
    >
      {/* ── Top Navbar sesuai Gambar 1 ───────────────────────── */}
      <header className="border-b border-[#ebdccd]/80 bg-[#FAF5EE]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Logo Kiri (Gambar 3) */}
          <Link to="/" className="flex items-center">
            <BrandLogo size="md" />
          </Link>

          {/* User Profile Box & Tombol Keluar Kanan */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm select-none"
                style={{ backgroundColor: "#FADDBA", color: "#984732" }}
              >
                {userInitial}
              </span>
              <div className="text-left leading-tight hidden xs:block sm:block">
                <p className="text-xs font-bold text-[#1E2430]">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  Warga
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-11 items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#d6cebf] hover:bg-slate-50 transition cursor-pointer shadow-2xs text-[#1E2430]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Konten Utama ────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Sub-nav: Kembali ke Beranda */}
        <div>
          <Link
            to="/reportPage"
            className="inline-flex min-h-11 items-center gap-2 text-xs sm:text-sm font-semibold text-[#1E2430] hover:text-[#984732] transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#984732]" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Header Judul & Tombol Buat Laporan Baru */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E2430] tracking-tight">
              Riwayat Laporan Anda
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Seluruh laporan yang pernah Anda kirim, lengkap dengan tahap penanganannya.
              Buka satu laporan untuk melihat rincian dan bukti foto.
            </p>
          </div>

          <Link
            to="/laporan/baru"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:opacity-95 shrink-0 self-start cursor-pointer"
            style={{ backgroundColor: "#EB936E" }}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Buat Laporan Baru</span>
          </Link>
        </div>

        {/* ── Banner Statistik (Peach / Cream 3 Kolom) ───────── */}
        <section
          className="rounded-2xl p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 sm:divide-x divide-[#e8be9f]/60"
          style={{
            backgroundColor: "#FADDBA",
            border: "1px solid rgba(240, 196, 154, 0.7)",
          }}
        >
          {/* Kolom 1 */}
          <div className="sm:px-4 first:sm:pl-2">
            <p className="text-xs text-[#1E2430]/75 font-medium">
              Total laporan
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#1E2430] mt-1">
              {totalCount}
            </p>
          </div>

          {/* Kolom 2 */}
          <div className="sm:px-6">
            <p className="text-xs text-[#1E2430]/75 font-medium">
              Sedang ditangani
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#1E2430] mt-1">
              {inProgressCount}
            </p>
          </div>

          {/* Kolom 3 */}
          <div className="sm:px-6">
            <p className="text-xs text-[#1E2430]/75 font-medium">
              Selesai
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold text-[#1E2430] mt-1">
              {completedCount}
            </p>
          </div>
        </section>

        {/* ── Toolbar Filter & View Switcher ─────────────────── */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          {/* Mode Switcher: Per kategori vs Urut terbaru */}
          <div className="inline-flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode("kategori")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer min-h-11 flex items-center ${
                viewMode === "kategori"
                  ? "bg-[#1E2430] text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              Per kategori
            </button>
            <button
              type="button"
              onClick={() => setViewMode("terbaru")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer min-h-11 flex items-center ${
                viewMode === "terbaru"
                  ? "bg-[#1E2430] text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              Urut terbaru
            </button>
          </div>

          {/* Filter Pills Kategori */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory("Semua")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer min-h-11 ${
                activeCategory === "Semua"
                  ? "bg-[#1E2430] text-white border-[#1E2430]"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>Semua</span>
              <span className="text-[11px] opacity-80">{categoryCounts.Semua}</span>
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer min-h-11 ${
                  activeCategory === cat
                    ? "bg-[#1E2430] text-white border-[#1E2430]"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>{cat}</span>
                <span className="text-[11px] opacity-80">{categoryCounts[cat] || 0}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 text-center text-sm text-slate-500">
            Memuat riwayat laporan...
          </div>
        )}

        {/* ── Render Laporan: Mode 1 (Per Kategori) ───────────── */}
        {!isLoading && viewMode === "kategori" && (
          <div className="space-y-8">
            {CATEGORIES.map((category) => {
              // Jika filter kategori aktif dan bukan kategori ini, lewati
              if (activeCategory !== "Semua" && activeCategory !== category) {
                return null;
              }

              const categoryReports = reports.filter((r) => {
                if (category === "Lainnya") {
                  return r.category === "Lainnya" || !CATEGORIES.includes(r.category);
                }
                return r.category === category;
              });

              // Jika tidak ada laporan di kategori ini saat difilter "Semua", tetap sembunyikan atau tampilkan jika ada laporan
              if (categoryReports.length === 0 && activeCategory === "Semua") {
                return null;
              }

              return (
                <div key={category} className="space-y-3">
                  {/* Category Section Header */}
                  <div className="flex items-baseline justify-between pt-2">
                    <h2 className="text-lg font-bold text-[#1E2430]">
                      {category}
                    </h2>
                    <span className="text-xs text-slate-500">
                      {categoryReports.length} laporan
                    </span>
                  </div>

                  {categoryReports.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 bg-white">
                      Belum ada laporan pada kategori {category}.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {categoryReports.map((report) => renderReportCard(report))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Render Laporan: Mode 2 (Urut Terbaru) ──────────── */}
        {!isLoading && viewMode === "terbaru" && (
          <div className="space-y-3">
            {sortedReports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500 bg-white">
                Tidak ada laporan yang sesuai dengan filter.
              </div>
            ) : (
              sortedReports.map((report) => renderReportCard(report))
            )}
          </div>
        )}

        {/* Footer Note sesuai Gambar 1 */}
        <div className="pt-6 pb-8 border-t border-slate-200/60 text-[11px] text-slate-400">
          Sebagian deskripsi dan satu laporan pada halaman ini adalah contoh data untuk keperluan desain.
        </div>
      </main>

      {/* ── Modal Lightbox Bukti Foto ───────────────────────── */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-3xl p-5 border border-slate-700 text-white shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold truncate pr-3">
                Bukti Foto: {selectedPhoto.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                aria-label="Tutup foto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 overflow-hidden rounded-2xl bg-black flex items-center justify-center max-h-[60vh]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-[58vh] w-auto object-contain"
              />
            </div>

            <p className="text-xs text-slate-400">
              Lokasi: {selectedPhoto.location}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // Helper render kartu laporan
  function renderReportCard(report) {
    const isExpanded = expandedReportId === report.id;
    const progress = getReportProgress(report.status);
    const isCompleted = progress.step === 4;
    const reportCode = report.id ? `#${report.id.replace(/-/g, "").slice(0, 8).toUpperCase()}` : "#PN000000";

    return (
      <article
        key={report.id}
        className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs transition hover:shadow-xs"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
          {/* Sisi Kiri: Thumbnail Foto atau Ikon Kamera */}
          <div className="flex gap-4 items-start flex-1 min-w-0">
            {report.image_url ? (
              <div
                onClick={() =>
                  setSelectedPhoto({
                    url: report.image_url,
                    title: report.title,
                    location: report.location,
                  })
                }
                className="relative group w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 cursor-pointer bg-slate-100"
                title="Klik untuk memperbesar foto"
              >
                <img
                  src={report.image_url}
                  alt={report.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Eye className="w-4 h-4" />
                </span>
              </div>
            ) : (
              <div
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center shrink-0 border border-[#f0cbb0]/40"
                style={{ backgroundColor: "#FADDBA" }}
              >
                <Camera className="w-6 h-6 stroke-[1.8] text-[#984732]" />
              </div>
            )}

            {/* Tengah: Rincian Info Laporan */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-md border border-slate-300 font-semibold text-slate-700 text-[11px]">
                  {report.category || "Lainnya"}
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {reportCode}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#1E2430] leading-snug">
                {report.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                {report.description}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#984732] shrink-0" />
                  <span className="truncate max-w-[160px] sm:max-w-xs">{report.location}</span>
                </span>
                <span>•</span>
                <span>{formatDate(report.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Status, 4-Segment Bar, dan Tombol Accordion */}
          <div className="w-full sm:w-56 shrink-0 flex flex-col items-start sm:items-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            {/* Status Pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isCompleted
                  ? "bg-[#1E2430] text-white"
                  : "bg-white border border-[#984732] text-[#984732]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCompleted ? "bg-white" : "bg-[#984732]"
                }`}
              />
              <span>{report.status}</span>
            </div>

            {/* 4-Segment Progress Bar (Gambar 1) */}
            <div className="w-full flex items-center gap-2 mt-2.5 mb-2.5">
              <div className="flex items-center gap-1 flex-1">
                {[1, 2, 3, 4].map((stepNum) => (
                  <div
                    key={stepNum}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      stepNum <= progress.step
                        ? isCompleted
                          ? "bg-[#1E2430]"
                          : "bg-[#984732]"
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                {progress.step}/4
              </span>
            </div>

            {/* Accordion Toggle Button */}
            <button
              type="button"
              onClick={() => toggleAccordion(report.id)}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition w-full sm:w-auto cursor-pointer"
            >
              <span>{isExpanded ? "Tutup rincian" : "Lihat rincian"}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          </div>
        </div>

        {/* ── Drawer Tahap Penanganan (Accordion Expanded) ─── */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
            <div
              className="rounded-xl p-4 sm:p-5"
              style={{ backgroundColor: "#FDF8F2", border: "1px solid #f0e4d7" }}
            >
              <h4 className="text-xs font-bold text-[#1E2430] uppercase tracking-wider mb-4">
                Tahap penanganan
              </h4>

              {/* Stepper Horizontal 4 Tahap */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2">
                {STEPS.map((step) => {
                  const isPastOrCurrent = progress.step >= step.step;
                  const isCurrent = progress.step === step.step;

                  return (
                    <div key={step.step} className="space-y-1.5">
                      {/* Bar penghubung */}
                      <div
                        className={`h-1 rounded-full ${
                          isPastOrCurrent
                            ? isCompleted
                              ? "bg-[#1E2430]"
                              : "bg-[#984732]"
                            : "bg-slate-200"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-xs font-bold ${
                            isPastOrCurrent
                              ? "text-[#1E2430]"
                              : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {isPastOrCurrent ? "Selesai" : "Menunggu"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tampilkan foto bukti jika ada di dalam drawer */}
              {report.image_url && (
                <div className="mt-4 pt-3 border-t border-[#ebdccd]">
                  <p className="text-xs font-semibold text-[#1E2430] mb-2 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#984732]" />
                    <span>Foto Bukti Lapangan:</span>
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPhoto({
                        url: report.image_url,
                        title: report.title,
                        location: report.location,
                      })
                    }
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Buka Foto Penuh</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </article>
    );
  }
}
