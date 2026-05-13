import { insertTextAtCursor, replaceTextRange } from "./utils.js";
import { putFile } from "../manager.js";

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
const ALLOWED_MIMES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

let uploadIdCounter = 0;
let uploadQueue = [];
let uploadActive = false;

// Reliable WebP capability detection
const SUPPORTS_WEBP = (() => {
  try {
    const canvas = document.createElement("canvas");
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  } catch {
    return false;
  }
})();

function validateImageFile(file) {
  // Check MIME
  if (!ALLOWED_MIMES.includes(file.type)) {
    // Fallback: check extension (browser MIME reporting inconsistent)
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

// ---------------------------------------------------------------------------
// Smart Compression
// ---------------------------------------------------------------------------

const COMPRESS_THRESHOLD = 500 * 1024; // 500KB
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 0.82;

async function maybeCompress(file) {
  // Never touch SVG or GIF
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }
  // Small files: keep original format
  if (file.size < COMPRESS_THRESHOLD) {
    return file;
  }
  // Safari <15 lacks createImageBitmap — skip compression
  if (typeof createImageBitmap === "undefined") {
    return file;
  }

  // Large JPEG or PNG → compress to WebP
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_WIDTH / bitmap.width);
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    // Use OffscreenCanvas if available, fallback to regular canvas
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
        // Fallback to JPEG if WebP is unsupported
        blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.85));
      } else {
        blob = await new Promise(resolve => canvas.toBlob(resolve, "image/webp", WEBP_QUALITY));
      }
    }
    bitmap.close();

    // Only use compressed version if it's actually smaller
    if (blob && blob.size < file.size) {
      const isWebP = blob.type === "image/webp";
      const newName = file.name.replace(/\.[^.]+$/, isWebP ? ".webp" : ".jpg");
      return new File([blob], newName, { type: blob.type });
    }
    return file;
  } catch (err) {
    console.warn("Compression failed, using original:", err);
    return file;
  }
}

export function handleAssets(textarea, getState) {
  textarea.addEventListener("dragover", (e) => {
    e.preventDefault();
    textarea.classList.add("drag-over");
  });

  textarea.addEventListener("dragleave", () => {
    textarea.classList.remove("drag-over");
  });

  textarea.addEventListener("drop", async (e) => {
    e.preventDefault();
    textarea.classList.remove("drag-over");

    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("image/") || ALLOWED_EXTENSIONS.includes("." + f.name.split(".").pop().toLowerCase())
    );
    for (const file of files) {
      await uploadFile(file, textarea, getState);
    }
  });

  textarea.addEventListener("paste", async (e) => {
    const items = Array.from(e.clipboardData.items);
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        await uploadFile(file, textarea, getState);
      }
    }
  });

  // Setup listeners for persistent hidden inputs
  const fileInput = document.getElementById("file-picker-input");
  const cameraInput = document.getElementById("camera-picker-input");

  if (fileInput) {
    // Remove existing listeners to avoid duplicates if handleAssets is called multiple times
    const newFileInput = fileInput.cloneNode(true);
    fileInput.parentNode.replaceChild(newFileInput, fileInput);
    newFileInput.addEventListener("change", async () => {
      const files = Array.from(newFileInput.files);
      for (const file of files) {
        await uploadFile(file, textarea, getState);
      }
      newFileInput.value = ""; // Clear for next selection
    });
  }

  if (cameraInput) {
    const newCameraInput = cameraInput.cloneNode(true);
    cameraInput.parentNode.replaceChild(newCameraInput, cameraInput);
    newCameraInput.addEventListener("change", async () => {
      if (newCameraInput.files[0]) {
        await uploadFile(newCameraInput.files[0], textarea, getState);
      }
      newCameraInput.value = "";
    });
  }
}

export function triggerFilePicker(textarea, getState) {
  const input = document.getElementById("file-picker-input");
  if (input) {
    input.click();
  } else {
    // Fallback if DOM element is missing
    const tempInput = document.createElement("input");
    tempInput.type = "file";
    tempInput.accept = "image/*";
    tempInput.multiple = true;
    tempInput.style.display = "none";
    document.body.appendChild(tempInput);
    tempInput.addEventListener("change", async () => {
      const files = Array.from(tempInput.files);
      for (const file of files) {
        await uploadFile(file, textarea, getState);
      }
      tempInput.remove();
    });
    tempInput.click();
  }
}

export function triggerCameraCapture(textarea, getState) {
  const input = document.getElementById("camera-picker-input");
  if (input) {
    input.click();
  } else {
    // Fallback
    const tempInput = document.createElement("input");
    tempInput.type = "file";
    tempInput.accept = "image/*";
    tempInput.capture = "environment";
    tempInput.style.display = "none";
    document.body.appendChild(tempInput);
    tempInput.addEventListener("change", async () => {
      if (tempInput.files[0]) {
        await uploadFile(tempInput.files[0], textarea, getState);
      }
      tempInput.remove();
    });
    tempInput.click();
  }
}

async function uploadFile(file, textarea, getState) {
  const error = validateImageFile(file);
  if (error) {
    alert(error);
    return;
  }

  const state = getState();
  const token = state.token || document.getElementById("token-input").value;
  if (!token) {
    alert("Token required for image upload");
    return;
  }

  // Queue this upload
  uploadQueue.push({ file, textarea, token, getState });
  processQueue();
}

async function processQueue() {
  if (uploadActive || uploadQueue.length === 0) return;
  uploadActive = true;

  const { file, textarea, token, getState } = uploadQueue.shift();
  const uploadId = `upload_${++uploadIdCounter}_${Date.now()}`;
  const placeholder = `<!-- uploading:${uploadId} -->`;
  insertTextAtCursor(textarea, placeholder);
  const placeholderEnd = textarea.selectionStart;
  const placeholderStart = placeholderEnd - placeholder.length;

  // Notify button state
  const attachBtn = document.getElementById("attach-btn");
  const prevLabel = attachBtn ? attachBtn.textContent : null;
  if (attachBtn) {
    attachBtn.textContent = "⏳ Uploading…";
    attachBtn.disabled = true;
  }

  try {
    // Smart compression
    const processed = await maybeCompress(file);
    const content = await readFileAsUint8Array(processed);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const safeName = processed.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const fileName = `Pasted_image_${timestamp}_${safeName}`;

    // Folder-aware asset path (mirrored structure)
    const folderInput = document.getElementById("note-folder");
    const folderVal = folderInput ? folderInput.value : "";
    const noteFolder = folderVal.trim().replace(/^\/+|\/+$/g, "");
    const assetFolder = noteFolder ? `Assets/${noteFolder}` : "Assets";
    const path = `vault/${assetFolder}/${fileName}`;

    await putFile(token, path, content, null, `Upload asset: ${fileName}`, { isAsset: true });

    // Replace placeholder with wikilink
    const wikilink = `![[${fileName}]]`;
    // Find placeholder in current text (position may have shifted)
    const currentText = textarea.value;
    const phIdx = currentText.indexOf(placeholder);
    if (phIdx >= 0) {
      replaceTextRange(textarea, phIdx, phIdx + placeholder.length, wikilink);
    } else {
      // Placeholder was moved/edited — append at cursor
      insertTextAtCursor(textarea, wikilink);
    }

    // Stay in write mode — fire input so draft saves
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    updateAttachCount(textarea);
  } catch (err) {
    console.error("Upload failed:", err);
    // Replace placeholder with error comment
    const currentText = textarea.value;
    const phIdx = currentText.indexOf(placeholder);
    const errorMark = `<!-- upload-failed: ${file.name} — ${err.message} -->`;
    if (phIdx >= 0) {
      replaceTextRange(textarea, phIdx, phIdx + placeholder.length, errorMark);
    }
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    alert("Upload failed: " + err.message);
  } finally {
    if (attachBtn) {
      const remaining = uploadQueue.length;
      attachBtn.textContent = remaining > 0 ? `⏳ Uploading (${remaining})…` : "📎 Attach Image";
      attachBtn.disabled = remaining > 0;
    }
    uploadActive = false;
    // Process next in queue
    processQueue();
  }
}

function readFileAsUint8Array(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function updateAttachCount(textarea) {
  const count = (textarea.value.match(/!\[\[.*?\]\]/g) || []).length;
  const badge = document.getElementById("attach-count");
  if (badge) {
    badge.textContent = count > 0 ? `${count} image${count > 1 ? "s" : ""}` : "";
  }
}
