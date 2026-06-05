import { setupEditor } from "./editor/editor.js";
import { insertTextAtCursor } from "./editor/utils.js";
import { compressImage, generateAssetMeta, validateImageFile } from "./editor/assets.js";
import { initPendingAssetDb, savePendingAsset, loadPendingAssets, deletePendingAsset, saveNoteMetadata, loadAllNoteMetadata, deleteNoteMetadata } from "./editor/indexeddb.js";


const CONFIG = {
  apiBase:
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:8000"
      : "https://node-notes-api-zaxk.onrender.com",
  vaultPrefix: "vault/",
  noteSuffix: ".md",
  deleteConfirmMs: 4000,
  draftBodyKey: "nn_draft_body",
  draftTitleKey: "nn_draft_title",
  draftFolderKey: "nn_draft_folder",
  folderHistoryKey: "nn_folder_history",
  lastFolderKey: "nn_last_folder",
  vaultCollapsedKey: "nn_vault_collapsed",
  folderCollapsedKey: "nn_folder_collapsed",
  pinnedNotesKey: "nn_pinned_notes",
  vaultSortKey: "nn_vault_sort",
  backlinksCollapsedKey: "nn_backlinks_collapsed",
  collapsedFoldersKey: "nn_collapsed_folders",
  lastViewedNoteKey: "nn_last_viewed_note",
};

const $ = (id) => document.getElementById(id);

const elements = {
  authStatusLoading: $("auth-status-loading"),
  authStatusSignedIn: $("auth-status-signed-in"),
  authStatusSignedOut: $("auth-status-signed-out"),
  userAvatar: $("user-avatar"),
  userLogin: $("user-login"),
  loginBtn: $("login-btn"),
  logoutBtn: $("logout-btn"),
  folderInput: $("note-folder"),
  folderToggle: $("folder-toggle"),
  folderHeaderSummary: $("folder-header-summary"),
  folderSectionBody: $("folder-section-body"),
  privateModeToggle: $("private-mode-toggle"),
  folderMenu: $("folder-menu"),
  folderHint: $("folder-hint"),
  folderChips: $("folder-chips"),
  titleInput: $("note-title"),
  bodyInput: $("note-body"),
  noteSearchInput: $("note-search"),
  uploadBtn: $("upload-btn"),
  cancelEditBtn: $("cancel-edit-btn"),
  draftTag: $("draft-tag"),
  statusBar: $("status-bar"),
  statusText: $("status-text"),
  noteList: $("note-list"),
  noteCount: $("note-count"),
  writeTab: $("write-tab"),
  previewTab: $("preview-tab"),
  writePane: $("write-pane"),
  previewPane: $("preview-pane"),
  previewTitle: $("preview-title"),
  previewBody: $("preview-body"),
  attachBtn: $("attach-btn"),
  cameraBtn: $("camera-btn"),
  vaultSection: $("vault-section"),
  vaultToggle: $("vault-toggle"),
  vaultBody: $("vault-body"),
  backlinksSection: $("backlinks-section"),
  backlinksToggle: $("backlinks-toggle"),
  backlinksBody: $("backlinks-body"),
  backlinksList: $("backlinks-list"),
  backlinkCount: $("backlink-count"),
};

const state = {
  editor: {
    mode: "create",
    editingPath: null,
    editingSha: null,
    draftSnapshot: null,
    titleEdited: false,
    searchQuery: "",
    viewMode: "write",
  },
  ui: {
    listStatus: "idle",
    listError: "",
    isMutating: false,
    confirmDeletePath: null,
    deleteConfirmTimer: null,
    folderMenuOpen: false,
    activeFolderIndex: -1,
    vaultCollapsed: false,
    privateMode: false,
    folderCollapsed: false,
    backlinksCollapsed: false,
  },
  vault: {
    notes: [],
    folderHistory: [],
    folderIndex: [],
    filteredFolders: [],
    assetPaths: [],
    pinnedNotes: [],
    sortPreference: "newest",
    metaCache: {},
    backlinkIndex: {},
    metaSyncState: "idle",
  },
  assets: {
    pending: new Map(),
  },
  auth: {
    isAuthenticated: false,
    user: null,
  }
};

const storage = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch { }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch { }
  },
  getJson(key, fallback) {
    const raw = this.get(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  setJson(key, value) {
    this.set(key, JSON.stringify(value));
  },
};

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const WIKILINK_RE = /(!)?\[\[([^\]]+)\]\]/g;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

function setStatus(type, message) {
  elements.statusBar.className = `status visible ${type}`;
  elements.statusText.textContent = message;
}

function setEditorMode(mode) {
  const preview = mode === "preview";
  const previewCanvas = elements.previewPane.querySelector(".editor-canvas");
  
  // Track active mode in state
  state.editor.viewMode = mode;

  // 1. Determine active source scroller and capture percentage
  const sourceScroller = preview ? elements.bodyInput : previewCanvas;

  let pct = 0;
  if (sourceScroller) {
    const max = Math.max(1, sourceScroller.scrollHeight - sourceScroller.clientHeight);
    pct = sourceScroller.scrollTop / max;
  }

  if (preview && previewCanvas) {
    previewCanvas.dataset.targetScrollPct = pct.toString();
  }

  let renderPromise = Promise.resolve();
  if (preview) {
    renderPromise = renderPreview() || Promise.resolve();
  }

  // 2. Toggle active tab visual styles and ARIA states
  elements.writeTab.classList.toggle("active", !preview);
  elements.previewTab.classList.toggle("active", preview);
  elements.writePane.classList.toggle("active", !preview);
  elements.previewPane.classList.toggle("active", preview);
  elements.writeTab.setAttribute("aria-selected", String(!preview));
  elements.previewTab.setAttribute("aria-selected", String(preview));
  elements.writePane.setAttribute("aria-hidden", String(preview));
  elements.previewPane.setAttribute("aria-hidden", String(!preview));

  // 3. Apply scroll to targets
  const applyScroll = () => {
    if (preview) {
      if (previewCanvas) {
        const max = Math.max(1, previewCanvas.scrollHeight - previewCanvas.clientHeight);
        previewCanvas.scrollTop = pct * max;
      }
    } else {
      if (elements.bodyInput) {
        const max = Math.max(1, elements.bodyInput.scrollHeight - elements.bodyInput.clientHeight);
        elements.bodyInput.scrollTop = pct * max;
      }
    }
  };

  // Stage 1: Responsive scroll in next animation frame
  requestAnimationFrame(applyScroll);

  // Stage 2: Corrective scroll after math typesets
  renderPromise.then(() => {
    requestAnimationFrame(applyScroll);
  });
}

function typesetMath(target) {
  if (window.MathJax) {
    return MathJax.typesetPromise([target]).catch(() => { });
  }
  return Promise.resolve();
}

function parsePendingReferences(markdown) {
  const matches = [];
  const regex = /!\[\[pending:([^\]]+)\]\]/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    matches.push({
      id: match[1],
      match: match[0],
      start: match.index,
      end: match.index + match[0].length
    });
  }
  return matches;
}

function resolveAssetPreviewUrl(target) {
  const normalized = target.trim().replace(/\\/g, "/").toLowerCase();
  if (!normalized) return null;

  const directMatch = state.vault.assetPaths.find((path) => path.toLowerCase() === normalized);
  if (directMatch) return `content/${encodeURI(directMatch)}`;

  const leaf = normalized.split("/").pop();
  const matches = state.vault.assetPaths.filter((path) => path.toLowerCase().split("/").pop() === leaf);
  if (matches.length === 1) {
    return `content/${encodeURI(matches[0])}`;
  }

  return null;
}

function preprocessMarkdown(markdown) {
  const withEmbeds = markdown.replace(/!\[\[([^\]]+)\]\]/g, (match, inner) => {
    if (inner.startsWith("pending:")) {
      const id = inner.replace("pending:", "");
      const asset = state.assets.pending.get(id);
      if (asset && asset.blobUrl) {
        return `![${asset.finalName}](${asset.blobUrl})`;
      }
      return `![Pending asset unavailable]()`;
    }

    const target = inner.split("|", 1)[0].split("#", 1)[0].trim();
    const resolved = resolveAssetPreviewUrl(target);
    return resolved ? `![${target}](${resolved})` : match;
  });

  return withEmbeds.replace(WIKILINK_RE, (match, bang, inner) => {
    if (bang) return match;

    const [targetPart, aliasPart] = inner.split("|");
    const target = (targetPart || "").split("#", 1)[0].trim();
    const label = (aliasPart || target || "Untitled").trim();

    if (!target) return "";

    const resolvedNote = resolveVaultNoteTarget(target);
    const escapedTarget = escapeHtml(target);
    const escapedLabel = escapeHtml(label);

    if (!resolvedNote) {
      return `<a href="#" class="internal-link internal-link--ghost" data-note-target="${escapedTarget}" aria-label="Create missing note ${escapedLabel}">${escapedLabel}</a>`;
    }

    return `<a href="#" class="internal-link" data-note-path="${escapeHtml(resolvedNote.path)}" data-note-target="${escapedTarget}">${escapedLabel}</a>`;
  });
}

function updateAttachCount() {
  const badge = $("attach-count");
  if (!badge) return;
  const count = state.assets.pending.size;
  badge.textContent = count > 0 ? `${count} pending image${count > 1 ? "s" : ""}` : "";
}

function renderPreview() {
  const title = elements.titleInput.value.trim();
  const body = elements.bodyInput.value;

  elements.previewTitle.textContent = title;
  elements.previewTitle.classList.toggle("hidden", !title);

  if (!body.trim()) {
    elements.previewBody.innerHTML = '<p class="preview-empty">Nothing to preview yet</p>';
    return Promise.resolve();
  }

  const processedBody = preprocessMarkdown(body);
  const purifyConfig = {
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|blob|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  };
  elements.previewBody.innerHTML = DOMPurify.sanitize(marked.parse(processedBody, { breaks: true, gfm: true }), purifyConfig);
  return typesetMath(elements.previewBody);
}

function normalizeFolderPath(value) {
  return value
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/\s*\/\s*/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .trim();
}

function noteStemFromPath(path) {
  return path.split("/").pop().replace(/\.md$/i, "");
}

function normalizeLinkTarget(value) {
  return String(value || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^vault\//i, "")
    .replace(/\.md$/i, "")
    .toLowerCase();
}

function resolveVaultNoteTarget(target) {
  const normalized = normalizeLinkTarget(target);
  if (!normalized) return null;

  const exact = new Map();
  const byLeaf = new Map();

  for (const note of state.vault.notes) {
    const linkTarget = normalizeLinkTarget(note.linkTarget);
    exact.set(linkTarget, note);

    const leaf = linkTarget.split("/").pop();
    if (!byLeaf.has(leaf)) byLeaf.set(leaf, []);
    byLeaf.get(leaf).push(note);
  }

  if (exact.has(normalized)) return exact.get(normalized);

  const leaf = normalized.split("/").pop();
  const matches = byLeaf.get(leaf) || [];
  return matches.length === 1 ? matches[0] : null;
}

function isVaultPathSafe(path) {
  if (typeof path !== "string" || !path.startsWith(CONFIG.vaultPrefix) || path.includes("\\") || !path.endsWith(CONFIG.noteSuffix)) {
    return false;
  }
  const parts = path.split("/");
  return !parts.includes("..") && !parts.includes(".");
}

function buildFilename(title) {
  if (title.trim()) {
    return `${title.trim().replace(/[\\/:*?"<>|]/g, "_").replace(/\.md$/i, "")}.md`;
  }

  const now = new Date();
  const pad = (n, width = 2) => String(n).padStart(width, "0");
  return [
    now.getUTCFullYear(),
    "-",
    pad(now.getUTCMonth() + 1),
    "-",
    pad(now.getUTCDate()),
    "T",
    pad(now.getUTCHours()),
    "-",
    pad(now.getUTCMinutes()),
    "-",
    pad(now.getUTCSeconds()),
    "-",
    pad(now.getUTCMilliseconds(), 3),
    "Z.md",
  ].join("");
}

function buildMarkdown(title, body, fallbackTitle) {
  const safeTitle = (title || fallbackTitle).replace(/"/g, '\\"');
  return [
    "---",
    `title: "${safeTitle}"`,
    `date: ${new Date().toISOString()}`,
    "tags: [vault, web]",
    "---",
    "",
    body,
  ].join("\n");
}

function parseEditableNote(path, markdown) {
  const fallback = noteStemFromPath(path);
  const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!frontmatter) {
    return { title: fallback, body: markdown };
  }

  const titleMatch = frontmatter[1].match(/^title\s*:\s*(?:"((?:\\"|[^"])*)"|'([^']*)'|(.+))\s*$/m);
  const title = (titleMatch?.[1] || titleMatch?.[2] || titleMatch?.[3] || "").replace(/\\"/g, '"').trim();

  return {
    title: title || fallback,
    body: markdown.slice(frontmatter[0].length),
  };
}

function beginLinkedNoteDraft(rawTarget) {
  const cleanedTarget = String(rawTarget || "").split("#", 1)[0].trim().replace(/\\/g, "/").replace(/\.md$/i, "");
  if (!cleanedTarget) return;

  if (state.editor.mode === "edit" && !state.editor.draftSnapshot) {
    state.editor.draftSnapshot = {
      title: elements.titleInput.value,
      body: elements.bodyInput.value,
      folder: elements.folderInput.value,
    };
  }

  enterCreateMode();

  const parts = cleanedTarget.split("/").filter(Boolean);
  const leaf = parts.pop() || cleanedTarget;
  const folder = parts.join("/") || elements.folderInput.value || defaultFolder();

  elements.titleInput.value = leaf;
  elements.bodyInput.value = `# ${leaf}\n\nStart writing...`;
  elements.folderInput.value = folder;
  state.editor.titleEdited = true;

  updateModeUi();
  updateFolderHint();
  updateFolderSectionCollapse();
  renderPreview();
  saveDraftSoon();
  setEditorMode("preview");
  setStatus("success", `Draft created for "${leaf}". Save to create the linked note.`);
}

async function navigateToLinkedNote(rawTarget) {
  if (!state.auth.isAuthenticated) {
    setStatus("error", "Please sign in to follow or create internal links.");
    return;
  }

  const target = String(rawTarget || "").split("#", 1)[0].trim();
  if (!target) return;

  const note = resolveVaultNoteTarget(target);
  if (note) {
    await startEditing(note.path);
    setEditorMode("preview");
    return;
  }

  const shouldCreate = window.confirm(`Note "${target}" does not exist yet. Create a draft for it now?`);
  if (!shouldCreate) return;

  beginLinkedNoteDraft(target);
}

function extractAutoTitle(body) {
  const heading = body.match(/^#\s+(.*)$/m)?.[1]?.trim();
  if (heading) {
    return heading.slice(0, 80).replace(/[\\/:*?"<>|]/g, "");
  }

  const firstLine = body.split("\n").find((line) => line.trim());
  return firstLine ? firstLine.trim().slice(0, 80).replace(/[\\/:*?"<>|]/g, "") : "";
}

export async function createPendingAsset(file) {
  const attachBtn = document.getElementById("attach-btn");
  if (attachBtn) {
    attachBtn.textContent = "⏳ Processing…";
    attachBtn.disabled = true;
  }

  try {
    const error = validateImageFile(file);
    if (error) {
      setStatus("error", error);
      return;
    }

    if (!state.auth.isAuthenticated) {
      setStatus("error", "Please sign in with GitHub to upload images.");
      return;
    }

    const processed = await compressImage(file);

    const folderInput = document.getElementById("note-folder");
    const folderVal = folderInput ? folderInput.value : "";
    const { fileName, path } = generateAssetMeta(processed, folderVal);

    const pendingId = `img_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const dbAsset = {
      pendingId,
      finalName: fileName,
      path,
      file: processed,
      status: "pending",
      createdAt: Date.now()
    };

    try {
      await savePendingAsset(dbAsset);
    } catch (dbErr) {
      setStatus("error", "Failed to save image to local draft storage.");
      return;
    }

    const blobUrl = URL.createObjectURL(processed);
    const placeholder = `![[pending:${pendingId}]]`;
    insertTextAtCursor(elements.bodyInput, placeholder);

    const asset = { ...dbAsset, blobUrl };
    state.assets.pending.set(pendingId, asset);

    elements.bodyInput.dispatchEvent(new Event("input", { bubbles: true }));
    renderPendingAssets();
  } catch (err) {
    setStatus("error", "Processing failed: " + err.message);
  } finally {
    if (attachBtn) {
      attachBtn.textContent = "📎 Attach Image";
      attachBtn.disabled = false;
    }
  }
}

export async function removePendingAsset(id) {
  const asset = state.assets.pending.get(id);
  if (!asset) return;

  URL.revokeObjectURL(asset.blobUrl);
  state.assets.pending.delete(id);

  try {
    await deletePendingAsset(id);
  } catch (err) {
    console.error("Failed to delete pending asset from IDB", err);
  }

  elements.bodyInput.value = elements.bodyInput.value.replace(new RegExp(`!\\[\\[pending:${id}\\]\\]\\n?`, 'g'), '');

  renderPendingAssets();
  renderPreview();
  saveDraftSoon();
}

function renderPendingAssets() {
  const gallery = document.getElementById("pending-gallery");
  if (!gallery) return;

  if (state.assets.pending.size === 0) {
    gallery.classList.add("hidden");
    gallery.innerHTML = "";
    updateAttachCount();
    return;
  }

  gallery.classList.remove("hidden");
  gallery.innerHTML = Array.from(state.assets.pending.values()).map(asset => `
    <div class="pending-thumbnail is-${asset.status}" title="${asset.finalName}" data-id="${asset.pendingId}">
      <img src="${asset.blobUrl}" alt="${asset.finalName}" />
      <button type="button" class="remove-asset-btn" data-id="${asset.pendingId}" title="Remove image">×</button>
      ${asset.status === "uploading" ? '<div class="spinner"></div>' : ''}
      ${asset.status === "failed" ? '<div class="error-icon">!</div>' : ''}
    </div>
  `).join("");
  updateAttachCount();
}

function renderFolderMenu(query = "") {
  if (state.ui.privateMode) {
    closeFolderMenu();
    return;
  }

  const q = query.trim().toLowerCase();
  let matches = state.vault.folderIndex;

  if (q) {
    const startsWithMatches = [];
    const includesMatches = [];
    for (const folder of state.vault.folderIndex) {
      const fLower = folder.toLowerCase();
      if (fLower.startsWith(q)) {
        startsWithMatches.push(folder);
      } else if (fLower.includes(q)) {
        includesMatches.push(folder);
      }
    }
    matches = [...startsWithMatches, ...includesMatches];
  }

  state.vault.filteredFolders = matches.slice(0, 10);

  if (state.vault.filteredFolders.length === 0) {
    closeFolderMenu();
    return;
  }

  elements.folderMenu.innerHTML = state.vault.filteredFolders
    .map((folder, i) => `
      <div class="folder-menu-item" 
           role="option" 
           id="folder-opt-${i}"
           aria-selected="${i === state.ui.activeFolderIndex}" 
           data-index="${i}">
        ${escapeHtml(folder)}
      </div>
    `)
    .join("");

  elements.folderMenu.classList.remove("hidden");
  elements.folderInput.setAttribute("aria-expanded", "true");
  state.ui.folderMenuOpen = true;

  if (state.ui.activeFolderIndex >= state.vault.filteredFolders.length) {
    state.ui.activeFolderIndex = -1;
  }

  if (state.ui.activeFolderIndex >= 0) {
    const selectedEl = elements.folderMenu.querySelector(`[data-index="${state.ui.activeFolderIndex}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "nearest" });
    }
  }
}

function closeFolderMenu() {
  state.ui.folderMenuOpen = false;
  state.ui.activeFolderIndex = -1;
  elements.folderMenu.classList.add("hidden");
  elements.folderInput.setAttribute("aria-expanded", "false");
}

function selectFolderSuggestion(index) {
  const folder = state.vault.filteredFolders[index];
  if (!folder) return;

  elements.folderInput.value = folder;
  closeFolderMenu();

  // Follow same path as manual typing
  saveDraftSoon();
  updateFolderHint();
  updateFolderSectionCollapse();

  // Only focus input if it remains visible (not collapsed)
  const isCollapsed = elements.folderSectionBody.classList.contains("hidden");
  if (!isCollapsed) {
    elements.folderInput.focus();
  }
}

function updateFolderIndex(tree) {
  const counts = new Map();

  for (const entry of tree) {
    if (entry.type !== "blob" || !isVaultPathSafe(entry.path)) continue;

    const parts = entry.path.replace(CONFIG.vaultPrefix, "").split("/");
    parts.pop();

    let current = "";
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      counts.set(current, (counts.get(current) || 0) + 1);
    }
  }

  state.vault.folderIndex = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a));
  if (state.ui.folderMenuOpen) renderFolderMenu(elements.folderInput.value);
}

function renderFolderChips() {
  elements.folderChips.innerHTML = state.vault.folderHistory
    .map((folder) => `<button type="button" class="folder-chip" data-folder="${escapeHtml(folder)}">${escapeHtml(folder)}</button>`)
    .join("");
}

function updateFolderHint() {
  const folder = normalizeFolderPath(elements.folderInput.value);
  if (!folder || state.vault.folderIndex.includes(folder) || state.ui.privateMode) {
    elements.folderHint.classList.add("hidden");
    return;
  }

  elements.folderHint.textContent = `New folder: ${folder}`;
  elements.folderHint.classList.remove("hidden");
}

function updateFolderSectionCollapse() {
  const folderValue = elements.folderInput.value.trim();
  const isEditing = state.editor.mode === "edit";
  const isDisabled = elements.folderInput.disabled;
  const isFocused = elements.folderSectionBody.contains(document.activeElement);

  // Override rules: force expanded in Edit Mode, when input is disabled, or when focus is inside section body
  let activeCollapsed = false;
  if (isEditing || isDisabled || isFocused) {
    activeCollapsed = false;
  } else {
    activeCollapsed = state.ui.folderCollapsed;
  }

  // Update semantic button ARIA attributes and body visibility
  elements.folderToggle.setAttribute("aria-expanded", !activeCollapsed);
  elements.folderSectionBody.classList.toggle("hidden", activeCollapsed);

  // Sync toggle button disabled and aria states
  const cannotCollapse = isEditing || isDisabled;
  elements.folderToggle.disabled = cannotCollapse;
  if (cannotCollapse) {
    elements.folderToggle.setAttribute("aria-disabled", "true");
  } else {
    elements.folderToggle.removeAttribute("aria-disabled");
  }

  // Manage focus transition when collapsing
  if (activeCollapsed) {
    const isFocusInside = elements.folderSectionBody.contains(document.activeElement);
    if (isFocusInside) {
      elements.folderToggle.focus();
    }
  }

  // Sync autocomplete: close dropdown when collapsing
  if (activeCollapsed) {
    closeFolderMenu();
  }

  // Update header summary formatting
  if (activeCollapsed) {
    const normalized = normalizeFolderPath(folderValue);
    elements.folderHeaderSummary.textContent = normalized ? `(${normalized})` : "(Root)";
    elements.folderHeaderSummary.classList.remove("hidden");
  } else {
    elements.folderHeaderSummary.classList.add("hidden");
  }
}

function toggleFolderSection() {
  const isEditing = state.editor.mode === "edit";
  const isDisabled = elements.folderInput.disabled;

  // Prevent collapsing if in Edit Mode or input is disabled
  if (isEditing || isDisabled) return;

  state.ui.folderCollapsed = !state.ui.folderCollapsed;
  storage.setJson(CONFIG.folderCollapsedKey, state.ui.folderCollapsed);
  updateFolderSectionCollapse();
}

function saveFolderHistory(folder) {
  if (!folder || state.ui.privateMode) return;
  state.vault.folderHistory = [folder, ...state.vault.folderHistory.filter((item) => item !== folder)].slice(0, 5);
  storage.setJson(CONFIG.folderHistoryKey, state.vault.folderHistory);
  renderFolderChips();
}

function restoreSavedDraft() {
  const body = storage.get(CONFIG.draftBodyKey, "");
  const title = storage.get(CONFIG.draftTitleKey, "");
  const folder = storage.get(CONFIG.draftFolderKey, "");

  if (body) elements.bodyInput.value = body;
  if (title) {
    elements.titleInput.value = title;
    state.editor.titleEdited = true;
  }
  if (folder) elements.folderInput.value = folder;

  elements.draftTag.classList.toggle("visible", Boolean(body || title || folder));
}

function saveDraftSoon() {
  clearTimeout(saveDraftSoon.timerId);
  saveDraftSoon.timerId = setTimeout(() => {
    storage.set(CONFIG.draftBodyKey, elements.bodyInput.value);
    storage.set(CONFIG.draftTitleKey, elements.titleInput.value);

    const folder = elements.folderInput.value;
    if (folder && !state.ui.privateMode) {
      storage.set(CONFIG.draftFolderKey, folder);
    } else {
      storage.remove(CONFIG.draftFolderKey);
    }

    elements.draftTag.classList.toggle(
      "visible",
      Boolean(elements.bodyInput.value || elements.titleInput.value || folder),
    );
  }, 600);
}

function clearSavedDraft() {
  storage.remove(CONFIG.draftBodyKey);
  storage.remove(CONFIG.draftTitleKey);
  storage.remove(CONFIG.draftFolderKey);
  elements.draftTag.classList.remove("visible");
}

function clearDeleteConfirmation() {
  state.ui.confirmDeletePath = null;
  clearTimeout(state.ui.deleteConfirmTimer);
  state.ui.deleteConfirmTimer = null;
}

function armDeleteConfirmation(path) {
  clearDeleteConfirmation();
  state.ui.confirmDeletePath = path;
  state.ui.deleteConfirmTimer = setTimeout(() => {
    clearDeleteConfirmation();
    renderNoteList();
  }, CONFIG.deleteConfirmMs);
}

function setMutationState(isMutating) {
  state.ui.isMutating = isMutating;
  elements.uploadBtn.disabled = isMutating;
  elements.cancelEditBtn.disabled = isMutating;
  renderNoteList();
}

function filteredNotes() {
  const raw = state.editor.searchQuery.trim();
  const query = raw.toLowerCase();

  let notes;
  if (!query) {
    notes = state.vault.notes;
  } else {
    // Split into tag tokens (#foo) and plain text tokens
    const tokens = query.split(/\s+/);
    const tagTokens = tokens.filter(t => t.startsWith("#")).map(t => t.slice(1)).filter(Boolean);
    const textTokens = tokens.filter(t => !t.startsWith("#")).filter(Boolean);

    notes = state.vault.notes.filter(note => {
      // Plain text: must match all text tokens against displayPath
      const pathLower = note.displayPath.toLowerCase();
      const textMatch = textTokens.every(t => pathLower.includes(t));

      // Tag match: must match all tag tokens against cached tags
      let tagMatch = true;
      if (tagTokens.length > 0) {
        const cached = state.vault.metaCache?.[note.path];
        const noteTags = (cached?.tags || []).map(t => t.toLowerCase());
        tagMatch = tagTokens.every(tag => noteTags.some(nt => nt.includes(tag)));
      }

      return textMatch && tagMatch;
    });

    // Flat search view: sort globally
    notes = [...notes];
    const pref = state.vault.sortPreference;
    if (pref === "newest" || pref === "oldest") {
      notes.sort((a, b) => {
        const ad = state.vault.metaCache?.[a.path]?.frontmatterDate ?? null;
        const bd = state.vault.metaCache?.[b.path]?.frontmatterDate ?? null;
        if (!ad && !bd) return 0;
        if (!ad) return 1;
        if (!bd) return -1;
        return pref === "newest" ? bd.localeCompare(ad) : ad.localeCompare(bd);
      });
    } else {
      notes.sort((a, b) => a.displayPath.localeCompare(b.displayPath));
    }
  }
  return notes;
}


function buildFolderTree(notes) {
  const root = { name: "Root", path: "", isFolder: true, children: {}, files: [] };

  for (const note of notes) {
    const parts = note.displayPath.split("/");
    let current = root;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current.children[part]) {
        const subPath = parts.slice(0, i + 1).join("/");
        current.children[part] = {
          name: part,
          path: subPath,
          isFolder: true,
          children: {},
          files: []
        };
      }
      current = current.children[part];
    }
    current.files.push(note);
  }
  return root;
}

function sortNotesLocal(files) {
  const pref = state.vault.sortPreference;
  const sorted = [...files];
  if (pref === "newest" || pref === "oldest") {
    sorted.sort((a, b) => {
      const ad = state.vault.metaCache?.[a.path]?.frontmatterDate ?? null;
      const bd = state.vault.metaCache?.[b.path]?.frontmatterDate ?? null;
      if (!ad && !bd) return a.displayPath.localeCompare(b.displayPath);
      if (!ad) return 1;
      if (!bd) return -1;
      return pref === "newest" ? bd.localeCompare(ad) : ad.localeCompare(bd);
    });
  } else {
    sorted.sort((a, b) => {
      const aName = a.displayPath.split("/").pop();
      const bName = b.displayPath.split("/").pop();
      return aName.localeCompare(bName);
    });
  }
  return sorted;
}

function noteCardHtml(note, depth = 0) {
  const filename = note.displayPath.split("/").pop().replace(/\.md$/i, "");
  const confirming = state.ui.confirmDeletePath === note.path;
  const isPinned = state.vault.pinnedNotes.includes(note.path);
  const disabled = state.ui.isMutating || !state.auth.isAuthenticated ? "disabled" : "";
  return `
    <article class="vault-card depth-${depth}" data-path="${escapeHtml(note.path)}">
      <div class="vault-card__top">
        <div class="vault-card__content">
          <button class="vault-card__title-btn"
                  type="button"
                  data-action="edit"
                  data-path="${escapeHtml(note.path)}">
            <span class="file-icon">📄</span> ${escapeHtml(filename)}
          </button>
          <div class="vault-card__meta" data-metadata-path="${escapeHtml(note.path)}"></div>
        </div>
        <div class="vault-card__actions">
          <button type="button"
                  class="vault-card__action-btn pin-btn${isPinned ? " active-pin" : ""}"
                  data-action="pin"
                  data-path="${escapeHtml(note.path)}"
                  aria-label="${isPinned ? "Unpin note" : "Pin note"}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="${isPinned ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>
          </button>
          <button type="button"
                  class="vault-card__action-btn edit-btn"
                  data-action="edit"
                  data-path="${escapeHtml(note.path)}"
                  aria-label="Edit note"
                  ${disabled}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button type="button"
                  class="vault-card__action-btn delete-btn${confirming ? " active-danger" : ""}"
                  data-action="delete"
                  data-path="${escapeHtml(note.path)}"
                  data-sha="${escapeHtml(note.sha || "")}"
                  aria-label="${confirming ? "Confirm delete" : "Delete note"}"
                  ${disabled}>
            ${confirming
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`
    }
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderTreeNode(node, depth = 0) {
  let html = "";

  // Sort subfolders alphabetically
  const sortedSubFolders = Object.values(node.children).sort((a, b) => a.name.localeCompare(b.name));

  // Sort files by active preference within this folder
  const sortedFiles = sortNotesLocal(node.files);

  // Render subfolders first
  for (const subFolder of sortedSubFolders) {
    const isCollapsed = state.ui.collapsedFolders.has(subFolder.path);
    html += `
      <div class="vault-folder-group depth-${depth}">
        <button class="vault-folder-header ${isCollapsed ? "collapsed" : ""}"
                type="button"
                data-folder="${escapeHtml(subFolder.path)}"
                aria-expanded="${!isCollapsed}">
          <div class="vault-folder-title">
            <span class="folder-icon">📂</span>
            <span class="vault-folder-name">${escapeHtml(subFolder.name)}</span>
          </div>
          <span class="folder-arrow">${isCollapsed ? "▶" : "▼"}</span>
        </button>
        <div class="vault-folder-contents ${isCollapsed ? "hidden" : ""}">
          ${renderTreeNode(subFolder, depth + 1)}
        </div>
      </div>
    `;
  }

  for (const note of sortedFiles) {
    html += noteCardHtml(note, depth);
  }

  return html;
}

function renderNoteList() {
  if (state.ui.listStatus === "loading") {
    elements.noteList.innerHTML = '<p class="list-state">Scanning vault notes…</p>';
    elements.noteCount.textContent = "Syncing";
    return;
  }

  if (state.ui.listStatus === "error") {
    elements.noteList.innerHTML = `<p class="list-state">${escapeHtml(state.ui.listError || "Unable to load notes.")}</p>`;
    elements.noteCount.textContent = "Error";
    return;
  }

  const notes = filteredNotes();
  if (!notes.length) {
    const message = !state.auth.isAuthenticated
      ? "Please sign in with GitHub to manage vault notes."
      : state.editor.searchQuery
        ? `No matches for "${escapeHtml(state.editor.searchQuery)}".`
        : "No notes found in vault.";
    elements.noteList.innerHTML = `<p class="list-state">${message}</p>`;
    elements.noteCount.textContent = "0 files";
    return;
  }

  elements.noteCount.textContent = `${notes.length} files`;

  if (!state.ui.collapsedFolders) {
    state.ui.collapsedFolders = new Set(storage.getJson(CONFIG.collapsedFoldersKey, []));
  }

  const query = state.editor.searchQuery.trim();
  if (query) {
    // Search View: Flat card list, globally sorted, full displayPath as title
    elements.noteList.innerHTML = notes.map((note) => {
      // Override filename display to show full path in search view
      const origDisplayPath = note.displayPath;
      const cardNote = { ...note, displayPath: origDisplayPath };
      // Patch the title to show full path (without .md) instead of filename only
      const baseFilename = origDisplayPath.split("/").pop().replace(/\.md$/i, "");
      const cleanDisplayPath = origDisplayPath.replace(/\.md$/i, "");
      return noteCardHtml(cardNote, 0).replace(
        escapeHtml(baseFilename),
        escapeHtml(cleanDisplayPath)
      );
    }).join("");
  } else {
    // Default View: Hierarchical folder explorer tree with optional Pinned block at top
    let html = "";

    // Pinned section
    if (state.vault.pinnedNotes.length > 0) {
      const pinnedNoteObjects = state.vault.pinnedNotes
        .map(p => notes.find(n => n.path === p))
        .filter(Boolean);
      if (pinnedNoteObjects.length > 0) {
        html += `<div class="vault-pinned-group">
          <div class="vault-folder-header vault-pinned-header" aria-readonly="true">
            <div class="vault-folder-title">
              <span class="folder-icon">📌</span>
              <span class="vault-folder-name">Pinned</span>
            </div>
          </div>
          <div class="vault-folder-contents">
            ${pinnedNoteObjects.map(n => noteCardHtml(n, 0)).join("")}
          </div>
        </div>`;
      }
    }

    const tree = buildFolderTree(notes);
    html += renderTreeNode(tree, 0);
    elements.noteList.innerHTML = html;
  }
}

function updateModeUi() {
  const editing = state.editor.mode === "edit";
  elements.uploadBtn.textContent = editing ? "Update Note" : "Save to Vault";
  elements.cancelEditBtn.classList.toggle("hidden", !editing);
  elements.folderInput.disabled = editing;
  if (elements.backlinksSection) {
    elements.backlinksSection.classList.toggle("hidden", !editing);
  }
}

function restoreDraftSnapshot() {
  if (!state.editor.draftSnapshot) return;
  elements.titleInput.value = state.editor.draftSnapshot.title;
  elements.bodyInput.value = state.editor.draftSnapshot.body;
  elements.folderInput.value = state.editor.draftSnapshot.folder;
  state.editor.titleEdited = Boolean(state.editor.draftSnapshot.title);
  state.editor.draftSnapshot = null;
  saveDraftSoon();
  renderPreview();
  updateFolderSectionCollapse();
}

function enterCreateMode() {
  state.editor.mode = "create";
  state.editor.editingPath = null;
  state.editor.editingSha = null;
  state.editor.titleEdited = Boolean(elements.titleInput.value.trim());

  if (!elements.folderInput.value) {
    elements.folderInput.value = sessionStorage.getItem(CONFIG.lastFolderKey) || "";
  }

  updateModeUi();
  updateFolderHint();
  updateFolderSectionCollapse();
}

function exitEditMode({ restoreDraft = true } = {}) {
  storage.remove(CONFIG.lastViewedNoteKey);
  enterCreateMode();
  if (restoreDraft) {
    restoreDraftSnapshot();
  } else {
    state.editor.draftSnapshot = null;
  }
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${CONFIG.apiBase}${endpoint}`, {
    credentials: "include",
    ...options,
  });

  if (response.status === 401) {
    state.auth.isAuthenticated = false;
    renderAuth();
    throw new Error("Unauthorized. Please sign in again.");
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || errorBody.message || `Request failed: ${response.status}`);
  }

  return response.json();
}

function renderAuth() {
  elements.authStatusLoading.classList.add("hidden");
  elements.authStatusSignedIn.classList.toggle("hidden", !state.auth.isAuthenticated);
  elements.authStatusSignedOut.classList.toggle("hidden", state.auth.isAuthenticated);

  if (state.auth.isAuthenticated && state.auth.user) {
    elements.userLogin.textContent = state.auth.user.login;
    elements.userAvatar.src = state.auth.user.avatar_url;
  }
}

async function checkAuth() {
  elements.authStatusLoading.classList.remove("hidden");
  elements.authStatusSignedIn.classList.add("hidden");
  elements.authStatusSignedOut.classList.add("hidden");
  elements.authStatusLoading.textContent = "Checking connection…";

  const coldStartTimer = setTimeout(() => {
    elements.authStatusLoading.textContent = "Waking up server... this may take a moment.";
  }, 2000);

  try {
    const data = await apiRequest("/auth/status");
    clearTimeout(coldStartTimer);
    state.auth.isAuthenticated = data.authenticated;
    state.auth.user = data.user || null;
    renderAuth();

    if (state.auth.isAuthenticated) {
      await fetchNotes();

      const lastViewed = storage.get(CONFIG.lastViewedNoteKey);
      const hasDraft = storage.get(CONFIG.draftBodyKey) || storage.get(CONFIG.draftTitleKey) || storage.get(CONFIG.draftFolderKey);
      if (!window.location.hash && !hasDraft && lastViewed) {
        const noteExists = state.vault.notes.some(n => n.path === lastViewed);
        if (noteExists) {
          await startEditing(lastViewed);
        }
      }
    }
  } catch {
    clearTimeout(coldStartTimer);
    elements.authStatusLoading.textContent = "Backend offline.";
  }
}

async function keepAlive() {
  if (!state.auth.isAuthenticated) return;
  try {
    const data = await apiRequest("/auth/status");
    if (!data.authenticated) {
      state.auth.isAuthenticated = false;
      state.auth.user = null;
      renderAuth();
    }
  } catch (err) {
    console.warn("Silent keep-alive check failed:", err);
  }
}

function loginWithGitHub() {
  window.location.href = `${CONFIG.apiBase}/auth/login`;
}

async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
    window.location.reload();
  } catch {
    setStatus("error", "Logout failed.");
  }
}

async function getFileContent(path) {
  return apiRequest(`/api/vault/content/${path}`);
}

export async function putFile(path, content, sha, message) {
  const bytes = content instanceof Uint8Array ? content : new TextEncoder().encode(content);
  const base64Content = btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));

  return apiRequest("/api/vault/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, content: base64Content, sha, message }),
  });
}

async function deleteFile(path, sha, message) {
  return apiRequest("/api/vault/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, sha, message }),
  });
}

async function fetchNotes() {
  if (!state.auth.isAuthenticated) return;

  state.ui.listStatus = "loading";
  state.ui.listError = "";
  clearDeleteConfirmation();
  renderNoteList();

  try {
    const data = await apiRequest("/api/vault/notes");
    const tree = data.tree || [];
    updateFolderIndex(tree);
    state.vault.assetPaths = tree
      .filter((entry) => entry.type === "blob" && entry.path.startsWith(CONFIG.vaultPrefix) && !entry.path.endsWith(CONFIG.noteSuffix))
      .map((entry) => entry.path.replace(/^vault\//, ""));
    state.vault.notes = tree
      .filter((entry) => entry.type === "blob" && isVaultPathSafe(entry.path))
      .sort((a, b) => b.path.localeCompare(a.path))
      .map((entry) => ({
        path: entry.path,
        displayPath: entry.path.replace(/^vault\//, ""),
        title: noteStemFromPath(entry.path).replace(/_/g, " "),
        linkTarget: entry.path.replace(/^vault\//, "").replace(/\.md$/i, ""),
        sha: entry.sha || null,
      }));
    state.ui.listStatus = "ready";
  } catch (error) {
    state.ui.listStatus = "error";
    state.ui.listError = error.message || "Unable to load notes.";
  }

  renderNoteList();
  // Start metadata cache sync in background, no await
  startMetadataSync();
}

// ---------------------------------------------------------------------------
// Metadata Sync Engine
// ---------------------------------------------------------------------------

function parseFrontmatter(rawContent) {
  // rawContent is the full decoded markdown string
  const fm = { frontmatterDate: null, tags: [] };
  if (!rawContent.startsWith("---")) return fm;
  const end = rawContent.indexOf("\n---", 3);
  if (end === -1) return fm;
  const block = rawContent.slice(3, end);

  // date
  const dateMatch = block.match(/^(?:date|created|updated):\s*(.+)$/im);
  if (dateMatch) {
    const raw = dateMatch[1].trim().replace(/['"`]/g, "");
    const parsed = Date.parse(raw);
    if (!isNaN(parsed)) {
      fm.frontmatterDate = new Date(parsed).toISOString();
    } else if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      fm.frontmatterDate = raw.slice(0, 10);
    }
  }

  // tags — supports two forms:
  //   tags: [a, b, c]
  //   tags:\n  - a\n  - b
  const tagsInline = block.match(/^tags:\s*\[([^\]]+)\]/im);
  if (tagsInline) {
    fm.tags = tagsInline[1].split(",").map(t => t.trim().replace(/['"`]/g, "")).filter(Boolean);
  } else {
    const tagsBlock = block.match(/^tags:\s*\n((?:\s*-\s*.+\n?)+)/im);
    if (tagsBlock) {
      fm.tags = tagsBlock[1].split("\n").map(l => l.replace(/^\s*-\s*/, "").trim()).filter(Boolean);
    }
  }

  return fm;
}

function extractOutgoingLinks(markdown) {
  if (!markdown) return [];
  const links = new Set();

  // WIKILINK_RE is global, so reset lastIndex to prevent stateful issues
  WIKILINK_RE.lastIndex = 0;

  let match;
  while ((match = WIKILINK_RE.exec(markdown)) !== null) {
    const [full, bang, inner] = match;
    if (bang) continue; // Skip image/asset embeds ![[...]]
    const targetPart = inner.split("|")[0];
    const target = (targetPart || "").split("#")[0].trim();
    if (!target) continue;

    // Resolve target link using existing logic to get canonical target form if it exists
    const resolvedNote = resolveVaultNoteTarget(target);
    if (resolvedNote) {
      links.add(normalizeLinkTarget(resolvedNote.linkTarget));
    } else {
      links.add(normalizeLinkTarget(target));
    }
  }
  return Array.from(links);
}

function rebuildBacklinkIndex() {
  const index = {};
  for (const [path, record] of Object.entries(state.vault.metaCache)) {
    if (!record.outgoing_links) continue;
    for (const target of record.outgoing_links) {
      if (!index[target]) {
        index[target] = new Set();
      }
      index[target].add(path);
    }
  }
  state.vault.backlinkIndex = index;
}

function updateBacklinkIndexForRecord(path, oldRecord, newRecord) {
  if (!state.vault.backlinkIndex) {
    state.vault.backlinkIndex = {};
  }
  // Remove path from old links
  if (oldRecord && oldRecord.outgoing_links) {
    for (const target of oldRecord.outgoing_links) {
      const set = state.vault.backlinkIndex[target];
      if (set) {
        set.delete(path);
        if (set.size === 0) {
          delete state.vault.backlinkIndex[target];
        }
      }
    }
  }
  // Add path to new links
  if (newRecord && newRecord.outgoing_links) {
    for (const target of newRecord.outgoing_links) {
      if (!state.vault.backlinkIndex[target]) {
        state.vault.backlinkIndex[target] = new Set();
      }
      state.vault.backlinkIndex[target].add(path);
    }
  }
}

function renderBacklinks(path) {
  if (!path) return;
  const list = elements.backlinksList;
  const countBadge = elements.backlinkCount;
  if (!list || !countBadge) return;

  // 1. Loading/Scanning State
  if (!state.vault.metaCache[path]) {
    countBadge.textContent = "...";
    list.innerHTML = `<div class="backlink-loading">Scanning note metadata…</div>`;
    return;
  }

  // 2. Resolve Backlinks using canonical linkTarget
  const currentLinkTarget = normalizeLinkTarget(path);
  const backlinks = state.vault.backlinkIndex[currentLinkTarget];
  const backlinkArray = backlinks ? Array.from(backlinks) : [];

  countBadge.textContent = backlinkArray.length;

  if (backlinkArray.length === 0) {
    list.innerHTML = `<div class="backlink-empty">No backlinks yet</div>`;
  } else {
    // 3. Render List of backlinks
    list.innerHTML = backlinkArray
      .map(srcPath => {
        const note = state.vault.notes.find(n => n.path === srcPath);
        const displayName = note ? note.title : srcPath.split("/").pop().replace(/\.md$/i, "");
        const displayPath = srcPath.replace(/^vault\//, "").replace(/\.md$/i, "");
        return `
          <div class="backlink-item" data-backlink-path="${escapeHtml(srcPath)}">
            <span class="backlink-title">${escapeHtml(displayName)}</span>
            <span class="backlink-path">${escapeHtml(displayPath)}</span>
          </div>
        `;
      })
      .join("");

    // Add click listeners to navigate
    list.querySelectorAll(".backlink-item").forEach(item => {
      item.addEventListener("click", () => {
        const targetPath = item.getAttribute("data-backlink-path");
        if (targetPath) {
          startEditing(targetPath);
        }
      });
    });
  }
}

function hydrateCardMeta(path, meta) {
  const slot = document.querySelector(`[data-metadata-path="${CSS.escape(path)}"]`);
  if (!slot) return;
  const parts = [];
  if (meta.frontmatterDate) {
    parts.push(`<span class="date-pill">${escapeHtml(meta.frontmatterDate)}</span>`);
  }
  for (const tag of meta.tags) {
    parts.push(`<span class="tag-pill">#${escapeHtml(tag)}</span>`);
  }
  slot.innerHTML = parts.join("");
}

async function fetchAndDecodeNote(path) {
  const data = await apiRequest(`/api/vault/content/${path}`);
  const binary = atob((data.content || "").replace(/\s/g, ""));
  return new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0)));
}

let _syncAbortController = null;

async function startMetadataSync() {
  // Only run when authenticated
  if (!state.auth.isAuthenticated) return;

  // Abort any previous sync run
  if (_syncAbortController) _syncAbortController.abort();
  const controller = new AbortController();
  _syncAbortController = controller;
  const signal = controller.signal;

  state.vault.metaSyncState = "running";

  try {
    // 1. Load existing cache from IndexedDB
    const cached = await loadAllNoteMetadata();
    state.vault.metaCache = {};
    for (const record of cached) {
      state.vault.metaCache[record.path] = record;
    }

    // Rebuild backlink index on initial load
    rebuildBacklinkIndex();

    // Rerender backlinks for currently edited note if loaded from cache
    if (state.editor.mode === "edit" && state.editor.editingPath) {
      renderBacklinks(state.editor.editingPath);
    }

    // 2. Hydrate DOM cards that already have cache data
    for (const record of cached) {
      hydrateCardMeta(record.path, record);
    }

    // Re-render now so sort order reflects cached dates (not just pills)
    if (cached.length > 0 && !signal.aborted) {
      renderNoteList();
      // Re-hydrate after re-render since innerHTML was replaced
      for (const record of cached) {
        hydrateCardMeta(record.path, record);
      }
    }

    if (signal.aborted) return;

    // 3. Find dirty notes: sha mismatch, not in cache, or missing outgoing_links
    const dirty = state.vault.notes.filter(note => {
      const cached = state.vault.metaCache[note.path];
      return !cached || cached.sha !== note.sha || !cached.outgoing_links;
    });

    if (!dirty.length) {
      state.vault.metaSyncState = "complete";
      return;
    }

    // 4. Bounded concurrency: 2
    let i = 0;
    let hasErrors = false;
    async function worker() {
      while (i < dirty.length) {
        if (signal.aborted) return;
        const note = dirty[i++];
        try {
          const raw = await fetchAndDecodeNote(note.path);
          if (signal.aborted) return;
          const meta = parseFrontmatter(raw);
          const outgoing = extractOutgoingLinks(raw);
          const record = { path: note.path, sha: note.sha, ...meta, outgoing_links: outgoing };
          const oldRecord = state.vault.metaCache[note.path];

          await saveNoteMetadata(record);
          state.vault.metaCache[note.path] = record;

          updateBacklinkIndexForRecord(note.path, oldRecord, record);
          hydrateCardMeta(note.path, record);

          // Rerender backlinks for currently edited note if affected/updated
          if (state.editor.mode === "edit" && state.editor.editingPath) {
            renderBacklinks(state.editor.editingPath);
          }
        } catch {
          hasErrors = true;
          // Individual note failures are silent; move to next
        }
      }
    }

    await Promise.all([worker(), worker()]);
    if (!signal.aborted) {
      state.vault.metaSyncState = hasErrors ? "partial" : "complete";
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      console.warn("Metadata sync error:", err);
      state.vault.metaSyncState = "error";
    }
  }
}



async function startEditing(path) {
  storage.set(CONFIG.lastViewedNoteKey, path);
  if (state.ui.isMutating || !state.auth.isAuthenticated) {
    if (!state.auth.isAuthenticated) setStatus("error", "Please sign in to edit notes.");
    return;
  }

  clearDeleteConfirmation();
  setMutationState(true);
  setStatus("uploading", "Loading note…");

  try {
    if (!state.editor.draftSnapshot) {
      state.editor.draftSnapshot = {
        title: elements.titleInput.value,
        body: elements.bodyInput.value,
        folder: elements.folderInput.value,
      };
    }

    const data = await getFileContent(path);
    const binary = atob((data.content || "").replace(/\s/g, ""));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const { title, body } = parseEditableNote(path, new TextDecoder().decode(bytes));
    const displayPath = path.replace(/^vault\//, "");
    const folder = displayPath.includes("/") ? displayPath.slice(0, displayPath.lastIndexOf("/")) : "";

    elements.titleInput.value = title;
    elements.bodyInput.value = body;
    elements.folderInput.value = folder;
    state.editor.mode = "edit";
    state.editor.editingPath = path;
    state.editor.editingSha = data.sha || null;
    state.editor.titleEdited = true;
    updateModeUi();
    updateFolderSectionCollapse();
    renderPreview();
    renderBacklinks(path);
    setStatus("success", "Editing vault note.");
  } catch (error) {
    setStatus("error", error.message || "Unable to load note.");
    if (state.editor.mode !== "edit") state.editor.draftSnapshot = null;
  } finally {
    setMutationState(false);
  }
}

async function handleDelete(path, shaHint) {
  if (!state.auth.isAuthenticated) {
    setStatus("error", "Please sign in to delete notes.");
    return;
  }

  if (state.ui.confirmDeletePath !== path) {
    armDeleteConfirmation(path);
    renderNoteList();
    setStatus("error", "Tap delete again to confirm.");
    return;
  }

  if (state.vault.metaSyncState !== 'complete') {
    if (!window.confirm("Warning: Metadata sync is not complete. Backlinks might be missed or incorrect. Delete anyway?")) {
      return;
    }
  }

  clearDeleteConfirmation();
  setMutationState(true);
  setStatus("uploading", "Deleting note…");

  try {
    const sha = shaHint || state.vault.notes.find((note) => note.path === path)?.sha;
    if (!sha) throw new Error("Missing file SHA for delete.");

    const deletedStem = noteStemFromPath(path);
    const deletedStemUnique = resolveVaultNoteTarget(deletedStem)?.path === path;
    const parents = state.vault.backlinkIndex[normalizeLinkTarget(path)] || new Set();

    await deleteFile(path, sha, `vault: delete ${path.split("/").pop()}`);
    await pruneDeletedNoteLinks(path, parents, deletedStemUnique);
    if (state.editor.editingPath === path) {
      exitEditMode({ restoreDraft: true });
    }
    // Clean up metadata cache and pins for deleted note
    delete state.vault.metaCache[path];
    deleteNoteMetadata(path).catch(() => { });
    const pinIdx = state.vault.pinnedNotes.indexOf(path);
    if (pinIdx !== -1) {
      state.vault.pinnedNotes.splice(pinIdx, 1);
      storage.setJson(CONFIG.pinnedNotesKey, state.vault.pinnedNotes);
    }
    await fetchNotes();
    setStatus("success", "Note deleted.");
  } catch (error) {
    setStatus("error", error.message || "Delete failed.");
  } finally {
    setMutationState(false);
  }
}


function defaultFolder() {
  const remembered = sessionStorage.getItem(CONFIG.lastFolderKey);
  if (remembered) return remembered;

  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  return `Notes/${date}`;
}

async function commitPendingAssets(snapshot) {
  const references = parsePendingReferences(snapshot);
  if (references.length === 0) return snapshot;

  let resolvedSnapshot = snapshot;
  setStatus("uploading", `Uploading ${references.length} asset(s)…`);

  for (const { id, match } of references) {
    const asset = state.assets.pending.get(id);
    if (!asset || asset.status === "uploaded") continue;

    asset.status = "uploading";
    renderPendingAssets();

    try {
      const content = new Uint8Array(await asset.file.arrayBuffer());
      const response = await putFile(asset.path, content, null, `Upload asset: ${asset.finalName}`);

      asset.status = "uploaded";
      asset.sha = response.content?.sha;

      try {
        await savePendingAsset({
          pendingId: asset.pendingId,
          finalName: asset.finalName,
          path: asset.path,
          file: asset.file,
          status: asset.status,
          sha: asset.sha,
          createdAt: asset.createdAt
        });
      } catch (idbErr) {
        console.error("Failed to update asset status in IndexedDB:", idbErr);
      }

      renderPendingAssets();
    } catch (err) {
      asset.status = "failed";
      renderPendingAssets();
      throw new Error("Asset upload failed. Please check gallery and try again.");
    }
  }

  for (const { id, match } of references) {
    const asset = state.assets.pending.get(id);
    if (asset) {
      resolvedSnapshot = resolvedSnapshot.replace(new RegExp(`!\\[\\[pending:${id}\\]\\]`, 'g'), `![[${asset.finalName}]]`);
    }
  }

  return resolvedSnapshot;
}

// New helper functions for auto-linking
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function insertLinkIntoSection(content, noteStem, relativeTarget) {
  const lines = content.split("\n");
  let headingIndex = -1;
  const headingRegex = /^##\s*New\s*\/\s*Uncategorized\s*$/i;

  for (let i = 0; i < lines.length; i++) {
    if (headingRegex.test(lines[i].trim())) {
      headingIndex = i;
      break;
    }
  }

  const displayTitle = noteStem.replace(/_/g, " ");
  const targetPath = relativeTarget || noteStem;
  const newLink = `- [[${targetPath}|${displayTitle}]]`;

  if (headingIndex !== -1) {
    let endIndex = lines.length;
    for (let i = headingIndex + 1; i < lines.length; i++) {
      if (/^##\s/.test(lines[i])) {
        endIndex = i;
        break;
      }
    }

    let insertIndex = endIndex;
    for (let i = endIndex - 1; i > headingIndex; i--) {
      if (lines[i].trim() !== "") {
        insertIndex = i + 1;
        break;
      }
    }

    if (insertIndex === endIndex) {
      insertIndex = headingIndex + 1;
    }

    lines.splice(insertIndex, 0, newLink);
    return lines.join("\n");
  } else {
    const appendix = `\n\n## New / Uncategorized\n\n${newLink}`;
    return content.trimEnd() + appendix;
  }
}

async function clearCommittedAssets() {
  for (const [id, asset] of state.assets.pending.entries()) {
    if (asset.status === "uploaded") {
      try {
        await deletePendingAsset(id);
      } catch (e) {
        console.error("Failed to delete committed asset from IDB:", e);
      }
      URL.revokeObjectURL(asset.blobUrl);
      state.assets.pending.delete(id);
    }
  }
  renderPendingAssets();
}

async function rewriteIncomingLinks(oldPath, newPath, parents, oldStemUnique) {
  const oldRelative = normalizeLinkTarget(oldPath);
  const newRelative = normalizeLinkTarget(newPath);
  const oldStem = noteStemFromPath(oldPath);
  const newStem = noteStemFromPath(newPath);

  let success = true;

  for (const parentPath of parents) {
    try {
      const indexData = await getFileContent(parentPath);
      const binary = atob((indexData.content || "").replace(/\s/g, ""));
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      let content = new TextDecoder().decode(bytes);

      let changed = false;

      const exactRegex = new RegExp('\\[\\[(' + escapeRegExp(oldRelative) + ')(?:\\|([^\\]]*))?\\]\\]', 'gi');
      content = content.replace(exactRegex, (match, target, alias) => {
        changed = true;
        return alias ? `[[${newRelative}|${alias}]]` : `[[${newRelative}]]`;
      });

      const stemRegex = new RegExp('\\[\\[(' + escapeRegExp(oldStem) + ')(?:\\|([^\\]]*))?\\]\\]', 'gi');
      content = content.replace(stemRegex, (match, target, alias) => {
        if (oldStemUnique) {
          changed = true;
          return alias ? `[[${newStem}|${alias}]]` : `[[${newStem}]]`;
        }
        return match;
      });

      if (changed) {
        await putFile(parentPath, content, indexData.sha, `vault: auto-update link to ${newStem}`);
      }
    } catch (err) {
      console.error("Failed to rewrite links in", parentPath, err);
      success = false;
    }
  }
  return success;
}

async function pruneDeletedNoteLinks(deletedPath, parents, deletedStemUnique) {
  const deletedRelative = normalizeLinkTarget(deletedPath);
  const deletedStem = noteStemFromPath(deletedPath);

  for (const parentPath of parents) {
    try {
      const indexData = await getFileContent(parentPath);
      const binary = atob((indexData.content || "").replace(/\s/g, ""));
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      let content = new TextDecoder().decode(bytes);

      const exactRegex = new RegExp('^\\s*-\\s*\\[\\[(' + escapeRegExp(deletedRelative) + ')(?:\\|[^\\]]*)?\\]\\]\\s*$', 'gim');
      let newContent = content.replace(exactRegex, '');

      const stemRegex = new RegExp('^\\s*-\\s*\\[\\[(' + escapeRegExp(deletedStem) + ')(?:\\|[^\\]]*)?\\]\\]\\s*$', 'gim');
      newContent = newContent.replace(stemRegex, (match, target) => {
        if (deletedStemUnique) {
          return '';
        }
        return match;
      });

      newContent = newContent.replace(/\n{3,}/g, '\n\n');

      if (newContent !== content) {
        await putFile(parentPath, newContent, indexData.sha, `vault: auto-prune deleted link ${deletedStem}`);
      }
    } catch (err) {
      console.error("Failed to prune link from", parentPath, err);
    }
  }
}


async function handleSave() {
  if (!state.auth.isAuthenticated) {
    setStatus("error", "Please sign in to save notes.");
    return;
  }
  if (state.ui.isMutating) return;

  const title = elements.titleInput.value.trim();
  const rawBody = elements.bodyInput.value;
  const folder = normalizeFolderPath(elements.folderInput.value) || (state.editor.mode === "create" ? defaultFolder() : "");

  if (!rawBody.trim()) {
    setStatus("error", "Note is empty.");
    elements.bodyInput.focus();
    return;
  }

  clearDeleteConfirmation();
  setMutationState(true);

  let bodySnapshot;
  try {
    bodySnapshot = await commitPendingAssets(rawBody);
  } catch (err) {
    setStatus("error", err.message);
    setMutationState(false);
    return; // Abort save on asset failure
  }

  setStatus("uploading", state.editor.mode === "edit" ? "Updating vault note…" : "Saving to vault…");

  try {
    const filename = buildFilename(title);
    const fullPath = folder ? `${folder}/${filename}` : filename;
    const newPath = `${CONFIG.vaultPrefix}${fullPath}`;
    const oldPath = state.editor.editingPath;
    const isRename = state.editor.mode === "edit" && oldPath && oldPath !== newPath;

    if (isRename && state.vault.metaSyncState !== 'complete') {
      if (!window.confirm("Warning: Metadata sync is not complete. Backlinks might be missed or incorrect. Rename anyway?")) {
        setMutationState(false);
        return;
      }
    }

    const path = isRename ? newPath : (state.editor.mode === "edit" ? oldPath : newPath);
    const fallbackTitle = noteStemFromPath(path);
    const message = state.editor.mode === "edit"
      ? (isRename ? `vault: rename ${oldPath.split("/").pop()} to ${path.split("/").pop()}` : `vault: update ${path.split("/").pop()}`)
      : `vault: add ${path.split("/").pop()}`;

    const shaToUse = isRename ? null : state.editor.editingSha;

    let oldStemUnique = false;
    let parentsToRewrite = new Set();
    if (isRename) {
      const oldStem = noteStemFromPath(oldPath);
      oldStemUnique = resolveVaultNoteTarget(oldStem)?.path === oldPath;
      parentsToRewrite = state.vault.backlinkIndex[normalizeLinkTarget(oldPath)] || new Set();
    }

    await putFile(path, buildMarkdown(title, bodySnapshot, fallbackTitle), shaToUse, message);

    if (isRename) {
      const rewriteSuccess = await rewriteIncomingLinks(oldPath, newPath, parentsToRewrite, oldStemUnique);

      if (rewriteSuccess) {
        await deleteFile(oldPath, state.editor.editingSha, `vault: delete old note after rename`);
      } else {
        setStatus("error", "Rename incomplete. New copy created but backlink rewrite failed. Old note kept.");
        setMutationState(false);
        return; // keep editor state on old note and stop
      }
    }

    // Successfully saved note! Now safely clear committed assets from local IndexedDB and memory.
    await clearCommittedAssets();

    let indexFound = false;
    let indexUpdated = false;
    let indexWriteFailed = false;

    await fetchNotes();
    let refreshFailed = state.ui.listStatus === "error";

    if (folder && !path.endsWith("index.md")) {
      const noteStem = noteStemFromPath(path);
      const possibleIndexPaths = [];
      let currentFolder = folder;

      while (true) {
        possibleIndexPaths.push(`${CONFIG.vaultPrefix}${currentFolder}/index/index.md`);
        possibleIndexPaths.push(`${CONFIG.vaultPrefix}${currentFolder}/index.md`);

        if (currentFolder.endsWith('/notes') || currentFolder === 'notes') {
          const parentFolder = currentFolder === 'notes' ? '' : currentFolder.substring(0, currentFolder.lastIndexOf('/notes'));
          const prefix = parentFolder ? `${parentFolder}/` : '';
          possibleIndexPaths.push(`${CONFIG.vaultPrefix}${prefix}index/index.md`);
          possibleIndexPaths.push(`${CONFIG.vaultPrefix}${prefix}index.md`);
        }

        if (!currentFolder.includes('/')) break;
        currentFolder = currentFolder.substring(0, currentFolder.lastIndexOf('/'));
      }

      let targetIndexPath = null;
      for (const p of possibleIndexPaths) {
        if (state.vault.notes.some(n => n.path === p)) {
          targetIndexPath = p;
          break;
        }
      }

      if (targetIndexPath) {
        indexFound = true;
        try {
          const indexData = await getFileContent(targetIndexPath);
          const binary = atob((indexData.content || "").replace(/\s/g, ""));
          const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
          const indexContent = new TextDecoder().decode(bytes);

          const relativeTarget = path.replace(/^vault\//, "").replace(/\.md$/i, "");
          const linkRegex = new RegExp('\\[\\[(?:[^|\\]]*\\/)?' + escapeRegExp(relativeTarget) + '(?:\\|[^\\]]*)?\\]\\]', 'i');

          if (!linkRegex.test(indexContent)) {
            const updatedContent = insertLinkIntoSection(indexContent, noteStem, relativeTarget);
            await putFile(targetIndexPath, updatedContent, indexData.sha, `vault: auto-link ${noteStem}`);
            indexUpdated = true;
            await fetchNotes();
            refreshFailed = state.ui.listStatus === "error";
          }
        } catch (err) {
          indexWriteFailed = true;
        }
      }
    }

    if (!state.ui.privateMode) {
      saveFolderHistory(folder);
      sessionStorage.setItem(CONFIG.lastFolderKey, folder);
    }

    const wasEditMode = state.editor.mode === "edit";
    if (wasEditMode) {
      exitEditMode({ restoreDraft: true });
    } else {
      clearSavedDraft();
      elements.titleInput.value = "";
      elements.folderInput.value = "";
      elements.bodyInput.value = "";
      state.editor.titleEdited = false;
      renderPreview();
      updateFolderHint();
      updateFolderSectionCollapse();
    }

    if (indexWriteFailed) {
      setStatus("error", "Note saved, but index update failed.");
    } else if (refreshFailed) {
      if (indexUpdated) {
        setStatus("error", "Note saved and index updated, but the vault list could not be refreshed.");
      } else {
        setStatus("error", "Note saved, but the vault list could not be refreshed.");
      }
    } else {
      if (wasEditMode) {
        setStatus("success", "Note updated.");
      } else {
        setStatus("success", `Uploaded ${path.split("/").pop()}. Site rebuilding (~60s)`);
      }
    }
  } catch (error) {
    setStatus("error", error.message || "Save failed.");
  } finally {
    setMutationState(false);
  }
}

function togglePrivateMode() {
  state.ui.privateMode = !state.ui.privateMode;
  elements.privateModeToggle.textContent = state.ui.privateMode ? "Private: ON" : "Private: OFF";
  elements.privateModeToggle.classList.toggle("is-active", state.ui.privateMode);
  if (state.ui.privateMode) {
    closeFolderMenu();
  }
  elements.folderChips.classList.toggle("hidden", state.ui.privateMode);
  elements.folderHint.classList.toggle("hidden", state.ui.privateMode);
  if (!state.ui.privateMode) updateFolderHint();
}

function toggleVaultCollapse() {
  state.ui.vaultCollapsed = !state.ui.vaultCollapsed;
  applyVaultCollapse();
  storage.setJson(CONFIG.vaultCollapsedKey, state.ui.vaultCollapsed);
  if (state.ui.vaultCollapsed) {
    clearDeleteConfirmation();
    renderNoteList();
  }
}

function applyVaultCollapse() {
  const collapsed = state.ui.vaultCollapsed;
  elements.vaultSection.classList.toggle("is-collapsed", collapsed);
  elements.vaultToggle.setAttribute("aria-expanded", !collapsed);
}

function toggleBacklinksCollapse() {
  state.ui.backlinksCollapsed = !state.ui.backlinksCollapsed;
  applyBacklinksCollapse();
  storage.setJson(CONFIG.backlinksCollapsedKey, state.ui.backlinksCollapsed);
}

function applyBacklinksCollapse() {
  if (!elements.backlinksSection || !elements.backlinksToggle) return;
  const collapsed = state.ui.backlinksCollapsed;
  elements.backlinksSection.classList.toggle("is-collapsed", collapsed);
  elements.backlinksToggle.setAttribute("aria-expanded", !collapsed);
}

function restoreFolderState() {
  state.ui.folderCollapsed = storage.getJson(CONFIG.folderCollapsedKey, false);
  if (!elements.folderInput.value.trim()) {
    state.ui.folderCollapsed = false;
  }
  updateFolderSectionCollapse();
}

function restoreBacklinksState() {
  state.ui.backlinksCollapsed = storage.getJson(CONFIG.backlinksCollapsedKey, false);
  applyBacklinksCollapse();
}

function restoreVaultState() {
  state.ui.vaultCollapsed = storage.getJson(CONFIG.vaultCollapsedKey, false);
  applyVaultCollapse();
  restoreFolderState();
  restoreBacklinksState();
}

restoreVaultState();
setupEditor(elements.bodyInput, () => state);

function bindEvents() {
  elements.loginBtn.addEventListener("click", loginWithGitHub);
  elements.logoutBtn.addEventListener("click", logout);
  elements.privateModeToggle.addEventListener("click", togglePrivateMode);
  elements.folderToggle.addEventListener("click", toggleFolderSection);

  elements.folderInput.addEventListener("input", () => {
    saveDraftSoon();
    updateFolderHint();
    if (!elements.folderInput.value.trim()) {
      state.ui.folderCollapsed = false;
      storage.setJson(CONFIG.folderCollapsedKey, false);
    }
    updateFolderSectionCollapse();
    renderFolderMenu(elements.folderInput.value);
  });

  elements.folderInput.addEventListener("focus", () => {
    if (state.vault.folderIndex.length > 0) {
      renderFolderMenu(elements.folderInput.value);
    }
    updateFolderSectionCollapse();
  });

  elements.folderInput.addEventListener("blur", () => {
    // Small timeout to allow mousedown to trigger first
    setTimeout(() => {
      closeFolderMenu();
      updateFolderSectionCollapse();
    }, 200);
  });

  elements.folderInput.addEventListener("keydown", (e) => {
    if (!state.ui.folderMenuOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      state.ui.activeFolderIndex = (state.ui.activeFolderIndex + 1) % state.vault.filteredFolders.length;
      renderFolderMenu(elements.folderInput.value);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      state.ui.activeFolderIndex = (state.ui.activeFolderIndex - 1 + state.vault.filteredFolders.length) % state.vault.filteredFolders.length;
      renderFolderMenu(elements.folderInput.value);
    } else if (e.key === "Enter") {
      if (state.ui.activeFolderIndex >= 0) {
        e.preventDefault();
        selectFolderSuggestion(state.ui.activeFolderIndex);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeFolderMenu();
    }
  });

  elements.folderMenu.addEventListener("mousedown", (e) => {
    const item = e.target.closest(".folder-menu-item");
    if (item) {
      e.preventDefault(); // Prevent blur from firing before mousedown
      selectFolderSuggestion(parseInt(item.dataset.index, 10));
    }
  });

  elements.folderChips.addEventListener("click", (event) => {
    const chip = event.target.closest(".folder-chip");
    if (!chip || state.editor.mode === "edit") return;
    elements.folderInput.value = chip.dataset.folder;
    saveDraftSoon();
    updateFolderHint();
    updateFolderSectionCollapse();
  });

  elements.titleInput.addEventListener("input", () => {
    state.editor.titleEdited = true;
    const dangerousChars = /[\\/:*?"<>|]/;
    if (dangerousChars.test(elements.titleInput.value)) {
      setStatus("error", "Warning: Title contains characters (\\, /, :, *, ?, \", <, >, |) that might break file systems or links.");
    } else if (elements.statusBar.classList.contains("error") && elements.statusText.textContent.includes("Warning: Title")) {
      elements.statusBar.className = "status";
      elements.statusText.textContent = "";
    }
    saveDraftSoon();
    renderPreview();
  });

  elements.bodyInput.addEventListener("input", () => {
    if (!state.editor.titleEdited && state.editor.mode === "create") {
      elements.titleInput.value = extractAutoTitle(elements.bodyInput.value);
    }
    saveDraftSoon();
    renderPreview();
  });

  elements.writeTab.addEventListener("click", () => setEditorMode("write"));
  elements.previewTab.addEventListener("click", () => setEditorMode("preview"));

  elements.noteSearchInput.addEventListener("input", () => {
    state.editor.searchQuery = elements.noteSearchInput.value;
    clearDeleteConfirmation();
    renderNoteList();
  });

  elements.noteList.addEventListener("click", async (event) => {
    // Check if clicked a folder header to toggle collapse/expand
    const folderHeader = event.target.closest(".vault-folder-header");
    if (folderHeader) {
      const folder = folderHeader.dataset.folder;
      // Pinned header has no data-folder — skip it
      if (!folder) return;
      if (!state.ui.collapsedFolders) {
        state.ui.collapsedFolders = new Set(storage.getJson(CONFIG.collapsedFoldersKey, []));
      }
      if (state.ui.collapsedFolders.has(folder)) {
        state.ui.collapsedFolders.delete(folder);
      } else {
        state.ui.collapsedFolders.add(folder);
      }
      storage.setJson(CONFIG.collapsedFoldersKey, Array.from(state.ui.collapsedFolders));
      renderNoteList();
      return;
    }

    const button = event.target.closest("[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const path = button.dataset.path;

    // Pin is always available (no auth/mutation guard)
    if (action === "pin") {
      if (!path) return;
      const idx = state.vault.pinnedNotes.indexOf(path);
      if (idx === -1) {
        state.vault.pinnedNotes.push(path);
      } else {
        state.vault.pinnedNotes.splice(idx, 1);
      }
      storage.setJson(CONFIG.pinnedNotesKey, state.vault.pinnedNotes);
      renderNoteList();
      return;
    }

    if (state.ui.isMutating) return;

    if (!isVaultPathSafe(path)) {
      setStatus("error", "Unsafe vault path rejected.");
      return;
    }

    if (action === "edit") {
      await startEditing(path);
    } else if (action === "delete") {
      await handleDelete(path, button.dataset.sha || null);
    }
  });

  elements.previewBody.addEventListener("click", async (event) => {
    const link = event.target.closest(".internal-link");
    if (!link) return;

    event.preventDefault();
    if (state.ui.isMutating) return;

    await navigateToLinkedNote(link.dataset.noteTarget || "");
  });

  elements.cancelEditBtn.addEventListener("click", () => {
    if (state.ui.isMutating) return;
    exitEditMode({ restoreDraft: true });
    setStatus("success", "Edit cancelled. Draft restored.");
  });

  elements.uploadBtn.addEventListener("click", handleSave);
  elements.vaultToggle.addEventListener("click", toggleVaultCollapse);
  if (elements.backlinksToggle) {
    elements.backlinksToggle.addEventListener("click", toggleBacklinksCollapse);
  }

  // Sort button: cycle Newest → Oldest → Alphabetical
  const sortBtn = document.getElementById("vault-sort-btn");
  if (sortBtn) {
    sortBtn.addEventListener("click", () => {
      const cycle = { newest: "oldest", oldest: "alpha", alpha: "newest" };
      const labels = { newest: "⇅ Newest first", oldest: "⇅ Oldest first", alpha: "⇅ A → Z" };
      state.vault.sortPreference = cycle[state.vault.sortPreference] || "newest";
      storage.set(CONFIG.vaultSortKey, state.vault.sortPreference);
      sortBtn.textContent = labels[state.vault.sortPreference];
      renderNoteList();
    });
  }

  // Gallery Delegation
  const gallery = document.getElementById("pending-gallery");
  if (gallery) {
    gallery.addEventListener("click", (e) => {
      const removeBtn = e.target.closest(".remove-asset-btn");
      if (removeBtn) {
        removePendingAsset(removeBtn.dataset.id);
        return;
      }

      const thumb = e.target.closest(".pending-thumbnail");
      if (thumb) {
        const id = thumb.dataset.id;
        const text = elements.bodyInput.value;
        const idx = text.indexOf(`![[pending:${id}]]`);
        if (idx >= 0) {
          elements.bodyInput.focus();
          elements.bodyInput.setSelectionRange(idx, idx + `![[pending:${id}]]`.length);
          elements.bodyInput.blur();
          elements.bodyInput.focus();
        }
      }
    });
  }

  // Asset Attachments
  elements.attachBtn.addEventListener("click", () => triggerFilePicker());
  elements.cameraBtn.addEventListener("click", () => triggerCameraCapture());

  elements.bodyInput.addEventListener("dragover", (e) => {
    e.preventDefault();
    elements.bodyInput.classList.add("drag-over");
  });

  elements.bodyInput.addEventListener("dragleave", () => {
    elements.bodyInput.classList.remove("drag-over");
  });

  elements.bodyInput.addEventListener("drop", async (e) => {
    e.preventDefault();
    elements.bodyInput.classList.remove("drag-over");
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/") || validateImageFile(f) === null);
    for (const file of files) await createPendingAsset(file);
  });

  elements.bodyInput.addEventListener("paste", async (e) => {
    const items = Array.from(e.clipboardData.items);
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        await createPendingAsset(item.getAsFile());
      }
    }
  });

  bindInput(document.getElementById("file-picker-input"), async (event) => {
    const files = Array.from(event.currentTarget.files || []);
    for (const file of files) await createPendingAsset(file);
    event.currentTarget.value = "";
  });

  bindInput(document.getElementById("camera-picker-input"), async (event) => {
    const [file] = event.currentTarget.files || [];
    if (file) await createPendingAsset(file);
    event.currentTarget.value = "";
  });
}

function bindInput(input, handler) {
  if (!input) return;
  const replacement = input.cloneNode(true);
  input.parentNode.replaceChild(replacement, input);
  replacement.addEventListener("change", handler);
}

function triggerFilePicker() {
  const input = document.getElementById("file-picker-input");
  if (input) input.click();
}

function triggerCameraCapture() {
  const input = document.getElementById("camera-picker-input");
  if (input) input.click();
}

const mathExtension = {
  name: "math",
  level: "inline",
  start: (src) => src.indexOf("$"),
  tokenizer(src) {
    const block = /^\$\$([\s\S]*?)\$\$/.exec(src);
    if (block) return { type: "math", raw: block[0], text: block[1], displayMode: true };
    const inline = /^\$([^$\n]+?)\$/.exec(src);
    if (inline) return { type: "math", raw: inline[0], text: inline[1], displayMode: false };
    return undefined;
  },
  renderer(token) {
    return token.displayMode ? `\\[${escapeHtml(token.text)}\\]` : `\\(${escapeHtml(token.text)}\\)`;
  },
};

if (typeof marked !== "undefined") {
  marked.use({ extensions: [mathExtension] });
}

window.addEventListener("beforeunload", (e) => {
  if (state.assets.pending.size > 0) {
    e.preventDefault();
    e.returnValue = "";
  }
});

async function boot() {
  // Setup ResizeObserver for scroll sync correction
  const previewCanvas = elements.previewPane.querySelector(".editor-canvas");
  if (previewCanvas) {
    let lastHeight = previewCanvas.scrollHeight;
    let resizeRaf = null;

    // Observe preview canvas AND its body to catch content changes vs container changes
    const ro = new ResizeObserver(() => {
      if (state.editor.viewMode !== "preview") return;

      const newHeight = previewCanvas.scrollHeight;
      if (Math.abs(newHeight - lastHeight) < 3) return; // Skip minor jitter
      lastHeight = newHeight;

      const pctStr = previewCanvas.dataset.targetScrollPct;
      if (!pctStr) return;
      const pct = parseFloat(pctStr);
      if (isNaN(pct)) return;

      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        const max = Math.max(1, previewCanvas.scrollHeight - previewCanvas.clientHeight);
        previewCanvas.scrollTop = pct * max;
      });
    });
    
    ro.observe(previewCanvas);
    if (elements.previewBody) ro.observe(elements.previewBody);
    if (elements.previewTitle) ro.observe(elements.previewTitle);

    // Keep target scroll percentage fresh when user scrolls manually
    previewCanvas.addEventListener("scroll", () => {
      if (state.editor.viewMode !== "preview") return;
      const max = Math.max(1, previewCanvas.scrollHeight - previewCanvas.clientHeight);
      const pct = previewCanvas.scrollTop / max;
      previewCanvas.dataset.targetScrollPct = pct.toString();
    }, { passive: true });
  }

  // Load pin and sort preferences
  state.vault.pinnedNotes = storage.getJson(CONFIG.pinnedNotesKey, []);
  state.vault.sortPreference = storage.get(CONFIG.vaultSortKey, "newest");

  // Sync sort button label to saved preference
  const sortBtn = document.getElementById("vault-sort-btn");
  if (sortBtn) {
    const labels = { newest: "⇅ Newest first", oldest: "⇅ Oldest first", alpha: "⇅ A → Z" };
    sortBtn.textContent = labels[state.vault.sortPreference] || "⇅ Newest first";
  }

  state.vault.folderHistory = storage.getJson(CONFIG.folderHistoryKey, []);
  renderFolderChips();
  restoreSavedDraft();
  bindEvents();
  setEditorMode("write");
  updateModeUi();
  updateFolderHint();
  updateFolderSectionCollapse();

  try {
    const idbAssets = await loadPendingAssets();
    let draftBody = elements.bodyInput.value;
    let bodyChanged = false;

    for (const asset of idbAssets) {
      const placeholder = `![[pending:${asset.pendingId}]]`;
      const placeholderExists = draftBody.includes(placeholder);

      if (placeholderExists) {
        asset.blobUrl = URL.createObjectURL(asset.file);
        state.assets.pending.set(asset.pendingId, asset);
      } else {
        await deletePendingAsset(asset.pendingId);
      }
    }

    const pendingMatches = draftBody.matchAll(/!\[\[pending:([^\]]+)\]\]/g);
    for (const match of pendingMatches) {
      const id = match[1];
      if (!state.assets.pending.has(id)) {
        draftBody = draftBody.replace(match[0], `[Image Restoring Failed: asset missing in local storage]`);
        bodyChanged = true;
      }
    }

    if (bodyChanged) {
      elements.bodyInput.value = draftBody;
      storage.set(CONFIG.draftBodyKey, draftBody);
    }
  } catch (err) {
    console.error("Failed to load IndexedDB assets:", err);
  }

  renderPendingAssets();
  renderPreview();
  renderNoteList();
  checkAuth();

  // Best-effort keep-warm silent ping for Render Free tier
  let keepAliveInterval = null;

  function startKeepAlive() {
    if (keepAliveInterval) return;
    keepAliveInterval = setInterval(() => {
      keepAlive();
    }, 5 * 60 * 1000); // 5 minutes
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      keepAlive(); // Ping immediately on returning to visible
    }
  });

  startKeepAlive();
}

boot();
