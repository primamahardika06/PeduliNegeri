import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound
} from 'lucide-react'
import brandLogo from '../../assets/PeduliNegeri (4).png';

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
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-7 flex items-center justify-center gap-2">
          <img src={brandLogo} alt="Peduli Negeri" className="h-12 w-48 object-contain" />
        </div>

        {/* Reset Card */}
        <div className="rounded border border-line bg-surface p-5 sm:p-8">

          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-apricot text-coral-deep">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">Reset kata sandi</h2>
              <p className="text-xs text-muted">Masukkan kata sandi baru Anda</p>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-4 flex items-start gap-3 rounded border border-coral/50 bg-cream p-3.5 text-xs text-coral-deep">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-start gap-3 rounded border border-periwinkle/60 bg-periwinkle/15 p-3.5 text-xs text-periwinkle-deep">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {!sessionReady && !errorMessage && (
            <div className="mb-4 flex items-start gap-3 rounded border border-line bg-cream p-3.5 text-xs text-muted">
              <div className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-line border-t-ink" />
              <span>Memverifikasi tautan reset password...</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Kata sandi baru (min. 6 karakter)
              </label>
              <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                    className="min-h-12 w-full rounded border border-line bg-surface py-2.5 pl-10 pr-10 text-sm text-ink placeholder-muted focus:border-coral-deep focus:outline-none focus:ring-1 focus:ring-coral-deep"
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
                  Konfirmasi kata sandi baru
              </label>
              <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                    className="min-h-12 w-full rounded border border-line bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder-muted focus:border-coral-deep focus:outline-none focus:ring-1 focus:ring-coral-deep"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !sessionReady}
                className={`mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded bg-coral px-4 text-sm font-semibold text-ink transition-colors hover:bg-apricot ${
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

