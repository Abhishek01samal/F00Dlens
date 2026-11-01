/**
 * Compresses and resizes images to speed up upload and AI vision processing dramatically
 */
export async function compressImage(
  file: File,
  maxDimension = 720,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl.split(",")[1] ?? "");
        } else {
          resolve((e.target?.result as string).split(",")[1] ?? "");
        }
      };
      img.onerror = () => {
        const full = e.target?.result as string;
        resolve(full.includes(",") ? (full.split(",")[1] ?? full) : full);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}
