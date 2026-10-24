import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  UserPlus, 
  LogIn, 
  HeartHandshake, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  KeyRound
} from 'lucide-react'
import { authService } from '../../services/authService'

export default function LoginPages({ onLoginSuccess }) {
  const navigate = useNavigate()
  
  // State mode tab: 'login' | 'register' | 'forgot'
  const [authMode, setAuthMode] = useState('login')
  
  // Role selection: 'user' | 'admin'
  const [selectedRole, setSelectedRole] = useState('user')

  // Form inputs
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // UI States
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const response = await authService.login({
        email,
        password,
        expectedRole: selectedRole
      })

      const userData = response.data.user
      setSuccessMessage(`Selamat datang kembali, ${userData.fullName || userData.email}!`)

      if (onLoginSuccess) {
        onLoginSuccess(userData)
      }

      // Navigasi sesuai role setelah jeda singkat
      setTimeout(() => {
        if (userData.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/reportPage')
        }
      }, 700)
    } catch (err) {
      setErrorMessage(err.message || 'Gagal masuk. Periksa kembali email dan password Anda.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Register
  const handleRegister = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!fullName.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi harus memiliki minimal 6 karakter.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.')
      return
    }

    setLoading(true)

    try {
      await authService.register({
        email,
        password,
        fullName,
        role: selectedRole
      })

      setSuccessMessage('Akun berhasil dibuat! Silakan masuk.')
      // Pindahkan ke tab login dengan email yang sudah terisi
      setTimeout(() => {
        setAuthMode('login')
        setPassword('')
        setConfirmPassword('')
        setFullName('')
        setSuccessMessage('Akun Anda siap digunakan. Silakan masukkan kata sandi untuk masuk.')
      }, 1500)
    } catch (err) {
      setErrorMessage(err.message || 'Gagal mendaftarkan akun. Silakan coba kembali.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!email.trim()) {
      setErrorMessage('Masukkan alamat email Anda.')
      return
    }

    setLoading(true)

    try {
      await authService.forgotPassword(email)
      setSuccessMessage('Jika email terdaftar, tautan reset password telah dikirim. Silakan periksa kotak masuk Anda.')
    } catch (err) {
      setErrorMessage(err.message || 'Gagal mengirim email reset password.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (mode) => {
    setAuthMode(mode)
    setErrorMessage('')
    setSuccessMessage('')
  }

  return (
    <div className="theme-light min-h-screen bg-cream flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-ink">
      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-tr from-red-600 via-rose-500 to-indigo-600 shadow-xl shadow-red-500/20 mb-4 border border-white/20">
            <HeartHandshake className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            Peduli<span className="text-red-500">Negeri</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Platform Gotong Royong &amp; Aspirasi Demi Indonesia Maju
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          
          {/* Tab Mode: Masuk vs Buat Akun (tidak ditampilkan saat mode forgot) */}
          {authMode !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 bg-slate-900/80 rounded-2xl mb-6 border border-slate-700/50">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  authMode === 'login'
                    ? 'bg-linear-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" />
                Masuk
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  authMode === 'register'
                    ? 'bg-linear-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Buat Akun
              </button>
            </div>
          )}

          {/* Header untuk mode Lupa Password */}
          {authMode === 'forgot' && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Masuk
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Lupa Password</h2>
                  <p className="text-xs text-slate-400">Masukkan email untuk menerima tautan reset password</p>
                </div>
              </div>
            </div>
          )}

          {/* Role Selector: User vs Admin (tidak ditampilkan saat mode forgot) */}
          {authMode !== 'forgot' && (
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {authMode === 'login' ? 'Masuk Sebagai' : 'Daftar Sebagai Akun'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('user')}
                  className={`relative flex items-center justify-center gap-2.5 p-3 rounded-2xl border transition-all text-sm font-medium ${
                    selectedRole === 'user'
                      ? 'border-red-500 bg-red-500/10 text-white shadow-sm shadow-red-500/20'
                      : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                  }`}
                >
                  <User className={`w-4 h-4 ${selectedRole === 'user' ? 'text-red-400' : 'text-slate-400'}`} />
                  <span>Pengguna</span>
                  {selectedRole === 'user' && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`relative flex items-center justify-center gap-2.5 p-3 rounded-2xl border transition-all text-sm font-medium ${
                    selectedRole === 'admin'
                      ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-sm shadow-indigo-500/20'
                      : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className={`w-4 h-4 ${selectedRole === 'admin' ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>Administrator</span>
                  {selectedRole === 'admin' && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
                  )}
                </button>
              </div>
              
              {/* Role Notice */}
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5 px-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {selectedRole === 'user' 
                    ? 'Akses portal pelaporan masyarakat (akan diarahkan ke HomePage).' 
                    : 'Akses pengelolaan sistem & verifikasi (akan diarahkan ke Admin Dashboard).'}
                </span>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-950/60 border border-red-500/50 rounded-2xl flex items-start gap-3 text-red-200 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl flex items-start gap-3 text-emerald-200 text-xs animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* FORM: FORGOT PASSWORD */}
          {authMode === 'forgot' ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 mt-2 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Kirim Tautan Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : authMode === 'login' ? (
            /* FORM: LOGIN */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Lupa password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 mt-2 ${
                  selectedRole === 'admin'
                    ? 'bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-600/30'
                    : 'bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-600/30'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk sebagai {selectedRole === 'admin' ? 'Admin' : 'User'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* FORM: REGISTER */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Kata Sandi (Min. 6 Karakter)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 mt-2 ${
                  selectedRole === 'admin'
                    ? 'bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-600/30'
                    : 'bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-600/30'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Daftarkan Akun ({selectedRole === 'admin' ? 'Admin' : 'User'})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Database Info Tag */}
          <div className="mt-6 pt-4 border-t border-slate-700/60 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
              <span>Tersinkronisasi otomatis dengan Database</span>
              <span className="font-semibold text-emerald-400">Supabase</span>
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}
