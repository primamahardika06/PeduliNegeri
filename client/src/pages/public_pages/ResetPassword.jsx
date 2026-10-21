import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  HeartHandshake,
  AlertCircle,
  CheckCircle2,
  KeyRound
} from 'lucide-react'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export default function ResetPassword() {
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setErrorMessage('Konfigurasi Supabase belum tersedia.')
      return
    }

    // Supabase mengirim event SIGNED_IN atau PASSWORD_RECOVERY saat user membuka link reset
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
          setSessionReady(true)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (newPassword.length < 6) {
      setErrorMessage('Password baru harus minimal 6 karakter.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok.')
      return
    }

    if (!supabase) {
      setErrorMessage('Konfigurasi Supabase belum tersedia.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        setErrorMessage(error.message)
        return
      }

      setSuccessMessage('Password berhasil diperbarui! Anda akan diarahkan ke halaman login.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setErrorMessage(err.message || 'Gagal memperbarui password.')
    } finally {
      setLoading(false)
    }
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
        </div>

        {/* Reset Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Reset Password</h2>
              <p className="text-xs text-slate-400">Masukkan password baru Anda</p>
            </div>
          </div>

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

          {!sessionReady && !errorMessage && (
            <div className="mb-4 p-3.5 bg-slate-900/60 border border-slate-700/50 rounded-2xl flex items-start gap-3 text-slate-300 text-xs">
              <div className="w-4 h-4 border-2 border-slate-500/30 border-t-slate-300 rounded-full animate-spin shrink-0 mt-0.5" />
              <span>Memverifikasi tautan reset password...</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password Baru (Min. 6 Karakter)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
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
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !sessionReady}
              className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 mt-2 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30 ${
                loading || !sessionReady ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Simpan Password Baru</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}

