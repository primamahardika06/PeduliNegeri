# 🇮🇩 Peduli Negeri

**Platform Pelaporan Aspirasi & Fasilitas Publik Terintegrasi**

Peduli Negeri adalah platform pelaporan masyarakat terintegrasi yang memungkinkan warga melaporkan kerusakan infrastruktur, kebersihan lingkungan, dan sarana umum secara mudah, transparan, dan akuntabel. Aplikasi ini menghubungkan partisipasi aktif warga dengan instansi terkait agar proses verifikasi dan tindak lanjut lapangan dapat dipantau secara langsung — dari penerimaan laporan hingga penyelesaian di lapangan.

---

## ✨ Fitur Utama

### 👥 Sisi Pengguna (Warga)

- **Autentikasi Fleksibel** — Registrasi & login via email, nomor HP, atau **Google OAuth**. Dilengkapi pemulihan kata sandi (lupa password) dan manajemen sesi otomatis (auto-logout saat token kedaluwarsa).
- **Form Pelaporan Cerdas** — Pengajuan laporan dengan:
  - Pengambilan foto langsung dari kamera atau upload galeri
  - Kompresi gambar otomatis di sisi client & penghapusan metadata EXIF untuk privasi
  - Pemilihan kategori laporan (Infrastruktur, Fasilitas Umum, Lingkungan, dll.)
  - Deteksi titik lokasi koordinat otomatis via GPS
- **Deteksi Laporan Serupa & Sistem Dukungan** — Alur 3 langkah:
  1. Isi formulir laporan
  2. Sistem mengecek laporan serupa di sekitar lokasi (berdasarkan kemiripan, jarak, dan jumlah dukungan)
  3. Warga dapat memilih **mendukung laporan yang sudah ada** atau tetap mengirim laporan baru
  - Dukungan dapat dibatalkan kapan saja
  - Warga tidak dapat mendukung laporannya sendiri atau mendukung laporan yang sama lebih dari sekali
- **Pelacakan Status 4 Tahap** — Progress bar visual: _Laporan Diterima → Sedang Diproses → Petugas Dikirim ke Lokasi → Laporan Selesai_
- **Riwayat & Pantau Laporan** — Dashboard pribadi warga dengan statistik (total laporan, sedang ditangani, selesai), filter kategori, dan detail progres penanganan.
- **Notifikasi Email** — Konfirmasi otomatis saat laporan diterima dan notifikasi setiap kali status laporan diperbarui oleh admin.
- **Ulasan & Testimoni** — Warga dapat memberikan rating bintang (1–5) dan ulasan tertulis untuk laporan yang telah selesai ditangani.
- **Leaderboard Warga Peduli** — Papan peringkat warga paling aktif melaporkan, dengan kontrol privasi (opt-in, pilih tampil nama asli atau username).
- **Peta Interaktif** — Visualisasi sebaran titik laporan di seluruh Indonesia menggunakan Leaflet, dengan filter wilayah dan kategori.
- **Statistik Publik** — Dashboard analitik terbuka berisi:
  - Metrik ringkasan (total laporan, dalam proses, selesai, rata-rata waktu penyelesaian)
  - Grafik batang per kategori, donut chart status, line chart tren harian, dan grafik horizontal per wilayah
  - Ringkasan kepuasan warga (rata-rata rating, distribusi bintang, ulasan terbaru)
  - Semua chart dibuat dengan custom SVG (tanpa library chart eksternal)

### 🛡️ Sisi Admin

- **Kanban Board Drag-and-Drop** — Papan status laporan dengan 4 kolom (_Diterima → Diproses → Petugas Dikirim → Selesai_). Kartu laporan dapat di-drag antar kolom atau digeser menggunakan tombol ← Mundur / Majukan →.
- **Filter Dukungan Warga** — 3 mode filter: _Semua_ / 🔥 _Didukung Warga_ / _Biasa_. Laporan dengan dukungan ditandai badge jumlah dukungan. Klik badge untuk melihat daftar lengkap pendukung.
- **Filter Wilayah** — Dropdown filter wilayah untuk melihat laporan per daerah. Widget _"Dukungan Terbanyak per Wilayah"_ menampilkan 4 wilayah teratas berdasarkan total dukungan warga.
- **Notifikasi Bell Real-time** — Ikon lonceng di navbar dengan badge jumlah notifikasi belum dibaca. Dropdown menampilkan notifikasi prioritas untuk laporan yang mencapai ambang batas dukungan (default: 5 dukungan). Klik notifikasi untuk langsung membuka detail laporan.
- **Tabel Laporan** — Pencarian, filter kategori, filter dukungan, filter wilayah, dan **ekspor data ke CSV**.
- **Manajemen Pengguna** — Daftar akun terdaftar, pencarian, filter role (user/admin), statistik total akun.
- **Widget Analitik** — Laporan per bulan (bar chart 6 bulan), tingkat penyelesaian (%), dan kategori terbanyak.
- **Notifikasi Email ke Admin** — Notifikasi otomatis ke email admin apabila sebuah laporan mencapai ambang batas dukungan warga (default: 5 dukungan, dapat dikonfigurasi di `server/src/controllers/reportController.js` baris 10).

---

## 🛠️ Tech Stack

### Frontend (Client)

| Teknologi | Kegunaan |
|---|---|
| [React 19](https://react.dev/) | Library UI |
| [Vite 8](https://vite.dev/) | Build tool & dev server |
| [React Router v7](https://reactrouter.com/) | Client-side routing (SPA) |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [Leaflet](https://leafletjs.com/) | Peta interaktif |
| [Lucide React](https://lucide.dev/) | Ikon UI |
| [@supabase/supabase-js](https://supabase.com/docs/reference/javascript) | Client SDK (Auth & OAuth) |

### Backend (Server)

| Teknologi | Kegunaan |
|---|---|
| [Node.js](https://nodejs.org/) | Runtime JavaScript |
| [Express.js v5](https://expressjs.com/) | Web framework |
| [Supabase Auth](https://supabase.com/docs/guides/auth) | Autentikasi JWT + Google OAuth |
| [Resend](https://resend.com/) | Email transaksional (notifikasi) |
| [dotenv](https://github.com/motdotla/dotenv) | Manajemen environment variables |

### Database & Storage

| Teknologi | Kegunaan |
|---|---|
| [Supabase PostgreSQL](https://supabase.com/docs/guides/database) | Database relasional dengan RLS |
| [Supabase Storage](https://supabase.com/docs/guides/storage) | Penyimpanan bukti foto laporan |

### Deployment

| Teknologi | Kegunaan |
|---|---|
| [Vercel](https://vercel.com/) | Hosting (client sebagai SPA, server sebagai serverless functions) |

---

## 🗃️ Struktur Database

Aplikasi menggunakan 4 tabel utama dengan Row Level Security (RLS):

| Tabel | Deskripsi |
|---|---|
| `profiles` | Data pengguna (email, nama, telepon, role, avatar, pengaturan leaderboard) |
| `reports` | Data laporan (judul, kategori, deskripsi, lokasi, koordinat, foto, status, timeline, jumlah dukungan) |
| `report_supports` | Relasi dukungan warga ke laporan (unique constraint per user-report) |
| `testimonials` | Ulasan & rating warga untuk laporan yang telah selesai |

> File schema lengkap: `database/schema.sql` — File migrasi: `database/migrations/`

---

## 📁 Struktur Project

```
peduli-negeri/
├── client/                         # Frontend React + Vite
│   ├── src/
│   │   ├── assets/                 # Logo & gambar aset
│   │   ├── components/
│   │   │   ├── admin/              # Dashboard admin (kanban, tabel, filter)
│   │   │   ├── common/             # Komponen reusable (BrandLogo)
│   │   │   └── report/             # Cek duplikat & statistik laporan
│   │   ├── config/                 # Konfigurasi Supabase client
│   │   ├── pages/public_pages/     # Halaman publik (landing, login, form, peta, dll.)
│   │   ├── services/               # API service layer (auth, report, testimonial)
│   │   └── utils/                  # Utilitas (kompresi gambar)
│   ├── .env.example
│   ├── package.json
│   └── vercel.json
├── server/                         # Backend Express.js
│   ├── src/
│   │   ├── config/                 # Konfigurasi Supabase admin
│   │   ├── controllers/            # Logic handler (auth, report, testimonial)
│   │   ├── middlewares/            # Auth guard (requireUser, requireAdmin, rateLimit)
│   │   ├── routes/                 # Definisi route API
│   │   └── services/               # Email service (Resend)
│   ├── .env.example
│   ├── package.json
│   └── vercel.json
├── database/
│   ├── schema.sql                  # Skema database lengkap
│   └── migrations/                 # 10 file migrasi inkremental
└── README.md
```

---

## 🚀 Cara Menjalankan Project

### 1. Clone Repository

```bash
git clone https://github.com/primamahardika06/PeduliNegeri.git
cd peduli-negeri
```

### 2. Konfigurasi Environment Variables

Salin file `.env.example` menjadi `.env` pada folder `server` dan `client`, lalu isi nilainya:

**Backend (`server/.env`):**

```env
PORT=5000
SUPABASE_URL=isi_dengan_url_supabase
SUPABASE_SERVICE_ROLE_KEY=isi_dengan_service_role_key
CLIENT_URL=http://localhost:5173/

# Konfigurasi Notifikasi Email (Resend)
RESEND_API_KEY=isi_dengan_api_key_resend
RESEND_FROM_EMAIL=Peduli Negeri <onboarding@resend.dev>
```

**Frontend (`client/.env`):**

```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=isi_dengan_url_supabase
VITE_SUPABASE_ANON_KEY=isi_dengan_anon_key
```

### 3. Jalankan Backend (Server)

```bash
cd server
npm install
npm run dev
```

Server aktif di: `http://localhost:5000`

### 4. Jalankan Frontend (Client)

Buka terminal baru:

```bash
cd client
npm install
npm run dev
```

Aplikasi frontend aktif di: `http://localhost:5173`

### 5. Akun Demo (Login)

```
# Admin
Email    : admin@gmail.com
Password : admin123

# User (Warga)
Email    : p@gmail.com
Password : 12345678
```

> Login juga bisa dilakukan melalui **Google OAuth** (tombol "Masuk dengan Google" di halaman login).

---

## ☁️ Deployment ke Vercel

Project di-deploy sebagai **2 project Vercel terpisah** (client & server):

### Environment Variables di Vercel Dashboard

Karena file `.env` tidak ter-push ke GitHub (ada di `.gitignore`), tambahkan environment variables di **Vercel Project Settings → Environment Variables**:

**Project Server:**

| Variable | Nilai |
|---|---|
| `SUPABASE_URL` | URL project Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key Supabase |
| `CLIENT_URL` | URL frontend Vercel (misal: `https://peduli-negeri-client.vercel.app`) |
| `RESEND_API_KEY` | API key dari Resend dashboard |
| `RESEND_FROM_EMAIL` | _(opsional)_ Default: `Peduli Negeri <onboarding@resend.dev>` |

**Project Client:**

| Variable | Nilai |
|---|---|
| `VITE_API_URL` | URL backend Vercel + `/api` (misal: `https://peduli-negeri-server.vercel.app/api`) |
| `VITE_SUPABASE_URL` | URL project Supabase |
| `VITE_SUPABASE_ANON_KEY` | Anon/public key Supabase |

> **Catatan Resend Free Tier:** Jika menggunakan `onboarding@resend.dev`, email hanya dapat dikirim ke alamat yang terdaftar di akun Resend. Untuk mengirim ke semua pengguna, verifikasi domain custom di dashboard Resend.

---

## 🗺️ Halaman & Route

| Route | Halaman | Akses |
|---|---|---|
| `/` | Landing Page | Publik |
| `/login` | Login & Registrasi | Publik |
| `/reset-password` | Reset Kata Sandi | Publik |
| `/peta` | Peta Interaktif Laporan | Publik |
| `/statistik` | Statistik & Analitik Laporan | Publik |
| `/laporan/baru` | Form Pengajuan Laporan Baru | Warga (login) |
| `/laporan/cek-serupa` | Cek Laporan Serupa & Dukungan | Warga (login) |
| `/laporan` | Riwayat Laporan Saya | Warga (login) |
| `/reportPage` | Pantau & Detail Laporan | Warga (login) |
| `/admin` | Dashboard Admin | Admin |

---

## 🔔 Sistem Notifikasi Email

Aplikasi mengirim 3 jenis notifikasi email via **Resend API**:

1. **Konfirmasi Laporan Baru** — Dikirim ke warga saat laporan berhasil dibuat (berisi ringkasan laporan, kode laporan, dan progress bar).
2. **Perubahan Status Laporan** — Dikirim ke warga setiap kali admin memperbarui status laporan (dengan banner status berwarna dan deskripsi tahapan).
3. **Ambang Batas Dukungan (ke Admin)** — Dikirim ke semua admin saat sebuah laporan mencapai jumlah dukungan tertentu (default: 5).

> **Konfigurasi ambang batas:** Ubah nilai `SUPPORT_NOTIFICATION_THRESHOLD` di [`server/src/controllers/reportController.js`](server/src/controllers/reportController.js) baris 10.

---

## 🎨 Animasi & Responsivitas

- **Scroll Reveal** — Animasi on-scroll menggunakan `IntersectionObserver` native (tanpa library AOS). Mendukung: fade, scale, slide-left, slide-right.
- **Hover Effects** — Efek elevasi pada kartu (`.hover-lift`) dan shimmer pada tombol utama (`.btn-shimmer`).
- **Responsif** — Tampilan dioptimalkan untuk perangkat mobile (≥320px), tablet, hingga desktop lebar dengan target sentuh minimal 44px.

---

## 📜 API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `POST` | `/register` | Registrasi akun warga baru | Publik |
| `POST` | `/login` | Login (email/nomor HP + password) | Publik |
| `POST` | `/oauth-sync` | Sinkronisasi sesi Google OAuth ke backend | Publik |
| `POST` | `/forgot-password` | Kirim email reset password | Publik |
| `PATCH` | `/profile/leaderboard` | Update pengaturan leaderboard | User |
| `GET` | `/users` | Daftar semua profil pengguna | Admin |

### Reports (`/api/reports`)

| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `GET` | `/public` | Laporan publik (peta & landing page) | Publik |
| `GET` | `/stats/public` | Statistik publik | Publik |
| `GET` | `/leaderboard` | Data leaderboard | Publik |
| `POST` | `/` | Buat laporan baru | User |
| `GET` | `/` | Laporan milik user | User |
| `POST` | `/find-similar` | Cari laporan serupa | User |
| `POST` | `/:id/support` | Toggle dukungan laporan | User |
| `GET` | `/:id/supporters` | Daftar pendukung laporan | User |
| `GET` | `/admin` | Semua laporan (admin view) | Admin |
| `GET` | `/admin/notifications` | Notifikasi admin | Admin |
| `PATCH` | `/:id/status` | Update status laporan | Admin |

### Testimonials (`/api/testimonials`)

| Method | Endpoint | Deskripsi | Akses |
|---|---|---|---|
| `GET` | `/` | Daftar ulasan publik | Publik |
| `POST` | `/` | Kirim ulasan baru | User |

---

## 📄 Lisensi

Hak cipta © 2026 Peduli Negeri. Seluruh hak dilindungi undang-undang.
