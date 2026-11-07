import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Upload,
  MapPin,
  ChevronDown,
  LoaderCircle,
  X,
  RefreshCw,
  Maximize2,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { reportService } from "../../services/reportService";
import {
  compressImageFile,
  captureVideoFrame,
} from "../../utils/imageCompressor";
import BrandLogo from "../../components/common/BrandLogo";

const CATEGORIES = [
  "Infrastruktur",
  "Fasilitas Umum",
  "Lingkungan",
  "Lainnya",
];

export default function FormLaporan({ currentUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    image_url: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk pengelolaan foto bukti
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState("environment");
  const [isEnlargedOpen, setIsEnlargedOpen] = useState(false);

  const fileInputRef = useRef(null);
  const nativeCameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  // Tutup stream kamera saat unmount
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Mulai stream kamera live
  const startCamera = async (mode = facingMode) => {
    stopCameraStream();
    setCameraError("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Fitur kamera langsung tidak didukung pada peramban ini."
        );
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError(
        err.message ||
          "Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan."
      );
    }
  };

  const handleOpenLiveCamera = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (nativeCameraInputRef.current) {
        nativeCameraInputRef.current.click();
      }
      return;
    }
    setIsCameraOpen(true);
    startCamera(facingMode);
  };

  const handleCloseCamera = () => {
    stopCameraStream();
    setIsCameraOpen(false);
    setCameraError("");
  };

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    try {
      const { dataUrl } = captureVideoFrame(videoRef.current, 1200, 1200, 0.82);
      setPhotoPreview(dataUrl);
      setForm((prev) => ({ ...prev, image_url: dataUrl }));
      handleCloseCamera();
    } catch (snapErr) {
      setCameraError(snapErr.message || "Gagal mengambil foto.");
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Format berkas harus berupa gambar (JPG, PNG, WebP).");
      return;
    }

    setPhotoLoading(true);
    setError("");

    try {
      const { dataUrl } = await compressImageFile(file, 1200, 1200, 0.82);
      setPhotoPreview(dataUrl);
      setForm((prev) => ({ ...prev, image_url: dataUrl }));
    } catch (compErr) {
      setError(compErr.message || "Gagal memproses gambar.");
    } finally {
      setPhotoLoading(false);
      if (event.target) event.target.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview("");
    setForm((prev) => ({ ...prev, image_url: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await reportService.createReport(form);
      navigate("/laporan", { state: { reportCreated: true } });
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const userInitial = (
    currentUser?.fullName ||
    currentUser?.email ||
    "P"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

  const userName =
    currentUser?.fullName?.trim() ||
    currentUser?.email?.split("@")[0] ||
    "P";

  return (
    <div
      className="min-h-screen px-4 py-5 sm:px-8 sm:py-7 font-sans"
      style={{ backgroundColor: "var(--color-cream, #fdebe0)" }}
    >
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <header className="mx-auto flex max-w-5xl items-center justify-between pb-6">
        <Link to="/reportPage" className="inline-flex items-center">
          <BrandLogo size="md" />
        </Link>

        {/* Profil Singkat di Pojok Kanan Atas */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-md font-bold text-sm shadow-xs"
            style={{
              backgroundColor: "var(--color-apricot, #fcd5a8)",
              color: "var(--color-ink, #1f2433)",
            }}
          >
            {userInitial}
          </div>
          <div className="flex flex-col text-left">
            <span
              className="text-xs font-bold leading-tight"
              style={{ color: "var(--color-ink, #1f2433)" }}
            >
              {userName}
            </span>
            <span
              className="text-[11px] leading-tight"
              style={{ color: "var(--color-muted, #5c6070)" }}
            >
              Warga
            </span>
          </div>
        </div>
      </header>

      {/* ── Tombol Kembali ke Beranda ───────────────────────── */}
      <div className="mx-auto max-w-5xl mb-4">
        <Link
          to="/reportPage"
          className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:underline"
          style={{ color: "var(--color-ink, #1f2433)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>

      {/* ── Judul Halaman & Subtitle ───────────────────────── */}
      <div className="mx-auto max-w-5xl mb-7">
        <h1
          className="text-3xl sm:text-4xl font-extrabold tracking-tight"
          style={{ color: "var(--color-ink, #1f2433)" }}
        >
          Buat Laporan Baru
        </h1>
        <p
          className="mt-2 text-xs sm:text-sm leading-relaxed max-w-2xl"
          style={{ color: "var(--color-muted, #5c6070)" }}
        >
          Jelaskan masalah, lampirkan bukti foto, dan sebutkan lokasinya dengan
          jelas agar laporan dapat segera ditindaklanjuti.
        </p>
      </div>

      {/* ── Konten Grid (Form di Kiri, Info di Kanan) ───────── */}
      <main className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* ── Sisi Kiri: Form Card Putih ───────────────────── */}
          <section
            className="lg:col-span-8 rounded-lg sm:rounded-xl bg-white p-5 sm:p-7 shadow-xs"
            style={{ border: "1px solid var(--color-line, #ecd6c8)" }}
          >
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-md border border-red-300 bg-red-50 p-3 text-xs text-red-800"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Field 1: Judul Laporan */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-1.5 block text-xs sm:text-sm font-semibold"
                  style={{ color: "var(--color-ink, #1f2433)" }}
                >
                  Judul laporan{" "}
                  <span
                    className="font-normal"
                    style={{ color: "var(--color-muted, #5c6070)" }}
                  >
                    (wajib)
                  </span>
                </label>
                <input
                  id="title"
                  name="title"
                  required
                  minLength={5}
                  maxLength={160}
                  value={form.title}
                  onChange={updateField}
                  placeholder="Contoh: Lampu jalan padam di persimpangan"
                  className="w-full rounded-md border px-3.5 py-2.5 text-xs sm:text-sm outline-none transition focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                  style={{
                    borderColor: "var(--color-line, #d1d5db)",
                    color: "var(--color-ink, #1f2433)",
                  }}
                />
              </div>

              {/* Field 2: Kategori */}
              <div>
                <label
                  htmlFor="category"
                  className="mb-1.5 block text-xs sm:text-sm font-semibold"
                  style={{ color: "var(--color-ink, #1f2433)" }}
                >
                  Kategori{" "}
                  <span
                    className="font-normal"
                    style={{ color: "var(--color-muted, #5c6070)" }}
                  >
                    (wajib)
                  </span>
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    required
                    value={form.category}
                    onChange={updateField}
                    className="w-full appearance-none rounded-md border bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none transition focus:border-gray-600 focus:ring-1 focus:ring-gray-600 cursor-pointer"
                    style={{
                      borderColor: "var(--color-line, #d1d5db)",
                      color: form.category
                        ? "var(--color-ink, #1f2433)"
                        : "#9ca3af",
                    }}
                  >
                    <option value="" disabled>
                      Pilih kategori laporan
                    </option>
                    {CATEGORIES.map((category) => (
                      <option
                        key={category}
                        value={category}
                        className="text-[#1f2433]"
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{ color: "var(--color-muted, #5c6070)" }}
                  />
                </div>
              </div>

              {/* Field 3: Lokasi */}
              <div>
                <label
                  htmlFor="location"
                  className="mb-1.5 block text-xs sm:text-sm font-semibold"
                  style={{ color: "var(--color-ink, #1f2433)" }}
                >
                  Lokasi kejadian atau fasilitas{" "}
                  <span
                    className="font-normal"
                    style={{ color: "var(--color-muted, #5c6070)" }}
                  >
                    (wajib)
                  </span>
                </label>
                <div className="relative">
                  <MapPin
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{ color: "var(--color-muted, #5c6070)" }}
                  />
                  <input
                    id="location"
                    name="location"
                    required
                    minLength={3}
                    maxLength={250}
                    value={form.location}
                    onChange={updateField}
                    placeholder="Nama jalan, RT/RW, kelurahan, atau patokan jelas"
                    className="w-full rounded-md border pl-9 pr-3.5 py-2.5 text-xs sm:text-sm outline-none transition focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                    style={{
                      borderColor: "var(--color-line, #d1d5db)",
                      color: "var(--color-ink, #1f2433)",
                    }}
                  />
                </div>
              </div>

              {/* Field 4: Ceritakan Masalahnya */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="description"
                    className="block text-xs sm:text-sm font-semibold"
                    style={{ color: "var(--color-ink, #1f2433)" }}
                  >
                    Ceritakan masalahnya{" "}
                    <span
                      className="font-normal"
                      style={{ color: "var(--color-muted, #5c6070)" }}
                    >
                      (wajib)
                    </span>
                  </label>
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-muted, #5c6070)" }}
                  >
                    {form.description.length}/3000
                  </span>
                </div>
                <textarea
                  id="description"
                  name="description"
                  required
                  minLength={10}
                  maxLength={3000}
                  rows={5}
                  value={form.description}
                  onChange={updateField}
                  placeholder="Jelaskan kondisi yang Anda temukan, sudah berapa lama terjadi, dan dampaknya bagi warga sekitar."
                  className="w-full resize-y rounded-md border px-3.5 py-2.5 text-xs sm:text-sm outline-none transition focus:border-gray-600 focus:ring-1 focus:ring-gray-600 leading-relaxed"
                  style={{
                    borderColor: "var(--color-line, #d1d5db)",
                    color: "var(--color-ink, #1f2433)",
                  }}
                />
              </div>

              {/* Field 5: Foto Bukti */}
              <div>
                <label
                  className="block text-xs sm:text-sm font-semibold"
                  style={{ color: "var(--color-ink, #1f2433)" }}
                >
                  Foto bukti{" "}
                  <span
                    className="font-normal"
                    style={{ color: "var(--color-muted, #5c6070)" }}
                  >
                    (disarankan)
                  </span>
                </label>
                <p
                  className="mt-1 text-xs"
                  style={{ color: "var(--color-muted, #5c6070)" }}
                >
                  Foto yang jelas mempercepat verifikasi. Format JPG atau PNG,
                  maksimal 5 MB.
                </p>

                {/* Input berkas tersembunyi */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={nativeCameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {photoLoading && (
                  <div className="mt-3 flex items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 py-6 text-xs text-slate-600">
                    <LoaderCircle className="h-5 w-5 animate-spin text-coral-deep" />
                    <span>Memproses dan mengompres foto...</span>
                  </div>
                )}

                {/* Tombol Ambil Foto & Pilih dari Galeri */}
                {!photoLoading && !photoPreview && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleOpenLiveCamera}
                      className="flex items-center justify-center gap-2 rounded-md border border-[#1f2433] bg-white py-2.5 px-4 text-xs sm:text-sm font-semibold transition hover:bg-gray-50 cursor-pointer"
                      style={{ color: "var(--color-ink, #1f2433)" }}
                    >
                      <Camera className="h-4 w-4" />
                      <span>Ambil Foto Langsung</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 rounded-md border border-[#1f2433] bg-white py-2.5 px-4 text-xs sm:text-sm font-semibold transition hover:bg-gray-50 cursor-pointer"
                      style={{ color: "var(--color-ink, #1f2433)" }}
                    >
                      <Upload className="h-4 w-4" />
                      <span>Pilih dari Galeri</span>
                    </button>
                  </div>
                )}

                {/* Pratinjau Foto jika sudah terpilih */}
                {!photoLoading && photoPreview && (
                  <div className="mt-3 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Foto Bukti Terlampir
                      </span>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </button>
                    </div>

                    <div className="relative group max-w-xs overflow-hidden rounded-md border border-gray-300 bg-black">
                      <img
                        src={photoPreview}
                        alt="Pratinjau bukti"
                        className="h-40 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setIsEnlargedOpen(true)}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-semibold gap-1.5"
                      >
                        <Maximize2 className="h-4 w-4" /> Perbesar
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setIsEnlargedOpen(true)}
                        className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2.5 py-1 text-gray-700 hover:bg-gray-50"
                      >
                        <ImageIcon className="h-3.5 w-3.5" /> Lihat Penuh
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenLiveCamera}
                        className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2.5 py-1 text-gray-700 hover:bg-gray-50"
                      >
                        <Camera className="h-3.5 w-3.5" /> Foto Ulang
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2.5 py-1 text-gray-700 hover:bg-gray-50"
                      >
                        <Upload className="h-3.5 w-3.5" /> Ganti
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Garis Pembatas */}
              <div
                className="border-t pt-2"
                style={{ borderColor: "var(--color-line, #ecd6c8)" }}
              />

              {/* Teks Pernyataan */}
              <p
                className="text-xs"
                style={{ color: "var(--color-muted, #5c6070)" }}
              >
                Dengan mengirim, Anda menyatakan isi laporan sesuai dengan kondisi
                sebenarnya.
              </p>

              {/* Tombol Aksi Batal & Kirim Laporan */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate("/reportPage")}
                  className="rounded-md border border-[#1f2433] bg-white px-5 py-2 text-xs sm:text-sm font-semibold transition hover:bg-gray-50 cursor-pointer"
                  style={{ color: "var(--color-ink, #1f2433)" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || photoLoading}
                  className="inline-flex items-center gap-2 rounded-md px-5 py-2 text-xs sm:text-sm font-bold shadow-xs transition hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  style={{
                    backgroundColor: "var(--color-coral, #f7a581)",
                    color: "var(--color-ink, #1f2433)",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Laporan</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* ── Sisi Kanan: Card Informasi & Alur Penanganan ─── */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Box 1: Setelah laporan dikirim */}
            <div
              className="rounded-lg sm:rounded-xl p-5 sm:p-6 shadow-xs"
              style={{
                backgroundColor: "var(--color-apricot, #fcd5a8)",
              }}
            >
              <h3
                className="font-bold text-sm mb-4"
                style={{ color: "var(--color-ink, #1f2433)" }}
              >
                Setelah laporan dikirim
              </h3>
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-bold text-white"
                    style={{ backgroundColor: "var(--color-ink, #1f2433)" }}
                  >
                    1
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--color-ink, #1f2433)" }}
                  >
                    Laporan Diterima
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-bold text-white"
                    style={{ backgroundColor: "var(--color-ink, #1f2433)" }}
                  >
                    2
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--color-ink, #1f2433)" }}
                  >
                    Sedang Diverifikasi
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-bold text-white"
                    style={{ backgroundColor: "var(--color-ink, #1f2433)" }}
                  >
                    3
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--color-ink, #1f2433)" }}
                  >
                    Petugas Dikirim ke Lokasi
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-bold text-white"
                    style={{ backgroundColor: "var(--color-ink, #1f2433)" }}
                  >
                    4
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--color-ink, #1f2433)" }}
                  >
                    Laporan Selesai
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Agar cepat ditangani */}
            <div className="px-1">
              <h4
                className="font-bold text-xs sm:text-sm mb-3"
                style={{ color: "var(--color-ink, #1f2433)" }}
              >
                Agar cepat ditangani
              </h4>
              <ul
                className="space-y-2 text-xs leading-relaxed"
                style={{ color: "var(--color-muted, #5c6070)" }}
              >
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Sebutkan patokan lokasi yang mudah dikenali.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Foto kondisi dari jarak dekat dan jauh.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  <span>Ceritakan sejak kapan masalah terjadi.</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* ── MODAL KAMERA LANGSUNG ────────────────────────────── */}
      {isCameraOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Kamera Langsung"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 p-5 shadow-2xl border border-slate-700 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-coral" />
                <h2 className="text-sm font-semibold">
                  Ambil Foto Bukti Langsung
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseCamera}
                className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cameraError ? (
              <div className="my-6 p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs space-y-3">
                <p>{cameraError}</p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseCamera();
                      if (nativeCameraInputRef.current) {
                        nativeCameraInputRef.current.click();
                      }
                    }}
                    className="px-3 py-1.5 rounded bg-red-700 text-white text-xs font-semibold"
                  >
                    Gunakan Kamera Bawaan HP
                  </button>
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className="px-3 py-1.5 rounded bg-slate-800 text-slate-200 text-xs font-semibold"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="relative rounded-xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border border-slate-800">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-6 border border-white/30 rounded-lg" />
                </div>

                <div className="flex items-center justify-between px-2 pt-1">
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                    title="Ganti kamera depan / belakang"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Putar Kamera</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSnapPhoto}
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                    style={{ backgroundColor: "var(--color-coral, #f7a581)" }}
                  >
                    <Camera className="w-4 h-4" />
                    <span>Ambil Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseCamera}
                    className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL PREVIEW FOTO DIPERBESAR ────────────────────── */}
      {isEnlargedOpen && photoPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-2xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setIsEnlargedOpen(false)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={photoPreview}
              alt="Foto bukti resolusi penuh"
              className="rounded-xl max-h-[80vh] w-auto object-contain border border-white/20 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
