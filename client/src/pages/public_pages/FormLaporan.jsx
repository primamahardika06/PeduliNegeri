import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  HeartHandshake,
  LoaderCircle,
  Send,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  X,
  CheckCircle2,
  Maximize2,
} from "lucide-react";
import { reportService } from "../../services/reportService";
import {
  compressImageFile,
  captureVideoFrame,
} from "../../utils/imageCompressor";

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

  // Tutup stream kamera saat unmount atau saat modal kamera ditutup
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
      // Jika kamera gagal, berikan opsi fallback native file capture
      setCameraError(
        err.message ||
          "Kamera tidak dapat diakses. Pastikan izin kamera telah diberikan."
      );
    }
  };

  const handleOpenLiveCamera = () => {
    // Jika peramban tidak mendukung getUserMedia, langsung gunakan native camera input
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

  // Proses file yang diunggah dari galeri atau kamera native
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
      // Reset input agar dapat memilih file yang sama bila perlu
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

  return (
    <div
      className="min-h-screen px-4 py-6 sm:px-6"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="mx-auto flex max-w-3xl items-center justify-between">
        <Link
          to="/reportPage"
          className="flex items-center gap-2.5"
          style={{ color: "var(--color-ink)" }}
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: "var(--color-coral)" }}
          >
            <HeartHandshake className="h-5 w-5" />
          </span>
          <span className="font-display">
            Peduli
            <span style={{ color: "var(--color-coral-deep)" }}>Negeri</span>
          </span>
        </Link>
        <span className="text-sm" style={{ color: "var(--color-muted)" }}>
          {currentUser?.fullName || "Warga"}
        </span>
      </header>

      {/* ── Konten Utama ────────────────────────────────────── */}
      <main className="mx-auto mt-8 max-w-3xl">
        <Link
          to="/reportPage"
          className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium"
          style={{ color: "var(--color-coral-deep)" }}
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </Link>

        <section
          className="rounded-3xl bg-white p-5 shadow-sm sm:p-8"
          style={{ border: "1px solid var(--color-line)" }}
        >
          <div className="mb-7">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--color-coral-deep)" }}
            >
              Sampaikan kondisi di sekitar Anda
            </p>
            <h1
              className="mt-2 text-2xl font-bold"
              style={{ color: "var(--color-ink)" }}
            >
              Buat Laporan Baru
            </h1>
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              Jelaskan masalah, lampirkan bukti foto, dan sebutkan lokasinya
              dengan jelas agar laporan dapat segera ditindaklanjuti.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-300 bg-red-50 p-3.5 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Judul */}
            <div>
              <label
                htmlFor="title"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                Judul laporan <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                required
                minLength={5}
                maxLength={160}
                value={form.title}
                onChange={updateField}
                placeholder="Contoh: Lampu jalan padam di persimpangan jalan"
                className="min-h-12 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                style={{
                  borderColor: "var(--color-line)",
                  color: "var(--color-ink)",
                }}
              />
            </div>

            {/* Input Kategori */}
            <div>
              <label
                htmlFor="category"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                value={form.category}
                onChange={updateField}
                className="min-h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                style={{
                  borderColor: "var(--color-line)",
                  color: "var(--color-ink)",
                }}
              >
                <option value="" disabled>
                  Pilih kategori laporan
                </option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Input Lokasi */}
            <div>
              <label
                htmlFor="location"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                Lokasi kejadian / fasilitas{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="location"
                name="location"
                required
                minLength={3}
                maxLength={250}
                value={form.location}
                onChange={updateField}
                placeholder="Nama jalan, RT/RW, kelurahan, atau patokan jelas"
                className="min-h-12 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                style={{
                  borderColor: "var(--color-line)",
                  color: "var(--color-ink)",
                }}
              />
            </div>

            {/* Input Deskripsi */}
            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                Ceritakan masalahnya <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                minLength={10}
                maxLength={3000}
                rows={4}
                value={form.description}
                onChange={updateField}
                placeholder="Jelaskan kondisi yang Anda temukan, durasi kejadian, dan dampaknya bagi warga sekitar."
                className="w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                style={{
                  borderColor: "var(--color-line)",
                  color: "var(--color-ink)",
                }}
              />
              <p
                className="mt-1 text-right text-xs"
                style={{ color: "var(--color-muted)" }}
              >
                {form.description.length}/3000
              </p>
            </div>

            {/* ── BAGIAN FOTO BUKTI (UNGGAH & KAMERA LANGSUNG) ──────────── */}
            <div
              className="rounded-2xl p-4 sm:p-5"
              style={{
                backgroundColor: "var(--color-cream)",
                border: "1px dashed var(--color-line)",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <span
                    className="block text-sm font-semibold"
                    style={{ color: "var(--color-ink)" }}
                  >
                    Foto Bukti Kondisi / Isu
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-muted)" }}
                  >
                    Ambil foto langsung atau unggah gambar untuk memperkuat
                    laporan Anda.
                  </span>
                </div>
                {photoPreview && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Foto Siap Dikirim
                  </span>
                )}
              </div>

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
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-sm text-slate-600">
                  <LoaderCircle className="w-6 h-6 animate-spin text-coral-deep" />
                  <span>Memproses dan mengompres foto...</span>
                </div>
              )}

              {/* Jika belum ada foto yang dipilih */}
              {!photoLoading && !photoPreview && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Tombol Ambil Foto Langsung */}
                  <button
                    type="button"
                    onClick={handleOpenLiveCamera}
                    className="flex items-center justify-center gap-2.5 min-h-12 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border bg-white hover:bg-slate-50 cursor-pointer"
                    style={{
                      borderColor: "var(--color-coral)",
                      color: "var(--color-coral-deep)",
                    }}
                  >
                    <Camera className="w-4 h-4" />
                    <span>Ambil Foto Langsung</span>
                  </button>

                  {/* Tombol Unggah dari Galeri / Berkas */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2.5 min-h-12 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border bg-white hover:bg-slate-50 cursor-pointer"
                    style={{
                      borderColor: "var(--color-line)",
                      color: "var(--color-ink)",
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Pilih dari Galeri</span>
                  </button>
                </div>
              )}

              {/* Preview Foto Jika Sudah Ada */}
              {!photoLoading && photoPreview && (
                <div className="mt-2 space-y-3">
                  <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white max-w-sm">
                    <img
                      src={photoPreview}
                      alt="Pratinjau foto bukti"
                      className="w-full h-52 object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEnlargedOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-white/90 text-slate-800 text-xs font-medium flex items-center gap-1.5 shadow-sm"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        Perbesar
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEnlargedOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border bg-white text-slate-700 hover:bg-slate-50"
                      style={{ borderColor: "var(--color-line)" }}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Lihat Foto Penuh
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenLiveCamera}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border bg-white text-slate-700 hover:bg-slate-50"
                      style={{ borderColor: "var(--color-line)" }}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Foto Ulang
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border bg-white text-slate-700 hover:bg-slate-50"
                      style={{ borderColor: "var(--color-line)" }}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Ganti Foto
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus Foto
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tombol Aksi Form */}
            <div
              className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end"
              style={{ borderColor: "var(--color-line)" }}
            >
              <Link
                to="/reportPage"
                className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold"
                style={{
                  color: "var(--color-ink)",
                  backgroundColor: "var(--color-cream)",
                }}
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || photoLoading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                style={{ backgroundColor: "var(--color-coral-deep)" }}
              >
                {isSubmitting ? (
                  <LoaderCircle
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSubmitting ? "Menyimpan laporan..." : "Kirim Laporan"}
              </button>
            </div>
          </form>
        </section>
      </main>

      {/* ── MODAL KAMERA LANGSUNG ────────────────────────────── */}
      {isCameraOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Kamera Langsung"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 p-5 shadow-2xl border border-slate-700 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-coral" />
                <h2 className="text-base font-semibold">
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
              <div className="my-6 p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-sm space-y-3">
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
                    className="px-3 py-1.5 rounded-lg bg-red-700 text-white text-xs font-semibold"
                  >
                    Gunakan Kamera Bawaan HP
                  </button>
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border border-slate-800">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-6 border border-white/30 rounded-xl" />
                </div>

                <div className="flex items-center justify-between px-2 pt-1">
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                    title="Ganti kamera depan / belakang"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Putar Kamera</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSnapPhoto}
                    className="inline-flex items-center justify-center gap-2 h-13 px-6 rounded-2xl font-bold text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                    style={{ backgroundColor: "var(--color-coral)" }}
                  >
                    <Camera className="w-5 h-5" />
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
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={photoPreview}
              alt="Foto bukti resolusi penuh"
              className="rounded-2xl max-h-[80vh] w-auto object-contain border border-white/20 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* ── Loading Overlay Saat Mengirim ────────────────────── */}
      {isSubmitting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-label="Mengirim laporan"
        >
          <div className="flex w-full max-w-xs flex-col items-center rounded-2xl bg-white p-7 text-center shadow-xl">
            <LoaderCircle
              className="h-10 w-10 animate-spin"
              style={{ color: "var(--color-coral-deep)" }}
              aria-hidden="true"
            />
            <p
              className="mt-4 font-semibold"
              style={{ color: "var(--color-ink)" }}
            >
              Mengirim laporan
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
              Menyimpan data dan foto bukti ke database...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
