import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, FileText, MapPin } from "lucide-react";
import { reportService } from "../../services/reportService";

const REPORT_PROGRESS = {
  "Laporan Diterima": { step: 1, label: "Laporan diterima" },
  "Laporan Diproses": { step: 2, label: "Sedang diproses" },
  "Petugas Dikirim ke Lokasi": { step: 3, label: "Petugas menuju lokasi" },
  "Laporan Selesai": { step: 4, label: "Laporan selesai" },
};

function formatDate(value) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function RiwayatLaporan({ currentUser }) {
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    const loadReports = async () => {
      try {
        const items = await reportService.getMyReports();
        if (isActive) {
          setReports(items);
          setError("");
        }
      } catch (loadError) {
        if (isActive) setError(loadError.message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadReports();
    const intervalId = window.setInterval(loadReports, 15000);
    window.addEventListener("focus", loadReports);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadReports);
    };
  }, []);

  return (
    <div
      className="min-h-screen px-4 py-6 sm:px-6"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <main className="mx-auto max-w-4xl">
        <Link
          to="/home"
          className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium"
          style={{ color: "var(--color-coral-deep)" }}
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </Link>

        <section
          className="rounded-3xl bg-white p-5 sm:p-8"
          style={{ border: "1px solid var(--color-line)" }}
        >
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-coral-deep)" }}
              >
                {currentUser?.fullName || "Akun warga"}
              </p>
              <h1
                className="mt-2 text-2xl font-bold"
                style={{ color: "var(--color-ink)" }}
              >
                Riwayat Laporan
              </h1>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--color-muted)" }}
              >
                Pantau status laporan yang telah Anda kirim.
              </p>
            </div>
            <Link
              to="/laporan/baru"
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--color-coral-deep)" }}
            >
              Buat Laporan
            </Link>
          </div>

          {location.state?.reportCreated && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800"
            >
              Laporan berhasil dikirim dan masuk ke tahap Laporan Diterima.
            </div>
          )}

          {isLoading && (
            <p
              role="status"
              className="py-10 text-center text-sm"
              style={{ color: "var(--color-muted)" }}
            >
              Memuat riwayat laporan...
            </p>
          )}

          {!isLoading && error && (
            <div
              role="alert"
              className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800"
            >
              {error}{" "}
              <button
                className="ml-1 font-semibold underline"
                onClick={() => window.location.reload()}
              >
                Muat ulang
              </button>
            </div>
          )}

          {!isLoading && !error && reports.length === 0 && (
            <div
              className="rounded-2xl py-12 text-center"
              style={{ backgroundColor: "var(--color-cream)" }}
            >
              <FileText
                className="mx-auto h-8 w-8"
                style={{ color: "var(--color-coral-deep)" }}
              />
              <h2
                className="mt-3 font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                Belum ada laporan
              </h2>
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--color-muted)" }}
              >
                Laporan yang Anda kirim akan tampil di halaman ini.
              </p>
            </div>
          )}

          {!isLoading && !error && reports.length > 0 && (
            <div className="space-y-3">
              {reports.map((report) => {
                const progress =
                  REPORT_PROGRESS[report.status] ||
                  REPORT_PROGRESS["Laporan Diterima"];
                return (
                  <article
                    key={report.id}
                    className="rounded-2xl p-4 sm:p-5"
                    style={{ backgroundColor: "var(--color-cream)" }}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                            className="rounded-md px-2 py-1 text-xs font-semibold"
                            style={{
                              backgroundColor: "var(--color-apricot)",
                              color: "var(--color-coral-deep)",
                            }}
                          >
                            {report.category}
                          </span>
                          <time
                            className="text-xs"
                            style={{ color: "var(--color-muted)" }}
                          >
                            {formatDate(report.created_at)}
                          </time>
                        </div>
                        <h2
                          className="text-base font-semibold"
                          style={{ color: "var(--color-ink)" }}
                        >
                          {report.title}
                        </h2>
                        <p
                          className="mt-2 whitespace-pre-wrap text-sm leading-relaxed"
                          style={{ color: "var(--color-muted)" }}
                        >
                          {report.description}
                        </p>
                        <p
                          className="mt-3 flex items-center gap-1.5 text-sm"
                          style={{ color: "var(--color-muted)" }}
                        >
                          <MapPin
                            className="h-4 w-4 shrink-0"
                            style={{ color: "var(--color-coral-deep)" }}
                          />{" "}
                          {report.location}
                        </p>
                      </div>
                      <div className="w-full shrink-0 sm:w-48">
                        <div
                          className="flex items-center justify-between text-xs font-semibold"
                          style={{ color: "var(--color-coral-deep)" }}
                        >
                          <span>{report.status}</span>
                          <span>{progress.step}/4</span>
                        </div>
                        <div
                          className="mt-2 h-2 overflow-hidden rounded-full bg-white"
                          aria-label={`Progress: ${report.status}`}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${progress.step * 25}%`,
                              backgroundColor: "var(--color-coral-deep)",
                            }}
                          />
                        </div>
                        <p
                          className="mt-1 text-xs"
                          style={{ color: "var(--color-muted)" }}
                        >
                          {progress.label}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
