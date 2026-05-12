import { insertTextAtCursor, replaceTextRange } from "./utils.js";
import { putFile } from "../inbox.js";

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

    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        await uploadFile(file, textarea, getState);
      }
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
}

async function uploadFile(file, textarea, getState) {
  const state = getState();
  const token = state.token || document.getElementById("token-input").value;
  if (!token) {
    alert("Token required for upload");
    return;
  }

  // Placeholder while uploading
  const placeholder = `![Uploading ${file.name}...]()`;
  insertTextAtCursor(textarea, placeholder);
  const placeholderStart = textarea.selectionStart - placeholder.length;
  const placeholderEnd = textarea.selectionStart;

  try {
    const reader = new FileReader();
    const content = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(new Uint8Array(reader.result));
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const safeName = file.name.replace(/[^a-zA-Z0-6.]/g, "_");
    const fileName = `Pasted_image_${timestamp}_${safeName}`;
    const path = `vault/Assets/${fileName}`;

    await putFile(token, path, content, null, `Upload asset: ${fileName}`);

    // Replace placeholder with wikilink
    const wikilink = `![[${fileName}]]`;
    replaceTextRange(textarea, placeholderStart, placeholderEnd, wikilink);
    textarea.selectionStart = placeholderStart + wikilink.length;
    textarea.selectionEnd = textarea.selectionStart;
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Upload failed: " + err.message);
  }
}
