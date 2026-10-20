import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, HeartHandshake, LoaderCircle, Send } from "lucide-react";
import { reportService } from "../../services/reportService";

const CATEGORIES = ["Infrastruktur", "Fasilitas Umum", "Lingkungan", "Lainnya"];

export default function FormLaporan({ currentUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
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
      <header className="mx-auto flex max-w-3xl items-center justify-between">
        <Link
          to="/home"
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

      <main className="mx-auto mt-8 max-w-3xl">
        <Link
          to="/home"
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
              Jelaskan masalah dan lokasinya dengan jelas agar laporan dapat
              ditindaklanjuti.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="title"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                Judul laporan
              </label>
              <input
                id="title"
                name="title"
                required
                minLength={5}
                maxLength={160}
                value={form.title}
                onChange={updateField}
                placeholder="Contoh: Lampu jalan tidak menyala"
                className="min-h-12 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                style={{
                  borderColor: "var(--color-line)",
                  color: "var(--color-ink)",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                Kategori
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

            <div>
              <label
                htmlFor="location"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                Lokasi
              </label>
              <input
                id="location"
                name="location"
                required
                minLength={3}
                maxLength={250}
                value={form.location}
                onChange={updateField}
                placeholder="Nama jalan, kelurahan, atau patokan"
                className="min-h-12 w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                style={{
                  borderColor: "var(--color-line)",
                  color: "var(--color-ink)",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                Ceritakan masalahnya
              </label>
              <textarea
                id="description"
                name="description"
                required
                minLength={10}
                maxLength={3000}
                rows={5}
                value={form.description}
                onChange={updateField}
                placeholder="Jelaskan kondisi yang Anda temukan dan dampaknya."
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

            <div
              className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end"
              style={{ borderColor: "var(--color-line)" }}
            >
              <Link
                to="/home"
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
                disabled={isSubmitting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
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
                {isSubmitting ? "Mengirim laporan..." : "Kirim Laporan"}
              </button>
            </div>
          </form>
        </section>
      </main>

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
              Mohon tunggu, laporan sedang disimpan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
