import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  LogOut,
  Users,
  UserCheck,
  FileCheck2,
  Search,
  RefreshCw,
  CheckCircle2,
  Shield,
  Database,
  ChevronDown,
  ChevronRight,
  Camera,
  X,
  LayoutDashboard,
  ClipboardList,
  ArrowRight,
  Eye,
  Clock,
  MapPin,
  Home,
  Download,
} from "lucide-react";
import { authService } from "../../services/authService";
import { reportService } from "../../services/reportService";

const REPORT_STATUSES = [
  "Laporan Diterima",
  "Laporan Diproses",
  "Petugas Dikirim ke Lokasi",
  "Laporan Selesai",
];

const KANBAN_COLUMNS = [
  { status: "Laporan Diterima", label: "Diterima", icon: "📥", color: "coral" },
  { status: "Laporan Diproses", label: "Diproses", icon: "⚙️", color: "apricot" },
  { status: "Petugas Dikirim ke Lokasi", label: "Petugas Dikirim", icon: "🚗", color: "periwinkle" },
  { status: "Laporan Selesai", label: "Selesai", icon: "✅", color: "emerald" },
];

const CATEGORIES = [
  "Semua",
  "Infrastruktur",
  "Fasilitas Umum",
  "Lingkungan",
  "Lainnya",
];

export default function AdminDashboard({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const user = currentUser || authService.getCurrentUser();

  // Tab Navigation
  const [activeTab, setActiveTab] = useState("ringkasan");

  // Data State
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [reportCategoryFilter, setReportCategoryFilter] = useState("Semua");
  const [reportSearchTerm, setReportSearchTerm] = useState("");

  // UI State
  const [updatingReportId, setUpdatingReportId] = useState(null);
  const [adminSelectedPhoto, setAdminSelectedPhoto] = useState(null);

  const handleLogout = () => {
    authService.logout();
    if (onLogout) onLogout();
    navigate("/login");
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await authService.getAllUsers();
      if (Array.isArray(data) && data.length > 0) {
        setUsersList(data);
      } else {
        setUsersList([
          {
            id: user?.id || "usr-adm-01",
            email: user?.email || "admin@pedulinegeri.id",
            full_name: user?.fullName || "Super Administrator",
            role: "admin",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setUsersList([
        {
          id: user?.id || "usr-adm-01",
          email: user?.email || "admin@pedulinegeri.id",
          full_name: user?.fullName || "Super Administrator",
          role: "admin",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    setReportsError("");
    try {
      const data = await reportService.getAllReports();
      setReports(data);
    } catch (error) {
      setReportsError(error.message);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleReportStatusChange = async (reportId, status) => {
    setUpdatingReportId(reportId);
    setReportsError("");
    try {
      const updatedReport = await reportService.updateStatus(reportId, status);
      setReports((currentReports) =>
        currentReports.map((report) =>
          report.id === reportId ? updatedReport : report,
        ),
      );
    } catch (error) {
      setReportsError(error.message);
    } finally {
      setUpdatingReportId(null);
    }
  };

  // Move report to next/prev status instantly (Kanban)
  const moveReportStatus = (reportId, direction) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;
    const currentIdx = REPORT_STATUSES.indexOf(report.status);
    if (currentIdx === -1) return;
    const targetIdx = currentIdx + direction;
    if (targetIdx < 0 || targetIdx >= REPORT_STATUSES.length) return;
    handleReportStatusChange(reportId, REPORT_STATUSES[targetIdx]);
  };

  useEffect(() => {
    let ignore = false;
    const initData = async () => {
      try {
        const [usersData, reportsData] = await Promise.allSettled([
          authService.getAllUsers(),
          reportService.getAllReports(),
        ]);
        if (ignore) return;
        if (
          usersData.status === "fulfilled" &&
          Array.isArray(usersData.value) &&
          usersData.value.length > 0
        ) {
          setUsersList(usersData.value);
        } else {
          setUsersList([
            {
              id: user?.id || "usr-adm-01",
              email: user?.email || "admin@pedulinegeri.id",
              full_name: user?.fullName || "Super Administrator",
              role: "admin",
              created_at: new Date().toISOString(),
            },
          ]);
        }

        if (reportsData.status === "fulfilled") {
          setReports(reportsData.value);
        } else {
          setReportsError(reportsData.reason?.message || "");
        }
      } finally {
        if (!ignore) {
          setLoadingUsers(false);
          setLoadingReports(false);
        }
      }
    };

    initData();
    return () => {
      ignore = true;
    };
  }, [user]);

  // Derived stats
  const totalUsers = usersList.length;
  const totalRegularUsers = usersList.filter((u) => u.role === "user").length;
  const totalAdmins = usersList.filter((u) => u.role === "admin").length;
  const totalReports = reports.length;
  const inProgressReports = reports.filter(
    (r) => r.status !== "Laporan Selesai" && r.status !== "Selesai",
  ).length;
  const completedReports = totalReports - inProgressReports;

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    if (roleFilter === "all") return matchesSearch;
    return matchesSearch && u.role === roleFilter;
  });

  // Filtered reports for table tab
  const filteredReports = reports.filter((r) => {
    const matchCat =
      reportCategoryFilter === "Semua" ||
      r.category === reportCategoryFilter;
    const matchSearch =
      !reportSearchTerm.trim() ||
      r.title.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
      r.location.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(reportSearchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  // CSV export
  const handleExportCSV = () => {
    const headers = ["ID", "Judul", "Kategori", "Lokasi", "Status", "Tanggal"];
    const rows = filteredReports.map((r) => [
      r.id,
      `"${r.title.replace(/"/g, '""')}"`,
      r.category,
      `"${r.location.replace(/"/g, '""')}"`,
      r.status,
      new Date(r.created_at).toLocaleDateString("id-ID"),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan_peduli_negeri_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const adminName =
    user?.fullName || user?.email?.split("@")[0] || "Administrator";

  const tabs = [
    { id: "ringkasan", label: "Ringkasan", icon: LayoutDashboard },
    { id: "laporan", label: "Laporan", icon: ClipboardList },
    { id: "pengguna", label: "Pengguna", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-(--color-surface) text-(--color-ink) font-sans">
      {/* ── Dark Navbar ────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-(--color-ink) text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo + Admin Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 text-white hover:text-(--color-coral) transition-colors">
              <span className="w-9 h-9 rounded-xl bg-(--color-coral) text-(--color-ink) flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-lg font-bold tracking-tight">
                Peduli<span className="text-(--color-coral)">Negeri</span>
              </span>
            </Link>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-(--color-coral) border border-white/20 font-bold uppercase tracking-wider">
              Admin Panel
            </span>
          </div>

          {/* Tab Navigation (Desktop) */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-(--color-coral) text-(--color-ink) shadow-md"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right side: admin info + links */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/10 transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              Beranda Publik
            </Link>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5">
              <span className="w-7 h-7 rounded-lg bg-(--color-coral)/20 text-(--color-coral) flex items-center justify-center font-bold text-xs">
                {adminName.charAt(0).toUpperCase()}
              </span>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-white leading-none">
                  {adminName}
                </p>
                <span className="text-[10px] text-(--color-coral) font-bold uppercase tracking-wider">
                  Admin
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer"
              title="Keluar dari sesi admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex items-center gap-1 px-4 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-(--color-coral) text-(--color-ink)"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Statistics Bar (always visible) ──────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-[var(--color-line)] shadow-xs">
            <p className="text-[11px] text-[var(--color-muted)] font-medium">Total Laporan</p>
            <p className="text-2xl font-extrabold text-[var(--color-ink)] mt-1">{totalReports}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[var(--color-line)] shadow-xs">
            <p className="text-[11px] text-[var(--color-muted)] font-medium">Dalam Proses</p>
            <p className="text-2xl font-extrabold text-[var(--color-coral-deep)] mt-1">{inProgressReports}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[var(--color-line)] shadow-xs">
            <p className="text-[11px] text-[var(--color-muted)] font-medium">Selesai</p>
            <p className="text-2xl font-extrabold text-[var(--color-periwinkle-deep)] mt-1">{completedReports}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-[var(--color-line)] shadow-xs">
            <p className="text-[11px] text-[var(--color-muted)] font-medium">Total Akun</p>
            <p className="text-2xl font-extrabold text-[var(--color-ink)] mt-1">{totalUsers}</p>
          </div>
        </div>

        {/* Sync Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-extrabold text-[var(--color-ink)] tracking-tight">
            {activeTab === "ringkasan" && "Papan Kanban Laporan"}
            {activeTab === "laporan" && "Tabel Laporan Masyarakat"}
            {activeTab === "pengguna" && "Manajemen Pengguna & Akses"}
          </h2>
          <button
            onClick={() => { fetchUsers(); fetchReports(); }}
            disabled={loadingUsers || loadingReports}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-ink)] hover:bg-black text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers || loadingReports ? "animate-spin" : ""}`} />
            Sinkronisasi
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* TAB 1: RINGKASAN (KANBAN BOARD)                          */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === "ringkasan" && (
          <>
            {reportsError && (
              <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
                {reportsError}
              </div>
            )}

            {loadingReports ? (
              <div className="py-20 text-center text-sm text-[var(--color-muted)]">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[var(--color-coral)]" />
                Memuat papan kanban...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {KANBAN_COLUMNS.map((col) => {
                  const colReports = reports.filter(
                    (r) => r.status === col.status,
                  );
                  return (
                    <div
                      key={col.status}
                      className="rounded-2xl border border-[var(--color-line)] bg-white overflow-hidden shadow-xs"
                    >
                      {/* Column Header */}
                      <div className="px-4 py-3 bg-[var(--color-cream)] border-b border-[var(--color-line)] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{col.icon}</span>
                          <h3 className="text-xs font-bold text-[var(--color-ink)]">
                            {col.label}
                          </h3>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-line)]">
                          {colReports.length}
                        </span>
                      </div>

                      {/* Column Cards */}
                      <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                        {colReports.length === 0 ? (
                          <div className="p-4 text-center text-[11px] text-[var(--color-muted)]">
                            Tidak ada laporan
                          </div>
                        ) : (
                          colReports.map((report) => {
                            const statusIdx = REPORT_STATUSES.indexOf(report.status);
                            const canMoveRight = statusIdx < REPORT_STATUSES.length - 1;
                            const canMoveLeft = statusIdx > 0;

                            return (
                              <div
                                key={report.id}
                                className="p-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] hover:border-[var(--color-coral)]/40 transition-colors"
                              >
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--color-cream)] text-[var(--color-coral-deep)] border border-[var(--color-line)]">
                                    {report.category}
                                  </span>
                                  <span className="text-[10px] text-[var(--color-muted)]">
                                    {new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                                  </span>
                                </div>

                                <h4 className="text-xs font-bold text-[var(--color-ink)] line-clamp-2 mb-1">
                                  {report.title}
                                </h4>

                                <p className="text-[11px] text-[var(--color-muted)] flex items-center gap-1 mb-2">
                                  <MapPin size={10} /> {report.location}
                                </p>

                                {/* Photo button */}
                                {report.image_url && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAdminSelectedPhoto({
                                        url: report.image_url,
                                        title: report.title,
                                        location: report.location,
                                      })
                                    }
                                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[var(--color-coral-deep)] hover:text-[var(--color-ink)] mb-2 cursor-pointer"
                                  >
                                    <Camera className="w-3 h-3" />
                                    Lihat Bukti Foto
                                  </button>
                                )}

                                {/* Kanban move controls */}
                                <div className="flex items-center gap-1.5 pt-2 border-t border-[var(--color-line)]">
                                  {canMoveLeft && (
                                    <button
                                      onClick={() => moveReportStatus(report.id, -1)}
                                      disabled={updatingReportId === report.id}
                                      className="flex-1 py-1 rounded text-[10px] font-semibold bg-[var(--color-cream)] hover:bg-[var(--color-apricot)] text-[var(--color-ink)] border border-[var(--color-line)] transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                      ← Mundur
                                    </button>
                                  )}
                                  {canMoveRight && (
                                    <button
                                      onClick={() => moveReportStatus(report.id, 1)}
                                      disabled={updatingReportId === report.id}
                                      className="flex-1 py-1 rounded text-[10px] font-semibold bg-[var(--color-coral)] hover:bg-[#f39770] text-[var(--color-ink)] transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                      Majukan →
                                    </button>
                                  )}
                                  {updatingReportId === report.id && (
                                    <RefreshCw className="w-3 h-3 animate-spin text-[var(--color-coral-deep)]" />
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Preview Pengguna Terbaru di bawah Kanban */}
            <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--color-coral)]" />
                  Pengguna Terdaftar
                </h3>
                <button
                  onClick={() => setActiveTab("pengguna")}
                  className="text-[11px] font-semibold text-[var(--color-coral-deep)] hover:underline cursor-pointer flex items-center gap-1"
                >
                  Lihat Semua <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {usersList.slice(0, 4).map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-line)]">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        u.role === "admin"
                          ? "bg-[var(--color-periwinkle)]/15 text-[var(--color-periwinkle-deep)] border border-[var(--color-periwinkle)]/30"
                          : "bg-[var(--color-coral)]/15 text-[var(--color-coral-deep)] border border-[var(--color-coral)]/30"
                      }`}>
                        {(u.full_name || u.email)[0].toUpperCase()}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-ink)]">{u.full_name || "Tanpa Nama"}</p>
                        <p className="text-[10px] text-[var(--color-muted)]">{u.email}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      u.role === "admin"
                        ? "bg-[var(--color-periwinkle)]/15 text-[var(--color-periwinkle-deep)]"
                        : "bg-[var(--color-coral)]/15 text-[var(--color-coral-deep)]"
                    }`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* TAB 2: LAPORAN TABLE                                      */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === "laporan" && (
          <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5 sm:p-6 shadow-xs">
            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[var(--color-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari judul, lokasi, ID..."
                    value={reportSearchTerm}
                    onChange={(e) => setReportSearchTerm(e.target.value)}
                    className="pl-8 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl text-xs text-[var(--color-ink)] placeholder-[var(--color-muted)] focus:outline-hidden focus:border-[var(--color-coral-deep)] transition-all w-52 sm:w-64"
                  />
                </div>

                {/* Category filter */}
                <div className="flex items-center gap-1 bg-[var(--color-surface)] border border-[var(--color-line)] p-0.5 rounded-xl">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setReportCategoryFilter(cat)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all cursor-pointer ${
                        reportCategoryFilter === cat
                          ? "bg-[var(--color-coral)] text-[var(--color-ink)] shadow-xs"
                          : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* CSV Export */}
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--color-ink)] text-white hover:bg-black transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Ekspor CSV
              </button>
            </div>

            {/* Reports Error */}
            {reportsError && (
              <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
                {reportsError}
              </div>
            )}

            {/* Reports Table */}
            {loadingReports ? (
              <p className="py-10 text-center text-sm text-[var(--color-muted)]">Memuat laporan...</p>
            ) : filteredReports.length === 0 ? (
              <div className="py-10 text-center rounded-xl bg-[var(--color-surface)]">
                <FileCheck2 className="mx-auto h-8 w-8 text-[var(--color-coral)]" />
                <p className="mt-3 text-sm font-semibold text-[var(--color-ink)]">Belum ada laporan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--color-surface)] text-[var(--color-muted)] uppercase font-semibold border-b border-[var(--color-line)] text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Judul & Lokasi</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-line)]">
                    {filteredReports.map((report) => {
                      const isResolved = report.status === "Laporan Selesai" || report.status === "Selesai";
                      return (
                        <tr key={report.id} className="hover:bg-[var(--color-surface)] transition-colors">
                          <td className="py-3 px-4 font-mono text-[var(--color-muted)]">
                            #{report.id.slice(0, 6)}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-[var(--color-ink)] line-clamp-1">{report.title}</p>
                            <p className="text-[10px] text-[var(--color-muted)] flex items-center gap-1 mt-0.5">
                              <MapPin size={10} /> {report.location}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--color-cream)] text-[var(--color-coral-deep)] border border-[var(--color-line)]">
                              {report.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[var(--color-muted)]">
                            {new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                              isResolved
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-[var(--color-apricot)] text-[var(--color-ink)]"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isResolved ? "bg-emerald-500" : "bg-[var(--color-coral)] animate-pn-dot"}`} />
                              {report.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {report.image_url && (
                                <button
                                  onClick={() => setAdminSelectedPhoto({ url: report.image_url, title: report.title, location: report.location })}
                                  className="text-[var(--color-coral-deep)] hover:text-[var(--color-ink)] font-medium cursor-pointer flex items-center gap-1"
                                >
                                  <Camera className="w-3 h-3" /> Foto
                                </button>
                              )}
                              <div className="relative">
                                <select
                                  aria-label={`Ubah status: ${report.title}`}
                                  value={report.status}
                                  disabled={updatingReportId === report.id}
                                  onChange={(e) => handleReportStatusChange(report.id, e.target.value)}
                                  className="appearance-none pl-2 pr-6 py-1 text-[10px] font-semibold rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] focus:outline-hidden focus:border-[var(--color-coral-deep)] disabled:opacity-50 cursor-pointer"
                                >
                                  {REPORT_STATUSES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                                {updatingReportId === report.id ? (
                                  <RefreshCw className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-[var(--color-coral-deep)]" />
                                ) : (
                                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-muted)] pointer-events-none" />
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 text-[11px] text-[var(--color-muted)] text-right">
              Menampilkan {filteredReports.length} dari {reports.length} laporan
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* TAB 3: PENGGUNA                                           */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === "pengguna" && (
          <div className="space-y-5">
            {/* User Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-[var(--color-line)] shadow-xs">
                <p className="text-[11px] text-[var(--color-muted)] font-medium">Total Akun</p>
                <p className="text-2xl font-extrabold text-[var(--color-ink)] mt-1">{totalUsers}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[var(--color-line)] shadow-xs">
                <p className="text-[11px] text-[var(--color-muted)] font-medium">Pengguna Biasa</p>
                <p className="text-2xl font-extrabold text-[var(--color-coral-deep)] mt-1">{totalRegularUsers}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[var(--color-line)] shadow-xs">
                <p className="text-[11px] text-[var(--color-muted)] font-medium">Administrator</p>
                <p className="text-2xl font-extrabold text-[var(--color-periwinkle-deep)] mt-1">{totalAdmins}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[var(--color-line)] shadow-xs flex flex-col justify-center">
                <p className="text-[11px] text-[var(--color-muted)] font-medium">Sumber Data</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-periwinkle)] animate-pulse" />
                  <p className="text-xs font-bold text-[var(--color-ink)]">Supabase Connected</p>
                </div>
              </div>
            </div>

            {/* User Table */}
            <div className="rounded-2xl border border-[var(--color-line)] bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <h3 className="text-sm font-bold text-[var(--color-ink)] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--color-coral)]" />
                  Daftar Pengguna & Hak Akses
                </h3>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[var(--color-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari nama atau email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-line)] rounded-xl text-xs text-[var(--color-ink)] placeholder-[var(--color-muted)] focus:outline-hidden focus:border-[var(--color-coral-deep)] transition-all w-52 sm:w-64"
                    />
                  </div>

                  <div className="flex items-center gap-0.5 bg-[var(--color-surface)] border border-[var(--color-line)] p-0.5 rounded-xl">
                    {[
                      { key: "all", label: "Semua" },
                      { key: "user", label: "User" },
                      { key: "admin", label: "Admin" },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setRoleFilter(f.key)}
                        className={`px-3 py-1 text-[11px] rounded-lg font-medium transition-all cursor-pointer ${
                          roleFilter === f.key
                            ? "bg-[var(--color-coral)] text-[var(--color-ink)] shadow-xs"
                            : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loadingUsers ? (
                <p className="py-10 text-center text-sm text-[var(--color-muted)]">Memuat data pengguna...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--color-surface)] text-[var(--color-muted)] uppercase font-semibold border-b border-[var(--color-line)] text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Nama & Email</th>
                        <th className="py-3 px-4">Role Akses</th>
                        <th className="py-3 px-4">Tgl Terdaftar</th>
                        <th className="py-3 px-4">Status Akun</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-line)]">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((item) => (
                          <tr key={item.id} className="hover:bg-[var(--color-surface)] transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                  item.role === "admin"
                                    ? "bg-[var(--color-periwinkle)]/15 text-[var(--color-periwinkle-deep)] border border-[var(--color-periwinkle)]/30"
                                    : "bg-[var(--color-coral)]/15 text-[var(--color-coral-deep)] border border-[var(--color-coral)]/30"
                                }`}>
                                  {(item.full_name || item.email)[0].toUpperCase()}
                                </span>
                                <div>
                                  <p className="font-semibold text-[var(--color-ink)]">{item.full_name || "Tanpa Nama"}</p>
                                  <p className="text-[var(--color-muted)] text-[11px] font-mono">{item.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                item.role === "admin"
                                  ? "bg-[var(--color-periwinkle)]/10 text-[var(--color-periwinkle-deep)] border-[var(--color-periwinkle)]/30"
                                  : "bg-[var(--color-coral)]/10 text-[var(--color-coral-deep)] border-[var(--color-coral)]/30"
                              }`}>
                                {item.role === "admin" ? <ShieldCheck className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                                {item.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-[var(--color-muted)]">
                              {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 text-[var(--color-periwinkle-deep)] font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Terdaftar</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button className="text-[var(--color-coral-deep)] hover:text-[var(--color-ink)] font-medium hover:underline cursor-pointer text-xs">
                                Detail
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-[var(--color-muted)]">
                            Tidak ada data pengguna yang sesuai dengan filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Modal Preview Bukti Foto ──────────────────────────── */}
      {adminSelectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-ink)]/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-5 border border-[var(--color-line)] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-line)]">
              <h3 className="text-sm font-bold truncate pr-4 text-[var(--color-ink)]">
                Bukti Foto: {adminSelectedPhoto.title}
              </h3>
              <button
                type="button"
                onClick={() => setAdminSelectedPhoto(null)}
                className="rounded-full p-1.5 text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-cream)] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="my-4 overflow-hidden rounded-2xl bg-[var(--color-cream)] flex items-center justify-center max-h-[60vh]">
              <img
                src={adminSelectedPhoto.url}
                alt={adminSelectedPhoto.title}
                className="max-h-[58vh] w-auto object-contain"
              />
            </div>
            <p className="text-xs text-[var(--color-muted)]">
              Lokasi: {adminSelectedPhoto.location}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
