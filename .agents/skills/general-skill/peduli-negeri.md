# Rule Agent: Peduli Negeri

Peduli Negeri adalah website pelaporan (fullstack). Folder `client/` berisi frontend (Vite), `server/` berisi backend, `database/` berisi skema dan migrasi, dan Supabase dipakai sebagai backend/database. Ikuti rule ini di setiap tugas. Jika rule bertabrakan dengan permintaan user, sebutkan benturannya dan tanyakan dulu.

Prioritas: (1) Privasi dan keamanan, (2) Tidak AI slop, (3) Kebenaran dan kualitas kode, (4) Kecepatan.

---

## 1. PRIVASI FILE (WAJIB, TIDAK BOLEH DILANGGAR)

### Jangan dibuka, dibaca, di-grep, di-cat, atau diubah tanpa izin eksplisit:
- `.env`, `.env.local`, `.env.*` (KECUALI `.env.example`, yang boleh dibaca)
- Kunci dan kredensial: `*.pem`, `*.key`, `*.p12`, `id_rsa*`, `*credentials*`, `*secret*`, `service-account*.json`, `.npmrc` yang berisi token
- Folder di luar root proyek: `Documents`, `Downloads`, `Desktop`, `AppData`, `.ssh`, `.aws`, `.config`, home directory user
- Dump database, backup, atau ekspor yang berisi data asli pelapor/pengguna
- File upload pengguna, foto bukti laporan, dan data pribadi apa pun
- Riwayat browser, password manager, token sesi

### Aturan perilaku:
1. Kalau tugas benar-benar butuh file sensitif, BERHENTI dan tanya dulu. Sebutkan file apa, kenapa perlu, dan apa yang akan dilakukan. Tunggu persetujuan.
2. Untuk mengetahui variabel environment yang dibutuhkan, baca `.env.example`, bukan `.env`. Kalau ada variabel baru, tambahkan ke `.env.example` dengan nilai kosong atau placeholder jelas (`isi_dengan_url_supabase`).
3. Jangan menjalankan perintah yang menampilkan secret: `cat .env`, `type .env`, `printenv`, `env`, `set`, `Get-Content .env`, atau sejenisnya.
4. Jangan pernah menulis secret asli ke kode, komentar, log, commit, dokumentasi, atau output chat.
5. Pastikan `.env*` (selain `.env.example`) ada di `.gitignore`. Jika belum, usulkan perbaikannya.
6. Jangan mencari file di luar folder proyek. Kerja hanya di dalam `project-WIA/`.
7. Jangan mengirim isi file proyek ke layanan eksternal (upload, paste ke situs, curl ke URL pihak ketiga) tanpa izin.
8. Jika tidak sengaja melihat secret, jangan ulangi isinya. Beri tahu user supaya merotasi key tersebut.

---

## 2. TIDAK AI SLOP

AI slop adalah hasil generik, berlebihan, dan tidak dipikirkan, yang terlihat dan terasa "dibuat otomatis". Hindari semuanya.

### Desain dan UI
- Jangan pakai gaya default AI: gradien ungu-biru, kartu glassmorphism berlebihan, glow neon, blob dekoratif tanpa fungsi, hero section klise ("Revolutionize...", "Seamless...").
- Jangan pakai emoji sebagai ikon UI. Pakai satu set ikon konsisten (misalnya lucide) atau SVG.
- Jangan pakai font default sistem tanpa alasan. Tentukan tipografi (maksimal 2 font) dan skala ukuran yang konsisten.
- Tetapkan design tokens (warna, spacing, radius, shadow, font) di satu tempat (CSS variables / konfigurasi tema) dan pakai terus. Jangan hardcode warna atau spacing acak di tiap komponen.
- Desain harus sesuai tujuan: website pelaporan publik harus terasa terpercaya, jelas, dan mudah dipakai semua kalangan, bukan landing page startup.
- Setiap halaman wajib punya state nyata: loading, kosong, error, dan sukses. Bukan hanya "happy path".
- Responsif mobile-first (banyak pelapor memakai HP), dengan target sentuh minimal 44px.
- Aksesibilitas: HTML semantik, label form, kontras warna cukup (WCAG AA), navigasi keyboard, `alt` bermakna, fokus terlihat.
- Jangan buat dekorasi yang tidak berfungsi (animasi berlebihan, partikel, statistik palsu).

### Konten dan teks
- Dilarang `lorem ipsum`, "Your Title Here", "John Doe", data tiruan yang tampil seolah asli.
- Tidak boleh ada angka, testimoni, logo mitra, atau statistik karangan. Kalau data belum ada, tampilkan state kosong yang jujur atau tandai jelas sebagai placeholder sementara.
- Teks antarmuka memakai bahasa Indonesia yang natural, singkat, dan jelas. Hindari bahasa marketing kosong ("solusi inovatif", "revolusioner", "tingkatkan pengalaman Anda").
- Pesan error harus spesifik dan memberi langkah lanjut, bukan "Terjadi kesalahan".

### Kode
- Jangan menulis kode yang tidak dipakai, fitur spekulatif, atau abstraksi berlebihan "untuk jaga-jaga". Selesaikan yang diminta saja.
- Komentar hanya untuk menjelaskan KENAPA, bukan APA. Jangan komentar yang mengulang isi kode.
- Jangan mengarang package, fungsi, endpoint, atau opsi API. Cek dokumentasi atau kode yang sudah ada. Jika tidak yakin, katakan tidak yakin.
- Jangan menyalin pola dari tutorial generik. Ikuti konvensi yang sudah ada di repo ini (struktur folder, penamaan, gaya).
- Nama variabel dan fungsi harus bermakna. Dilarang `data1`, `temp`, `handleStuff`.
- Hindari file raksasa. Pecah komponen/modul berdasarkan tanggung jawab.
- Jangan tambahkan dependency baru jika bisa diselesaikan dengan yang sudah ada. Jika perlu, jelaskan alasannya dulu.
- Jangan menyisakan `console.log` debug, `TODO` tanpa konteks, atau kode yang di-comment-out.

### Jawaban dan laporan ke user
- Singkat, jujur, spesifik. Tanpa basa-basi dan pujian berlebihan.
- Jangan klaim "sudah selesai" atau "sudah berhasil" kalau belum benar-benar dijalankan dan dicek.

---

## 3. DATA PELAPOR (spesifik proyek ini)

Aplikasi ini menyimpan laporan dan identitas orang. Perlakukan sebagai data sensitif.

- Kumpulkan data pribadi seminimal mungkin. Tanyakan: apakah field ini benar-benar dibutuhkan?
- Dukung opsi pelaporan anonim jika sesuai kebutuhan tim. Tanyakan ke user kalau belum jelas.
- Jangan pernah mencatat (log) data pribadi, isi laporan, token, atau password.
- Data seed, contoh, dan test harus 100% fiktif. Jangan pakai data asli.
- Data pelapor tidak boleh bocor lewat URL, query string, pesan error, atau response API yang berlebihan.
- Foto/dokumen bukti: validasi tipe dan ukuran, simpan di storage dengan akses terkontrol, dan pertimbangkan penghapusan metadata (EXIF/lokasi).

---

## 4. KEAMANAN FULLSTACK

- Semua validasi input dilakukan di server. Validasi di client hanya untuk UX.
- Aktifkan Row Level Security (RLS) di setiap tabel Supabase dan tulis policy yang eksplisit. Jangan menonaktifkan RLS demi "supaya jalan".
- Key `service_role` dan secret lain HANYA di server. Jangan pernah ada di `client/` atau bundle frontend. Hanya `anon` key (publik) yang boleh di client.
- Gunakan query berparameter / query builder. Jangan menyusun SQL dari string input.
- Cegah XSS: jangan pakai `dangerouslySetInnerHTML`/`innerHTML` dengan input pengguna tanpa sanitasi.
- Autentikasi dan otorisasi diperiksa di server untuk setiap endpoint yang sensitif. Jangan percaya role yang dikirim dari client.
- Terapkan rate limiting pada endpoint publik (terutama submit laporan) untuk mencegah spam.
- Konfigurasi CORS ketat. Jangan `*` untuk endpoint yang memakai kredensial.
- Upload file: batasi tipe MIME, ukuran, dan ganti nama file. Jangan percaya ekstensi dari client.
- Jangan ekspos stack trace atau detail internal ke pengguna.
- Perhatikan header keamanan dan cookie (HttpOnly, Secure, SameSite) bila memakai cookie.

---

## 5. ARSITEKTUR DAN KODE

- Pisahkan tanggung jawab: UI di `client/src` (komponen), akses API di `client/services`, routing di `client/routes`, logika bisnis di `server/`, skema dan migrasi di `database/`.
- Perubahan skema database hanya lewat file migrasi di `database/`. Jangan mengubah skema manual tanpa jejak.
- Definisikan kontrak API yang konsisten (bentuk request, response sukses, response error beserta kode status yang benar).
- Validasi variabel environment saat startup, dan gagal dengan pesan jelas bila ada yang hilang.
- Tangani semua error async (try/catch, state error di UI). Jangan menelan error diam-diam.
- Ikuti konfigurasi ESLint yang ada. Kode yang ditulis harus lolos lint tanpa menonaktifkan rule.
- Perhatikan performa: lazy load route/komponen berat, optimalkan gambar, hindari re-render dan query N+1.
- Gunakan Skill `supabase-server` di `.agents/skills/` bila tugas menyangkut Supabase.

---

## 6. CARA KERJA

1. Baca dulu kode yang relevan sebelum mengubah apa pun. Pahami pola yang sudah ada.
2. Untuk tugas besar atau ambigu, ajukan rencana singkat dan tanya hal yang belum jelas SEBELUM menulis kode. Untuk tugas kecil, langsung kerjakan.
3. Buat perubahan sekecil dan sefokus mungkin. Jangan refactor atau ubah file di luar lingkup tugas.
4. Setelah mengubah kode, verifikasi: jalankan lint, build, dan (bila ada) test. Lihat hasilnya, jangan menebak.
5. Jangan menjalankan perintah destruktif tanpa konfirmasi eksplisit: `rm -rf`, `git reset --hard`, `git clean`, `git push --force`, `DROP TABLE`, `TRUNCATE`, menghapus data atau migrasi.
6. Jangan `git commit` atau `git push` kecuali diminta. Jika diminta, gunakan pesan commit yang jelas dan spesifik.
7. Jangan menjalankan atau menghentikan server dev yang sedang berjalan di terminal tanpa perlu. Terminal `server` dan `client` mungkin sedang dipakai tim.
8. Jangan mengubah `package-lock.json`, `skills-lock.json`, atau konfigurasi build kecuali memang diperlukan oleh tugas.
9. Jika ada hal yang tidak bisa dipastikan (versi library, perilaku API, keputusan desain), tanyakan atau katakan terus terang. Jangan menebak lalu menyajikannya sebagai fakta.

---

## 7. FORMAT LAPORAN SETELAH SELESAI

Tulis singkat:
- Apa yang diubah (file dan intinya)
- Cara memverifikasi / hasil pengecekan yang sudah dijalankan
- Hal yang belum selesai, risiko, atau keputusan yang butuh persetujuan tim
