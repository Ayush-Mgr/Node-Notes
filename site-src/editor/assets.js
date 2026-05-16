const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
const ALLOWED_MIMES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const COMPRESS_THRESHOLD = 500 * 1024; // 500KB
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 0.82;

const SUPPORTS_WEBP = (() => {
  try {
    const canvas = document.createElement("canvas");
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  } catch {
    return false;
  }
})();

export function validateImageFile(file) {
  if (!ALLOWED_MIMES.includes(file.type)) {
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported format: ${file.type || ext}`;
    }
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB, max 10MB)`;
  }
  return null;
}

export async function compressImage(file) {
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }
  if (file.size < COMPRESS_THRESHOLD) {
    return file;
  }
  if (typeof createImageBitmap === "undefined") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_WIDTH / bitmap.width);
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    let blob;
    if (typeof OffscreenCanvas !== "undefined") {
      const canvas = new OffscreenCanvas(w, h);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0, w, h);
      if (SUPPORTS_WEBP) {
        blob = await canvas.convertToBlob({ type: "image/webp", quality: WEBP_QUALITY });
      } else {
        blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 });
      }
    } else {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0, w, h);

      if (!SUPPORTS_WEBP) {
        blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.85));
      } else {
        blob = await new Promise(resolve => canvas.toBlob(resolve, "image/webp", WEBP_QUALITY));
      }
    }
    bitmap.close();

    if (blob && blob.size < file.size) {
      const isWebP = blob.type === "image/webp";
      const newName = file.name.replace(/\.[^.]+$/, isWebP ? ".webp" : ".jpg");
      return new File([blob], newName, { type: blob.type });
    }
    return file;
  } catch {
    return file;
  }
}

export function generateAssetMeta(file, folderPath = "") {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const shortHash = Math.random().toString(36).substring(2, 6);
  const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const fileName = `Pasted_image_${timestamp}_${shortHash}_${safeName}`;

  const noteFolder = folderPath.trim().replace(/^\/+|\/+$/g, "");
  const assetFolder = noteFolder ? `Assets/${noteFolder}` : "Assets";
  const path = `vault/${assetFolder}/${fileName}`;

  return { fileName, path };
}
