import "dotenv/config";

// Getter dinamis agar selalu membaca variabel lingkungan terbaru di Vercel Serverless
const getResendApiKey = () => (process.env.RESEND_API_KEY || "").trim();
const getFromEmail = () =>
  process.env.RESEND_FROM_EMAIL || "Peduli Negeri <onboarding@resend.dev>";
const getClientUrl = () => {
  if (process.env.CLIENT_URL) return process.env.CLIENT_URL.replace(/\/+$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:5173";
};

/**
 * Status mapping untuk warna, label, dan deskripsi ramah pengguna
 */
const STATUS_CONFIG = {
  "Laporan Diterima": {
    step: 1,
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    title: "Laporan Telah Diterima",
    description:
      "Laporan Anda telah berhasil masuk ke sistem kami dan sedang menunggu verifikasi oleh tim dinas/petugas terkait.",
  },
  "Laporan Diproses": {
    step: 2,
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    title: "Laporan Sedang Diproses",
    description:
      "Laporan Anda telah diverifikasi dan saat ini sedang dikoordinasikan dengan instansi teknis untuk persiapan penanganan di lapangan.",
  },
  "Petugas Dikirim ke Lokasi": {
    step: 3,
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    title: "Petugas Sedang Menuju Lokasi",
    description:
      "Tim petugas teknis telah dikerahkan ke lokasi yang Anda laporkan untuk melakukan penanganan dan perbaikan langsung.",
  },
  "Laporan Selesai": {
    step: 4,
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    title: "Laporan Selesai Ditangani",
    description:
      "Penanganan atas laporan Anda telah selesai dilaksanakan. Terima kasih atas partisipasi aktif Anda dalam membangun negeri!",
  },
};

/**
 * Helper untuk membuat visual progress bar 4 langkah di email HTML
 */
function generateStepTimelineHTML(currentStep) {
  const steps = [
    { num: 1, label: "Diterima" },
    { num: 2, label: "Diproses" },
    { num: 3, label: "Ditangani" },
    { num: 4, label: "Selesai" },
  ];

  const stepsHTML = steps
    .map((s) => {
      const isReached = currentStep >= s.num;
      const isCurrent = currentStep === s.num;

      const circleBg = isReached ? "#EB936E" : "#E2E8F0";
      const circleColor = isReached ? "#1E2430" : "#94A3B8";
      const labelWeight = isCurrent ? "bold" : isReached ? "600" : "normal";
      const labelColor = isCurrent ? "#EB936E" : isReached ? "#1E2430" : "#94A3B8";

      return `
        <td align="center" style="width: 25%; vertical-align: top;">
          <div style="display: inline-block; width: 28px; height: 28px; line-height: 28px; border-radius: 50%; background-color: ${circleBg}; color: ${circleColor}; font-size: 12px; font-weight: bold; text-align: center; margin-bottom: 6px;">
            ${s.num}
          </div>
          <div style="font-size: 11px; font-weight: ${labelWeight}; color: ${labelColor};">
            ${s.label}
          </div>
        </td>
      `;
    })
    .join("");

  return `
    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 20px 0 10px 0;">
      <tr>
        ${stepsHTML}
      </tr>
    </table>
  `;
}

/**
 * Fungsi inti pengiriman email via Resend API
 */
export async function sendEmail({ to, subject, html, text }) {
  const apiKey = getResendApiKey();
  const fromEmail = getFromEmail();

  if (!apiKey) {
    console.warn(
      `[EmailService] ⚠️ RESEND_API_KEY tidak ditemukan pada environment variables. ` +
        `Pastikan RESEND_API_KEY sudah disetel di Vercel Project Settings > Environment Variables.\n` +
        `-> Kepada : ${to}\n` +
        `-> Subjek : ${subject}\n`
    );
    return {
      success: false,
      simulated: true,
      message: "RESEND_API_KEY belum dikonfigurasi di environment variables.",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[EmailService] Resend API Error:", data);
      return { success: false, error: data };
    }

    console.log(
      `[EmailService] ✅ Email notifikasi berhasil terkirim ke ${to} (Resend ID: ${data.id})`
    );
    return { success: true, data };
  } catch (error) {
    console.error("[EmailService] Gagal menghubungi Resend:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Template Base Wrapper untuk Email Peduli Negeri
 */
function wrapEmailTemplate({ title, preheader, bodyContent }) {
  const clientUrl = getClientUrl();
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF5EE; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E2430; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text for inbox preview -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${preheader}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF5EE; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(30, 36, 48, 0.05); border: 1px solid #EBE4D8;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #EB936E; padding: 24px 30px; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #1E2430;">
                      Peduli Negeri
                    </span>
                    <span style="display: block; font-size: 11px; color: rgba(30, 36, 48, 0.85); margin-top: 2px;">
                      Platform Gotong Royong & Aspirasi Warga
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 30px 25px 30px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Action Button -->
          <tr>
            <td align="center" style="padding: 0 30px 30px 30px;">
              <a href="${clientUrl}/laporan" style="display: inline-block; background-color: #EB936E; color: #1E2430; font-size: 14px; font-weight: bold; text-decoration: none; padding: 13px 28px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.06);">
                Lihat Perkembangan Laporan Saya &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FAF5EE; padding: 20px 30px; border-top: 1px solid #EBE4D8; text-align: center; font-size: 11px; color: #5C6070; line-height: 1.6;">
              Email otomatis ini dikirimkan karena Anda membuat laporan aspirasi di Peduli Negeri.<br>
              &copy; ${new Date().getFullYear()} Peduli Negeri. Suara Anda, Perubahan untuk Negeri.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Kirim Notifikasi: Laporan Baru Berhasil Dibuat
 */
export async function sendReportCreatedNotification({
  userEmail,
  userName,
  report,
}) {
  if (!userEmail) return;

  const subject = `[Peduli Negeri] Laporan Berhasil Diterima: "${report.title}"`;
  const preheader = `Terima kasih atas laporan Anda. Laporan #${(report.id || "").slice(0, 8)} telah tercatat di sistem kami.`;

  const bodyContent = `
    <h2 style="font-size: 18px; font-weight: 800; margin: 0 0 12px 0; color: #1E2430;">
      Halo, ${userName || "Warga Peduli"} 👋
    </h2>
    <p style="font-size: 13px; line-height: 1.6; color: #5C6070; margin: 0 0 20px 0;">
      Terima kasih telah berkontribusi aktif. Laporan Anda telah berhasil kami terima dan saat ini tercatat di sistem Peduli Negeri untuk segera ditindaklanjuti.
    </p>

    <!-- Ringkasan Kartu Laporan -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF5EE; border-radius: 14px; padding: 18px; border: 1px solid #EBE4D8; margin-bottom: 20px;">
      <tr>
        <td style="font-size: 11px; color: #5C6070; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">
          Nomor Laporan
        </td>
        <td align="right" style="font-size: 12px; font-weight: bold; color: #1E2430;">
          #${(report.id || "").slice(0, 8)}
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding-top: 8px;">
          <div style="font-size: 14px; font-weight: 700; color: #1E2430; margin-bottom: 4px;">
            ${report.title}
          </div>
          <div style="font-size: 12px; color: #5C6070;">
            📍 ${report.location}
          </div>
          <div style="margin-top: 8px;">
            <span style="display: inline-block; background-color: #FFFFFF; border: 1px solid #E2D9CF; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; color: #EB936E;">
              ${report.category || "Infrastruktur"}
            </span>
          </div>
        </td>
      </tr>
    </table>

    <div style="margin-bottom: 15px;">
      <span style="font-size: 12px; font-weight: 700; color: #1E2430;">Alur Penanganan Laporan:</span>
      ${generateStepTimelineHTML(1)}
    </div>

    <p style="font-size: 12px; line-height: 1.5; color: #5C6070; margin: 0;">
      Anda akan menerima pemberitahuan email otomatis setiap kali status laporan Anda diperbarui oleh petugas.
    </p>
  `;

  const html = wrapEmailTemplate({
    title: subject,
    preheader,
    bodyContent,
  });

  const clientUrl = getClientUrl();
  const text = `Halo ${userName || "Warga Peduli"},\n\n` +
    `Laporan Anda "${report.title}" telah berhasil kami terima dengan nomor tiket #${(report.id || "").slice(0, 8)}.\n` +
    `Lokasi: ${report.location}\nKategori: ${report.category}\n\n` +
    `Anda dapat memantau perkembangannya melalui: ${clientUrl}/laporan\n\n` +
    `Salam,\nTim Peduli Negeri`;

  return sendEmail({ to: userEmail, subject, html, text });
}

/**
 * Kirim Notifikasi: Perkembangan Status Laporan Diperbarui oleh Petugas/Admin
 */
export async function sendReportStatusNotification({
  userEmail,
  userName,
  report,
  newStatus,
  previousStatus,
}) {
  if (!userEmail) return;

  const config = STATUS_CONFIG[newStatus] || {
    step: 2,
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    title: `Status: ${newStatus}`,
    description: "Status laporan Anda telah diperbarui oleh petugas.",
  };

  const subject = `[Peduli Negeri] Status Laporan Diperbarui: "${report.title}" (${newStatus})`;
  const preheader = `Kabar terbaru untuk laporan #${(report.id || "").slice(0, 8)}: Status saat ini "${newStatus}".`;

  const bodyContent = `
    <h2 style="font-size: 18px; font-weight: 800; margin: 0 0 12px 0; color: #1E2430;">
      Kabar Terbaru Laporan Anda 📢
    </h2>
    <p style="font-size: 13px; line-height: 1.6; color: #5C6070; margin: 0 0 20px 0;">
      Halo <strong>${userName || "Warga Peduli"}</strong>, ada pembaruan perkembangan penanganan pada laporan yang telah Anda sampaikan.
    </p>

    <!-- Banner Status Baru -->
    <div style="background-color: ${config.bg}; border: 1px solid ${config.border}; border-radius: 14px; padding: 18px; margin-bottom: 20px;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; color: ${config.color}; margin-bottom: 4px;">
        Status Terkini
      </div>
      <div style="font-size: 16px; font-weight: 800; color: ${config.color}; margin-bottom: 8px;">
        ${newStatus}
      </div>
      <div style="font-size: 12px; line-height: 1.5; color: #1E2430;">
        ${config.description}
      </div>
    </div>

    <!-- Ringkasan Informasi Laporan -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF5EE; border-radius: 14px; padding: 18px; border: 1px solid #EBE4D8; margin-bottom: 20px;">
      <tr>
        <td style="font-size: 11px; color: #5C6070; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">
          Judul Laporan
        </td>
        <td align="right" style="font-size: 12px; font-weight: bold; color: #1E2430;">
          #${(report.id || "").slice(0, 8)}
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding-top: 6px;">
          <div style="font-size: 13px; font-weight: 700; color: #1E2430;">
            ${report.title}
          </div>
          <div style="font-size: 11px; color: #5C6070; margin-top: 4px;">
            📍 ${report.location}
          </div>
        </td>
      </tr>
    </table>

    <!-- Visual Progress Tracker -->
    <div style="margin-bottom: 15px;">
      <span style="font-size: 12px; font-weight: 700; color: #1E2430;">Tahapan Penanganan Saat Ini:</span>
      ${generateStepTimelineHTML(config.step)}
    </div>

    <p style="font-size: 12px; line-height: 1.5; color: #5C6070; margin: 0;">
      Anda dapat melihat riwayat lengkap status dan dokumentasi penanganan melalui tautan di bawah.
    </p>
  `;

  const html = wrapEmailTemplate({
    title: subject,
    preheader,
    bodyContent,
  });

  const clientUrl = getClientUrl();
  const text = `Halo ${userName || "Warga Peduli"},\n\n` +
    `Ada pembaruan status pada laporan Anda "${report.title}".\n` +
    `Status Baru: ${newStatus}\n` +
    `Keterangan: ${config.description}\n\n` +
    `Lihat detail laporan: ${clientUrl}/laporan\n\n` +
    `Salam,\nTim Peduli Negeri`;

  return sendEmail({ to: userEmail, subject, html, text });
}

/**
 * Kirim Notifikasi ke Admin: Laporan Mencapai Ambang Batas Dukungan Warga (e.g. 5 dukungan)
 */
export async function sendSupportThresholdNotification({
  adminEmail,
  adminName,
  report,
  supportCount,
}) {
  if (!adminEmail) return;

  const subject = `[Peduli Negeri - Perhatian Admin] Laporan Populer: "${report.title}" Telah Didukung ${supportCount} Warga!`;
  const preheader = `Laporan #${(report.id || "").slice(0, 8)} telah mendapat perhatian tinggi dengan ${supportCount} dukungan warga.`;

  const bodyContent = `
    <h2 style="font-size: 18px; font-weight: 800; margin: 0 0 12px 0; color: #1E2430;">
      Laporan Mencapai ${supportCount} Dukungan Warga ⚠️
    </h2>
    <p style="font-size: 13px; line-height: 1.6; color: #5C6070; margin: 0 0 20px 0;">
      Halo <strong>${adminName || "Administrator"}</strong>, ada laporan yang mendapatkan banyak dukungan warga di sekitarnya dan membutuhkan prioritas perhatian tindak lanjut.
    </p>

    <div style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 14px; padding: 18px; margin-bottom: 20px;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; color: #92400E; margin-bottom: 4px;">
        Jumlah Dukungan Terkini
      </div>
      <div style="font-size: 20px; font-weight: 800; color: #92400E; margin-bottom: 6px;">
        👥 ${supportCount} Warga Mendukung
      </div>
      <div style="font-size: 12px; line-height: 1.5; color: #78350F;">
        Banyak warga merasakan kendala yang serupa di wilayah ini. Segera tinjau laporan untuk dijadwalkan ke tahap penanganan.
      </div>
    </div>

    <!-- Ringkasan Laporan -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF5EE; border-radius: 14px; padding: 18px; border: 1px solid #EBE4D8; margin-bottom: 20px;">
      <tr>
        <td style="font-size: 11px; color: #5C6070; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">
          Nomor Laporan
        </td>
        <td align="right" style="font-size: 12px; font-weight: bold; color: #1E2430;">
          #${(report.id || "").slice(0, 8)}
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding-top: 6px;">
          <div style="font-size: 14px; font-weight: 700; color: #1E2430;">
            ${report.title}
          </div>
          <div style="font-size: 12px; color: #5C6070; margin-top: 4px;">
            📍 ${report.location}
          </div>
          <div style="font-size: 12px; color: #5C6070; margin-top: 4px;">
            🏷️ Kategori: ${report.category}
          </div>
          <div style="font-size: 12px; color: #5C6070; margin-top: 4px;">
            📌 Status Saat Ini: <strong>${report.status}</strong>
          </div>
        </td>
      </tr>
    </table>

    <p style="font-size: 12px; line-height: 1.5; color: #5C6070; margin: 0;">
      Anda dapat langsung membuka dashboard admin untuk memperbarui status atau menugaskan petugas teknis ke lokasi.
    </p>
  `;

  const html = wrapEmailTemplate({
    title: subject,
    preheader,
    bodyContent,
  });

  const clientUrl = getClientUrl();
  const text = `Halo ${adminName || "Administrator"},\n\n` +
    `Laporan "${report.title}" telah mencapai ${supportCount} dukungan warga!\n` +
    `Lokasi: ${report.location}\n` +
    `Kategori: ${report.category}\n` +
    `Status Saat Ini: ${report.status}\n\n` +
    `Tinjau di Admin Dashboard: ${clientUrl}/admin\n\n` +
    `Salam,\nSistem Peduli Negeri`;

  return sendEmail({ to: adminEmail, subject, html, text });
}

