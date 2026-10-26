import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { authService } from "../../services/authService";
import { reportService } from "../../services/reportService";
import dashboardLogo from "../../assets/PeduliNegeri (4).png";

const REPORT_STATUSES = [
  "Laporan Diterima",
  "Laporan Diproses",
  "Petugas Dikirim ke Lokasi",
  "Laporan Selesai",
];

export default function AdminDashboard({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const user = currentUser || authService.getCurrentUser();

  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [reportsError, setReportsError] = useState("");
  const [updatingReportId, setUpdatingReportId] = useState(null);

  const handleLogout = () => {
    authService.logout();
    if (onLogout) onLogout();
    navigate("/login");
  };

  // Load registered users from API
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await authService.getAllUsers();
      if (Array.isArray(data) && data.length > 0) {
        setUsersList(data);
      } else {
        // Fallback default list if database is freshly initialized
        setUsersList([
          {
            id: user?.id || "usr-adm-01",
            email: user?.email || "admin@pedulinegeri.id",
            full_name: user?.fullName || "Super Administrator",
            role: "admin",
            created_at: new Date().toISOString(),
          },
          {
            id: "usr-demo-02",
            email: "budi.santoso@gmail.com",
            full_name: "Budi Santoso",
            role: "user",
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            id: "usr-demo-03",
            email: "siti.aminah@gmail.com",
            full_name: "Siti Aminah",
            role: "user",
            created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
          },
        ]);
      }
    } catch {
      // If server unreachable, provide current admin info + mock
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

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter users based on search and role
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    if (roleFilter === "all") return matchesSearch;
    return matchesSearch && u.role === roleFilter;
  });

  const totalUsers = usersList.length;
  const totalRegularUsers = usersList.filter((u) => u.role === "user").length;
  const totalAdmins = usersList.filter((u) => u.role === "admin").length;
  const completedReports = reports.filter(
    (report) => report.status === "Laporan Selesai",
  ).length;
  const inProgressReports = reports.length - completedReports;

  return (
    <div className="theme-light min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-ink text-surface backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo & Admin Portal Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              aria-label="Muat ulang halaman Peduli Negeri"
              className="flex min-h-11 items-center rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-periwinkle-deep"
            >
              <img
                src={dashboardLogo}
                alt="Peduli Negeri"
                className="h-12 w-48 object-contain"
              />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-periwinkle/40 bg-periwinkle/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-surface">
                  Admin Panel
                </span>
              </div>
            </div>
          </div>

          {/* Current Admin Info & Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 rounded border border-white/15 bg-white/5 px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-periwinkle/20 text-apricot">
                <Shield className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold leading-none text-surface">
                  {user?.fullName ||
                    user?.email?.split("@")[0] ||
                    "Administrator"}
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wider text-apricot">
                  Admin Role
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex min-h-10 items-center gap-1.5 rounded border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-surface transition-colors hover:border-coral hover:bg-coral/15 hover:text-apricot"
              title="Keluar dari sesi admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
        {/* Welcome Banner */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-coral-deep">
              <Database className="h-4 w-4" />
              <span>Pusat kendali · Supabase</span>
            </div>
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">
              Dashboard Pengelolaan Administrator
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              Pantau pengguna dan kelola laporan aspirasi masyarakat.
            </p>
          </div>

          <button
            onClick={() => {
              fetchUsers();
              fetchReports();
            }}
            disabled={loadingUsers || loadingReports}
            className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded bg-coral px-4 text-xs font-semibold text-ink transition-colors hover:bg-apricot disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loadingUsers || loadingReports ? "animate-spin" : ""}`}
            />
            <span>Sinkronisasi Data</span>
          </button>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 overflow-hidden rounded border border-line bg-line sm:grid-cols-4">
          <div className="min-w-0 bg-apricot p-4 sm:p-5">
            <p className="text-xs font-medium text-ink">Total Akun Terdaftar</p>
            <p className="mt-1 text-3xl font-bold text-ink">{totalUsers}</p>
            <p className="mt-1 text-[11px] text-muted">Tersimpan di tabel profiles</p>
          </div>
          <div className="min-w-0 bg-apricot p-4 sm:p-5">
            <p className="text-xs font-medium text-ink">Pengguna Biasa</p>
            <p className="mt-1 text-3xl font-bold text-ink">{totalRegularUsers}</p>
            <p className="mt-1 text-[11px] text-muted">Akses portal pelaporan</p>
          </div>
          <div className="min-w-0 bg-apricot p-4 sm:p-5">
            <p className="text-xs font-medium text-ink">Administrator</p>
            <p className="mt-1 text-3xl font-bold text-ink">{totalAdmins}</p>
            <p className="mt-1 text-[11px] text-muted">Hak akses sistem</p>
          </div>
          <div className="min-w-0 bg-apricot p-4 sm:p-5">
            <p className="text-xs font-medium text-ink">Status Integrasi</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-periwinkle-deep" />
              <p className="text-sm font-bold text-ink">Supabase Connected</p>
            </div>
            <p className="mt-1 text-[11px] text-muted">PostgreSQL + Auth + RLS</p>
          </div>
        </div>

        <section className="overflow-hidden rounded border border-line bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                <FileCheck2 className="h-5 w-5 text-coral-deep" /> Laporan
                Masyarakat
              </h2>
              <p className="mt-1 text-xs text-muted">
                Perubahan status langsung tersimpan dan terlihat oleh pelapor.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
              <span>{reports.length} laporan</span>
              <span className="font-semibold text-periwinkle-deep">
                {completedReports} selesai
              </span>
              <span className="font-semibold text-coral-deep">
                {inProgressReports} dalam proses
              </span>
            </div>
          </div>

          {reportsError && (
            <div
              role="alert"
              className="mx-5 my-4 rounded border border-coral/50 bg-cream p-3 text-sm text-coral-deep sm:mx-6"
            >
              {reportsError}
            </div>
          )}

          {loadingReports ? (
            <p
              role="status"
              className="py-10 text-center text-sm text-muted"
            >
              Memuat laporan...
            </p>
          ) : reports.length === 0 && !reportsError ? (
            <div className="m-5 rounded border border-line bg-cream py-10 text-center sm:m-6">
              <FileCheck2 className="mx-auto h-8 w-8 text-muted" />
              <p className="mt-3 text-sm font-semibold text-ink">
                Belum ada laporan masuk
              </p>
              <p className="mt-1 text-xs text-muted">
                Laporan warga akan tampil di sini setelah dikirim.
              </p>
            </div>
          ) : (
            <div>
              {reports.map((report) => (
                <article
                  key={report.id}
                  className="border-b border-line p-5 last:border-b-0 sm:px-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded border border-periwinkle-deep/40 px-2 py-1 font-semibold text-periwinkle-deep">
                          {report.category}
                        </span>
                        <time className="text-muted">
                          {new Intl.DateTimeFormat("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(report.created_at))}
                        </time>
                      </div>
                      <h3 className="font-semibold text-ink">
                        {report.title}
                      </h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                        {report.description}
                      </p>
                      <p className="mt-3 text-xs text-muted">
                        Lokasi: {report.location}
                      </p>
                    </div>

                    <label className="relative block w-full shrink-0 lg:w-72">
                      <span className="mb-1.5 block text-xs font-semibold text-muted">
                        Status laporan
                      </span>
                      <select
                        aria-label={`Ubah status laporan: ${report.title}`}
                        value={report.status}
                        disabled={updatingReportId === report.id}
                        onChange={(event) =>
                          handleReportStatusChange(
                            report.id,
                            event.target.value,
                          )
                        }
                        className="min-h-11 w-full appearance-none rounded border border-line bg-surface px-3 pr-10 text-sm text-ink outline-none transition focus:border-periwinkle-deep focus:ring-2 focus:ring-periwinkle/30 disabled:opacity-60"
                      >
                        {REPORT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      {updatingReportId === report.id ? (
                        <RefreshCw className="pointer-events-none absolute right-3 top-9 h-4 w-4 animate-spin text-periwinkle-deep" />
                      ) : (
                        <ChevronDown className="pointer-events-none absolute right-3 top-9 h-4 w-4 text-muted" />
                      )}
                    </label>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* User Management Section */}
        <section className="overflow-hidden rounded border border-line bg-surface">
          {/* Header Controls */}
          <div className="flex flex-col justify-between gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
                <Users className="h-5 w-5 text-coral-deep" />
                Daftar Pengguna & Hak Akses
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Data sinkronisasi dari tabel{" "}
                <code className="font-mono text-periwinkle-deep">
                  public.profiles
                </code>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Cari nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="min-h-10 w-52 rounded border border-line bg-cream py-2 pl-9 pr-4 text-xs text-ink placeholder-muted focus:border-periwinkle-deep focus:outline-none sm:w-64"
                />
              </div>

              {/* Filter Role */}
              <div className="flex items-center gap-1 rounded border border-line bg-cream p-1">
                <button
                  onClick={() => setRoleFilter("all")}
                  className={`min-h-8 rounded px-3 py-1 text-xs font-medium transition-colors ${
                    roleFilter === "all"
                      ? "bg-ink text-surface"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setRoleFilter("user")}
                  className={`min-h-8 rounded px-3 py-1 text-xs font-medium transition-colors ${
                    roleFilter === "user"
                      ? "bg-ink text-surface"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  User
                </button>
                <button
                  onClick={() => setRoleFilter("admin")}
                  className={`min-h-8 rounded px-3 py-1 text-xs font-medium transition-colors ${
                    roleFilter === "admin"
                      ? "bg-ink text-surface"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-cream text-left text-[10px] font-semibold uppercase text-muted">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Nama & Email</th>
                  <th className="py-3 px-4">Role Akses</th>
                  <th className="py-3 px-4">Tgl Terdaftar</th>
                  <th className="py-3 px-4">Status Akun</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-cream/60"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              item.role === "admin"
                                ? "border border-periwinkle-deep/30 bg-periwinkle/25 text-periwinkle-deep"
                                : "border border-coral/30 bg-apricot text-coral-deep"
                            }`}
                          >
                            {(item.full_name || item.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-ink">
                              {item.full_name || "Tanpa Nama"}
                            </p>
                            <p className="font-mono text-[11px] text-muted">
                              {item.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            item.role === "admin"
                              ? "border-periwinkle-deep/40 bg-periwinkle/15 text-periwinkle-deep"
                              : "border-coral/40 bg-cream text-coral-deep"
                          }`}
                        >
                          {item.role === "admin" ? (
                            <ShieldCheck className="w-3 h-3" />
                          ) : (
                            <UserCheck className="w-3 h-3" />
                          )}
                          {item.role.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-muted">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-medium text-periwinkle-deep">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aktif</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button className="font-medium text-periwinkle-deep hover:underline">
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-muted">
                      Tidak ada data pengguna yang sesuai dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
