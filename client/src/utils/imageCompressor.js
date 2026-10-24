/**
 * Utilitas untuk kompresi dan sanitasi foto sebelum dikirim ke database
 * Membantu mereduksi ukuran file, menghapus metadata EXIF (privasi pelapor),
 * serta memastikan format gambar standar (JPEG).
 */

export async function compressImageFile(
  file,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      return reject(new Error("File yang dipilih bukan gambar yang valid."));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca berkas gambar."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Gagal memproses berkas gambar."));
      img.onload = () => {
        let { width, height } = img;

        // Skala proporsional jika melebihi batas maksimum
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Canvas context tidak tersedia."));
        }

        // Gambar ulang di canvas untuk kompresi & strip metadata EXIF
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve({
          dataUrl,
          width,
          height,
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function captureVideoFrame(
  videoElement,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
) {
  if (!videoElement || videoElement.videoWidth === 0) {
    throw new Error("Stream kamera belum siap.");
  }

  let width = videoElement.videoWidth;
  let height = videoElement.videoHeight;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context tidak tersedia.");
  }

  ctx.drawImage(videoElement, 0, 0, width, height);
  const dataUrl = canvas.toDataURL("image/jpeg", quality);

  return {
    dataUrl,
    width,
    height,
  };
}

