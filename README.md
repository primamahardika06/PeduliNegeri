# Peduli Negeri

Peduli Negeri adalah platform pelaporan aspirasi dan masalah fasilitas publik terintegrasi yang memungkinkan masyarakat melaporkan kerusakan infrastruktur, kebersihan lingkungan, dan sarana umum secara mudah dan transparan. Aplikasi ini menghubungkan partisipasi aktif warga dengan instansi terkait agar proses verifikasi dan tindak lanjut lapangan dapat dipantau secara langsung dan akuntabel.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework & Runtime:** [React 19](https://react.dev/), [Vite](https://vite.dev/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & Design Tokens CSS Variables
- **Peta Interaktif:** [Leaflet](https://leafletjs.com/)
- **Ikon UI:** [Lucide React](https://lucide.dev/)
- **Client SDK:** [@supabase/supabase-js](https://supabase.com/docs/reference/javascript)

### Backend (Server)
- **Runtime & Framework:** [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
- **Autentikasi & Keamanan:** Supabase Auth (JWT), Row Level Security (RLS), CORS
- **Environment Management:** [dotenv](https://github.com/motdotla/dotenv)

### Database & Storage
- **Database:** [Supabase PostgreSQL](https://supabase.com/docs/guides/database)
- **Storage:** Supabase Storage Bucket (Bukti Foto Laporan Warga)

---

## 🚀 Cara Menjalankan Project

Ikuti langkah-langkah berikut untuk mengkloning dan menjalankan project di komputer lokal:

### 1. Clone Repository
```bash
git clone https://github.com/primamahardika06/PeduliNegeri.git
cd peduli-negeri
```

### 2. Konfigurasi Environment Variables

Salin file contoh konfigurasi environment pada folder `server` dan `client`:

**Backend (`server/.env`):**
```bash
# Salin dari server/.env.example
PORT=5000
SUPABASE_URL=isi_dengan_url_supabase
SUPABASE_SERVICE_ROLE_KEY=isi_dengan_service_role_key
CLIENT_URL=http://localhost:5173/
```

**Frontend (`client/.env`):**
```bash
# Salin dari client/.env.example
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=isi_dengan_url_supabase
VITE_SUPABASE_ANON_KEY=isi_dengan_anon_key
```

### 3. Jalankan Backend (Server)
Buka terminal dan jalankan server Express:
```bash
cd server
npm install
npm run dev
```
Server akan aktif di: `http://localhost:5000`

### 4. Jalankan Frontend (Client)
Buka terminal baru dan jalankan aplikasi Vite:
```bash
cd client
npm install
npm run dev
```
Aplikasi frontend akan aktif di: `http://localhost:5173`

---

## 📌 Progress Saat Ini

Fitur dan halaman yang telah selesai diimplementasikan:

- [x] **Landing Page Publik:**
  - Hero section, ringkasan capaian/statistik nasional, alur kerja pelaporan 3 langkah, dan papan peringkat warga peduli lingkungan.
- [x] **Autentikasi & Manajemen Sesi:**
  - Registrasi warga (email dan nomor HP terpisah), login fleksibel (email / nomor HP), pemulihan kata sandi (lupa password), serta mekanisme *auto-redirect* ke landing page saat waktu sesi/token login telah habis.
- [x] **Halaman Pengajuan Laporan (`/laporan/baru`):**
  - Form pelaporan dengan kompresi gambar otomatis di sisi client, integrasi pengambilan foto langsung lewat kamera/upload, pemilihan kategori, dan titik lokasi koordinat otomatis.
- [x] **Halaman Riwayat Laporan Warga (`/laporan`):**
  - Banner statistik 3 kolom (*Total laporan*, *Sedang ditangani*, *Selesai*).
  - Tampilan pengelompokan per kategori dan filter urutan terbaru.
  - Kartu laporan dengan 4-segment progress bar (*Laporan Diterima*, *Sedang Diverifikasi*, *Petugas Dikirim ke Lokasi*, *Laporan Selesai*) serta drawer accordion tahap penanganan.
- [x] **Halaman Pantau Laporan Saya (`/reportPage`):**
  - Tampilan split-view laporan warga, pencarian laporan, ulasan testimoni selesai, serta tombol kembali ke beranda ramah perangkat mobile.
- [x] **Peta Interaktif Publik (`/peta`):**
  - Visualisasi titik sebaran laporan di seluruh wilayah Indonesia menggunakan Leaflet dengan filter wilayah dan kategori.
- [x] **Admin Dashboard (`/admin`):**
  - Papan kanban status laporan (*move* / tombol langkah penanganan).
  - 3 Widget analitik metrik performa (*Laporan per bulan dengan bar chart 6 bulan*, *Tingkat penyelesaian*, dan *Kategori terbanyak*).
  - Tabel laporan masyarakat dengan pencarian, filter, dan fitur ekspor data ke file CSV.
  - Manajemen akun pengguna terdaftar dan hak akses (role warga & admin).
- [x] **Desain & Responsivitas:**
  - Tampilan responsif optimal untuk layar HP kecil, tablet, hingga desktop lebar dengan target sentuh minimal 44px.
