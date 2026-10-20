import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HeartHandshake,
  LogOut,
  User,
  FileText,
  PlusCircle,
  Clock,
  CheckCircle,
  MapPin,
  ChevronRight,
  TrendingUp,
  Send,
  ArrowRight,
  Menu,
  X,
} from 'lucide-react'
import { authService } from '../../services/authService'

const STATUS_STYLES = {
  'Sedang Diproses': {
    bg: 'bg-[var(--color-apricot)]',
    text: 'text-[var(--color-ink)]',
    border: 'border-[var(--color-coral)]',
    dot: 'bg-[var(--color-coral)]',
  },
  Selesai: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    dot: 'bg-emerald-500',
  },
  Diverifikasi: {
    bg: 'bg-[color:var(--color-periwinkle)]/15',
    text: 'text-[var(--color-periwinkle-deep)]',
    border: 'border-[var(--color-periwinkle)]',
    dot: 'bg-[var(--color-periwinkle)]',
  },
}

function getStatusStyle(status) {
  return (
    STATUS_STYLES[status] || {
      bg: 'bg-[var(--color-cream)]',
      text: 'text-[var(--color-ink)]',
      border: 'border-[var(--color-line)]',
      dot: 'bg-[var(--color-muted)]',
    }
  )
}

export default function HomePages({ currentUser, onLogout }) {
  const navigate = useNavigate()
  const user = currentUser || authService.getCurrentUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    authService.logout()
    if (onLogout) onLogout()
    navigate('/login')
  }

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Pengguna'

  const sampleReports = [
    {
      id: 'LAP-1029',
      title: 'Perbaikan Jalan Rusak & Berlubang di Jl. Merdeka',
      category: 'Infrastruktur',
      location: 'Kecamatan Gambir, Jakarta Pusat',
      date: '19 Okt 2026',
      status: 'Sedang Diproses',
    },
    {
      id: 'LAP-1028',
      title: 'Penerangan Lampu Jalan Padam di Dekat Sekolah',
      category: 'Fasilitas Umum',
      location: 'Kelurahan Sukajadi, Bandung',
      date: '18 Okt 2026',
      status: 'Selesai',
    },
    {
      id: 'LAP-1027',
      title: 'Pembersihan Sampah Liar di Saluran Air Pemukiman',
      category: 'Lingkungan',
      location: 'Wonokromo, Surabaya',
      date: '17 Okt 2026',
      status: 'Diverifikasi',
    },
  ]

  const summaryCards = [
    {
      label: 'Total Laporan Anda',
      value: sampleReports.length,
      icon: FileText,
      accent: 'var(--color-coral)',
      accentBg: 'var(--color-coral)',
    },
    {
      label: 'Sedang Diproses',
      value: sampleReports.filter((r) => r.status === 'Sedang Diproses').length,
      icon: Clock,
      accent: 'var(--color-periwinkle-deep)',
      accentBg: 'var(--color-periwinkle)',
    },
    {
      label: 'Terselesaikan',
      value: sampleReports.filter((r) => r.status === 'Selesai').length,
      icon: CheckCircle,
      accent: '#2e7d5b',
      accentBg: '#4ade80',
    },
  ]

  return (
    <div
      className="min-h-screen font-[family-name:var(--font-sans)]"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(255, 246, 239, 0.85)',
          borderBottom: '1px solid var(--color-line)',
        }}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between px-5 h-16">
          {/* Brand */}
          <a href="/home" className="flex items-center gap-2.5 select-none">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: 'var(--color-coral)' }}
            >
              <HeartHandshake className="w-[18px] h-[18px]" />
            </span>
            <span
              className="text-lg font-[family-name:var(--font-display)] tracking-tight"
              style={{ color: 'var(--color-ink)' }}
            >
              Peduli
              <span style={{ color: 'var(--color-coral)' }}>Negeri</span>
            </span>
          </a>

          {/* Desktop user section */}
          <div className="hidden sm:flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{
                backgroundColor: 'var(--color-cream)',
                border: '1px solid var(--color-line)',
              }}
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: 'var(--color-apricot)',
                  color: 'var(--color-coral-deep)',
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </span>
              <div className="text-left">
                <p
                  className="text-xs font-semibold leading-none"
                  style={{ color: 'var(--color-ink)' }}
                >
                  {displayName}
                </p>
                <span
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Warga
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-200"
              style={{
                backgroundColor: 'var(--color-cream)',
                color: 'var(--color-muted)',
                border: '1px solid var(--color-line)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-coral)'
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.borderColor = 'var(--color-coral)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-cream)'
                e.currentTarget.style.color = 'var(--color-muted)'
                e.currentTarget.style.borderColor = 'var(--color-line)'
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
            style={{ color: 'var(--color-ink)' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div
            className="sm:hidden px-5 pb-4 space-y-3"
            style={{ borderTop: '1px solid var(--color-line)' }}
          >
            <div className="flex items-center gap-2 pt-3">
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: 'var(--color-apricot)',
                  color: 'var(--color-coral-deep)',
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
                  {displayName}
                </p>
                <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  Warga
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
              style={{
                backgroundColor: 'var(--color-cream)',
                color: 'var(--color-coral-deep)',
                border: '1px solid var(--color-line)',
              }}
            >
              <LogOut className="w-4 h-4" />
              Keluar dari Akun
            </button>
          </div>
        )}
      </nav>

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-5 py-8 space-y-8">
        {/* ── Hero ────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden rounded-3xl p-6 sm:p-10"
          style={{
            background:
              'linear-gradient(135deg, var(--color-cream) 0%, var(--color-apricot) 60%, var(--color-coral) 100%)',
          }}
        >
          <div className="max-w-xl relative z-10 space-y-4">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: 'rgba(255,255,255,0.55)',
                color: 'var(--color-coral-deep)',
              }}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ruang Partisipasi Publik</span>
            </div>

            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-[family-name:var(--font-display)] tracking-tight"
              style={{ color: 'var(--color-ink)' }}
            >
              Halo, {displayName}!
            </h1>

            <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-coral-deep)' }}>
              Sampaikan aspirasi dan laporkan kendala fasilitas di lingkungan Anda.
              Pantau proses penyelesaian secara transparan.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--color-coral)',
                  boxShadow: '0 4px 14px rgba(161,74,48,0.25)',
                }}
              >
                <PlusCircle className="w-4 h-4" />
                Buat Laporan Baru
              </button>
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-line)',
                }}
              >
                <FileText className="w-4 h-4" />
                Lihat Laporan Saya
              </button>
            </div>
          </div>

          {/* Decorative circle */}
          <div
            className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full opacity-30 pointer-events-none"
            style={{ backgroundColor: 'var(--color-periwinkle)' }}
          />
        </section>

        {/* ── Summary Cards ───────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summaryCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.label}
                className="flex items-center justify-between p-5 rounded-2xl transition-shadow duration-200 hover:shadow-md"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--color-line)',
                }}
              >
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
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
                  <Icon className="w-5 h-5" style={{ color: card.accent, opacity: 1 }} />
                </span>
              </div>
            )
          })}
        </section>

        {/* ── Recent Reports ──────────────────────────────── */}
        <section
          className="rounded-3xl p-6 sm:p-8"
          style={{
            backgroundColor: '#fff',
            border: '1px solid var(--color-line)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className="text-base sm:text-lg font-bold flex items-center gap-2"
                style={{ color: 'var(--color-ink)' }}
              >
                <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-coral)' }} />
                Laporan Terkini
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Perkembangan laporan dan aspirasi publik
              </p>
            </div>
            <button
              className="text-xs font-medium flex items-center gap-1 transition-colors duration-150"
              style={{ color: 'var(--color-coral-deep)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-coral)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-coral-deep)')}
            >
              Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Report list */}
          <div className="space-y-3">
            {sampleReports.map((item) => {
              const style = getStatusStyle(item.status)
              return (
                <article
                  key={item.id}
                  className="group p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-cream)',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-line)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-mono"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        {item.id}
                      </span>
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-md font-medium"
                        style={{
                          backgroundColor: 'var(--color-apricot)',
                          color: 'var(--color-coral-deep)',
                        }}
                      >
                        {item.category}
                      </span>
                    </div>
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-ink)' }}
                    >
                      {item.title}
                    </h3>
                    <div
                      className="flex items-center gap-4 text-xs"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" style={{ color: 'var(--color-coral)' }} />
                        {item.location}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-medium ${style.bg} ${style.text} ${style.border}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {item.status}
                    </span>
                    <ArrowRight
                      className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ color: 'var(--color-muted)' }}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer
        className="mt-4 py-6 text-center text-xs"
        style={{
          color: 'var(--color-muted)',
          borderTop: '1px solid var(--color-line)',
        }}
      >
        Peduli Negeri — Portal Partisipasi Publik Indonesia
      </footer>
    </div>
  )
}
