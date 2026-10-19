import { supabase, supabaseAdmin } from '../config/supabase.js'

/**
 * Controller untuk Registrasi Akun Baru
 */
export const register = async (req, res) => {
  try {
    const { email, password, fullName, role = 'user' } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal harus 6 karakter.'
      })
    }

    const assignedRole = role === 'admin' ? 'admin' : 'user'

    let user = null
    let authError = null
    let session = null

    // Jika admin client tersedia, buat user langsung dengan email terverifikasi (agar bisa langsung login)
    if (supabaseAdmin) {
      const { data: adminData, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || '',
          role: assignedRole
        }
      })

      if (adminErr) {
        authError = adminErr
      } else {
        user = adminData.user
      }
    }

    // Jika belum berhasil dan ada client publik, coba signUp biasa
    if (!user && !authError && supabase) {
      const { data: authData, error: standardErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
            role: assignedRole
          }
        }
      })

      if (standardErr) {
        authError = standardErr
      } else {
        user = authData?.user
        session = authData?.session
      }
    }

    if (authError) {
      return res.status(400).json({
        success: false,
        message: authError.message
      })
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Pendaftaran gagal dilakukan.'
      })
    }

    // Pastikan atau pastikan kembali profil tersimpan di tabel public.profiles jika trigger belum berjalan
    const dbClient = supabaseAdmin || clientToUse
    const { data: profileData, error: profileError } = await dbClient
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: fullName || '',
        role: assignedRole,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select()
      .single()

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil!',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: profileData?.full_name || fullName || '',
          role: profileData?.role || assignedRole
        },
        session: authData.session
      }
    })
  } catch (error) {
    console.error('Error saat register:', error)
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat registrasi.',
      error: error.message
    })
  }
}

/**
 * Controller untuk Login (User dan Admin)
 */
export const login = async (req, res) => {
  try {
    const { email, password, expectedRole = 'user' } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.'
      })
    }

    const clientToUse = supabase || supabaseAdmin
    if (!clientToUse) {
      return res.status(500).json({
        success: false,
        message: 'Supabase client belum terkonfigurasi pada server.'
      })
    }

    // Login ke Supabase Auth
    const { data: authData, error: authError } = await clientToUse.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.'
      })
    }

    const user = authData.user

    // Ambil data profil dari tabel public.profiles untuk memastikan role
    const dbClient = supabaseAdmin || clientToUse
    let { data: profile, error: profileError } = await dbClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Fallback jika belum ada di tabel profiles, ambil dari user metadata
    if (!profile) {
      const metaRole = user.user_metadata?.role || 'user'
      const metaName = user.user_metadata?.full_name || ''
      
      const { data: newProfile } = await dbClient
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: metaName,
          role: metaRole
        })
        .select()
        .single()
      
      profile = newProfile || { id: user.id, email: user.email, full_name: metaName, role: metaRole }
    }

    const actualRole = profile?.role || 'user'

    // Validasi opsi Login: Jika memilih Admin tapi rolenya bukan admin
    if (expectedRole === 'admin' && actualRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak: Akun Anda tidak memiliki hak akses sebagai Administrator.'
      })
    }

    return res.status(200).json({
      success: true,
      message: `Login berhasil sebagai ${actualRole.toUpperCase()}!`,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: profile?.full_name || user.user_metadata?.full_name || '',
          role: actualRole
        },
        session: authData.session
      }
    })
  } catch (error) {
    console.error('Error saat login:', error)
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat login.',
      error: error.message
    })
  }
}

/**
 * Controller untuk mendapatkan seluruh daftar profil (Khusus Admin)
 */
export const getAllProfiles = async (req, res) => {
  try {
    const dbClient = supabaseAdmin || supabase
    if (!dbClient) {
      return res.status(500).json({ success: false, message: 'Database client tidak tersedia.' })
    }

    const { data, error } = await dbClient
      .from('profiles')
      .select('id, email, full_name, role, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(400).json({ success: false, message: error.message })
    }

    return res.status(200).json({
      success: true,
      data
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
