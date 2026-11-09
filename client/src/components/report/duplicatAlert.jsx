import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  MapPin,
  RefreshCw,
  LoaderCircle,
  ThumbsUp,
} from "lucide-react";
import BrandLogo from "../common/BrandLogo";
import { reportService } from "../../services/reportService";

export default function DuplicatAlert({ currentUser }) {
  const navigate = useNavigate();
  const locationState = useLocation();

  const pendingReport = locationState.state?.pendingReport || null;
  const initialSimilarReports = locationState.state?.similarReports || [];

  const [reportsList, setReportsList] = useState(initialSimilarReports);
  const [activeSort, setActiveSort] = useState("mirip"); // "mirip" | "terdekat" | "dukungan"
  const [supportingId, setSupportingId] = useState(null);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedReport, setSubmittedReport] = useState(null);

  // Filter & Urutkan laporan sesuai tab
  const sortedReports = useMemo(() => {
    const list = [...reportsList];
    if (activeSort === "mirip") {
      list.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));
    } else if (activeSort === "terdekat") {
      list.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    } else if (activeSort === "dukungan") {
      list.sort((a, b) => (b.supports_count || 0) - (a.supports_count || 0));
    }
    return list;
  }, [reportsList, activeSort]);

  // Hitung berapa laporan yang sudah didukung user di sesi ini
  const supportedCount = useMemo(() => {
    return reportsList.filter((r) => r.isSupported).length;
  }, [reportsList]);

  // Handler toggle dukungan
  const handleToggleSupport = async (reportId) => {
    if (supportingId) return;
    setSupportingId(reportId);
    try {
      const res = await reportService.toggleSupport(reportId);
      setReportsList((prev) =>
        prev.map((r) => {
          if (r.id === reportId) {
            return {
              ...r,
              isSupported: res.isSupported,
              supports_count: res.supportsCount,
            };
          }
          return r;
        }),
      );
    } catch (err) {
      alert(err.message || "Gagal memperbarui dukungan.");
    } finally {
      setSupportingId(null);
    }
  };

  // Handler jika user tetap ingin mengirim laporannya sendiri
  const handleProceedSubmitNewReport = async () => {
    if (!pendingReport) {
      navigate("/laporan/baru");
      return;
    }

    setIsSubmittingNew(true);
    setSubmitError("");
    try {
      const newReport = await reportService.createReport(pendingReport);
      setSubmittedReport(newReport);
    } catch (err) {
      setSubmitError(err.message || "Gagal mengirim laporan baru.");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const userInitial = (
    currentUser?.fullName ||
    currentUser?.email ||
    "P"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

  const userName =
    currentUser?.fullName?.trim() ||
    currentUser?.email?.split("@")[0] ||
    "P";

  // Jika tidak ada data form sama sekali (misal refresh manual tanpa state)
  if (!pendingReport && reportsList.length === 0 && !submittedReport) {
    return (
      <div
        className="min-h-screen px-4 py-8 font-sans flex flex-col items-center justify-center text-center"
        style={{ backgroundColor: "var(--color-cream, #fdebe0)" }}
      >
        <BrandLogo size="lg" />
        <h2 className="mt-6 text-xl font-bold text-(--color-ink)">
          Tidak Ada Laporan yang Sedang Diperiksa
        </h2>
        <p className="mt-2 text-sm text-(--color-muted) max-w-md">
          Silakan isi formulir laporan terlebih dahulu untuk memeriksa laporan
          serupa di wilayah Anda.
        </p>
        <Link
          to="/laporan/baru"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-(--color-coral) px-5 py-2.5 text-xs font-bold text-(--color-ink) shadow-sm hover:opacity-95"
        >
          <ArrowLeft className="w-4 h-4" /> Buat Laporan Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-5 sm:px-8 sm:py-7 font-sans text-(--color-ink)"
      style={{ backgroundColor: "var(--color-cream, #fdebe0)" }}
    >
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <header className="mx-auto flex max-w-5xl items-center justify-between pb-6">
        <Link to="/reportPage" className="inline-flex items-center">
          <BrandLogo size="md" />
        </Link>

        {/* Profil Singkat di Pojok Kanan Atas */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-md font-bold text-sm shadow-xs"
            style={{
              backgroundColor: "var(--color-apricot, #fcd5a8)",
              color: "var(--color-ink, #1f2433)",
            }}
          >
            {userInitial}
          </div>
          <div className="flex flex-col text-left">
            <span
              className="text-xs font-bold leading-tight"
              style={{ color: "var(--color-ink, #1f2433)" }}
            >
              {userName}
            </span>
            <span
              className="text-[11px] leading-tight"
              style={{ color: "var(--color-muted, #5c6070)" }}
            >
              Warga
            </span>
          </div>
        </div>
      </header>

      {/* ── Tombol Kembali Mengubah Laporan ────────────────────── */}
      <div className="mx-auto max-w-5xl mb-3">
        <button
          type="button"
          onClick={() =>
            navigate("/laporan/baru", { state: { pendingReport } })
          }
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--color-ink) hover:underline cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali mengubah laporan</span>
        </button>
      </div>

      {/* ── Step Indicator (1. Isi laporan ✓ -> 2. Cek laporan serupa -> 3. Kirim) ── */}
      <div className="mx-auto max-w-5xl mb-6">
        <div className="flex items-center gap-4 text-xs font-medium">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-(--color-ink) text-white font-bold text-xs">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-(--color-ink)">Isi laporan</span>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F2A383] text-(--color-ink) font-bold text-xs">
              2
            </div>
            <span className="font-bold text-(--color-ink)">
              Cek laporan serupa
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--color-line)] bg-white/70 text-(--color-muted) font-bold text-xs">
              3
            </div>
            <span className="text-(--color-muted)">Kirim</span>
          </div>
        </div>
      </div>

      {/* ── Judul Halaman & Subtitle ───────────────────────── */}
      <div className="mx-auto max-w-5xl mb-7">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--color-ink)">
          Apakah masalah Anda sudah dilaporkan?
        </h1>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed max-w-2xl text-(--color-muted)">
          Kami menemukan {reportsList.length} laporan serupa di sekitar lokasi Anda.
          Jika masalahnya sama, cukup dukung laporan yang sudah ada. Suara warga
          jadi lebih kuat dan petugas tidak menangani laporan ganda.
        </p>
      </div>

      {/* ── Konten Dua Kolom (Kiri: List / Sukses, Kanan: Sidebar) ── */}
      <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ══ KOLOM KIRI (UTAMA) ════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-4">
          {/* JIKA USER TELAH BERHASIL MENGIRIM LAPORAN BARU (SCREENSHOT 1) */}
          {submittedReport ? (
            <div className="rounded-2xl bg-white p-6 sm:p-7 border border-[var(--color-line)] shadow-xs animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-ink) text-white font-bold">
                  <Check className="h-5 w-5" />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-(--color-ink) tracking-tight">
                  Laporan baru Anda sudah terkirim
                </h2>
              </div>

              {/* Box Detail Kode & Status */}
              <div className="rounded-xl bg-[#FCD7B6]/40 border border-[#FCD7B6] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-(--color-muted) tracking-wider block mb-0.5">
                    Kode laporan
                  </span>
                  <span className="text-lg sm:text-xl font-extrabold text-(--color-ink) tracking-tight">
                    PN-{(submittedReport.id || "").replace(/-/g, "").slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-(--color-muted) tracking-wider block mb-0.5">
                    Status
                  </span>
                  <span className="text-sm font-extrabold text-(--color-ink)">
                    {submittedReport.status || "Laporan Diterima"} · 1/4
                  </span>
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/laporan")}
                  className="px-5 py-2.5 rounded-xl bg-(--color-coral) text-(--color-ink) text-xs font-bold shadow-xs hover:opacity-90 transition-all cursor-pointer"
                >
                  Lihat Riwayat Laporan
                </button>
                <button
                  type="button"
                  onClick={() => setSubmittedReport(null)}
                  className="px-5 py-2.5 rounded-xl bg-white border border-[var(--color-line)] text-(--color-ink) text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Kembali ke daftar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Filter Tabs & Counter (Screenshot 2) */}
              <div className="flex items-center justify-between gap-2 pb-1">
                <span className="text-xs font-bold text-(--color-ink)">
                  {reportsList.length} laporan serupa
                </span>

                {/* Tabs Segmented Control */}
                <div className="flex items-center rounded-xl border border-[var(--color-line)] bg-white/40 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveSort("mirip")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeSort === "mirip"
                        ? "bg-(--color-ink) text-white shadow-xs"
                        : "text-(--color-muted) hover:text-(--color-ink)"
                    }`}
                  >
                    Paling mirip
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSort("terdekat")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeSort === "terdekat"
                        ? "bg-(--color-ink) text-white shadow-xs"
                        : "text-(--color-muted) hover:text-(--color-ink)"
                    }`}
                  >
                    Terdekat
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSort("dukungan")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeSort === "dukungan"
                        ? "bg-(--color-ink) text-white shadow-xs"
                        : "text-(--color-muted) hover:text-(--color-ink)"
                    }`}
                  >
                    Dukungan terbanyak
                  </button>
                </div>
              </div>

              {/* ── DAFTAR KARTU LAPORAN SERUPA ────────────────────── */}
              <div className="space-y-3.5">
                {sortedReports.map((report) => {
                  const isOwn = report.isOwnReport;
                  const isSupported = report.isSupported;
                  const step = report.statusStep || 1;

                  return (
                    <div
                      key={report.id}
                      className="rounded-2xl bg-white p-4 sm:p-5 border border-[var(--color-line)] shadow-xs transition-all hover:border-[var(--color-coral)]/40 flex flex-col md:flex-row gap-4 justify-between"
                    >
                      {/* Left Side: Thumbnail + Report Details */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {/* Thumbnail / Camera Box */}
                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-[#FDE2D0] text-[#984732] overflow-hidden border border-[#F2C5AF]">
                          {report.image_url ? (
                            <img
                              src={report.image_url}
                              alt={report.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Camera className="w-5 h-5 opacity-80" />
                          )}
                        </div>

                        {/* Text Details */}
                        <div className="flex-1 min-w-0">
                          {/* Badges Row */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            {isOwn ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FCE8D3] text-[#984732] border border-[#F5C7A5]">
                                Laporan Anda
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  report.similarityLevel === "Sangat mirip"
                                    ? "bg-[#FCE8D3] text-[#984732] border border-[#F5C7A5]"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}
                              >
                                {report.similarityLevel || "Mirip"}
                              </span>
                            )}

                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-(--color-muted) border border-[var(--color-line)]">
                              {report.category}
                            </span>

                            <span className="text-[10px] font-mono text-(--color-muted) px-1.5 py-0.5 rounded-md bg-slate-50 border border-slate-200">
                              {report.code || `#${(report.id || "").slice(0, 8).toUpperCase()}`}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-sm sm:text-base font-bold text-(--color-ink) leading-snug truncate">
                            {report.title}
                          </h3>

                          {/* Meta match info */}
                          <p className="mt-1 text-[11px] text-(--color-muted) leading-relaxed">
                            {isOwn ? (
                              "Laporan ini dibuat oleh Anda, jadi tidak perlu didukung."
                            ) : (
                              <>
                                <span>{report.categoryMatchText || "Kategori sama"}</span>
                                <span> · {report.distanceText || "Dekat dari lokasi Anda"}</span>
                                {report.matchedKeywords && report.matchedKeywords.length > 0 && (
                                  <span> · kata kunci: {report.matchedKeywords.join(", ")}</span>
                                )}
                              </>
                            )}
                          </p>

                          {/* Location & Date */}
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-(--color-muted)">
                            <span className="flex items-center gap-1 font-medium text-(--color-ink)">
                              <MapPin className="w-3.5 h-3.5 text-[#984732]" />
                              {report.location}
                            </span>
                            <span>
                              {new Date(report.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          {/* Progress Status Bar (1/4 to 4/4) */}
                          <div className="mt-3 pt-2.5 border-t border-[var(--color-line)] max-w-sm">
                            <div className="flex items-center gap-2">
                              <div className="grid grid-cols-4 gap-1.5 flex-1">
                                {[1, 2, 3, 4].map((s) => (
                                  <div
                                    key={s}
                                    className={`h-1.5 rounded-full ${
                                      s <= step
                                        ? "bg-[#984732]"
                                        : "bg-[#FADDBA]"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] font-bold text-(--color-muted)">
                                {step}/4
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-(--color-ink) mt-1 block">
                              {report.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side Box: Support Count & Action Button */}
                      <div className="md:w-36 shrink-0 flex flex-col items-center justify-center p-3 rounded-xl bg-[#FDF1E6] border border-[#F5DAC2] text-center">
                        <span className="text-2xl sm:text-3xl font-extrabold text-(--color-ink) leading-none">
                          {report.supports_count || 0}
                        </span>
                        <span className="text-[11px] text-(--color-muted) mt-0.5 mb-3 font-medium">
                          warga mendukung
                        </span>

                        {/* Tombol Dukung / Status Dukungan */}
                        {isOwn ? (
                          <button
                            type="button"
                            disabled
                            className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-white/70 text-(--color-muted) border border-[var(--color-line)] cursor-not-allowed"
                          >
                            Laporan Anda
                          </button>
                        ) : isSupported ? (
                          <div className="w-full flex flex-col items-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSupport(report.id)}
                              disabled={supportingId === report.id}
                              className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-(--color-ink) text-white shadow-xs hover:bg-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              {supportingId === report.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Anda mendukung
                                </>
                              )}
                            </button>
                            <span className="text-[9px] text-(--color-muted) mt-1 leading-tight">
                              Tekan lagi untuk membatalkan
                            </span>
                          </div>
                        ) : (
                          <div className="w-full flex flex-col items-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSupport(report.id)}
                              disabled={supportingId === report.id}
                              className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-white text-(--color-ink) border border-[var(--color-line)] shadow-xs hover:border-(--color-coral) transition-all cursor-pointer flex items-center justify-center gap-1"
                            >
                              {supportingId === report.id ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-(--color-coral-deep)" />
                              ) : (
                                "+ Dukung"
                              )}
                            </button>
                            <span className="text-[9px] text-(--color-muted) mt-1 leading-tight">
                              Saya mengalami masalah yang sama
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── BOTTOM ACTION SECTION ──────────────────────────── */}
              {/* Jika User SUDAH mendukung setidaknya 1 laporan (Screenshot 4) */}
              {supportedCount > 0 ? (
                <div className="rounded-2xl bg-[#FCD8BA]/70 border border-[#F3BF9B] p-5 sm:p-6 shadow-xs animate-in fade-in duration-200">
                  <h4 className="text-sm sm:text-base font-extrabold text-(--color-ink)">
                    Dukungan Anda tercatat untuk {supportedCount} laporan
                  </h4>
                  <p className="mt-1 text-xs text-(--color-ink)/80 leading-relaxed max-w-xl">
                    Jika masalah Anda sama dengan laporan yang Anda dukung, Anda tidak perlu
                    mengirim laporan baru. Petugas akan memprioritaskan laporan dengan dukungan warga terbanyak.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("/laporan")}
                      className="px-5 py-2.5 rounded-xl bg-(--color-ink) text-white text-xs font-bold shadow-xs hover:bg-black transition-all cursor-pointer"
                    >
                      Selesai
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedSubmitNewReport}
                      disabled={isSubmittingNew}
                      className="px-4 py-2.5 rounded-xl bg-white/70 border border-[var(--color-line)] text-(--color-ink) text-xs font-semibold hover:bg-white transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {isSubmittingNew ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Masalah saya berbeda, tetap kirim laporan baru"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Jika User BELUM memilih mendukung laporan apapun (Screenshot 2 & 3) */
                <div className="rounded-2xl bg-white p-5 sm:p-6 border border-[var(--color-line)] shadow-xs">
                  <h4 className="text-sm sm:text-base font-extrabold text-(--color-ink)">
                    Tidak ada yang sama dengan masalah Anda?
                  </h4>
                  <p className="mt-1 text-xs text-(--color-muted) leading-relaxed">
                    Jika masalah Anda berbeda atau lokasinya lain, lanjutkan mengirim laporan baru.
                  </p>

                  {submitError && (
                    <div className="mt-3 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                      {submitError}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleProceedSubmitNewReport}
                      disabled={isSubmittingNew}
                      className="px-5 py-2.5 rounded-xl bg-(--color-coral) text-(--color-ink) text-xs font-bold shadow-xs hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {isSubmittingNew ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Mengirim...
                        </>
                      ) : (
                        <>
                          Lanjut Kirim Laporan Baru <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/laporan/baru", { state: { pendingReport } })
                      }
                      className="px-4 py-2.5 rounded-xl bg-white border border-[var(--color-line)] text-(--color-ink) text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Kembali Ubah Laporan
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Catatan Kaki */}
          <p className="text-[11px] text-(--color-muted) pt-2">
            Daftar laporan serupa pada halaman ini disinkronkan langsung dengan basis data laporan publik Peduli Negeri.
          </p>
        </div>

        {/* ══ KOLOM KANAN (SIDEBAR) ═════════════════════════════════ */}
        <div className="space-y-4">
          {/* Card 1: Ringkasan "Laporan Anda" */}
          {pendingReport && (
            <div className="rounded-2xl bg-white p-5 border border-[var(--color-line)] shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--color-line)]">
                <div>
                  <h3 className="text-xs font-bold text-(--color-ink)">Laporan Anda</h3>
                  <span className="text-[10px] text-(--color-muted)">
                    {submittedReport ? "Sudah terkirim" : "Belum dikirim"}
                  </span>
                </div>
                {!submittedReport && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/laporan/baru", { state: { pendingReport } })
                    }
                    className="text-xs font-bold text-[#984732] hover:underline cursor-pointer"
                  >
                    Ubah
                  </button>
                )}
              </div>

              <h4 className="text-sm font-bold text-(--color-ink) mb-2">
                {pendingReport.title || "Judul Laporan"}
              </h4>

              {pendingReport.category && (
                <div className="mb-2.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-(--color-muted) border border-[var(--color-line)]">
                    {pendingReport.category}
                  </span>
                </div>
              )}

              <p className="text-xs text-(--color-muted) flex items-start gap-1.5 leading-snug">
                <MapPin className="w-3.5 h-3.5 text-[#984732] shrink-0 mt-0.5" />
                <span>{pendingReport.location || "Lokasi belum ditentukan"}</span>
              </p>

              {pendingReport.description && (
                <p className="mt-3 text-xs text-(--color-muted) line-clamp-3 italic bg-[var(--color-surface)] p-2.5 rounded-xl border border-[var(--color-line)]">
                  "{pendingReport.description}"
                </p>
              )}
            </div>
          )}

          {/* Card 2: Informasi "Apa arti mendukung laporan?" */}
          <div className="rounded-2xl bg-[#FCD8BA]/60 p-5 border border-[#F3BF9B] shadow-xs">
            <h3 className="text-xs font-extrabold text-(--color-ink) mb-2.5">
              Apa arti mendukung laporan?
            </h3>
            <ul className="space-y-2 text-xs text-(--color-ink)/85 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-base leading-none text-[#984732]">•</span>
                <span>Anda menyatakan mengalami atau melihat masalah yang sama.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-base leading-none text-[#984732]">•</span>
                <span>
                  Jumlah dukungan membantu petugas melihat seberapa banyak warga terdampak.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-base leading-none text-[#984732]">•</span>
                <span>
                  Dukungan bisa dibatalkan kapan saja dengan menekan tombol yang sama.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

