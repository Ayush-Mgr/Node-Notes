import { setupEditor } from "./editor/editor.js";
import { triggerFilePicker, triggerCameraCapture } from "./editor/assets.js";

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
  folderDatalist: $("folder-suggestions"),
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
};

const state = {
  mode: "create",
  editingPath: null,
  editingSha: null,
  draftSnapshot: null,
  notes: [],
  searchQuery: "",
  listStatus: "idle",
  listError: "",
  isMutating: false,
  confirmDeletePath: null,
  deleteConfirmTimer: null,
  titleEdited: false,
  privateMode: false,
  folderHistory: [],
  folderIndex: [],
  isAuthenticated: false,
  user: null,
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

function renderPreview() {
  const title = elements.titleInput.value.trim();
  const body = elements.bodyInput.value;

  elements.previewTitle.textContent = title;
  elements.previewTitle.classList.toggle("hidden", !title);

  if (!body.trim()) {
    elements.previewBody.innerHTML = '<p class="preview-empty">Nothing to preview yet</p>';
    return;
  }

  elements.previewBody.innerHTML = DOMPurify.sanitize(marked.parse(body, { breaks: true, gfm: true }));
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

function renderFolderSuggestions() {
  elements.folderDatalist.innerHTML = state.folderIndex
    .map((path) => `<option value="${escapeHtml(path)}"></option>`)
    .join("");
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

  state.folderIndex = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a));
  renderFolderSuggestions();
}

function renderFolderChips() {
  elements.folderChips.innerHTML = state.folderHistory
    .map((folder) => `<button type="button" class="folder-chip" data-folder="${escapeHtml(folder)}">${escapeHtml(folder)}</button>`)
    .join("");
}

function updateFolderHint() {
  const folder = normalizeFolderPath(elements.folderInput.value);
  if (!folder || state.folderIndex.includes(folder) || state.privateMode) {
    elements.folderHint.classList.add("hidden");
    return;
  }

  elements.folderHint.textContent = `New folder: ${folder}`;
  elements.folderHint.classList.remove("hidden");
}

function saveFolderHistory(folder) {
  if (!folder || state.privateMode) return;
  state.folderHistory = [folder, ...state.folderHistory.filter((item) => item !== folder)].slice(0, 5);
  storage.setJson(CONFIG.folderHistoryKey, state.folderHistory);
  renderFolderChips();
}

function restoreSavedDraft() {
  const body = storage.get(CONFIG.draftBodyKey, "");
  const title = storage.get(CONFIG.draftTitleKey, "");
  const folder = storage.get(CONFIG.draftFolderKey, "");

  if (body) elements.bodyInput.value = body;
  if (title) {
    elements.titleInput.value = title;
    state.titleEdited = true;
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
    if (folder && !state.privateMode) {
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
  state.confirmDeletePath = null;
  clearTimeout(state.deleteConfirmTimer);
  state.deleteConfirmTimer = null;
}

function armDeleteConfirmation(path) {
  clearDeleteConfirmation();
  state.confirmDeletePath = path;
  state.deleteConfirmTimer = setTimeout(() => {
    clearDeleteConfirmation();
    renderNoteList();
  }, CONFIG.deleteConfirmMs);
}

function setMutationState(isMutating) {
  state.isMutating = isMutating;
  elements.uploadBtn.disabled = isMutating;
  elements.cancelEditBtn.disabled = isMutating;
  renderNoteList();
}

function filteredNotes() {
  const query = state.searchQuery.trim().toLowerCase();
  return query
    ? state.notes.filter((note) => note.displayPath.toLowerCase().includes(query))
    : state.notes;
}

function renderNoteList() {
  if (state.listStatus === "loading") {
    elements.noteList.innerHTML = '<p class="list-state">Scanning vault notes…</p>';
    elements.noteCount.textContent = "Syncing";
    return;
  }

  if (state.listStatus === "error") {
    elements.noteList.innerHTML = `<p class="list-state">${escapeHtml(state.listError || "Unable to load notes.")}</p>`;
    elements.noteCount.textContent = "Error";
    return;
  }

  const notes = filteredNotes();
  if (!notes.length) {
    const message = !state.isAuthenticated
      ? "Please sign in with GitHub to manage vault notes."
      : state.searchQuery
        ? `No matches for "${escapeHtml(state.searchQuery)}".`
        : "No notes found in vault.";
    elements.noteList.innerHTML = `<p class="list-state">${message}</p>`;
    elements.noteCount.textContent = "0 files";
    return;
  }

  elements.noteCount.textContent = `${notes.length} files`;
  elements.noteList.innerHTML = notes.map((note) => {
    const confirming = state.confirmDeletePath === note.path;
    return `
      <article class="vault-card">
        <div class="vault-card__top">
          <div class="vault-card__content">
            <h3 class="vault-card__title">${escapeHtml(note.displayPath)}</h3>
          </div>
        </div>
        <div class="vault-actions">
          <button class="action-btn" type="button" data-action="edit" data-path="${escapeHtml(note.path)}" ${state.isMutating || !state.isAuthenticated ? "disabled" : ""}>Edit</button>
          <button class="action-btn danger ${confirming ? "active-danger" : ""}" type="button" data-action="delete" data-path="${escapeHtml(note.path)}" data-sha="${escapeHtml(note.sha || "")}" ${state.isMutating || !state.isAuthenticated ? "disabled" : ""}>${confirming ? "Confirm Delete" : "Delete"}</button>
        </div>
      </article>
    `;
  }).join("");
}

function updateModeUi() {
  const editing = state.mode === "edit";
  elements.uploadBtn.textContent = editing ? "Update Note" : "Save to Vault";
  elements.cancelEditBtn.classList.toggle("hidden", !editing);
  elements.folderInput.disabled = editing;
}

function restoreDraftSnapshot() {
  if (!state.draftSnapshot) return;
  elements.titleInput.value = state.draftSnapshot.title;
  elements.bodyInput.value = state.draftSnapshot.body;
  elements.folderInput.value = state.draftSnapshot.folder;
  state.titleEdited = Boolean(state.draftSnapshot.title);
  state.draftSnapshot = null;
  saveDraftSoon();
  renderPreview();
}

function enterCreateMode() {
  state.mode = "create";
  state.editingPath = null;
  state.editingSha = null;
  state.titleEdited = Boolean(elements.titleInput.value.trim());

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
    state.draftSnapshot = null;
  }
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${CONFIG.apiBase}${endpoint}`, {
    credentials: "include",
    ...options,
  });

  if (response.status === 401) {
    state.isAuthenticated = false;
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
  elements.authStatusSignedIn.classList.toggle("hidden", !state.isAuthenticated);
  elements.authStatusSignedOut.classList.toggle("hidden", state.isAuthenticated);

  if (state.isAuthenticated && state.user) {
    elements.userLogin.textContent = state.user.login;
    elements.userAvatar.src = state.user.avatar_url;
  }
}

async function checkAuth() {
  elements.authStatusLoading.classList.remove("hidden");
  elements.authStatusSignedIn.classList.add("hidden");
  elements.authStatusSignedOut.classList.add("hidden");

  try {
    const data = await apiRequest("/auth/status");
    state.isAuthenticated = data.authenticated;
    state.user = data.user || null;
    renderAuth();

    if (state.isAuthenticated) {
      await fetchNotes();
    }
  } catch {
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
  if (!state.isAuthenticated) return;

  state.listStatus = "loading";
  state.listError = "";
  clearDeleteConfirmation();
  renderNoteList();

  try {
    const data = await apiRequest("/api/vault/notes");
    const tree = data.tree || [];
    updateFolderIndex(tree);
    state.notes = tree
      .filter((entry) => entry.type === "blob" && isVaultPathSafe(entry.path))
      .sort((a, b) => b.path.localeCompare(a.path))
      .map((entry) => ({
        path: entry.path,
        displayPath: entry.path.replace(/^vault\//, ""),
        sha: entry.sha || null,
      }));
    state.listStatus = "ready";
  } catch (error) {
    state.listStatus = "error";
    state.listError = error.message || "Unable to load notes.";
  }

  renderNoteList();
}

async function startEditing(path) {
  if (state.isMutating || !state.isAuthenticated) {
    if (!state.isAuthenticated) setStatus("error", "Please sign in to edit notes.");
    return;
  }

  clearDeleteConfirmation();
  setMutationState(true);
  setStatus("uploading", "Loading note…");

  try {
    if (!state.draftSnapshot) {
      state.draftSnapshot = {
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
    state.mode = "edit";
    state.editingPath = path;
    state.editingSha = data.sha || null;
    state.titleEdited = true;
    updateModeUi();
    renderPreview();
    setStatus("success", "Editing vault note.");
  } catch (error) {
    setStatus("error", error.message || "Unable to load note.");
    if (state.mode !== "edit") state.draftSnapshot = null;
  } finally {
    setMutationState(false);
  }
}

async function handleDelete(path, shaHint) {
  if (!state.isAuthenticated) {
    setStatus("error", "Please sign in to delete notes.");
    return;
  }

  if (state.confirmDeletePath !== path) {
    armDeleteConfirmation(path);
    renderNoteList();
    setStatus("error", "Tap delete again to confirm.");
    return;
  }

  clearDeleteConfirmation();
  setMutationState(true);
  setStatus("uploading", "Deleting note…");

  try {
    const sha = shaHint || state.notes.find((note) => note.path === path)?.sha;
    if (!sha) throw new Error("Missing file SHA for delete.");
    await deleteFile(path, sha, `vault: delete ${path.split("/").pop()}`);
    if (state.editingPath === path) {
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

async function handleSave() {
  if (!state.isAuthenticated) {
    setStatus("error", "Please sign in to save notes.");
    return;
  }

  const title = elements.titleInput.value.trim();
  const body = elements.bodyInput.value;
  const folder = normalizeFolderPath(elements.folderInput.value) || (state.mode === "create" ? defaultFolder() : "");

  if (!body.trim()) {
    setStatus("error", "Note is empty.");
    elements.bodyInput.focus();
    return;
  }

  clearDeleteConfirmation();
  setMutationState(true);
  setStatus("uploading", state.mode === "edit" ? "Updating vault note…" : "Saving to vault…");

  try {
    const filename = buildFilename(title);
    const fullPath = folder ? `${folder}/${filename}` : filename;
    const path = state.mode === "edit" ? state.editingPath : `${CONFIG.vaultPrefix}${fullPath}`;
    const fallbackTitle = noteStemFromPath(path);
    const message = state.mode === "edit"
      ? `vault: update ${path.split("/").pop()}`
      : `vault: add ${path.split("/").pop()}`;

    await putFile(path, buildMarkdown(title, body, fallbackTitle), state.editingSha, message);
    await fetchNotes();

    if (!state.privateMode) {
      saveFolderHistory(folder);
      sessionStorage.setItem(CONFIG.lastFolderKey, folder);
    }

    if (state.mode === "edit") {
      exitEditMode({ restoreDraft: true });
      setStatus("success", "Note updated.");
    } else {
      clearSavedDraft();
      elements.titleInput.value = "";
      elements.folderInput.value = "";
      elements.bodyInput.value = "";
      state.titleEdited = false;
      renderPreview();
      setStatus("success", `Uploaded ${path.split("/").pop()}. Site rebuilding (~60s)`);
    }
  } catch (error) {
    setStatus("error", error.message || "Save failed.");
  } finally {
    setMutationState(false);
  }
}

function togglePrivateMode() {
  state.privateMode = !state.privateMode;
  elements.privateModeToggle.textContent = state.privateMode ? "Private: ON" : "Private: OFF";
  elements.privateModeToggle.classList.toggle("is-active", state.privateMode);
  if (state.privateMode) {
    elements.folderInput.removeAttribute("list");
  } else {
    elements.folderInput.setAttribute("list", "folder-suggestions");
  }
  elements.folderChips.classList.toggle("hidden", state.privateMode);
  elements.folderHint.classList.toggle("hidden", state.privateMode);
  if (!state.privateMode) updateFolderHint();
}

setupEditor(elements.bodyInput, () => state);

function bindEvents() {
  elements.loginBtn.addEventListener("click", loginWithGitHub);
  elements.logoutBtn.addEventListener("click", logout);
  elements.privateModeToggle.addEventListener("click", togglePrivateMode);

  elements.folderInput.addEventListener("input", () => {
    saveDraftSoon();
    updateFolderHint();
  });

  elements.folderChips.addEventListener("click", (event) => {
    const chip = event.target.closest(".folder-chip");
    if (!chip || state.mode === "edit") return;
    elements.folderInput.value = chip.dataset.folder;
    saveDraftSoon();
    updateFolderHint();
  });

  elements.titleInput.addEventListener("input", () => {
    state.titleEdited = true;
    saveDraftSoon();
    renderPreview();
  });

  elements.bodyInput.addEventListener("input", () => {
    if (!state.titleEdited && state.mode === "create") {
      elements.titleInput.value = extractAutoTitle(elements.bodyInput.value);
    }
    saveDraftSoon();
    renderPreview();
  });

  elements.writeTab.addEventListener("click", () => setEditorMode("write"));
  elements.previewTab.addEventListener("click", () => setEditorMode("preview"));

  elements.noteSearchInput.addEventListener("input", () => {
    state.searchQuery = elements.noteSearchInput.value;
    clearDeleteConfirmation();
    renderNoteList();
  });

  elements.noteList.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button || state.isMutating) return;

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
    if (state.isMutating) return;
    exitEditMode({ restoreDraft: true });
    setStatus("success", "Edit cancelled. Draft restored.");
  });

  elements.uploadBtn.addEventListener("click", handleSave);
  elements.attachBtn.addEventListener("click", () => triggerFilePicker(elements.bodyInput, () => state));
  elements.cameraBtn.addEventListener("click", () => triggerCameraCapture(elements.bodyInput, () => state));
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

function boot() {
  state.folderHistory = storage.getJson(CONFIG.folderHistoryKey, []);
  renderFolderChips();
  restoreSavedDraft();
  bindEvents();
  setEditorMode("write");
  updateModeUi();
  updateFolderHint();
  renderPreview();
  renderNoteList();
  checkAuth();
}

boot();
