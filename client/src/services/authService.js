const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const authService = {
  /**
   * Mendaftar akun baru
   * @param {Object} payload { email, password, fullName, role }
   */
  async register({ email, password, fullName, role = 'user' }) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, fullName, role }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Registrasi gagal. Silakan coba lagi.')
    }
    return data
  },

  /**
   * Login pengguna (User atau Admin)
   * @param {Object} payload { email, password, expectedRole }
   */
  async login({ email, password, expectedRole = 'user' }) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, expectedRole }),
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Login gagal. Cek email dan password Anda.')
    }

    // Simpan sesi ke localStorage
    if (data.data?.user) {
      localStorage.setItem('pn_user', JSON.stringify(data.data.user))
      if (data.data.session?.access_token) {
        localStorage.setItem('pn_token', data.data.session.access_token)
      }
    }

    return data
  },

  /**
   * Logout dan hapus sesi dari localStorage
   */
  logout() {
    localStorage.removeItem('pn_user')
    localStorage.removeItem('pn_token')
  },

  /**
   * Dapatkan user yang sedang aktif dari penyimpanan lokal
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem('pn_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  },

  /**
   * Dapatkan daftar seluruh user untuk admin dashboard
   */
  async getAllUsers() {
    const response = await fetch(`${API_URL}/auth/users`)
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'Gagal memuat data pengguna.')
    }
    return data.data || []
  }
}

export default authService
