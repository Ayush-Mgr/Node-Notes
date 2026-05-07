const CONFIG = {
  owner: "Ayush-Mgr",
  repo: "Node-Notes",
  branch: "main",
  apiBase: "https://api.github.com",
  vaultPrefix: "vault/",
  noteSuffix: ".md",
  deleteConfirmMs: 4000,
  draftBodyKey: "nn_draft_body",
  draftTitleKey: "nn_draft_title",
  tokenKey: "nn_token",
};

const elements = {
  tokenInput: document.getElementById("token-input"),
  tokenToggle: document.getElementById("token-toggle"),
  titleInput: document.getElementById("note-title"),
  bodyInput: document.getElementById("note-body"),
  noteSearchInput: document.getElementById("note-search"),
  uploadBtn: document.getElementById("upload-btn"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  draftTag: document.getElementById("draft-tag"),
  statusBar: document.getElementById("status-bar"),
  statusText: document.getElementById("status-text"),
  noteList: document.getElementById("note-list"),
  noteCount: document.getElementById("note-count"),
  writeTab: document.getElementById("write-tab"),
  previewTab: document.getElementById("preview-tab"),
  writePane: document.getElementById("write-pane"),
  previewPane: document.getElementById("preview-pane"),
  previewTitle: document.getElementById("preview-title"),
  previewBody: document.getElementById("preview-body"),
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
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[char]));
}

function setStatus(type, message) {
  elements.statusBar.className = `status visible ${type}`;
  elements.statusText.textContent = message;
}

function isPathSafe(path) {
  return typeof path === "string"
    && path.startsWith(CONFIG.vaultPrefix)
    && path.endsWith(CONFIG.noteSuffix)
    && !path.includes("..")
    && !path.includes("\\");
}

function currentToken() {
  return elements.tokenInput.value.trim();
}

function noteStemFromPath(path) {
  return path.split("/").pop().replace(/\.md$/i, "");
}

function buildFilename(title) {
  if (title.trim()) {
    return `${title.trim().replace(/\.md$/i, "")}.md`;
  }
  const now = new Date();
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  return [
    now.getUTCFullYear(),
    '-', pad(now.getUTCMonth() + 1),
    '-', pad(now.getUTCDate()),
    'T', pad(now.getUTCHours()),
    '-', pad(now.getUTCMinutes()),
    '-', pad(now.getUTCSeconds()),
    '-', pad(now.getUTCMilliseconds(), 3),
    'Z.md'
  ].join('');
}

function buildMarkdown(title, body, fallbackTitle) {
  const safeTitle = (title || fallbackTitle).replace(/"/g, "\\\"");
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

function extractFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return null;

  const titleMatch = match[1].match(/^title\s*:\s*(?:"((?:\\"|[^"])*)"|'([^']*)'|(.+))\s*$/m);
  const rawTitle = titleMatch ? (titleMatch[1] ?? titleMatch[2] ?? titleMatch[3] ?? "") : "";
  return {
    title: rawTitle.replace(/\\"/g, "\"").trim(),
    body: markdown.slice(match[0].length),
  };
}

function parseEditableNote(path, markdown) {
  const fallbackTitle = noteStemFromPath(path);
  try {
    const parsed = extractFrontmatter(markdown);
    if (!parsed) return { title: fallbackTitle, body: markdown };
    return {
      title: parsed.title || fallbackTitle,
      body: parsed.body,
    };
  } catch {
    return { title: fallbackTitle, body: markdown };
  }
}

function saveDraftSoon() {
  clearTimeout(saveDraftSoon.timerId);
  saveDraftSoon.timerId = setTimeout(() => {
    try {
      localStorage.setItem(CONFIG.draftBodyKey, elements.bodyInput.value);
      localStorage.setItem(CONFIG.draftTitleKey, elements.titleInput.value);
      elements.draftTag.classList.toggle(
        "visible",
        Boolean(elements.bodyInput.value || elements.titleInput.value),
      );
    } catch { }
  }, 600);
}

function restoreSavedDraft() {
  try {
    const savedBody = localStorage.getItem(CONFIG.draftBodyKey);
    const savedTitle = localStorage.getItem(CONFIG.draftTitleKey);
    if (savedBody) elements.bodyInput.value = savedBody;
    if (savedTitle) elements.titleInput.value = savedTitle;
    if (savedBody || savedTitle) elements.draftTag.classList.add("visible");
  } catch { }
}

function clearSavedDraft() {
  try {
    localStorage.removeItem(CONFIG.draftBodyKey);
    localStorage.removeItem(CONFIG.draftTitleKey);
  } catch { }
  elements.draftTag.classList.remove("visible");
}

function saveSessionToken() {
  try {
    sessionStorage.setItem(CONFIG.tokenKey, currentToken());
  } catch { }
}

function restoreSessionToken() {
  try {
    const saved = sessionStorage.getItem(CONFIG.tokenKey);
    if (saved) elements.tokenInput.value = saved;
  } catch { }
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

  const html = marked.parse(body, { breaks: true, gfm: true });
  elements.previewBody.innerHTML = DOMPurify.sanitize(html);
}

function setEditorMode(mode) {
  const showPreview = mode === "preview";
  elements.writeTab.classList.toggle("active", !showPreview);
  elements.previewTab.classList.toggle("active", showPreview);
  elements.writePane.classList.toggle("active", !showPreview);
  elements.previewPane.classList.toggle("active", showPreview);
}

function clearDeleteConfirmation() {
  state.confirmDeletePath = null;
  if (state.deleteConfirmTimer) {
    clearTimeout(state.deleteConfirmTimer);
    state.deleteConfirmTimer = null;
  }
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
  if (!query) return state.notes;
  return state.notes.filter((note) => note.path.toLowerCase().includes(query));
}

function renderNoteList() {
  if (state.listStatus === "loading") {
    elements.noteList.innerHTML = '<p class="list-state">Scanning vault files…</p>';
    elements.noteCount.textContent = "Syncing";
    return;
  }

  if (state.listStatus === "error") {
    elements.noteList.innerHTML = `<p class="list-state">${escapeHtml(state.listError || "Unable to load notes from GitHub.")}</p>`;
    elements.noteCount.textContent = "Error";
    return;
  }

  const notes = filteredNotes();
  if (notes.length === 0) {
    const token = currentToken();
    const message = token 
      ? (state.searchQuery ? `No notes match "${escapeHtml(state.searchQuery)}".` : "No notes found in vault. Your new notes will appear here.")
      : "Enter your GitHub Token above to list and manage your vault notes.";
    elements.noteList.innerHTML = `<p class="list-state">${message}</p>`;
    elements.noteCount.textContent = "0 files";
    return;
  }

  elements.noteCount.textContent = `${notes.length} files`;
  elements.noteList.innerHTML = notes.map((note) => {
    const confirmDelete = state.confirmDeletePath === note.path;
    const deleteLabel = confirmDelete ? "Confirm Delete" : "Delete";
    const hasToken = !!currentToken();
    const displayPath = note.path.replace(/^vault\//, '');
    
    return `
      <article class="vault-card">
        <div class="vault-card__top">
          <div class="vault-card__content">
            <h3 class="vault-card__title" style="font-family:var(--font-sans); font-size: 0.9rem; font-weight: 500;">${escapeHtml(displayPath)}</h3>
          </div>
        </div>
        <div class="vault-actions">
          <button class="action-btn" type="button" data-action="edit" data-path="${escapeHtml(note.path)}" ${state.isMutating || !hasToken ? "disabled" : ""}>Edit</button>
          <button class="action-btn danger ${confirmDelete ? "active-danger" : ""}" type="button" data-action="delete" data-path="${escapeHtml(note.path)}" data-sha="${escapeHtml(note.sha || "")}" ${state.isMutating || !hasToken ? "disabled" : ""}>${escapeHtml(deleteLabel)}</button>
        </div>
        ${!hasToken ? '<p style="font-size:0.6rem;color:var(--error);text-align:right;margin-top:4px;text-transform:uppercase;">Token required</p>' : ''}
      </article>
    `;
  }).join("");
}

function updateModeUi() {
  const editing = state.mode === "edit";
  elements.uploadBtn.textContent = editing ? "Update Note" : "Save to Vault";
  elements.cancelEditBtn.classList.toggle("hidden", !editing);
}

function restoreDraftSnapshot() {
  if (!state.draftSnapshot) return;
  elements.titleInput.value = state.draftSnapshot.title;
  elements.bodyInput.value = state.draftSnapshot.body;
  state.draftSnapshot = null;
  saveDraftSoon();
  renderPreview();
}

function enterCreateMode() {
  state.mode = "create";
  state.editingPath = null;
  state.editingSha = null;
  updateModeUi();
}

function exitEditMode({ restoreDraft = true } = {}) {
  enterCreateMode();
  if (restoreDraft) {
    restoreDraftSnapshot();
  } else {
    state.draftSnapshot = null;
  }
}

async function githubRequest(path, options = {}) {
  const response = await fetch(`${CONFIG.apiBase}${path}`, options);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `${options.method || "GET"} ${path}: ${response.status}`);
  }
  return response.json();
}

function authHeaders(token, includeJson = false) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function getFileSha(token, path) {
  if (!isPathSafe(path)) throw new Error("Unsafe vault path rejected.");
  const response = await fetch(`${CONFIG.apiBase}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`, {
    headers: authHeaders(token),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GET ${path}: ${response.status}`);
  const data = await response.json();
  return data.sha || null;
}

async function getFileContent(token, path) {
  if (!isPathSafe(path)) throw new Error("Unsafe vault path rejected.");
  const data = await githubRequest(
    `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
    { headers: authHeaders(token) },
  );
  const binary = atob((data.content || "").replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return {
    sha: data.sha || null,
    content: new TextDecoder().decode(bytes),
  };
}

async function putFile(token, path, content, sha, message) {
  if (!isPathSafe(path)) throw new Error("Unsafe vault path rejected.");
  const bytes = new TextEncoder().encode(content);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return githubRequest(
    `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
    {
      method: "PUT",
      headers: authHeaders(token, true),
      body: JSON.stringify({
        message,
        content: btoa(binary),
        branch: CONFIG.branch,
        ...(sha ? { sha } : {}),
      }),
    },
  );
}

async function deleteFile(token, path, sha, message) {
  if (!isPathSafe(path)) throw new Error("Unsafe vault path rejected.");
  return githubRequest(
    `/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`,
    {
      method: "DELETE",
      headers: authHeaders(token, true),
      body: JSON.stringify({
        message,
        sha,
        branch: CONFIG.branch,
      }),
    },
  );
}

async function fetchNotes(token) {
  state.listStatus = "loading";
  state.listError = "";
  clearDeleteConfirmation();
  renderNoteList();

  try {
    const headers = authHeaders(token);
    const branchRes = await fetch(`${CONFIG.apiBase}/repos/${CONFIG.owner}/${CONFIG.repo}/branches/${CONFIG.branch}`, { headers });
    if (!branchRes.ok) throw new Error(`Branch resolution failed: ${branchRes.status}`);
    const branchData = await branchRes.json();
    const treeSha = branchData.commit.commit.tree.sha;

    const res = await fetch(`${CONFIG.apiBase}/repos/${CONFIG.owner}/${CONFIG.repo}/git/trees/${treeSha}?recursive=1`, { headers });
    if (res.status === 404) {
      state.notes = [];
      state.listStatus = "ready";
      renderNoteList();
      return;
    }
    if (!res.ok) throw new Error(`Note list failed: ${res.status}`);

    const data = await res.json();
    const tree = data.tree || [];
    const files = tree
      .filter((entry) => entry.type === "blob" && isPathSafe(entry.path))
      .sort((a, b) => b.path.localeCompare(a.path));

    state.notes = files.map((entry) => ({
      path: entry.path,
      sha: entry.sha || null,
    }));

    state.listStatus = "ready";
    renderNoteList();
  } catch (error) {
    state.listStatus = "error";
    state.listError = "Unable to load notes from GitHub.";
    renderNoteList();
  }
}

async function refreshFromToken() {
  const token = currentToken();
  try {
    await fetchNotes(token);
  } catch (error) {
    state.listStatus = "error";
    state.listError = "Unable to load vault files from GitHub.";
    renderNoteList();
  }
}

async function startEditing(path) {
  if (state.isMutating) return;
  const token = currentToken();
  if (!token) {
    setStatus("error", "GitHub token required to load notes.");
    elements.tokenInput.focus();
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
      };
    }

    const { sha, content } = await getFileContent(token, path);
    const parsed = parseEditableNote(path, content);
    elements.titleInput.value = parsed.title;
    elements.bodyInput.value = parsed.body;
    state.mode = "edit";
    state.editingPath = path;
    state.editingSha = sha;
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
  const token = currentToken();
  if (!token) {
    setStatus("error", "GitHub token required to delete notes.");
    elements.tokenInput.focus();
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
    const sha = shaHint || state.notes.find((note) => note.path === path)?.sha || await getFileSha(token, path);
    if (!sha) throw new Error("Missing file SHA for delete.");
    await deleteFile(token, path, sha, `vault: delete ${path.split("/").pop()}`);
    if (state.editingPath === path) exitEditMode({ restoreDraft: true });
    await fetchNotes(token);
    setStatus("success", "Note deleted.");
  } catch (error) {
    setStatus("error", error.message || "Delete failed.");
  } finally {
    setMutationState(false);
  }
}

async function handleSave() {
  const token = currentToken();
  const title = elements.titleInput.value.trim();
  const body = elements.bodyInput.value;

  if (!token) {
    setStatus("error", "GitHub token required.");
    elements.tokenInput.focus();
    return;
  }
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
    const path = state.mode === "edit" ? state.editingPath : `${CONFIG.vaultPrefix}${filename}`;
    const fallbackTitle = noteStemFromPath(path);
    const message = state.mode === "edit"
      ? `vault: update ${path.split("/").pop()}`
      : `vault: add ${path.split("/").pop()}`;
    const sha = state.mode === "edit" ? state.editingSha : await getFileSha(token, path);

    await putFile(token, path, buildMarkdown(title, body, fallbackTitle), sha, message);
    await fetchNotes(token);

    if (state.mode === "edit") {
      exitEditMode({ restoreDraft: true });
      setStatus("success", "Note updated.");
    } else {
      clearSavedDraft();
      elements.titleInput.value = "";
      elements.bodyInput.value = "";
      renderPreview();
      setStatus("success", `Uploaded ${path.split("/").pop()}. Site rebuilding (~60s)`);
    }
  } catch (error) {
    setStatus("error", error.message || "Save failed. Check token and network.");
  } finally {
    setMutationState(false);
  }
}

function bindEvents() {
  elements.tokenInput.addEventListener("input", saveSessionToken);
  elements.tokenInput.addEventListener("change", refreshFromToken);
  elements.tokenToggle.addEventListener("click", () => {
    const hidden = elements.tokenInput.type === "password";
    elements.tokenInput.type = hidden ? "text" : "password";
    elements.tokenToggle.textContent = hidden ? "Hide" : "Show";
  });
  elements.titleInput.addEventListener("input", () => { saveDraftSoon(); renderPreview(); });
  elements.bodyInput.addEventListener("input", () => { saveDraftSoon(); renderPreview(); });
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
    if (!isPathSafe(path)) { setStatus("error", "Unsafe vault path rejected."); return; }
    if (button.dataset.action === "edit") { await startEditing(path); return; }
    if (button.dataset.action === "delete") { await handleDelete(path, button.dataset.sha || null); }
  });
  elements.cancelEditBtn.addEventListener("click", () => {
    if (state.isMutating) return;
    exitEditMode({ restoreDraft: true });
    setStatus("success", "Returned to draft.");
  });
  elements.uploadBtn.addEventListener("click", handleSave);
}

function boot() {
  restoreSessionToken();
  restoreSavedDraft();
  bindEvents();
  setEditorMode("write");
  updateModeUi();
  renderPreview();
  renderNoteList();
  refreshFromToken();
}

boot();
