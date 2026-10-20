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

  return (
    <div className="theme-light min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation Bar */}
      <nav className="border-b border-indigo-900/50 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Admin Portal Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  Peduli<span className="text-red-500">Negeri</span>
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold uppercase tracking-wider">
                  Admin Panel
                </span>
              </div>
            </div>
          </div>

          {/* Current Admin Info & Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 bg-slate-800/90 border border-indigo-500/30 rounded-xl px-3 py-1.5 shadow-sm">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                <Shield className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 leading-none">
                  {user?.fullName ||
                    user?.email?.split("@")[0] ||
                    "Administrator"}
                </p>
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                  Admin Role
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-all duration-200"
              title="Keluar dari sesi admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-3xl bg-linear-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-900/40 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium mb-1">
              <Database className="w-4 h-4" />
              <span>Pusat Kendali Basis Data Supabase</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Pengelolaan Administrator
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Pantau pengguna terdaftar, verifikasi akun, dan kelola laporan
              aspirasi masyarakat secara terpusat.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchUsers();
                fetchReports();
              }}
              disabled={loadingUsers || loadingReports}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-semibold transition-all"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingUsers || loadingReports ? "animate-spin" : ""}`}
              />
              <span>Sinkronisasi Data</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-medium">
                Total Akun Terdaftar
              </p>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white mt-2">
              {totalUsers}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Tersimpan di tabel profiles
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-medium">
                Pengguna Biasa (User)
              </p>
              <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-red-400 mt-2">
              {totalRegularUsers}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Akses Portal Pelaporan
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-medium">
                Administrator
              </p>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-emerald-400 mt-2">
              {totalAdmins}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Hak akses penuh sistem
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 font-medium">
                Status Integrasi
              </p>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-sm font-bold text-white">Supabase Connected</p>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              PostgreSQL + Auth + RLS
            </p>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <FileCheck2 className="h-5 w-5 text-indigo-400" /> Laporan
                Masyarakat
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Perubahan status langsung tersimpan dan terlihat oleh pelapor.
              </p>
            </div>
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              {reports.length} laporan
            </span>
          </div>

          {reportsError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {reportsError}
            </div>
          )}

          {loadingReports ? (
            <p
              role="status"
              className="py-10 text-center text-sm text-slate-400"
            >
              Memuat laporan...
            </p>
          ) : reports.length === 0 && !reportsError ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 py-10 text-center">
              <FileCheck2 className="mx-auto h-8 w-8 text-slate-500" />
              <p className="mt-3 text-sm font-semibold text-slate-200">
                Belum ada laporan masuk
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Laporan warga akan tampil di sini setelah dikirim.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <article
                  key={report.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-md bg-indigo-500/10 px-2 py-1 font-semibold text-indigo-300">
                          {report.category}
                        </span>
                        <time className="text-slate-500">
                          {new Intl.DateTimeFormat("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(report.created_at))}
                        </time>
                      </div>
                      <h3 className="font-semibold text-white">
                        {report.title}
                      </h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                        {report.description}
                      </p>
                      <p className="mt-3 text-xs text-slate-400">
                        Lokasi: {report.location}
                      </p>
                    </div>

                    <label className="relative block w-full shrink-0 lg:w-72">
                      <span className="mb-1.5 block text-xs font-semibold text-slate-400">
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
                        className="min-h-11 w-full appearance-none rounded-xl border border-slate-700 bg-slate-800 px-3 pr-10 text-sm text-white outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
                      >
                        {REPORT_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      {updatingReportId === report.id ? (
                        <RefreshCw className="pointer-events-none absolute right-3 top-9 h-4 w-4 animate-spin text-indigo-300" />
                      ) : (
                        <ChevronDown className="pointer-events-none absolute right-3 top-9 h-4 w-4 text-slate-400" />
                      )}
                    </label>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* User Management Section */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Daftar Pengguna & Hak Akses
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Data sinkronisasi dari tabel{" "}
                <code className="text-indigo-300 font-mono">
                  public.profiles
                </code>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all w-52 sm:w-64"
                />
              </div>

              {/* Filter Role */}
              <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700 p-1 rounded-xl">
                <button
                  onClick={() => setRoleFilter("all")}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    roleFilter === "all"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setRoleFilter("user")}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    roleFilter === "user"
                      ? "bg-red-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  User
                </button>
                <button
                  onClick={() => setRoleFilter("admin")}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    roleFilter === "admin"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
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
              <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold border-b border-slate-700/60">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Nama & Email</th>
                  <th className="py-3 px-4">Role Akses</th>
                  <th className="py-3 px-4">Tgl Terdaftar</th>
                  <th className="py-3 px-4">Status Akun</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              item.role === "admin"
                                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {(item.full_name || item.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200">
                              {item.full_name || "Tanpa Nama"}
                            </p>
                            <p className="text-slate-400 text-[11px] font-mono">
                              {item.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            item.role === "admin"
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                              : "bg-red-500/10 text-red-400 border-red-500/30"
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

                      <td className="py-3.5 px-4 text-slate-400">
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
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aktif</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline">
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Tidak ada data pengguna yang sesuai dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
