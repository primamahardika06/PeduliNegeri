import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import {
  HeartHandshake,
  MapPin,
  Calendar,
  Layers,
  Search,
  Filter,
  PlusCircle,
  ArrowRight,
  Menu,
  X,
  ExternalLink,
  Info,
} from "lucide-react";
import { reportService } from "../../services/reportService";
import { authService } from "../../services/authService";
import BrandLogo from "../../components/common/BrandLogo";

const REGIONS = [
  "Semua Wilayah",
  "Sumatra",
  "Jawa",
  "Kalimantan",
  "Sulawesi",
  "Bali & Nusa Tenggara",
  "Maluku",
  "Papua",
];

const CATEGORIES = [
  "Semua",
  "Infrastruktur",
  "Lingkungan",
  "Fasilitas Umum",
  "Lainnya",
];

export default function PetaLaporan() {
  const [currentUser] = useState(() => authService.getCurrentUser());
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [selectedRegion, setSelectedRegion] = useState("Semua Wilayah");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeReport, setActiveReport] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  // Fetch public reports
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const data = await reportService.getPublicReports();
        if (isMounted) {
          setReports(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Gagal memuat titik peta laporan.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter reports
  const filteredReports = reports.filter((rep) => {
    const matchCat =
      selectedCategory === "Semua" || rep.category === selectedCategory;
    const isCompleted =
      rep.status === "Laporan Selesai" || rep.status === "Selesai";
    const matchStatus =
      selectedStatus === "Semua" ||
      (selectedStatus === "Selesai" && isCompleted) ||
      (selectedStatus === "Dalam proses" && !isCompleted);
    const matchRegion =
      selectedRegion === "Semua Wilayah" || rep.region === selectedRegion;
    const matchSearch =
      !searchTerm.trim() ||
      rep.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.location.toLowerCase().includes(searchTerm.toLowerCase());

    return matchCat && matchStatus && matchRegion && matchSearch;
  });

  // Calculate category counts
  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    if (cat === "Semua") {
      acc[cat] = reports.length;
    } else {
      acc[cat] = reports.filter((r) => r.category === cat).length;
    }
    return acc;
  }, {});

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on Indonesia archipelago
      const map = L.map(mapContainerRef.current, {
        center: [-2.5489, 118.0149],
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false,
      });

      // OpenStreetMap standard tile layer (bebas API key, gratis, dan stabil)
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          subdomains: "abc",
          maxZoom: 19,
        },
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add markers for filtered reports
    filteredReports.forEach((rep) => {
      if (typeof rep.latitude !== "number" || typeof rep.longitude !== "number")
        return;

      const isResolved =
        rep.status === "Laporan Selesai" || rep.status === "Selesai";

      // Custom HTML Pin Marker
      const pinColor = isResolved ? "#1f2433" : "#f7a581";
      const iconHtml = `
        <div style="
          position: relative;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="
            width: 26px;
            height: 26px;
            border-radius: 50% 50% 50% 0;
            background: ${pinColor};
            transform: rotate(-45deg);
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            border: 2px solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: #ffffff;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-map-pin",
        html: iconHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      });

      const marker = L.marker([rep.latitude, rep.longitude], {
        icon: customIcon,
      }).addTo(map);

      // Popup Content matching the design
      const popupHtml = `
        <div style="width: 240px; font-family: Inter, sans-serif; padding: 2px;">
          ${
            rep.imageUrl
              ? `<div style="width: 100%; height: 110px; border-radius: 6px; overflow: hidden; margin-bottom: 8px; background: #fdebe0;">
                  <img src="${rep.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Foto Bukti" />
                </div>`
              : ""
          }
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 4px; background: #fdebe0; color: #a14a30;">
              ${rep.category}
            </span>
            <span style="font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 4px; background: ${
              isResolved ? "#e6f4ea" : "#fcd5a8"
            }; color: ${isResolved ? "#137333" : "#1f2433"};">
              ${isResolved ? "Selesai" : "Dalam proses"}
            </span>
          </div>
          <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #1f2433; line-height: 1.3;">
            ${rep.title}
          </h4>
          <p style="margin: 0 0 8px; font-size: 11px; color: #5c6070; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${rep.description}
          </p>
          <div style="border-top: 1px solid #ecd6c8; padding-top: 6px; font-size: 10px; color: #5c6070; display: flex; justify-content: space-between;">
            <span>📍 ${rep.location}</span>
            <span>ID: #${rep.id.slice(0, 6)}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on("click", () => {
        setActiveReport(rep);
      });

      markersRef.current[rep.id] = marker;
    });

    // If activeReport changed, fly to and open popup
    if (
      activeReport &&
      typeof activeReport.latitude === "number" &&
      typeof activeReport.longitude === "number"
    ) {
      map.flyTo([activeReport.latitude, activeReport.longitude], 13, {
        duration: 1.2,
      });
      const marker = markersRef.current[activeReport.id];
      if (marker) {
        marker.openPopup();
      }
    } else {
      const validPoints = filteredReports
        .filter((r) => typeof r.latitude === "number" && typeof r.longitude === "number")
        .map((r) => [r.latitude, r.longitude]);

      if (validPoints.length > 0) {
        try {
          const bounds = L.latLngBounds(validPoints);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
        } catch {
          // fallback
        }
      }
    }
  }, [filteredReports, activeReport]);

  const handleSelectReport = (report) => {
    setActiveReport(report);
    if (mapInstanceRef.current && report.latitude && report.longitude) {
      mapInstanceRef.current.flyTo([report.latitude, report.longitude], 12, {
        duration: 1,
      });
      const m = markersRef.current[report.id];
      if (m) m.openPopup();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)] font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-[#fdebe0]/95 backdrop-blur-md border-b border-[#ecd6c8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/">
            <BrandLogo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--color-muted)] font-medium">
            <Link to="/" className="hover:text-[var(--color-ink)] transition-colors">
              Beranda
            </Link>
            <Link
              to="/laporan"
              className="hover:text-[var(--color-ink)] transition-colors"
            >
              Laporan
            </Link>
            <Link
              to="/peta"
              className="text-[var(--color-coral-deep)] font-semibold border-b-2 border-[var(--color-coral-deep)] pb-0.5"
            >
              Peta
            </Link>
            <a
              href="/#tentang"
              className="hover:text-[var(--color-ink)] transition-colors"
            >
              Tentang Kami
            </a>
            <a
              href="/#cara-melapor"
              className="hover:text-[var(--color-ink)] transition-colors"
            >
              Bantuan
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  to={currentUser.role === "admin" ? "/admin" : "/reportPage"}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-[var(--color-cream)] border border-[var(--color-line)] hover:bg-[var(--color-apricot)] transition-colors"
                >
                  Dashboard Saya
                </Link>
                <Link
                  to="/laporan/baru"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-[var(--color-coral)] hover:bg-[#f39770] text-[var(--color-ink)] transition-colors"
                >
                  <PlusCircle size={14} /> Buat Laporan
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded border border-[var(--color-ink)] hover:bg-[var(--color-cream)] transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded bg-[var(--color-coral)] hover:bg-[#f39770] text-[var(--color-ink)] transition-colors"
                >
                  Daftar
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded text-[var(--color-ink)] hover:bg-[var(--color-cream)]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 py-3 bg-[var(--color-cream)] border-b border-[var(--color-line)] flex flex-col gap-2 text-sm">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              Beranda
            </Link>
            <Link to="/laporan" onClick={() => setMobileMenuOpen(false)}>
              Laporan
            </Link>
            <Link
              to="/peta"
              className="text-[var(--color-coral-deep)] font-semibold"
              onClick={() => setMobileMenuOpen(false)}
            >
              Peta Laporan
            </Link>
            <a href="/#tentang" onClick={() => setMobileMenuOpen(false)}>
              Tentang Kami
            </a>
            <a href="/#cara-melapor" onClick={() => setMobileMenuOpen(false)}>
              Bantuan
            </a>
          </div>
        )}
      </header>

      {/* Title & Filter Header */}
      <section className="bg-[var(--color-cream)] border-b border-[var(--color-line)] px-4 sm:px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Peta Laporan
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] mt-0.5">
              Pantau sebaran laporan masyarakat di seluruh wilayah Indonesia
              secara real-time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/laporan/baru"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded bg-[var(--color-ink)] hover:bg-black text-white transition-colors"
            >
              <PlusCircle size={15} /> Buat Laporan Baru
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded border border-[var(--color-line)] bg-white"
            >
              <Layers size={14} /> {sidebarOpen ? "Tutup List" : "Buka List"}
            </button>
          </div>
        </div>

        {/* Category & Status Filter Bar */}
        <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-[var(--color-line)]/60 flex flex-wrap items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[var(--color-coral-deep)] text-white shadow-xs"
                      : "bg-white/80 hover:bg-white text-[var(--color-muted)] border border-[var(--color-line)]"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-[var(--color-cream)] text-[var(--color-muted)]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-muted)] font-medium">
              Status:
            </span>
            <div className="inline-flex rounded-md border border-[var(--color-line)] bg-white p-0.5 text-xs">
              {["Semua", "Dalam proses", "Selesai"].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    selectedStatus === st
                      ? "bg-[var(--color-coral)] text-[var(--color-ink)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Region Filter Bar */}
        <div className="max-w-7xl mx-auto mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-xs text-[var(--color-muted)] font-medium mr-1">
            Wilayah:
          </span>
          {REGIONS.map((reg) => {
            const isSelected = selectedRegion === reg;
            return (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  isSelected
                    ? "bg-[var(--color-ink)] text-white font-semibold"
                    : "text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-white/60"
                }`}
              >
                {reg}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content: Map + Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[550px]">
        {/* Map Container */}
        <div
          className={`${
            sidebarOpen ? "lg:col-span-8" : "lg:col-span-12"
          } rounded-xl border border-[var(--color-line)] overflow-hidden shadow-xs relative bg-[var(--color-cream)] flex flex-col h-[520px] lg:h-[620px]`}
        >
          {loading && (
            <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-xs flex items-center justify-center gap-2 text-sm font-semibold">
              <span className="animate-spin inline-block w-5 h-5 border-2 border-[var(--color-coral-deep)] border-t-transparent rounded-full" />
              <span>Memuat peta laporan...</span>
            </div>
          )}

          {error && (
            <div className="absolute top-4 left-4 right-4 z-20 p-3 bg-red-100 border border-red-300 rounded text-red-800 text-xs">
              {error}
            </div>
          )}

          {/* Leaflet DOM Node */}
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-[var(--color-line)] shadow-md text-xs flex flex-col gap-1.5">
            <span className="font-bold text-[11px] text-[var(--color-ink)] mb-0.5">
              Legenda Peta
            </span>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#f7a581] border border-white inline-block shadow-xs" />
              <span>Dalam Proses</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#1f2433] border border-white inline-block shadow-xs" />
              <span>Laporan Selesai</span>
            </div>
          </div>
        </div>

        {/* Sidebar: Laporan Terbaru */}
        {sidebarOpen && (
          <aside className="lg:col-span-4 flex flex-col h-[520px] lg:h-[620px] rounded-xl border border-[var(--color-line)] bg-white overflow-hidden shadow-xs">
            <div className="p-3.5 border-b border-[var(--color-line)] bg-[var(--color-surface)] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Laporan Terbaru</h3>
                <p className="text-[11px] text-[var(--color-muted)]">
                  Menampilkan {filteredReports.length} laporan
                </p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari lokasi/judul..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-36 sm:w-44 pl-7 pr-2 py-1 text-xs rounded border border-[var(--color-line)] bg-white focus:outline-hidden focus:border-[var(--color-coral-deep)]"
                />
                <Search
                  size={12}
                  className="absolute left-2 top-2 text-[var(--color-muted)]"
                />
              </div>
            </div>

            {/* List Container */}
            <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-line)]/70 p-1">
              {filteredReports.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--color-muted)] flex flex-col items-center justify-center gap-2 h-full">
                  <Info size={24} className="text-[var(--color-coral-deep)]" />
                  <p className="font-semibold text-[var(--color-ink)]">
                    Tidak ada laporan ditemukan
                  </p>
                  <p>Coba sesuaikan filter wilayah atau kategori Anda.</p>
                </div>
              ) : (
                filteredReports.map((item) => {
                  const isResolved =
                    item.status === "Laporan Selesai" ||
                    item.status === "Selesai";
                  const isSelected = activeReport?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectReport(item)}
                      className={`p-3.5 transition-colors cursor-pointer rounded-lg m-1 ${
                        isSelected
                          ? "bg-[var(--color-cream)] border-l-4 border-[var(--color-coral-deep)] shadow-xs"
                          : "hover:bg-[var(--color-surface)]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-coral-deep)] border border-[var(--color-line)]">
                          {item.category}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            isResolved
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-[var(--color-apricot)] text-[var(--color-ink)]"
                          }`}
                        >
                          {isResolved ? "Selesai" : "Dalam proses"}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold line-clamp-1 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[var(--color-muted)] line-clamp-2 mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-[var(--color-muted)]">
                        <span className="flex items-center gap-1 line-clamp-1">
                          <MapPin size={11} /> {item.location}
                        </span>
                        <span>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })
                            : ""}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

