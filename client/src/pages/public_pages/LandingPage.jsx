import React, { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import brandLogo from "../../assets/PeduliNegeri (4).png";
import communityIllustration from "../../assets/PeduliNegeri (4).png";

const REPORT_TYPES = [
  "Infrastruktur",
  "Fasilitas umum",
  "Lingkungan",
  "Lainnya",
];

const REPORT_STEPS = [
  {
    number: "01",
    title: "Ceritakan kondisi",
    description: "Jelaskan masalah dan lokasi yang perlu mendapat perhatian.",
  },
  {
    number: "02",
    title: "Kirim laporan",
    description: "Informasi diteruskan agar dapat ditinjau oleh pihak terkait.",
  },
  {
    number: "03",
    title: "Pantau tindak lanjut",
    description: "Lihat perubahan status laporan melalui akun Anda.",
  },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
        <nav
          aria-label="Navigasi utama"
          className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"
        >
          <Link to="/" aria-label="Peduli Negeri, beranda" onClick={closeMenu}>
            <img
              src={brandLogo}
              alt="Peduli Negeri"
              className="h-12 w-48 object-contain"
            />
          </Link>

          <div className="hidden items-center gap-7 text-sm md:flex">
            <a className="font-semibold text-coral-deep" href="#beranda">
              Beranda
            </a>
            <a className="text-muted transition-colors hover:text-ink" href="#alur">
              Cara Melapor
            </a>
            <a className="text-muted transition-colors hover:text-ink" href="#kategori">
              Kategori
            </a>
            <a className="text-muted transition-colors hover:text-ink" href="#tentang">
              Tentang
            </a>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/login"
              className="inline-flex min-h-10 items-center justify-center rounded border border-ink px-4 text-sm font-semibold transition-colors hover:bg-cream"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="inline-flex min-h-10 items-center justify-center rounded bg-coral px-4 text-sm font-semibold text-ink transition-colors hover:bg-apricot"
            >
              Daftar
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded text-ink hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-periwinkle-deep md:hidden"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-line bg-surface px-5 py-4 md:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-1">
              <a className="rounded px-3 py-3 text-sm" href="#alur" onClick={closeMenu}>
                Cara Melapor
              </a>
              <a className="rounded px-3 py-3 text-sm" href="#kategori" onClick={closeMenu}>
                Kategori
              </a>
              <a className="rounded px-3 py-3 text-sm" href="#tentang" onClick={closeMenu}>
                Tentang
              </a>
              <div className="mt-2 flex gap-2 border-t border-line pt-4">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex min-h-11 flex-1 items-center justify-center rounded border border-ink text-sm font-semibold"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="flex min-h-11 flex-1 items-center justify-center rounded bg-coral text-sm font-semibold"
                >
                  Daftar
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <section
          id="beranda"
          className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-20"
        >
          <div className="max-w-xl">
            <p className="mb-4 text-sm font-semibold text-coral-deep">
              Suara Anda, perubahan untuk negeri
            </p>
            <h1 className="font-sans text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Bersama wujudkan Indonesia yang lebih baik.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted">
              Sampaikan aspirasi dan laporkan kendala di lingkungan sekitar.
              Pantau perkembangan laporan Anda melalui satu tempat.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex min-h-12 items-center gap-2 rounded bg-coral px-5 text-sm font-semibold text-ink transition-colors hover:bg-apricot focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral-deep"
              >
                Laporkan Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#alur"
                className="inline-flex min-h-12 items-center rounded border border-ink px-5 text-sm font-semibold transition-colors hover:bg-cream"
              >
                Pelajari Alurnya
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="flex aspect-[1.15/1] items-center justify-center overflow-hidden rounded bg-apricot p-5 sm:p-8">
              <img
                src={communityIllustration}
                alt="Ilustrasi warga bekerja sama"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="relative mx-4 -mt-16 rounded border border-line bg-surface p-4 shadow-lg sm:mx-8 sm:p-5">
              <div className="flex items-center justify-between gap-4 border-b border-line pb-3 text-xs text-muted">
                <span>Alur laporan</span>
                <span className="rounded-full bg-apricot px-2.5 py-1 font-medium text-coral-deep">
                  Dapat dipantau
                </span>
              </div>
              <h2 className="mt-3 text-base font-semibold">Dari aspirasi menuju tindak lanjut</h2>
              <div className="mt-3 grid grid-cols-4 gap-1" aria-hidden="true">
                <span className="h-1 rounded-full bg-coral-deep" />
                <span className="h-1 rounded-full bg-coral-deep" />
                <span className="h-1 rounded-full bg-apricot" />
                <span className="h-1 rounded-full bg-line" />
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-muted">
                <span>Diterima</span>
                <span>Ditinjau</span>
                <span>Ditangani</span>
                <span>Selesai</span>
              </div>
            </div>
          </div>
        </section>

        <section id="alur" className="border-y border-line bg-cream">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
            <div className="mb-8 max-w-xl">
              <p className="text-sm font-semibold text-coral-deep">Langkah sederhana</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Cara menyampaikan laporan</h2>
            </div>
            <ol className="grid gap-7 sm:grid-cols-3 sm:gap-5">
              {REPORT_STEPS.map((step) => (
                <li key={step.number} className="border-t-2 border-ink pt-4">
                  <span className="font-mono text-xs text-coral-deep">{step.number}</span>
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="kategori" className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-coral-deep">Ruang partisipasi</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Hal yang bisa dilaporkan</h2>
            </div>
            <Link to="/register" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-periwinkle-deep hover:underline">
              Buat laporan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-7 grid border-y border-line sm:grid-cols-2 lg:grid-cols-4">
            {REPORT_TYPES.map((reportType) => (
              <li key={reportType} className="border-b border-line py-4 text-sm font-semibold sm:px-4 lg:border-b-0 lg:border-r last:lg:border-r-0">
                {reportType}
              </li>
            ))}
          </ul>
        </section>

        <section id="tentang" className="bg-ink text-surface">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 sm:py-14 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold sm:text-3xl">Peduli Negeri dimulai dari kepedulian bersama.</h2>
              <p className="mt-3 text-sm leading-6 text-surface/75">
                Gunakan portal ini untuk menyampaikan kondisi di sekitar Anda dan mengikuti perkembangan laporan yang telah dikirim.
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded bg-coral px-5 text-sm font-semibold text-ink hover:bg-apricot"
            >
              Mulai melapor <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-ink text-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-7 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <img src={brandLogo} alt="Peduli Negeri" className="h-10 w-40 object-contain" />
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-surface/75">
            <Link to="/login" className="hover:text-surface">Masuk</Link>
            <Link to="/register" className="hover:text-surface">Daftar</Link>
            <a href="#alur" className="hover:text-surface">Cara Melapor</a>
            <a href="#kategori" className="hover:text-surface">Kategori</a>
          </div>
          <span className="text-surface/60">Peduli Negeri</span>
        </div>
      </footer>
    </div>
  );
}