import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle2,
  Timer,
  Star,
  MapPin,
  Map,
  Plus,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Compass,
} from "lucide-react";
import { reportService } from "../../services/reportService";
import { testimonialService } from "../../services/testimonialService";
import { authService } from "../../services/authService";
import BrandLogo from "../common/BrandLogo";

const MONTH_NAMES_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

/**
 * Mengelompokkan laporan ke dalam bucket harian dan menghitung
 * jumlah laporan masuk vs selesai per hari.
 */
function buildTrendBuckets(reports, periodDays) {
  const now = new Date();
  const days = periodDays === null ? 30 : periodDays;
  const bucketCount = Math.min(days, 15);
  const bucketSpan = Math.max(Math.floor(days / bucketCount), 1);

  const buckets = [];
  for (let i = bucketCount - 1; i >= 0; i--) {
    const bucketEnd = new Date(now);
    bucketEnd.setDate(bucketEnd.getDate() - i * bucketSpan);
    bucketEnd.setHours(23, 59, 59, 999);

    const bucketStart = new Date(bucketEnd);
    bucketStart.setDate(bucketStart.getDate() - bucketSpan + 1);
    bucketStart.setHours(0, 0, 0, 0);

    const label = `${bucketEnd.getDate()} ${MONTH_NAMES_ID[bucketEnd.getMonth()]}`;
    buckets.push({ label, start: bucketStart.getTime(), end: bucketEnd.getTime(), incoming: 0, resolved: 0 });
  }

  reports.forEach((rep) => {
    const createdMs = new Date(rep.createdAt || rep.created_at).getTime();
    const isResolved = rep.status === "Laporan Selesai" || rep.status === "Selesai";

    // Menentukan kapan laporan selesai dari status_timeline atau updatedAt
    let resolvedMs = null;
    if (isResolved) {
      const timeline = rep.statusTimeline || rep.status_timeline || [];
      const finishedEntry = timeline.find(
        (e) => e.status === "Laporan Selesai" || e.status === "Selesai",
      );
      resolvedMs = finishedEntry
        ? new Date(finishedEntry.timestamp).getTime()
        : new Date(rep.updatedAt || rep.updated_at || rep.createdAt || rep.created_at).getTime();
    }

    for (const bucket of buckets) {
      if (createdMs >= bucket.start && createdMs <= bucket.end) {
        bucket.incoming += 1;
      }
      if (resolvedMs && resolvedMs >= bucket.start && resolvedMs <= bucket.end) {
        bucket.resolved += 1;
      }
    }
  });

  return buckets.map((b) => ({ date: b.label, incoming: b.incoming, resolved: b.resolved }));
}

/**
 * Menghitung rata-rata jumlah hari dari laporan dibuat hingga selesai.
 */
function computeAvgResolutionDays(reports) {
  const resolved = reports.filter(
    (r) => r.status === "Laporan Selesai" || r.status === "Selesai",
  );
  if (resolved.length === 0) return null;

  let totalDays = 0;
  let count = 0;
  for (const rep of resolved) {
    const created = new Date(rep.createdAt || rep.created_at);
    const timeline = rep.statusTimeline || rep.status_timeline || [];
    const finishedEntry = timeline.find(
      (e) => e.status === "Laporan Selesai" || e.status === "Selesai",
    );
    const finishedAt = finishedEntry
      ? new Date(finishedEntry.timestamp)
      : new Date(rep.updatedAt || rep.updated_at || rep.createdAt || rep.created_at);

    const diffMs = finishedAt - created;
    if (diffMs >= 0) {
      totalDays += diffMs / (1000 * 60 * 60 * 24);
      count += 1;
    }
  }

  if (count === 0) return null;
  const avg = totalDays / count;
  return avg.toFixed(1).replace(".", ",");
}

/**
 * Menghitung ringkasan rating dari array testimoni.
 */
function computeRatingSummary(testimonials) {
  if (!testimonials || testimonials.length === 0) return null;

  const breakdown = [
    { stars: 5, count: 0 },
    { stars: 4, count: 0 },
    { stars: 3, count: 0 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 },
  ];

  let sum = 0;
  testimonials.forEach((t) => {
    const r = t.rating || 5;
    sum += r;
    const entry = breakdown.find((b) => b.stars === r);
    if (entry) entry.count += 1;
  });

  return {
    average: Math.round((sum / testimonials.length) * 10) / 10,
    totalReviews: testimonials.length,
    breakdown,
  };
}

// Smooth cubic bezier SVG path dari titik-titik koordinat
function generateSmoothPath(points) {
  if (!points || points.length < 2) return "";
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export default function ReportStatistik() {
  const [currentUser] = useState(() => authService.getCurrentUser());
  const [period, setPeriod] = useState("30 hari");
  const [reports, setReports] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    let isActive = true;
    async function loadData() {
      setLoading(true);
      try {
        const [reportsData, testimonialsData] = await Promise.all([
          reportService.getPublicReports().catch(() => []),
          testimonialService.getTestimonials().catch(() => []),
        ]);
        if (isActive) {
          setReports(Array.isArray(reportsData) ? reportsData : []);
          setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : []);
        }
      } catch {
        // Fallback ke state kosong — UI akan menampilkan state "belum ada data"
      } finally {
        if (isActive) setLoading(false);
      }
    }
    loadData();
    return () => {
      isActive = false;
    };
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const periodDays = period === "7 hari" ? 7 : period === "30 hari" ? 30 : null;

    // Filter berdasarkan periode
    const filteredReports = reports.filter((rep) => {
      if (periodDays === null) return true;
      const created = new Date(rep.createdAt || rep.created_at);
      return (now - created) / (1000 * 60 * 60 * 24) <= periodDays;
    });

    const total = filteredReports.length;
    const resolved = filteredReports.filter(
      (r) => r.status === "Laporan Selesai" || r.status === "Selesai",
    ).length;
    const inProgress = total - resolved;
    const resolvedPct = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const inProgressPct = total > 0 ? 100 - resolvedPct : 0;

    // Rata-rata waktu penyelesaian dihitung dari data riil
    const avgDays = computeAvgResolutionDays(filteredReports) || "—";

    // Kategori
    const catMap = { Infrastruktur: 0, Lingkungan: 0, "Fasilitas Umum": 0, Lainnya: 0 };
    filteredReports.forEach((r) => {
      const cat = r.category || "Lainnya";
      if (catMap[cat] !== undefined) catMap[cat] += 1;
      else catMap["Lainnya"] += 1;
    });
    const categories = Object.entries(catMap).map(([name, count]) => ({ name, count }));

    // Wilayah
    const regMap = {
      Jawa: 0, Sumatra: 0, Kalimantan: 0,
      "Bali & Nusa Tenggara": 0, Maluku: 0, Sulawesi: 0, Papua: 0,
    };
    filteredReports.forEach((r) => {
      const reg = r.region || "Jawa";
      if (regMap[reg] !== undefined) regMap[reg] += 1;
      else regMap["Jawa"] += 1;
    });
    const regions = Object.entries(regMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Tren per hari — dihitung dari data real
    const effectiveDays = periodDays || Math.max(
      Math.ceil((now - new Date(
        filteredReports.length > 0
          ? filteredReports[filteredReports.length - 1].createdAt || filteredReports[filteredReports.length - 1].created_at
          : now,
      )) / (1000 * 60 * 60 * 24)),
      7,
    );
    const trend = buildTrendBuckets(filteredReports, effectiveDays);

    // Rating & Ulasan dari testimoni riil
    const ratingSummary = computeRatingSummary(testimonials);
    const rating = ratingSummary || {
      average: 0,
      totalReviews: 0,
      breakdown: [
        { stars: 5, count: 0 }, { stars: 4, count: 0 }, { stars: 3, count: 0 },
        { stars: 2, count: 0 }, { stars: 1, count: 0 },
      ],
    };

    // Ulasan terbaru (dari testimonial endpoint, sekarang menyertakan kategori laporan)
    const reviews = testimonials.slice(0, 3).map((t, idx) => ({
      id: t.id || `t-${idx}`,
      rating: t.rating || 5,
      category: t.category || "Umum",
      comment: t.content,
      location: t.reportTitle || t.author || "Warga Peduli",
      region: t.reportProvince || t.reportLocation || "Indonesia",
      date: t.createdAt
        ? new Date(t.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
        : "",
    }));

    return {
      total, inProgress, resolved, resolvedPct, inProgressPct,
      avgDays, categories, regions, trend, rating, reviews,
    };
  }, [reports, testimonials, period]);

  // Donut chart
  const donutRadius = 52;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const resolvedStrokeLength = (stats.resolvedPct / 100) * donutCircumference;
  const inProgressStrokeLength = (stats.inProgressPct / 100) * donutCircumference;

  // Max value wilayah chart
  const maxRegionCount = Math.max(...stats.regions.map((r) => r.count), 1);

  // SVG Trend Chart — menghitung maxY dari data riil
  const chartWidth = 860;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 25;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const maxY = useMemo(() => {
    const peak = Math.max(
      ...stats.trend.map((t) => Math.max(t.incoming, t.resolved)),
      1,
    );
    // Bulatkan ke atas ke kelipatan 2 terdekat untuk grid yang rapi
    return Math.ceil(peak / 2) * 2;
  }, [stats.trend]);

  const trendPointsIncoming = useMemo(() => {
    const data = stats.trend;
    if (data.length < 2) return [];
    return data.map((item, index) => ({
      x: paddingX + (index / (data.length - 1)) * innerWidth,
      y: paddingY + innerHeight - (item.incoming / maxY) * innerHeight,
      ...item,
    }));
  }, [stats.trend, innerWidth, innerHeight, maxY]);

  const trendPointsResolved = useMemo(() => {
    const data = stats.trend;
    if (data.length < 2) return [];
    return data.map((item, index) => ({
      x: paddingX + (index / (data.length - 1)) * innerWidth,
      y: paddingY + innerHeight - (item.resolved / maxY) * innerHeight,
      ...item,
    }));
  }, [stats.trend, innerWidth, innerHeight, maxY]);

  const incomingPath = useMemo(() => generateSmoothPath(trendPointsIncoming), [trendPointsIncoming]);
  const resolvedPath = useMemo(() => generateSmoothPath(trendPointsResolved), [trendPointsResolved]);

  const incomingAreaPath = useMemo(() => {
    if (trendPointsIncoming.length < 2) return "";
    const firstX = trendPointsIncoming[0].x.toFixed(1);
    const lastX = trendPointsIncoming[trendPointsIncoming.length - 1].x.toFixed(1);
    const bottomY = (paddingY + innerHeight).toFixed(1);
    return `${incomingPath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [incomingPath, trendPointsIncoming, innerHeight]);

  // Y-axis gridline values dihitung dari maxY
  const yGridValues = useMemo(() => {
    const step = Math.max(Math.round(maxY / 4), 1);
    const vals = [];
    for (let v = 0; v <= maxY; v += step) vals.push(v);
    if (vals[vals.length - 1] !== maxY) vals.push(maxY);
    return vals.reverse();
  }, [maxY]);

  // Max count untuk bar chart kategori
  const maxCatCount = useMemo(
    () => Math.max(...stats.categories.map((c) => c.count), 1),
    [stats.categories],
  );

  const isEmpty = !loading && reports.length === 0;

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)] font-sans antialiased">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#fdebe0]/95 backdrop-blur-md border-b border-[#ecd6c8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="shrink-0">
              <BrandLogo size="md" />
            </Link>
            <div className="hidden sm:flex items-center gap-1 text-xs text-[var(--color-muted)]">
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/peta"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors px-3 py-1.5 rounded-md hover:bg-white/50"
            >
              <Compass size={14} className="text-[var(--color-coral-deep)]" />
              <span>Peta Interaktif</span>
            </Link>

            {currentUser ? (
              <Link
                to={currentUser.role === "admin" ? "/admin" : "/reportPage"}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--color-cream)] border border-[var(--color-line)] hover:bg-[var(--color-apricot)] transition-colors shadow-2xs"
              >
                Dashboard Saya
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[var(--color-ink)] hover:bg-[var(--color-cream)] transition-colors shadow-2xs"
              >
                Masuk
              </Link>
            )}

            <Link
              to="/laporan/baru"
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[var(--color-coral)] hover:bg-[#f39770] text-[var(--color-ink)] transition-colors flex items-center gap-1 shadow-2xs"
            >
              <Plus size={14} />
              <span>Laporkan</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        {/* Title & Period Filter */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] tracking-tight">
              Statistik Laporan
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] mt-1 max-w-2xl leading-relaxed">
              Data terbuka dari seluruh laporan warga: berapa yang masuk, seberapa cepat
              ditangani, dan di mana masalah terbanyak terjadi.
            </p>
          </div>

          <div className="shrink-0 self-start md:self-auto">
            <div className="inline-flex p-1 rounded-lg border border-[var(--color-line)] bg-white shadow-2xs">
              {["7 hari", "30 hari", "Semua"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPeriod(item)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${period === item
                    ? "bg-[#1f2433] text-white shadow-xs"
                    : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-[var(--color-coral)] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[var(--color-muted)] mt-3">Memuat statistik laporan...</p>
          </div>
        )}

        {/* Empty State */}
        {isEmpty && (
          <div className="mt-12 rounded-xl border border-[var(--color-line)] bg-white p-8 text-center">
            <FileText size={32} className="mx-auto text-[var(--color-muted)] mb-3" />
            <h3 className="text-sm font-bold text-[var(--color-ink)]">Belum ada laporan</h3>
            <p className="text-xs text-[var(--color-muted)] mt-1 max-w-md mx-auto">
              Data statistik akan ditampilkan setelah laporan dari warga mulai masuk.
            </p>
            <Link
              to="/laporan/baru"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 text-xs font-bold rounded-lg bg-[var(--color-coral)] hover:bg-[#f39770] text-[var(--color-ink)] transition-colors"
            >
              <Plus size={14} />
              Buat Laporan Pertama
            </Link>
          </div>
        )}

        {!loading && !isEmpty && (
          <>
            {/* Top 4 Metrics Cards */}
            <section aria-label="Ringkasan Utama" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 reveal-on-scroll">
              {[
                { icon: FileText, label: "Total Laporan", value: stats.total, sub: "Seluruh laporan pada periode ini" },
                { icon: Clock, label: "Dalam Proses", value: stats.inProgress, sub: `${stats.inProgressPct}% dari total` },
                { icon: CheckCircle2, label: "Selesai", value: stats.resolved, sub: `${stats.resolvedPct}% dari total` },
                { icon: Timer, label: "Rata-rata Waktu Penyelesaian", value: stats.avgDays, sub: "Dari dibuat hingga selesai", suffix: stats.avgDays !== "—" ? "hari" : null },
              ].map((card) => (
                <div key={card.label} className="rounded-xl border border-[var(--color-line)] bg-white p-4 shadow-2xs hover-lift hover:shadow-xs transition-shadow">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-cream)] text-[var(--color-coral-deep)] flex items-center justify-center shrink-0">
                      <card.icon size={17} />
                    </div>
                    <span className="text-xs font-semibold text-[var(--color-muted)]">{card.label}</span>
                  </div>
                  <div className="mt-3 flex items-baseline">
                    <span className="text-3xl font-extrabold text-[var(--color-ink)] tracking-tight">{card.value}</span>
                    {card.suffix && <span className="text-xs font-bold text-[var(--color-ink)] ml-1.5">{card.suffix}</span>}
                  </div>
                  <p className="text-[11px] text-[var(--color-muted)] mt-1">{card.sub}</p>
                </div>
              ))}
            </section>

            {/* Row 2: Kategori & Status Penyelesaian */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5 reveal-on-scroll">
              {/* Laporan per Kategori — Bar Chart */}
              <div className="rounded-xl border border-[var(--color-line)] bg-white p-5 shadow-2xs hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-ink)]">Laporan per Kategori</h3>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">Jumlah laporan berdasarkan jenis masalah.</p>
                  </div>
                  <BarChart3 size={16} className="text-[var(--color-muted)]" />
                </div>

                <div className="mt-10 pt-4 pb-20 relative">
                  {/* SVG bar chart — menghindari masalah CSS percentage height */}
                  <svg viewBox="0 0 320 200" className="w-full h-48" aria-label="Grafik batang per kategori" style={{ overflow: "visible" }} >
                    {/* Garis horizontal */}
                    {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                      const lineY = 10 + (1 - frac) * 150;
                      return (
                        <line key={frac} x1="10" y1={lineY} x2="310" y2={lineY}
                          stroke="#ecd6c8" strokeWidth="0.5" strokeDasharray={frac === 0 ? "none" : "2 3"} />
                      );
                    })}

                    {/* Batang & Label */}
                    {stats.categories.map((cat, idx) => {
                      const barMaxHeight = 150;
                      const barH = maxCatCount > 0 ? Math.max((cat.count / maxCatCount) * barMaxHeight, 4) : 4;
                      const barW = 40;
                      const gap = (300 - stats.categories.length * barW) / (stats.categories.length + 1);
                      const barX = 10 + gap + idx * (barW + gap);
                      const barY = 10 + barMaxHeight - barH;
                      const isHovered = hoveredCategory === cat.name;

                      return (
                        <g key={cat.name}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredCategory(cat.name)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          {/* Invisible hover area */}
                          <rect x={barX - 5} y="0" width={barW + 10} height="200" fill="transparent" />

                          {/* Count label di atas bar */}
                          <text
                            x={barX + barW / 2} y={barY - 6}
                            textAnchor="middle" fontSize="12" fontWeight="bold"
                            fill={isHovered ? "#a14a30" : "#1f2433"}
                          >
                            {cat.count}
                          </text>

                          {/* Bar */}
                          <rect
                            x={barX} y={barY} width={barW} height={barH}
                            rx="3" ry="3"
                            fill={isHovered ? "#a14a30" : "#374868"}
                            className="transition-all duration-200"
                          />

                          {/* Category label di bawah */}
                          <text
                            x={barX + barW / 2} y="178"
                            textAnchor="middle" fontSize="10" fill="#5c6070"
                          >
                            {cat.name.length > 12 ? cat.name.slice(0, 10) + "…" : cat.name}
                          </text>
                        </g>
                      );
                    })}

                    {/* Garis batas bawah */}
                    <line x1="10" y1="165" x2="310" y2="165" stroke="#ecd6c8" strokeWidth="1" />
                  </svg>
                </div>
              </div>

              {/* Status Penyelesaian — Donut */}
              <div className="rounded-xl border border-[var(--color-line)] bg-white p-5 shadow-2xs hover-lift flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-ink)]">Status Penyelesaian</h3>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">Perbandingan laporan selesai dan masih diproses.</p>

                  <div className="mt-4 flex flex-col items-center justify-center">
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140" aria-hidden="true">
                        <circle cx="70" cy="70" r={donutRadius}
                          stroke="#ecd6c8" strokeOpacity="0.5" strokeWidth="18" fill="transparent" />
                        <circle cx="70" cy="70" r={donutRadius}
                          stroke="#1f2433" strokeWidth="18"
                          strokeDasharray={`${resolvedStrokeLength} ${donutCircumference}`}
                          strokeDashoffset="0" strokeLinecap="round" fill="transparent"
                          className="transition-all duration-700 ease-out" />
                        <circle cx="70" cy="70" r={donutRadius}
                          stroke="#ea7044" strokeWidth="18"
                          strokeDasharray={`${inProgressStrokeLength} ${donutCircumference}`}
                          strokeDashoffset={-resolvedStrokeLength} strokeLinecap="round" fill="transparent"
                          className="transition-all duration-700 ease-out" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)] tracking-tight">
                          {stats.resolvedPct}%
                        </span>
                        <span className="text-[11px] font-medium text-[var(--color-muted)]">Selesai</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--color-line)] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#1f2433] inline-block" />
                      <span className="font-medium text-[var(--color-ink)]">Selesai</span>
                    </div>
                    <span className="text-[var(--color-muted)]">{stats.resolved} laporan · {stats.resolvedPct}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs bg-[#ea7044] inline-block" />
                      <span className="font-medium text-[var(--color-ink)]">Dalam proses</span>
                    </div>
                    <span className="text-[var(--color-muted)]">{stats.inProgress} laporan · {stats.inProgressPct}%</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Row 3: Tren Laporan per Hari */}
            <section className="mt-5 reveal-on-scroll">
              <div className="rounded-xl border border-[var(--color-line)] bg-white p-5 shadow-2xs hover-lift">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                      <span>Tren Laporan per Hari</span>
                      <TrendingUp size={15} className="text-[var(--color-coral-deep)]" />
                    </h3>
                    <p className="text-xs text-[var(--color-muted)] mt-0.5">
                      Laporan yang masuk dibandingkan dengan laporan yang diselesaikan.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-[var(--color-muted)] self-start sm:self-auto">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-0.5 bg-[#1f2433] inline-block rounded-full" />
                      <span className="text-[var(--color-ink)]">Laporan masuk</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-0.5 border-b-2 border-dashed border-[#ea7044] inline-block" />
                      <span className="text-[var(--color-coral-deep)]">Laporan selesai</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 relative">
                  {trendPointsIncoming.length >= 2 ? (
                    <div className="w-full overflow-x-auto">
                      <div className="min-w-[640px]">
                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 sm:h-56 overflow-visible"
                          aria-label="Grafik garis tren laporan per hari">
                          <defs>
                            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ea7044" stopOpacity="0.28" />
                              <stop offset="100%" stopColor="#ea7044" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Y-axis gridlines */}
                          {yGridValues.map((val) => {
                            const y = paddingY + innerHeight - (val / maxY) * innerHeight;
                            return (
                              <g key={val}>
                                <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y}
                                  stroke="#ecd6c8" strokeWidth="1" strokeDasharray={val === 0 ? "none" : "2 3"} />
                                <text x={paddingX - 12} y={y + 3} textAnchor="end" fontSize="10" fill="#5c6070" fontWeight="500">
                                  {val}
                                </text>
                              </g>
                            );
                          })}

                          {/* Area & Lines */}
                          {incomingAreaPath && <path d={incomingAreaPath} fill="url(#trendGradient)" />}
                          {incomingPath && (
                            <path d={incomingPath} fill="none" stroke="#1f2433" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          )}
                          {resolvedPath && (
                            <path d={resolvedPath} fill="none" stroke="#ea7044" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" strokeLinejoin="round" />
                          )}

                          {/* Interactive Points */}
                          {trendPointsIncoming.map((pt, idx) => {
                            const isHovered = hoveredTrendIndex === idx;
                            const resPt = trendPointsResolved[idx];
                            return (
                              <g key={idx} className="cursor-pointer"
                                onMouseEnter={() => setHoveredTrendIndex(idx)}
                                onMouseLeave={() => setHoveredTrendIndex(null)}>
                                <rect x={pt.x - 14} y={paddingY} width="28" height={innerHeight} fill="transparent" />
                                {isHovered && (
                                  <line x1={pt.x} y1={paddingY} x2={pt.x} y2={paddingY + innerHeight}
                                    stroke="#1f2433" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                                )}
                                <circle cx={pt.x} cy={pt.y} r={isHovered ? 4.5 : 2.5}
                                  fill="#1f2433" stroke="#fff" strokeWidth="1.5" className="transition-all duration-150" />
                                {resPt && (
                                  <circle cx={resPt.x} cy={resPt.y} r={isHovered ? 4 : 2}
                                    fill="#ea7044" stroke="#fff" strokeWidth="1.5" className="transition-all duration-150" />
                                )}
                                <text x={pt.x} y={paddingY + innerHeight + 16} textAnchor="middle" fontSize="9.5"
                                  fill={isHovered ? "#1f2433" : "#5c6070"} fontWeight={isHovered ? "bold" : "500"}>
                                  {pt.date}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-xs text-[var(--color-muted)]">
                      Belum cukup data untuk menampilkan tren.
                    </div>
                  )}

                  {hoveredTrendIndex !== null && stats.trend[hoveredTrendIndex] && (
                    <div className="absolute top-2 right-4 bg-[#1f2433] text-white text-[11px] px-3 py-1.5 rounded-md shadow-md flex items-center gap-3 pointer-events-none">
                      <span className="font-semibold text-[var(--color-coral)]">{stats.trend[hoveredTrendIndex].date}</span>
                      <span>Masuk: <strong>{stats.trend[hoveredTrendIndex].incoming}</strong></span>
                      <span>Selesai: <strong>{stats.trend[hoveredTrendIndex].resolved}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Row 4: Wilayah & Kepuasan Warga */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5 reveal-on-scroll">
              {/* Laporan per Wilayah */}
              <div className="rounded-xl border border-[var(--color-line)] bg-white p-5 shadow-2xs hover-lift">
                <h3 className="text-sm font-bold text-[var(--color-ink)]">Laporan per Wilayah</h3>
                <p className="text-xs text-[var(--color-muted)] mt-0.5">Diurutkan dari yang terbanyak.</p>

                <div className="mt-5 space-y-3 relative">
                  {stats.regions.map((reg) => {
                    const widthPct = maxRegionCount > 0
                      ? Math.max(Math.round((reg.count / maxRegionCount) * 100), reg.count > 0 ? 5 : 0)
                      : 0;
                    return (
                      <div key={reg.name} className="flex items-center text-xs">
                        <span className="w-32 shrink-0 text-right pr-3 text-[11px] sm:text-xs text-[var(--color-muted)] truncate">
                          {reg.name}
                        </span>
                        <div className="flex-1 flex items-center">
                          <div className="w-full bg-transparent h-4 relative flex items-center">
                            {widthPct > 0 && (
                              <div
                                style={{ width: `${widthPct}%` }}
                                className="h-4 bg-[#1f2433] rounded-r-xs transition-all duration-500 ease-out"
                              />
                            )}
                            <span className="text-[11px] font-bold text-[var(--color-ink)] pl-2 shrink-0">
                              {reg.count}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* X-axis scale */}
                  <div className="pt-3 border-t border-[var(--color-line)] flex items-center text-[10px] text-[var(--color-muted)]">
                    <span className="w-32 shrink-0" />
                    <div className="flex-1 flex justify-between pr-4">
                      {[0, 1, 2, 3, 4].map((i) => {
                        const step = Math.ceil(maxRegionCount / 4);
                        const val = Math.min(i * step, maxRegionCount);
                        return <span key={i}>{val}</span>;
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Kepuasan Warga */}
              <div className="rounded-xl border border-[var(--color-line)] bg-white p-5 shadow-2xs hover-lift flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-ink)]">Kepuasan Warga</h3>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">Penilaian warga untuk laporan yang sudah selesai.</p>

                  {stats.rating.totalReviews > 0 ? (
                    <>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        <div className="sm:col-span-5 flex flex-col items-start justify-center">
                          <span className="text-4xl font-extrabold text-[var(--color-ink)] tracking-tight">
                            {stats.rating.average.toString().replace(".", ",")}
                          </span>
                          <div className="flex items-center gap-0.5 mt-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={14}
                                fill={s <= Math.floor(stats.rating.average) ? "currentColor" : "none"}
                                className={s <= Math.floor(stats.rating.average) ? "text-amber-500" : "text-[var(--color-line)]"} />
                            ))}
                          </div>
                          <span className="text-[11px] text-[var(--color-muted)] mt-1">
                            dari {stats.rating.totalReviews} penilaian
                          </span>
                        </div>

                        <div className="sm:col-span-7 space-y-1.5">
                          {stats.rating.breakdown.map((row) => {
                            const pct = stats.rating.totalReviews > 0
                              ? Math.round((row.count / stats.rating.totalReviews) * 100)
                              : 0;
                            return (
                              <div key={row.stars} className="flex items-center gap-2 text-[11px] text-[var(--color-muted)]">
                                <span className="w-14 shrink-0 text-right">{row.stars} bintang</span>
                                <div className="flex-1 h-2 rounded-full bg-[var(--color-cream)] overflow-hidden">
                                  <div style={{ width: `${pct}%` }} className="h-full bg-[#1f2433] rounded-full transition-all duration-500" />
                                </div>
                                <span className="w-5 text-right font-semibold text-[var(--color-ink)]">{row.count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ulasan Terbaru */}
                      {stats.reviews.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-[var(--color-line)]">
                          <h4 className="text-xs font-bold text-[var(--color-ink)] mb-3">Ulasan terbaru</h4>
                          <div className="space-y-3.5">
                            {stats.reviews.map((rev) => (
                              <div key={rev.id} className="border-b border-[var(--color-line)]/50 pb-3 last:border-b-0 last:pb-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star key={s} size={12}
                                        fill={s <= rev.rating ? "currentColor" : "none"}
                                        className={s <= rev.rating ? "text-amber-500" : "text-[var(--color-line)]"} />
                                    ))}
                                  </div>
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-[var(--color-line)] bg-[var(--color-cream)] text-[var(--color-ink)]">
                                    {rev.category}
                                  </span>
                                </div>
                                <p className="text-xs font-medium text-[var(--color-ink)] mt-1.5 leading-snug">
                                  &ldquo;{rev.comment}&rdquo;
                                </p>
                                <p className="text-[11px] text-[var(--color-muted)] mt-1 flex items-center gap-1">
                                  <MapPin size={10} className="text-[var(--color-coral-deep)] shrink-0" />
                                  <span className="truncate">{rev.location} · {rev.region} · {rev.date}</span>
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="mt-6 text-center py-6">
                      <Star size={24} className="mx-auto text-[var(--color-line)] mb-2" />
                      <p className="text-xs text-[var(--color-muted)]">
                        Belum ada ulasan dari warga. Penilaian akan muncul setelah laporan selesai ditangani.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Bottom CTA Banner */}
            <section className="mt-6">
              <div className="rounded-xl bg-[#182230] text-white p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-lg">
                <div className="max-w-xl">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Lihat di mana masalah terjadi
                  </h3>
                  <p className="text-xs sm:text-sm text-white/75 mt-1 leading-relaxed">
                    Buka Peta Laporan untuk melihat titik laporan lengkap dengan foto dan lokasi,
                    atau laporkan masalah di sekitar Anda.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0 w-full md:w-auto">
                  <Link
                    to="/peta"
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/20 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
                  >
                    <Map size={14} />
                    <span>Peta Laporan</span>
                    <ChevronRight size={13} />
                  </Link>
                  <Link
                    to="/laporan/baru"
                    className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[var(--color-coral)] hover:bg-[#f39770] text-[#1f2433] text-xs font-bold transition-colors shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Buat Laporan Baru</span>
                  </Link>
                </div>
              </div>
            </section>

            <p className="text-[11px] text-[var(--color-muted)] mt-4 mb-8 leading-relaxed">
              Angka dihitung dari laporan yang dibuat pada rentang terpilih (zona waktu WIB). Status
              &ldquo;Dalam proses&rdquo; mencakup semua tahap sebelum laporan dinyatakan selesai.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
