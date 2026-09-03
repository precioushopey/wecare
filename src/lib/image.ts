/**
 * Read an image `File` and return a square, downscaled JPEG **data URL**.
 *
 * Used for the mock-auth profile photo: there is no backend or object store,
 * so the picture is kept in `localStorage` (`wecare.auth`). Cover-cropping to
 * a small square + JPEG re-encode keeps that blob to a few tens of KB instead
 * of the multi-MB original, so it fits comfortably under the storage quota.
 */
export function resizeImageToDataUrl(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("not an image"));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("no 2d context"));
          return;
        }
        // Cover-fit: scale so the shorter side fills the square, centre-crop.
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
