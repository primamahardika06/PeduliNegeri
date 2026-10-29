import React from "react";
import logoMark from "../../assets/PeduliNegeri (1).png";

/**
 * Komponen Logo Terstandarisasi Peduli Negeri sesuai Gambar 3
 * Menampilkan ikon di sebelah kiri dan teks "Peduli Negeri" di sebelah kanan
 */
export default function BrandLogo({
  size = "md",
  isDark = false,
  showText = true,
  className = "",
}) {
  // Ukuran dimensi kotak ikon
  const iconSizes = {
    sm: "w-7 h-7 rounded-lg",
    md: "w-9 h-9 rounded-xl",
    lg: "w-11 h-11 rounded-2xl",
  };

  // Ukuran teks
  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
  };

  // Ukuran gambar logo mark di dalam kotak
  const imgSizes = {
    sm: "w-4.5 h-4.5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Kotak Ikon Gelap Berujung Bundar sesuai Gambar 3 */}
      <span
        className={`${iconSizes[size] || iconSizes.md} bg-[#1E2430] flex items-center justify-center shrink-0 shadow-xs p-1`}
        style={{ backgroundColor: "#1E2430" }}
      >
        <img
          src={logoMark}
          alt="Ikon Peduli Negeri"
          className={`${imgSizes[size] || imgSizes.md} object-contain`}
          loading="eager"
        />
      </span>

      {/* Teks Peduli Negeri di Sebelah Kanan Ikon */}
      {showText && (
        <span
          className={`${textSizes[size] || textSizes.md} font-bold tracking-tight ${
            isDark ? "text-white" : "text-[#1E2430]"
          }`}
          style={{ fontFamily: "inherit" }}
        >
          Peduli Negeri
        </span>
      )}
    </div>
  );
}
