import { setupEditor } from "./editor/editor.js";
import { insertTextAtCursor } from "./editor/utils.js";
import { compressImage, generateAssetMeta, validateImageFile } from "./editor/assets.js";
import { initPendingAssetDb, savePendingAsset, loadPendingAssets, deletePendingAsset } from "./editor/indexeddb.js";

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
};

const state = {
  editor: {
    mode: "create",
    editingPath: null,
    editingSha: null,
    draftSnapshot: null,
    titleEdited: false,
    searchQuery: "",
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
  },
  vault: {
    notes: [],
    folderHistory: [],
    folderIndex: [],
    filteredFolders: [],
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
    } catch {}
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {}
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

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

function setStatus(type, message) {
  elements.statusBar.className = `status visible ${type}`;
  elements.statusText.textContent = message;
}

function setEditorMode(mode) {
  const preview = mode === "preview";
  elements.writeTab.classList.toggle("active", !preview);
  elements.previewTab.classList.toggle("active", preview);
  elements.writePane.classList.toggle("active", !preview);
  elements.previewPane.classList.toggle("active", preview);
}

function typesetMath(target) {
  if (window.MathJax) {
    MathJax.typesetPromise([target]).catch(() => {});
  }
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

function preprocessMarkdown(markdown) {
  return markdown.replace(/!\[\[([^\]]+)\]\]/g, (match, inner) => {
    if (inner.startsWith("pending:")) {
      const id = inner.replace("pending:", "");
      const asset = state.assets.pending.get(id);
      if (asset && asset.blobUrl) {
        return `![${asset.finalName}](${asset.blobUrl})`;
      }
    }
    // Better fallback for standard wikilinks in preview
    return `![${inner}](vault/Assets/${inner})`;
  });
}

function renderPreview() {
  const title = elements.titleInput.value.trim();
  const body = elements.bodyInput.value;

  elements.previewTitle.textContent = title;
  elements.previewTitle.classList.toggle("hidden", !title);

  if (!body.trim()) {
    elements.previewBody.innerHTML = '<p class="preview-empty">Nothing to preview yet</p>';
    return;
  }

  const processedBody = preprocessMarkdown(body);
  const purifyConfig = {
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|blob|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  };
  elements.previewBody.innerHTML = DOMPurify.sanitize(marked.parse(processedBody, { breaks: true, gfm: true }), purifyConfig);
  typesetMath(elements.previewBody);
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

function isVaultPathSafe(path) {
  return typeof path === "string"
    && path.startsWith(CONFIG.vaultPrefix)
    && !path.includes("..")
    && !path.includes("\\")
    && path.endsWith(CONFIG.noteSuffix);
}

function buildFilename(title) {
  if (title.trim()) {
    return `${title.trim().replace(/\.md$/i, "")}.md`;
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
  
  const count = (elements.bodyInput.value.match(/!\[\[.*?\]\]/g) || []).length;
  const badge = document.getElementById("attach-count");
  if (badge) {
    badge.textContent = count > 0 ? `${count} image${count > 1 ? "s" : ""}` : "";
  }
}

function renderPendingAssets() {
  const gallery = document.getElementById("pending-gallery");
  if (!gallery) return;

  if (state.assets.pending.size === 0) {
    gallery.classList.add("hidden");
    gallery.innerHTML = "";
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
  elements.folderInput.focus();
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
  const query = state.editor.searchQuery.trim().toLowerCase();
  return query
    ? state.vault.notes.filter((note) => note.displayPath.toLowerCase().includes(query))
    : state.vault.notes;
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
  elements.noteList.innerHTML = notes.map((note) => {
    const confirming = state.ui.confirmDeletePath === note.path;
    return `
      <article class="vault-card">
        <div class="vault-card__top">
          <div class="vault-card__content">
            <h3 class="vault-card__title">${escapeHtml(note.displayPath)}</h3>
          </div>
        </div>
        <div class="vault-actions">
          <button class="action-btn" type="button" data-action="edit" data-path="${escapeHtml(note.path)}" ${state.ui.isMutating || !state.auth.isAuthenticated ? "disabled" : ""}>Edit</button>
          <button class="action-btn danger ${confirming ? "active-danger" : ""}" type="button" data-action="delete" data-path="${escapeHtml(note.path)}" data-sha="${escapeHtml(note.sha || "")}" ${state.ui.isMutating || !state.auth.isAuthenticated ? "disabled" : ""}>${confirming ? "Confirm Delete" : "Delete"}</button>
        </div>
      </article>
    `;
  }).join("");
}

function updateModeUi() {
  const editing = state.editor.mode === "edit";
  elements.uploadBtn.textContent = editing ? "Update Note" : "Save to Vault";
  elements.cancelEditBtn.classList.toggle("hidden", !editing);
  elements.folderInput.disabled = editing;
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
}

function exitEditMode({ restoreDraft = true } = {}) {
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
    }
  } catch {
    clearTimeout(coldStartTimer);
    elements.authStatusLoading.textContent = "Backend offline.";
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
}

async function startEditing(path) {
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
    renderPreview();
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

  clearDeleteConfirmation();
  setMutationState(true);
  setStatus("uploading", "Deleting note…");

  try {
    const sha = shaHint || state.vault.notes.find((note) => note.path === path)?.sha;
    if (!sha) throw new Error("Missing file SHA for delete.");
    await deleteFile(path, sha, `vault: delete ${path.split("/").pop()}`);
    if (state.editor.editingPath === path) {
      exitEditMode({ restoreDraft: true });
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

function insertLinkIntoSection(content, noteStem) {
  const lines = content.split("\n");
  let headingIndex = -1;
  const headingRegex = /^##\s*New\s*\/\s*Uncategorized\s*$/i;
  
  for (let i = 0; i < lines.length; i++) {
    if (headingRegex.test(lines[i].trim())) {
      headingIndex = i;
      break;
    }
  }
  
  const newLink = `- [[${noteStem}]]`;
  
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
    const path = state.editor.mode === "edit" ? state.editor.editingPath : `${CONFIG.vaultPrefix}${fullPath}`;
    const fallbackTitle = noteStemFromPath(path);
    const message = state.editor.mode === "edit"
      ? `vault: update ${path.split("/").pop()}`
      : `vault: add ${path.split("/").pop()}`;

    await putFile(path, buildMarkdown(title, bodySnapshot, fallbackTitle), state.editor.editingSha, message);
    
    // Successfully saved note! Now safely clear committed assets from local IndexedDB and memory.
    await clearCommittedAssets();

    let indexFound = false;
    let indexUpdated = false;
    let indexWriteFailed = false;

    await fetchNotes();
    let refreshFailed = state.ui.listStatus === "error";

    if (folder && path !== `${CONFIG.vaultPrefix}index.md` && path !== `${CONFIG.vaultPrefix}${folder}/index.md` && path !== `${CONFIG.vaultPrefix}${folder}/index/index.md`) {
      const noteStem = noteStemFromPath(path);
      const possibleIndexPaths = [
        `${CONFIG.vaultPrefix}${folder}/index/index.md`,
        `${CONFIG.vaultPrefix}${folder}/index.md`
      ];
      
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
          
          const linkRegex = new RegExp('\\[\\[(?:[^|\\]]*\\/)?' + escapeRegExp(noteStem) + '(?:\\|[^\\]]*)?\\]\\]', 'i');
          
          if (!linkRegex.test(indexContent)) {
            const updatedContent = insertLinkIntoSection(indexContent, noteStem);
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

function restoreVaultState() {
  state.ui.vaultCollapsed = storage.getJson(CONFIG.vaultCollapsedKey, false);
  applyVaultCollapse();
}

restoreVaultState();
setupEditor(elements.bodyInput, () => state);

function bindEvents() {
  elements.loginBtn.addEventListener("click", loginWithGitHub);
  elements.logoutBtn.addEventListener("click", logout);
  elements.privateModeToggle.addEventListener("click", togglePrivateMode);

  elements.folderInput.addEventListener("input", () => {
    saveDraftSoon();
    updateFolderHint();
    renderFolderMenu(elements.folderInput.value);
  });

  elements.folderInput.addEventListener("focus", () => {
    if (state.vault.folderIndex.length > 0) {
      renderFolderMenu(elements.folderInput.value);
    }
  });

  elements.folderInput.addEventListener("blur", () => {
    // Small timeout to allow mousedown to trigger first
    setTimeout(() => {
      closeFolderMenu();
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
  });

  elements.titleInput.addEventListener("input", () => {
    state.editor.titleEdited = true;
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
    const button = event.target.closest("[data-action]");
    if (!button || state.ui.isMutating) return;

    const path = button.dataset.path;
    if (!isVaultPathSafe(path)) {
      setStatus("error", "Unsafe vault path rejected.");
      return;
    }

    if (button.dataset.action === "edit") {
      await startEditing(path);
    } else if (button.dataset.action === "delete") {
      await handleDelete(path, button.dataset.sha || null);
    }
  });

  elements.cancelEditBtn.addEventListener("click", () => {
    if (state.ui.isMutating) return;
    exitEditMode({ restoreDraft: true });
    setStatus("success", "Edit cancelled. Draft restored.");
  });

  elements.uploadBtn.addEventListener("click", handleSave);
  elements.vaultToggle.addEventListener("click", toggleVaultCollapse);

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
  state.vault.folderHistory = storage.getJson(CONFIG.folderHistoryKey, []);
  renderFolderChips();
  restoreSavedDraft();
  bindEvents();
  setEditorMode("write");
  updateModeUi();
  updateFolderHint();

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
}

boot();
