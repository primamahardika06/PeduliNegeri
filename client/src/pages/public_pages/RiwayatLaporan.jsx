import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  MapPin,
  Camera,
  X,
  Layers,
  ListFilter,
  Wrench,
  Building2,
  Trees,
  FolderArchive,
  Eye,
} from "lucide-react";
import { reportService } from "../../services/reportService";

const CATEGORIES = [
  "Infrastruktur",
  "Fasilitas Umum",
  "Lingkungan",
  "Lainnya",
];

const CATEGORY_META = {
  Infrastruktur: {
    icon: Wrench,
    bg: "bg-amber-100",
    text: "text-amber-800",
    border: "border-amber-300",
  },
  "Fasilitas Umum": {
    icon: Building2,
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
  },
  Lingkungan: {
    icon: Trees,
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    border: "border-emerald-300",
  },
  Lainnya: {
    icon: FolderArchive,
    bg: "bg-slate-100",
    text: "text-slate-800",
    border: "border-slate-300",
  },
};

const REPORT_PROGRESS = {
  "Laporan Diterima": { step: 1, label: "Laporan diterima" },
  "Laporan Diproses": { step: 2, label: "Sedang diproses" },
  "Petugas Dikirim ke Lokasi": { step: 3, label: "Petugas menuju lokasi" },
  "Laporan Selesai": { step: 4, label: "Laporan selesai" },
};

function formatDate(value) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function RiwayatLaporan({ currentUser }) {
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // State untuk filter dan pengelompokan kategori
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [viewMode, setViewMode] = useState("grouped"); // 'list' | 'grouped'

  // State untuk modal perbesar foto bukti
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    let isActive = true;
    const loadReports = async () => {
      try {
        const items = await reportService.getMyReports();
        if (isActive) {
          setReports(items);
          setError("");
        }
      } catch (loadError) {
        if (isActive) setError(loadError.message);
      } finally {
        if (isActive) setIsLoading(false);
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

  // Hitung jumlah laporan per kategori
  const categoryCounts = {
    Semua: reports.length,
    Infrastruktur: reports.filter((r) => r.category === "Infrastruktur").length,
    "Fasilitas Umum": reports.filter((r) => r.category === "Fasilitas Umum").length,
    Lingkungan: reports.filter((r) => r.category === "Lingkungan").length,
    Lainnya: reports.filter((r) => r.category === "Lainnya").length,
  };

  // Filter laporan berdasarkan kategori yang aktif pada mode list
  const filteredReports =
    activeCategory === "Semua"
      ? reports
      : reports.filter((r) => r.category === activeCategory);

  // Render satu kartu laporan (reusable untuk mode list maupun mode grouped)
  const renderReportCard = (report) => {
    const progress =
      REPORT_PROGRESS[report.status] ||
      REPORT_PROGRESS["Laporan Diterima"];
    const meta = CATEGORY_META[report.category] || CATEGORY_META["Lainnya"];
    const CategoryIcon = meta.icon;

    return (
      <article
        key={report.id}
        className="rounded-2xl p-4 sm:p-5 transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-xs"
        style={{ backgroundColor: "var(--color-cream)" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            {/* Header info */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${meta.bg} ${meta.text}`}
              >
                <CategoryIcon className="w-3 h-3" />
                {report.category}
              </span>
              <span
                className="text-xs font-mono"
                style={{ color: "var(--color-muted)" }}
              >
                #{report.id.slice(0, 8).toUpperCase()}
              </span>
              <span style={{ color: "var(--color-line)" }}>·</span>
              <time
                className="text-xs"
                style={{ color: "var(--color-muted)" }}
              >
                {formatDate(report.created_at)}
              </time>
            </div>

            <h2
              className="text-base font-semibold"
              style={{ color: "var(--color-ink)" }}
            >
              {report.title}
            </h2>

            <p
              className="mt-2 whitespace-pre-wrap text-sm leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              {report.description}
            </p>

            <p
              className="mt-3 flex items-center gap-1.5 text-xs sm:text-sm font-medium"
              style={{ color: "var(--color-muted)" }}
            >
              <MapPin
                className="h-4 w-4 shrink-0"
                style={{ color: "var(--color-coral-deep)" }}
              />
              {report.location}
            </p>

            {/* Tampilan Foto Bukti jika ada */}
            {report.image_url ? (
              <div className="mt-4 pt-3 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5 text-xs font-semibold mb-2 text-slate-700">
                  <Camera className="w-3.5 h-3.5 text-coral-deep" />
                  <span>Foto Bukti Terlampir:</span>
                </div>
                <div className="inline-block relative group rounded-xl overflow-hidden border border-slate-300 bg-white shadow-xs">
                  <img
                    src={report.image_url}
                    alt={`Bukti laporan: ${report.title}`}
                    className="w-36 h-28 sm:w-44 sm:h-32 object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPhoto({
                        url: report.image_url,
                        title: report.title,
                        category: report.category,
                        description: report.description,
                        location: report.location,
                        date: formatDate(report.created_at),
                      })
                    }
                    className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-medium cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Penuh</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Kolom Status & Progress */}
          <div className="w-full shrink-0 sm:w-48 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
            <div
              className="flex items-center justify-between text-xs font-semibold"
              style={{ color: "var(--color-coral-deep)" }}
            >
              <span>{report.status}</span>
              <span>{progress.step}/4</span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-white"
              aria-label={`Progress: ${report.status}`}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress.step * 25}%`,
                  backgroundColor: "var(--color-coral-deep)",
                }}
              />
            </div>
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--color-muted)" }}
            >
              {progress.label}
            </p>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div
      className="min-h-screen px-4 py-6 sm:px-6"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <main className="mx-auto max-w-4xl">
        <Link
          to="/reportPage"
          className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium"
          style={{ color: "var(--color-coral-deep)" }}
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </Link>

        <section
          className="rounded-3xl bg-white p-5 sm:p-8"
          style={{ border: "1px solid var(--color-line)" }}
        >
          {/* Header Section */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-coral-deep)" }}
              >
                {currentUser?.fullName || "Akun warga"}
              </p>
              <h1
                className="mt-2 text-2xl font-bold"
                style={{ color: "var(--color-ink)" }}
              >
                Riwayat Laporan Anda
              </h1>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--color-muted)" }}
              >
                Pantau perkembangan dan tindak lanjut laporan berdasarkan
                kategorinya.
              </p>
            </div>
            <Link
              to="/laporan/baru"
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white shadow-xs transition hover:opacity-95"
              style={{ backgroundColor: "var(--color-coral-deep)" }}
            >
              Buat Laporan Baru
            </Link>
          </div>

          {location.state?.reportCreated && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 text-sm text-emerald-800"
            >
              Laporan berhasil dikirim dan tersimpan di database beserta foto
              bukti! Status awal: <strong>Laporan Diterima</strong>.
            </div>
          )}

          {/* ── FITUR PENGELOMPOKKAN & FILTER KATEGORI ────────────────── */}
          {!isLoading && !error && reports.length > 0 && (
            <div className="mb-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Kategori Laporan
                </span>

                {/* Switcher Tampilan: Kelompokkan per Kategori vs Filter Tunggal */}
                <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("grouped")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      viewMode === "grouped"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-coral-deep" />
                    <span>Kelompokkan Kategori</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      viewMode === "list"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <ListFilter className="w-3.5 h-3.5 text-coral-deep" />
                    <span>Filter Per Kategori</span>
                  </button>
                </div>
              </div>

              {/* Tombol Tab Filter Kategori */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("Semua");
                    if (viewMode === "grouped") setViewMode("list");
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    activeCategory === "Semua" && viewMode === "list"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span>Semua Kategori</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeCategory === "Semua" && viewMode === "list"
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {categoryCounts.Semua}
                  </span>
                </button>

                {CATEGORIES.map((cat) => {
                  const count = categoryCounts[cat] || 0;
                  const isSelected =
                    activeCategory === cat && viewMode === "list";
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat);
                        setViewMode("list");
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? "bg-coral-deep text-white border-coral-deep"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                      style={
                        isSelected
                          ? {
                              backgroundColor: "var(--color-coral-deep)",
                              borderColor: "var(--color-coral-deep)",
                            }
                          : {}
                      }
                    >
                      <span>{cat}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <p
              role="status"
              className="py-12 text-center text-sm"
              style={{ color: "var(--color-muted)" }}
            >
              Memuat riwayat laporan...
            </p>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div
              role="alert"
              className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800"
            >
              {error}{" "}
              <button
                className="ml-1 font-semibold underline"
                onClick={() => window.location.reload()}
              >
                Muat ulang
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && reports.length === 0 && (
            <div
              className="rounded-2xl py-12 text-center"
              style={{ backgroundColor: "var(--color-cream)" }}
            >
              <FileText
                className="mx-auto h-8 w-8"
                style={{ color: "var(--color-coral-deep)" }}
              />
              <h2
                className="mt-3 font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                Belum ada laporan
              </h2>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--color-muted)" }}
              >
                Laporan yang Anda kirim akan tampil di halaman ini beserta bukti
                fotonya.
              </p>
            </div>
          )}

          {/* ── TAMPILAN MODE 1: KELOMPOKKAN PER KATEGORI ──────────────── */}
          {!isLoading && !error && reports.length > 0 && viewMode === "grouped" && (
            <div className="space-y-8">
              {CATEGORIES.map((category) => {
                const categoryReports = reports.filter(
                  (r) => r.category === category
                );
                const meta =
                  CATEGORY_META[category] || CATEGORY_META["Lainnya"];
                const CategoryIcon = meta.icon;

                return (
                  <div
                    key={category}
                    className="rounded-2xl border border-slate-200/80 p-4 sm:p-5 bg-white shadow-2xs"
                  >
                    {/* Header Grup Kategori */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`p-2 rounded-xl ${meta.bg} ${meta.text}`}
                        >
                          <CategoryIcon className="w-4 h-4" />
                        </span>
                        <div>
                          <h2 className="text-base font-bold text-slate-900">
                            {category}
                          </h2>
                          <p className="text-xs text-slate-500">
                            {categoryReports.length} laporan dalam kategori ini
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        Total: {categoryReports.length}
                      </span>
                    </div>

                    {/* Daftar laporan dalam kategori ini */}
                    {categoryReports.length > 0 ? (
                      <div className="space-y-3">
                        {categoryReports.map((report) => renderReportCard(report))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                        Belum ada laporan pada kategori {category}.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── TAMPILAN MODE 2: DAFTAR BERDASARKAN FILTER ────────────── */}
          {!isLoading && !error && reports.length > 0 && viewMode === "list" && (
            <div>
              {filteredReports.length > 0 ? (
                <div className="space-y-3">
                  {filteredReports.map((report) => renderReportCard(report))}
                </div>
              ) : (
                <div
                  className="rounded-2xl py-10 text-center"
                  style={{ backgroundColor: "var(--color-cream)" }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-ink)" }}
                  >
                    Tidak ada laporan pada kategori "{activeCategory}"
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveCategory("Semua")}
                    className="mt-2 text-xs font-medium underline"
                    style={{ color: "var(--color-coral-deep)" }}
                  >
                    Tampilkan Semua Kategori
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ── MODAL LIGHTBOX FOTO BUKTI BESAR ────────────────────────── */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl p-5 border border-slate-700 text-white shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="min-w-0 pr-4">
                <span className="text-[11px] font-semibold text-coral uppercase tracking-wider">
                  Foto Bukti Laporan
                </span>
                <h3 className="text-base font-bold truncate">
                  {selectedPhoto.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Tutup"
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

            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <p>
                <strong className="text-slate-300">Kategori:</strong>{" "}
                {selectedPhoto.category} ·{" "}
                <strong className="text-slate-300">Waktu:</strong>{" "}
                {selectedPhoto.date}
              </p>
              <p>
                <strong className="text-slate-300">Lokasi:</strong>{" "}
                {selectedPhoto.location}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
