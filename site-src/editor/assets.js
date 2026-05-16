import { insertTextAtCursor, replaceTextRange } from "./utils.js";
import { registerPendingAsset } from "../manager.js";

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
const ALLOWED_MIMES = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

let uploadIdCounter = 0;
let uploadQueue = [];
let uploadActive = false;

const SUPPORTS_WEBP = (() => {
  try {
    const canvas = document.createElement("canvas");
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  } catch {
    return false;
  }
})();

function validateImageFile(file) {
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

const COMPRESS_THRESHOLD = 500 * 1024; // 500KB
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 0.82;

async function maybeCompress(file) {
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

function bindInput(input, handler) {
  if (!input) return;
  const replacement = input.cloneNode(true);
  input.parentNode.replaceChild(replacement, input);
  replacement.addEventListener("change", handler);
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

  const fileInput = document.getElementById("file-picker-input");
  const cameraInput = document.getElementById("camera-picker-input");

  bindInput(fileInput, async (event) => {
      const files = Array.from(event.currentTarget.files || []);
      for (const file of files) {
        await uploadFile(file, textarea, getState);
      }
      event.currentTarget.value = "";
    });

  bindInput(cameraInput, async (event) => {
      const [file] = event.currentTarget.files || [];
      if (file) {
        await uploadFile(file, textarea, getState);
      }
      event.currentTarget.value = "";
    });
}

export function triggerFilePicker(textarea, getState) {
  const input = document.getElementById("file-picker-input");
  if (input) {
    input.click();
  } else {
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
  if (!state.isAuthenticated) {
    alert("Please sign in with GitHub to upload images.");
    return;
  }

  uploadQueue.push({ file, textarea });
  processQueue();
}

async function processQueue() {
  if (uploadActive || uploadQueue.length === 0) return;
  uploadActive = true;

  const { file, textarea } = uploadQueue.shift();
  const pendingId = `img_${++uploadIdCounter}_${Date.now().toString(36)}`;
  const placeholder = `![[pending:${pendingId}]]`;
  insertTextAtCursor(textarea, placeholder);

  const attachBtn = document.getElementById("attach-btn");
  if (attachBtn) {
    attachBtn.textContent = "⏳ Processing…";
    attachBtn.disabled = true;
  }

  try {
    const processed = await maybeCompress(file);
    const blobUrl = URL.createObjectURL(processed);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const shortHash = Math.random().toString(36).substring(2, 6);
    const safeName = processed.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const fileName = `Pasted_image_${timestamp}_${shortHash}_${safeName}`;

    const folderInput = document.getElementById("note-folder");
    const folderVal = folderInput ? folderInput.value : "";
    const noteFolder = folderVal.trim().replace(/^\/+|\/+$/g, "");
    const assetFolder = noteFolder ? `Assets/${noteFolder}` : "Assets";
    const path = `vault/${assetFolder}/${fileName}`;

    registerPendingAsset({
      pendingId,
      finalName: fileName,
      path,
      file: processed,
      blobUrl,
      status: "pending"
    });

    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    updateAttachCount(textarea);
  } catch (err) {
    const currentText = textarea.value;
    const phIdx = currentText.indexOf(placeholder);
    const errorMark = `<!-- upload-failed: ${file.name} — ${err.message} -->`;
    if (phIdx >= 0) {
      replaceTextRange(textarea, phIdx, phIdx + placeholder.length, errorMark);
    }
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    alert("Processing failed: " + err.message);
  } finally {
    if (attachBtn) {
      const remaining = uploadQueue.length;
      attachBtn.textContent = remaining > 0 ? `⏳ Processing (${remaining})…` : "📎 Attach Image";
      attachBtn.disabled = remaining > 0;
    }
    uploadActive = false;
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
