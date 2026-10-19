import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  HeartHandshake, 
  LogOut, 
  User, 
  FileText, 
  PlusCircle, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  MapPin, 
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react'
import { authService } from '../../services/authService'

export default function HomePages({ currentUser, onLogout }) {
  const navigate = useNavigate()
  const user = currentUser || authService.getCurrentUser()

  const handleLogout = () => {
    authService.logout()
    if (onLogout) onLogout()
    navigate('/login')
  }

  // Dummy activity data for demo
  const sampleReports = [
    {
      id: 'LAP-1029',
      title: 'Perbaikan Jalan Rusak & Berlubang di Jl. Merdeka',
      category: 'Infrastruktur',
      location: 'Kecamatan Gambir, Jakarta Pusat',
      date: '19 Okt 2026',
      status: 'Sedang Diproses',
      statusColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    {
      id: 'LAP-1028',
      title: 'Penerangan Lampu Jalan Padam di Dekat Sekolah',
      category: 'Fasilitas Umum',
      location: 'Kelurahan Sukajadi, Bandung',
      date: '18 Okt 2026',
      status: 'Selesai',
      statusColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    },
    {
      id: 'LAP-1027',
      title: 'Pembersihan Sampah Liar di Saluran Air Pemukiman',
      category: 'Lingkungan',
      location: 'Wonokromo, Surabaya',
      date: '17 Okt 2026',
      status: 'Diverifikasi',
      statusColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-600/30">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Peduli<span className="text-red-500">Negeri</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Portal Warga
              </span>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5">
              <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 leading-none">
                  {user?.fullName || user?.email?.split('@')[0] || 'Pengguna'}
                </p>
                <span className="text-[10px] text-red-400 font-medium uppercase tracking-wider">
                  User
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-all duration-200"
              title="Keluar dari akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>

        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-red-950/40 via-slate-900 to-indigo-950/30 border border-slate-800 p-6 sm:p-10 shadow-2xl">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              <Award className="w-3.5 h-3.5" />
              <span>Ruang Partisipasi Publik Indonesia</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Halo, <span className="text-red-400">{user?.fullName || 'Sahabat Peduli'}</span>! 👋
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Selamat datang di portal <span className="text-white font-semibold">Peduli Negeri</span>. Sampaikan aspirasi, laporkan kendala fasilitas di lingkungan Anda, dan pantau proses penyelesaian secara transparan.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-red-600 to-rose-600 text-white font-medium text-sm shadow-lg shadow-red-600/30 hover:from-red-500 hover:to-rose-500 transition-all">
                <PlusCircle className="w-4 h-4" />
                <span>Buat Laporan Baru</span>
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-medium text-sm border border-slate-700 transition-all">
                <FileText className="w-4 h-4" />
                <span>Lihat Laporan Saya</span>
              </button>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Laporan Anda</p>
              <p className="text-2xl font-bold text-white mt-1">3</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Sedang Diproses</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">1</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Laporan Terselesaikan</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">2</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Status Akun</p>
              <p className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Terverifikasi Supabase
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Recent Reports Section */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-500" />
                Daftar Aspirasi & Laporan Terkini
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Perkembangan laporan fasilitas dan aspirasi publik
              </p>
            </div>
            <button className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1">
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {sampleReports.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">{item.id}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100">{item.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400" />
                      {item.location}
                    </span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </div>

                <div className="flex items-center sm:self-center">
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
