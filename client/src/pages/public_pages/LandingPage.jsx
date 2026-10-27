import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  Check,
  ChevronRight,
  ClipboardList,
  HeartHandshake,
  MapPin,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";

const reports = [
  {
    category: "Infrastruktur",
    title: "Jalan dan fasilitas umum",
    description: "Jalan rusak, lampu jalan, dan fasilitas publik.",
  },
  {
    category: "Lingkungan",
    title: "Kebersihan lingkungan",
    description: "Sampah menumpuk, saluran air, dan ruang hijau.",
  },
  {
    category: "Pelayanan Publik",
    title: "Layanan masyarakat",
    description: "Akses dan kualitas pelayanan publik.",
  },
  {
    category: "Pendidikan",
    title: "Fasilitas pendidikan",
    description: "Sarana belajar yang perlu perhatian.",
  },
  {
    category: "Kesehatan",
    title: "Layanan kesehatan",
    description: "Fasilitas dan akses layanan kesehatan.",
  },
];

const steps = [
  ["Daftar / Masuk", "Buat akun atau masuk ke akun yang sudah ada."],
  ["Pilih Kategori", "Tentukan jenis laporan yang ingin disampaikan."],
  ["Isi Detail Laporan", "Lengkapi informasi dan unggah bukti pendukung."],
  ["Kirim Laporan", "Laporan diteruskan ke pihak terkait."],
  ["Pantau Perkembangan", "Lihat pembaruan status laporan Anda."],
];

const benefits = [
  ["Laporan Beragam", "Pilih kategori yang sesuai dengan masalah di sekitar."],
  ["Aman & Tepercaya", "Informasi laporan digunakan untuk tindak lanjut."],
  ["Status Terpantau", "Pantau perkembangan laporan melalui akun Anda."],
  ["Kolaborasi Warga", "Sampaikan aspirasi untuk lingkungan yang lebih baik."],
];

const styles = `
  .landing-page {
    --lp-cream: #fdebe0;
    --lp-apricot: #fcd5a8;
    --lp-coral: #f7a581;
    --lp-coral-deep: #a14a30;
    --lp-ink: #1f2433;
    --lp-muted: #5c6070;
    --lp-surface: #fff6ef;
    --lp-line: #ecd6c8;
    background: var(--lp-surface);
    color: var(--lp-ink);
    font-family: var(--font-sans), Inter, sans-serif;
  }
  .landing-page * { box-sizing: border-box; }
  .landing-page a { color: inherit; text-decoration: none; }
  .landing-page button { font: inherit; }
  .lp-container { width: min(1120px, calc(100% - 48px)); margin: 0 auto; }
  .lp-header {
    position: sticky; top: 0; z-index: 20; background: rgba(253, 235, 224, .96);
    border-bottom: 1px solid rgba(236, 214, 200, .8); backdrop-filter: blur(12px);
  }
  .lp-nav { height: 66px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
  .lp-brand { display: inline-flex; align-items: center; gap: 9px; font-size: 15px; font-weight: 700; white-space: nowrap; }
  .lp-brand-mark { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 5px; background: var(--lp-ink); color: var(--lp-surface); }
  .lp-links { display: flex; align-items: center; gap: 28px; color: var(--lp-muted); font-size: 12px; }
  .lp-links a { padding: 25px 0 22px; border-bottom: 2px solid transparent; }
  .lp-links a:hover, .lp-links a:focus-visible { color: var(--lp-ink); border-color: var(--lp-coral-deep); }
  .lp-nav-actions { display: flex; align-items: center; gap: 10px; }
  .lp-button { min-height: 44px; padding: 0 18px; border: 1px solid var(--lp-ink); border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; gap: 9px; font-size: 13px; font-weight: 650; transition: background .18s ease, transform .18s ease; }
  .lp-button:hover { transform: translateY(-1px); }
  .lp-button:focus-visible, .lp-menu-button:focus-visible, .lp-links a:focus-visible { outline: 3px solid #4a5f8f; outline-offset: 3px; }
  .lp-button-primary { border-color: var(--lp-coral); background: var(--lp-coral); color: var(--lp-ink); }
  .lp-button-primary:hover { background: #f39770; }
  .lp-button-dark { border-color: var(--lp-ink); background: var(--lp-ink); color: white; }
  .lp-button-outline { background: transparent; }
  .lp-menu-button { display: none; min-width: 44px; min-height: 44px; border: 1px solid var(--lp-line); border-radius: 4px; background: transparent; color: var(--lp-ink); }
  .lp-hero { padding: 82px 0 76px; background: var(--lp-cream); }
  .lp-hero-grid { display: grid; grid-template-columns: 1fr .95fr; align-items: center; gap: 72px; }
  .lp-eyebrow { margin: 0 0 17px; color: var(--lp-coral-deep); font-size: 13px; font-weight: 600; }
  .lp-hero h1 { max-width: 600px; margin: 0; font-size: clamp(38px, 5vw, 58px); line-height: 1.06; letter-spacing: -2px; font-weight: 750; }
  .lp-hero-copy { max-width: 540px; margin: 21px 0 25px; color: var(--lp-muted); font-size: 15px; line-height: 1.75; }
  .lp-hero-actions { display: flex; flex-wrap: wrap; gap: 12px; }
  .lp-preview-wrap { position: relative; max-width: 490px; margin-left: auto; width: 100%; }
  .lp-photo-placeholder { min-height: 245px; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 28px; border-radius: 5px; background: var(--lp-apricot); color: var(--lp-ink); text-align: center; }
  .lp-photo-placeholder svg { margin-bottom: 12px; }
  .lp-photo-placeholder p { max-width: 280px; margin: 0; font-size: 13px; line-height: 1.6; }
  .lp-report-preview { position: relative; width: calc(100% - 36px); margin: -38px auto 0; padding: 15px 18px 17px; border: 1px solid var(--lp-line); border-radius: 5px; background: var(--lp-surface); box-shadow: 0 14px 35px rgba(31, 36, 51, .08); }
  .lp-preview-meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: var(--lp-muted); font-size: 10px; }
  .lp-status { display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 20px; background: var(--lp-cream); color: var(--lp-coral-deep); font-size: 10px; font-weight: 600; }
  .lp-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--lp-coral-deep); }
  .lp-preview-title { margin: 15px 0 4px; font-size: 15px; font-weight: 700; }
  .lp-preview-address { margin: 0; display: flex; align-items: center; gap: 5px; color: var(--lp-muted); font-size: 11px; }
  .lp-progress { display: flex; height: 4px; margin: 13px 0 8px; background: var(--lp-line); }
  .lp-progress span { width: 72%; background: var(--lp-coral-deep); }
  .lp-progress-labels { display: flex; justify-content: space-between; color: var(--lp-muted); font-size: 9px; }
  .lp-illustration-note { margin: 11px 0 0; color: var(--lp-muted); text-align: center; font-size: 10px; }
  .lp-highlights { background: var(--lp-apricot); }
  .lp-highlights-grid { display: grid; grid-template-columns: repeat(4, 1fr); }
  .lp-highlight { min-height: 112px; padding: 23px 20px; border-right: 1px solid rgba(161, 74, 48, .13); }
  .lp-highlight:last-child { border-right: 0; }
  .lp-highlight strong { display: block; margin-bottom: 8px; font-size: 15px; }
  .lp-highlight span { display: block; color: #5c4c45; font-size: 11px; line-height: 1.5; }
  .lp-section { padding: 76px 0; }
  .lp-section-heading { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 29px; }
  .lp-section h2, .lp-about h2, .lp-how h2 { margin: 0; font-size: clamp(25px, 3vw, 32px); line-height: 1.2; letter-spacing: -.7px; }
  .lp-section-intro { max-width: 570px; margin: 10px 0 0; color: var(--lp-muted); font-size: 13px; line-height: 1.7; }
  .lp-text-link { display: inline-flex; align-items: center; gap: 7px; color: #4a5f8f; font-size: 12px; font-weight: 600; white-space: nowrap; }
  .lp-text-link:hover { text-decoration: underline; }
  .lp-report-list { border-top: 1px solid var(--lp-line); }
  .lp-report-row { display: grid; grid-template-columns: 40px 145px minmax(0, 1fr) 175px 100px; align-items: center; gap: 16px; min-height: 72px; border-bottom: 1px solid var(--lp-line); }
  .lp-row-number, .lp-row-time { color: var(--lp-muted); font-size: 11px; }
  .lp-category { justify-self: start; padding: 5px 9px; border: 1px solid #bac4d7; color: #4a5f8f; font-size: 10px; }
  .lp-row-title { font-size: 13px; font-weight: 650; }
  .lp-row-detail { color: var(--lp-muted); font-size: 10px; line-height: 1.4; }
  .lp-empty-state { padding: 28px 20px; border: 1px dashed #d5b9a8; background: rgba(255,255,255,.32); color: var(--lp-muted); text-align: center; font-size: 13px; line-height: 1.6; }
  .lp-empty-state strong { display: block; margin-bottom: 4px; color: var(--lp-ink); }
  .lp-about { padding: 78px 0 72px; background: var(--lp-cream); }
  .lp-about-top { display: grid; grid-template-columns: .65fr 1.35fr; gap: 70px; }
  .lp-about-copy h3 { max-width: 650px; margin: 0; font-size: 20px; line-height: 1.55; font-weight: 600; }
  .lp-about-copy p { margin: 14px 0 21px; color: var(--lp-muted); font-size: 13px; line-height: 1.7; }
  .lp-about-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin-top: 55px; }
  .lp-about-feature { padding-top: 15px; border-top: 2px solid #7d756f; }
  .lp-about-feature strong { display: block; margin-bottom: 7px; font-size: 14px; }
  .lp-about-feature span { color: var(--lp-muted); font-size: 12px; line-height: 1.6; }
  .lp-how { padding: 78px 0; background: var(--lp-ink); color: #fff6ef; }
  .lp-how-grid { display: grid; grid-template-columns: .75fr 1.25fr; gap: 74px; }
  .lp-how-copy p { margin: 17px 0; max-width: 300px; color: #d3d0d1; font-size: 13px; line-height: 1.7; }
  .lp-how-copy .lp-text-link { color: var(--lp-coral); }
  .lp-steps { border-top: 1px solid rgba(255,255,255,.15); }
  .lp-step { display: grid; grid-template-columns: 40px 1fr; gap: 14px; padding: 17px 0; border-bottom: 1px solid rgba(255,255,255,.15); }
  .lp-step-number { color: var(--lp-coral); font-size: 19px; font-weight: 700; }
  .lp-step strong { display: block; margin-bottom: 5px; font-size: 14px; }
  .lp-step span { color: #d3d0d1; font-size: 11px; }
  .lp-benefits { padding: 75px 0; }
  .lp-benefits h2 { margin-bottom: 30px; }
  .lp-benefit-grid { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid var(--lp-line); border-radius: 4px; }
  .lp-benefit { min-height: 125px; padding: 22px; border-right: 1px solid var(--lp-line); }
  .lp-benefit:last-child { border-right: 0; }
  .lp-benefit-icon { width: 30px; height: 30px; display: grid; place-items: center; margin-bottom: 14px; border-radius: 4px; background: var(--lp-cream); color: var(--lp-coral-deep); }
  .lp-benefit strong { display: block; margin-bottom: 8px; font-size: 14px; }
  .lp-benefit p { margin: 0; color: var(--lp-muted); font-size: 11px; line-height: 1.6; }
  .lp-community { padding: 75px 0; background: var(--lp-cream); }
  .lp-community-panel { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 24px; padding: 30px; border: 1px solid #eed9ca; background: var(--lp-surface); }
  .lp-community-panel h3 { margin: 0 0 8px; font-size: 19px; }
  .lp-community-panel p { margin: 0; color: var(--lp-muted); font-size: 13px; line-height: 1.6; }
  .lp-cta { padding: 32px 0; background: var(--lp-coral); }
  .lp-cta-inner { display: flex; align-items: center; justify-content: space-between; gap: 22px; }
  .lp-cta h2 { margin: 0 0 7px; font-size: 24px; }
  .lp-cta p { margin: 0; font-size: 13px; }
  .lp-footer { padding: 48px 0 20px; background: var(--lp-ink); color: #fff6ef; }
  .lp-footer-grid { display: grid; grid-template-columns: 1.7fr 1fr 1fr 1fr; gap: 28px; }
  .lp-footer-brand p { max-width: 220px; margin: 12px 0; color: #c9c7cd; font-size: 11px; line-height: 1.6; }
  .lp-footer-title { margin: 0 0 14px; font-size: 11px; }
  .lp-footer-links { display: grid; gap: 11px; }
  .lp-footer-links a { color: #d3d0d1; font-size: 11px; }
  .lp-footer-links a:hover { color: var(--lp-coral); }
  .lp-footer-bottom { display: flex; justify-content: space-between; gap: 18px; margin-top: 42px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,.14); color: #c9c7cd; font-size: 10px; }
  .lp-legal { display: flex; gap: 18px; }
  @media (max-width: 800px) {
    .lp-container { width: min(100% - 36px, 680px); }
    .lp-links { gap: 16px; }
    .lp-links a { font-size: 11px; }
    .lp-hero { padding: 60px 0; }
    .lp-hero-grid { gap: 32px; }
    .lp-hero h1 { font-size: clamp(34px, 6vw, 48px); }
    .lp-report-row { grid-template-columns: 30px 115px minmax(0,1fr) 110px; gap: 10px; }
    .lp-row-time { display: none; }
    .lp-about-top, .lp-how-grid { gap: 36px; }
    .lp-benefit { padding: 17px; }
  }
  @media (max-width: 620px) {
    .lp-container { width: calc(100% - 36px); }
    .lp-nav { height: 62px; }
    .lp-menu-button { display: grid; place-items: center; }
    .lp-nav-actions { margin-left: auto; }
    .lp-nav-actions .lp-button { min-height: 40px; padding: 0 12px; font-size: 12px; }
    .lp-links { position: absolute; top: 61px; left: 0; right: 0; display: none; padding: 10px 18px 16px; border-bottom: 1px solid var(--lp-line); background: var(--lp-cream); }
    .lp-links.is-open { display: grid; gap: 0; }
    .lp-links a { padding: 13px 4px; border-bottom: 1px solid var(--lp-line); }
    .lp-hero { padding: 49px 0 55px; }
    .lp-hero-grid { grid-template-columns: 1fr; gap: 38px; }
    .lp-eyebrow { margin-bottom: 12px; font-size: 12px; }
    .lp-hero h1 { max-width: 500px; font-size: clamp(37px, 11vw, 50px); letter-spacing: -1.6px; }
    .lp-hero-copy { margin: 16px 0 20px; font-size: 14px; }
    .lp-preview-wrap { max-width: 460px; margin: 0 auto; }
    .lp-photo-placeholder { min-height: 210px; }
    .lp-highlights-grid { grid-template-columns: repeat(2, 1fr); }
    .lp-highlight { min-height: 94px; padding: 17px; border-bottom: 1px solid rgba(161, 74, 48, .13); }
    .lp-highlight:nth-child(2) { border-right: 0; }
    .lp-highlight:nth-child(n+3) { border-bottom: 0; }
    .lp-section, .lp-about, .lp-how, .lp-benefits, .lp-community { padding: 55px 0; }
    .lp-section-heading { align-items: start; flex-direction: column; gap: 12px; margin-bottom: 22px; }
    .lp-section h2, .lp-about h2, .lp-how h2 { font-size: 27px; }
    .lp-report-row { grid-template-columns: 27px 1fr auto; gap: 8px; padding: 12px 0; }
    .lp-category { grid-column: 2; grid-row: 1; }
    .lp-row-title { grid-column: 2; grid-row: 2; font-size: 12px; }
    .lp-row-detail { grid-column: 2 / 4; grid-row: 3; }
    .lp-row-number { grid-column: 1; grid-row: 1 / 4; align-self: start; padding-top: 4px; }
    .lp-about-top, .lp-how-grid { grid-template-columns: 1fr; gap: 20px; }
    .lp-about-copy h3 { font-size: 18px; }
    .lp-about-features { grid-template-columns: 1fr; gap: 20px; margin-top: 35px; }
    .lp-about-feature { padding-top: 12px; }
    .lp-step { grid-template-columns: 32px 1fr; padding: 15px 0; }
    .lp-benefit-grid { grid-template-columns: repeat(2, 1fr); }
    .lp-benefit { min-height: 135px; border-bottom: 1px solid var(--lp-line); }
    .lp-benefit:nth-child(2) { border-right: 0; }
    .lp-benefit:nth-child(n+3) { border-bottom: 0; }
    .lp-community-panel { grid-template-columns: 1fr; padding: 22px; }
    .lp-cta-inner { align-items: flex-start; flex-direction: column; }
    .lp-cta h2 { font-size: 21px; }
    .lp-footer-grid { grid-template-columns: repeat(2, 1fr); gap: 30px 20px; }
    .lp-footer-brand { grid-column: 1 / -1; }
    .lp-footer-bottom { flex-direction: column; margin-top: 30px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .landing-page *, .landing-page *::before, .landing-page *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
  }
`;

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="landing-page">
      <style>{styles}</style>
      <header className="lp-header">
        <nav className="lp-container lp-nav" aria-label="Navigasi utama">
          <Link className="lp-brand" to="/" onClick={closeMenu}>
            <span className="lp-brand-mark" aria-hidden="true">
              <HeartHandshake size={18} />
            </span>
            <span>Peduli Negeri</span>
          </Link>
          <div className={`lp-links${menuOpen ? " is-open" : ""}`}>
            <a href="#beranda" onClick={closeMenu}>Beranda</a>
            <a href="#laporan" onClick={closeMenu}>Laporan</a>
            <a href="#tentang" onClick={closeMenu}>Tentang Kami</a>
            <a href="#cara-melapor" onClick={closeMenu}>Bantuan</a>
          </div>
          <div className="lp-nav-actions">
            <Link className="lp-button lp-button-outline" to="/login">Masuk</Link>
            <Link className="lp-button lp-button-primary" to="/login">Daftar</Link>
            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
              className="lp-menu-button"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section className="lp-hero" id="beranda">
          <div className="lp-container lp-hero-grid">
            <div>
              <p className="lp-eyebrow">Suara Anda, Perubahan untuk Negeri</p>
              <h1>Bersama Wujudkan Indonesia yang Lebih Baik</h1>
              <p className="lp-hero-copy">
                Peduli Negeri adalah platform pelaporan masyarakat untuk
                menyampaikan aspirasi, keluhan, dan laporan terkait berbagai
                permasalahan di lingkungan sekitar.
              </p>
              <div className="lp-hero-actions">
                <Link className="lp-button lp-button-primary" to="/laporan/baru">
                  Laporkan Sekarang <ArrowRight size={16} />
                </Link>
                <a className="lp-button lp-button-outline" href="#tentang">
                  Pelajari Lebih Lanjut
                </a>
              </div>
            </div>
            <div className="lp-preview-wrap" aria-label="Ilustrasi tampilan laporan">
              <div className="lp-photo-placeholder">
                <Camera size={22} />
                <p>
                  Ilustrasi bukti foto laporan. Sertakan foto yang jelas saat
                  menyampaikan laporan.
                </p>
              </div>
              <div className="lp-report-preview">
                <div className="lp-preview-meta">
                  <span>Contoh tampilan laporan</span>
                  <span className="lp-status"><i className="lp-status-dot" />Status diperbarui</span>
                </div>
                <p className="lp-preview-title">Laporan Anda dapat dipantau</p>
                <p className="lp-preview-address"><MapPin size={12} /> Perkembangan ditampilkan di akun Anda</p>
                <div className="lp-progress" aria-hidden="true"><span /></div>
                <div className="lp-progress-labels">
                  <span>Diterima</span><span>Diverifikasi</span><span>Ditindaklanjuti</span><span>Selesai</span>
                </div>
              </div>
              <p className="lp-illustration-note">Ilustrasi, bukan data laporan aktual.</p>
            </div>
          </div>
        </section>

        <section aria-label="Kategori laporan" className="lp-highlights">
          <div className="lp-container lp-highlights-grid">
            {reports.slice(0, 4).map((report) => (
              <div className="lp-highlight" key={report.category}>
                <strong>{report.category}</strong>
                <span>{report.description}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="lp-section" id="laporan">
          <div className="lp-container">
            <div className="lp-section-heading">
              <div>
                <h2>Isu yang Sedang Jadi Perhatian</h2>
                <p className="lp-section-intro">
                  Laporan yang masuk akan ditampilkan di sini setelah tersedia.
                  Saat ini, data laporan publik belum tersedia.
                </p>
              </div>
              <Link className="lp-text-link" to="/laporan">
                Lihat Semua <ArrowRight size={14} />
              </Link>
            </div>
            <div aria-live="polite" className="lp-empty-state">
              <strong>Belum ada laporan publik untuk ditampilkan</strong>
              Laporan pribadi tetap dapat dipantau melalui akun pelapor.
            </div>
          </div>
        </section>

        <section className="lp-about" id="tentang">
          <div className="lp-container">
            <div className="lp-about-top">
              <h2>Tentang Peduli Negeri</h2>
              <div className="lp-about-copy">
                <h3>
                  Peduli Negeri adalah platform digital untuk memfasilitasi
                  masyarakat dalam menyampaikan permasalahan di lingkungan
                  sekitar, mulai dari infrastruktur, lingkungan, pelayanan
                  publik, hingga isu sosial lainnya.
                </h3>
                <p>
                  Sampaikan laporan dengan informasi yang jelas agar dapat
                  dipahami dan ditindaklanjuti oleh pihak terkait.
                </p>
                <a className="lp-button lp-button-dark" href="#cara-melapor">
                  Selengkapnya <ArrowRight size={15} />
                </a>
              </div>
            </div>
            <div className="lp-about-features">
              <div className="lp-about-feature">
                <strong>Mudah Digunakan</strong>
                <span>Alur pelaporan dirancang agar mudah diikuti.</span>
              </div>
              <div className="lp-about-feature">
                <strong>Transparan & Akuntabel</strong>
                <span>Perkembangan laporan dapat dipantau melalui akun Anda.</span>
              </div>
              <div className="lp-about-feature">
                <strong>Bersama Membangun Negeri</strong>
                <span>Aspirasi warga membantu menyuarakan kebutuhan lingkungan.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="lp-how" id="cara-melapor">
          <div className="lp-container lp-how-grid">
            <div className="lp-how-copy">
              <h2>Cara Melapor di Peduli Negeri</h2>
              <p>Ikuti langkah-langkah berikut untuk menyampaikan laporan Anda.</p>
              <a className="lp-text-link" href="#langkah-melapor">
                Lihat Semua Langkah <ArrowRight size={14} />
              </a>
            </div>
            <div className="lp-steps" id="langkah-melapor">
              {steps.map(([title, description], index) => (
                <div className="lp-step" key={title}>
                  <span className="lp-step-number">{index + 1}</span>
                  <div>
                    <strong>{title}</strong>
                    <span>{description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-benefits">
          <div className="lp-container">
            <h2>Kenapa Memilih Peduli Negeri?</h2>
            <div className="lp-benefit-grid">
              {benefits.map(([title, description], index) => (
                <div className="lp-benefit" key={title}>
                  <span className="lp-benefit-icon" aria-hidden="true">
                    {index === 0 ? <ClipboardList size={17} /> : index === 1 ? <ShieldCheck size={17} /> : index === 2 ? <Check size={17} /> : <HeartHandshake size={17} />}
                  </span>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-community">
          <div className="lp-container">
            <div className="lp-section-heading">
              <div>
                <h2>Apa Kata Pengguna?</h2>
                <p className="lp-section-intro">
                  Kami belum memiliki testimoni yang dapat ditampilkan saat ini.
                </p>
              </div>
              <Link className="lp-text-link" to="/laporan/baru">
                Mulai Melapor <ArrowRight size={14} />
              </Link>
            </div>
            <div className="lp-community-panel">
              <div>
                <h3>Masukan Anda berarti</h3>
                <p>
                  Bagikan pengalaman atau saran agar layanan pelaporan ini dapat
                  terus diperbaiki.
                </p>
              </div>
              <Link className="lp-button lp-button-outline" to="/laporan/baru">
                Buat Laporan <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        <section className="lp-cta">
          <div className="lp-container lp-cta-inner">
            <div>
              <h2>Ada masalah di lingkungan Anda?</h2>
              <p>Sampaikan laporan dan pantau perkembangannya melalui akun Anda.</p>
            </div>
            <Link className="lp-button lp-button-dark" to="/laporan/baru">
              Laporkan Sekarang <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="lp-footer" id="kontak">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <Link className="lp-brand" to="/">
                <span className="lp-brand-mark" aria-hidden="true"><HeartHandshake size={18} /></span>
                <span>Peduli Negeri</span>
              </Link>
              <p>Suara Anda, perubahan untuk Negeri.</p>
            </div>
            <div>
              <h3 className="lp-footer-title">Tautan Cepat</h3>
              <div className="lp-footer-links">
                <a href="#beranda">Beranda</a>
                <a href="#laporan">Laporan</a>
                <a href="#tentang">Tentang Kami</a>
                <a href="#cara-melapor">Bantuan</a>
              </div>
            </div>
            <div>
              <h3 className="lp-footer-title">Kategori Laporan</h3>
              <div className="lp-footer-links">
                {reports.map((report) => <a href="#laporan" key={report.category}>{report.category}</a>)}
              </div>
            </div>
            <div>
              <h3 className="lp-footer-title">Ikuti Kami</h3>
              <div className="lp-footer-links">
                <a href="#kontak">Informasi layanan</a>
                <Link to="/login">Masuk ke akun</Link>
              </div>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span>© {new Date().getFullYear()} Peduli Negeri. Semua hak dilindungi.</span>
            <div className="lp-legal">
              <span>Syarat & Ketentuan</span>
              <span>Kebijakan Privasi</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
