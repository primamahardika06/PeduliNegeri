import logoMark from "../../assets/PeduliNegeri (4).png";

/**
 * Komponen Logo Terstandarisasi Peduli Negeri sesuai Gambar 3
 * Menampilkan ikon di sebelah kiri dan teks "Peduli Negeri" di sebelah kanan
 */
export default function BrandLogo({
  size = "md",
  className = "",
}){
  const imgSizes = {
    sm: "w-4.5 h-4.5",
    md: "w-25 h-25",
    lg: "w-7 h-7",
  };

  return (
    <div className={`items-center gap-2.5 select-none ${className}`}>
        <img
          src={logoMark}
          alt="Ikon Peduli Negeri"
          className={`${imgSizes[size] || imgSizes.md} object-contain`}
          loading="eager"
        />
    </div>
  );
}
