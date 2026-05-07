const CONFIG = {
  owner: "Ayush-Mgr",
  repo: "Node-Notes",
  branch: "main",
  apiBase: "https://api.github.com",
  inboxPrefix: "vault/inbox/",
  noteSuffix: ".md",
  maxRecentNotes: 24,
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
    && path.startsWith(CONFIG.inboxPrefix)
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

  return `${new Date().toISOString().replace(/[:.]/g, "-")}.md`;
}

function buildMarkdown(title, body, fallbackTitle) {
  const safeTitle = (title || fallbackTitle).replace(/"/g, "\\\"");
  return [
    "---",
    `title: "${safeTitle}"`,
    `date: ${new Date().toISOString()}`,
    "tags: [inbox, mobile]",
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
    if (!parsed) {
      return { title: fallbackTitle, body: markdown };
    }

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
    } catch {
      // Ignore storage failures on restrictive browsers.
    }
  }, 600);
}

function restoreSavedDraft() {
  try {
    const savedBody = localStorage.getItem(CONFIG.draftBodyKey);
    const savedTitle = localStorage.getItem(CONFIG.draftTitleKey);
    if (savedBody) elements.bodyInput.value = savedBody;
    if (savedTitle) elements.titleInput.value = savedTitle;
    if (savedBody || savedTitle) elements.draftTag.classList.add("visible");
  } catch {
    // Ignore storage failures on restrictive browsers.
  }
}

function clearSavedDraft() {
  try {
    localStorage.removeItem(CONFIG.draftBodyKey);
    localStorage.removeItem(CONFIG.draftTitleKey);
  } catch {
    // Ignore storage failures on restrictive browsers.
  }

  elements.draftTag.classList.remove("visible");
}

function saveSessionToken() {
  try {
    sessionStorage.setItem(CONFIG.tokenKey, currentToken());
  } catch {
    // Ignore storage failures on restrictive browsers.
  }
}

function restoreSessionToken() {
  try {
    const saved = sessionStorage.getItem(CONFIG.tokenKey);
    if (saved) elements.tokenInput.value = saved;
  } catch {
    // Ignore storage failures on restrictive browsers.
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

  const html = marked.parse(body, { breaks: true, gfm: true });
  elements.previewBody.innerHTML = DOMPurify.sanitize(html);
}

function setEditorMode(mode) {
  const showPreview = mode === "preview";
  elements.writeTab.classList.toggle("active", !showPreview);
  elements.previewTab.classList.toggle("active", showPreview);
  elements.writeTab.setAttribute("aria-selected", String(!showPreview));
  elements.previewTab.setAttribute("aria-selected", String(showPreview));
  elements.writePane.classList.toggle("active", !showPreview);
  elements.previewPane.classList.toggle("active", showPreview);
  elements.writePane.setAttribute("aria-hidden", String(showPreview));
  elements.previewPane.setAttribute("aria-hidden", String(!showPreview));
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
    elements.noteList.innerHTML = '<p class="list-state">Loading inbox notes…</p>';
    elements.noteCount.textContent = "Syncing";
    return;
  }

  if (state.listStatus === "error") {
    elements.noteList.innerHTML = `<p class="list-state">${escapeHtml(state.listError || "Unable to load inbox notes.")}</p>`;
    elements.noteCount.textContent = "Error";
    return;
  }

  const notes = filteredNotes();
  if (notes.length === 0) {
    const message = state.searchQuery
      ? "No inbox notes match that search."
      : "No inbox notes yet.";
    elements.noteList.innerHTML = `<p class="list-state">${message}</p>`;
    elements.noteCount.textContent = "Empty";
    return;
  }

  elements.noteCount.textContent = `${notes.length} shown`;
  elements.noteList.innerHTML = notes.map((note) => {
    const confirmDelete = state.confirmDeletePath === note.path;
    const deleteLabel = confirmDelete ? "Tap Again to Delete" : "Delete";
    return `
      <article class="vault-card">
        <div class="vault-card__top">
          <div class="vault-card__content">
            <h3 class="vault-card__title">${escapeHtml(note.title)}</h3>
            <p class="vault-card__meta">${escapeHtml(note.path)}</p>
          </div>
        </div>
        <div class="vault-actions">
          <button class="action-btn" type="button" data-action="edit" data-path="${escapeHtml(note.path)}" ${state.isMutating ? "disabled" : ""}>Edit</button>
          <button class="action-btn danger ${confirmDelete ? "active-danger" : ""}" type="button" data-action="delete" data-path="${escapeHtml(note.path)}" data-sha="${escapeHtml(note.sha || "")}" ${state.isMutating ? "disabled" : ""}>${escapeHtml(deleteLabel)}</button>
        </div>
      </article>
    `;
  }).join("");
}

function updateModeUi() {
  const editing = state.mode === "edit";
  elements.uploadBtn.textContent = editing ? "Update Note" : "Create Note";
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
  if (!isPathSafe(path)) throw new Error("Unsafe inbox path rejected.");

  const response = await fetch(`${CONFIG.apiBase}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`, {
    headers: authHeaders(token),
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `GET ${path}: ${response.status}`);
  }

  const data = await response.json();
  return data.sha || null;
}

async function getFileContent(token, path) {
  if (!isPathSafe(path)) throw new Error("Unsafe inbox path rejected.");

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
  if (!isPathSafe(path)) throw new Error("Unsafe inbox path rejected.");

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
  if (!isPathSafe(path)) throw new Error("Unsafe inbox path rejected.");

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

async function fetchInbox(token) {
  state.listStatus = "loading";
  state.listError = "";
  clearDeleteConfirmation();
  renderNoteList();

  const response = await fetch(
    `${CONFIG.apiBase}/repos/${CONFIG.owner}/${CONFIG.repo}/contents/vault/inbox?ref=${encodeURIComponent(CONFIG.branch)}`,
    { headers: authHeaders(token) },
  );

  if (response.status === 404) {
    state.notes = [];
    state.listStatus = "ready";
    renderNoteList();
    return;
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Inbox list failed: ${response.status}`);
  }

  const entries = await response.json();
  const files = Array.isArray(entries)
    ? entries
      .filter((entry) => entry.type === "file" && isPathSafe(entry.path))
      .sort((a, b) => b.name.localeCompare(a.name))
      .slice(0, CONFIG.maxRecentNotes)
    : [];

  const notes = await Promise.all(files.map(async (entry) => {
    try {
      const { content } = await getFileContent(token, entry.path);
      const parsed = parseEditableNote(entry.path, content);
      return {
        path: entry.path,
        sha: entry.sha || null,
        title: parsed.title || noteStemFromPath(entry.path),
      };
    } catch {
      return {
        path: entry.path,
        sha: entry.sha || null,
        title: noteStemFromPath(entry.path),
      };
    }
  }));

  state.notes = notes;
  state.listStatus = "ready";
  renderNoteList();
}

async function refreshInboxFromToken() {
  const token = currentToken();
  if (!token) {
    state.notes = [];
    state.listStatus = "empty";
    renderNoteList();
    return;
  }

  try {
    await fetchInbox(token);
  } catch (error) {
    state.listStatus = "error";
    state.listError = error.message || "Unable to load inbox notes.";
    renderNoteList();
  }
}

async function startEditing(path) {
  if (state.isMutating) return;

  const token = currentToken();
  if (!token) {
    setStatus("error", "GitHub token required to load inbox notes.");
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
    setStatus("success", "Editing inbox note.");
  } catch (error) {
    setStatus("error", error.message || "Unable to load note.");
    if (state.mode !== "edit") {
      state.draftSnapshot = null;
    }
  } finally {
    setMutationState(false);
  }
}

async function handleDelete(path, shaHint) {
  const token = currentToken();
  if (!token) {
    setStatus("error", "GitHub token required to delete inbox notes.");
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

    await deleteFile(token, path, sha, `inbox: delete ${path.split("/").pop()}`);
    if (state.editingPath === path) {
      exitEditMode({ restoreDraft: true });
    }

    await fetchInbox(token);
    setStatus("success", "Inbox note deleted.");
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
  setStatus("uploading", state.mode === "edit" ? "Updating note…" : "Creating note…");

  try {
    const filename = buildFilename(title);
    const path = state.mode === "edit" ? state.editingPath : `${CONFIG.inboxPrefix}${filename}`;
    const fallbackTitle = noteStemFromPath(path);
    const message = state.mode === "edit"
      ? `inbox: update ${path.split("/").pop()}`
      : `inbox: add ${path.split("/").pop()}`;
    const sha = state.mode === "edit"
      ? state.editingSha
      : await getFileSha(token, path);

    await putFile(token, path, buildMarkdown(title, body, fallbackTitle), sha, message);
    await fetchInbox(token);

    if (state.mode === "edit") {
      exitEditMode({ restoreDraft: true });
      setStatus("success", "Note updated.");
      return;
    }

    clearSavedDraft();
    elements.titleInput.value = "";
    elements.bodyInput.value = "";
    renderPreview();
    setStatus("success", `Created ${path.split("/").pop()}.`);
  } catch (error) {
    setStatus("error", error.message || "Save failed. Check token and network.");
  } finally {
    setMutationState(false);
  }
}

function bindEvents() {
  elements.tokenInput.addEventListener("input", saveSessionToken);
  elements.tokenInput.addEventListener("change", refreshInboxFromToken);

  elements.tokenToggle.addEventListener("click", () => {
    const hidden = elements.tokenInput.type === "password";
    elements.tokenInput.type = hidden ? "text" : "password";
    elements.tokenToggle.textContent = hidden ? "Hide" : "Show";
  });

  elements.titleInput.addEventListener("input", () => {
    saveDraftSoon();
    renderPreview();
  });

  elements.bodyInput.addEventListener("input", () => {
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
    if (!isPathSafe(path)) {
      setStatus("error", "Unsafe inbox path rejected.");
      return;
    }

    if (button.dataset.action === "edit") {
      await startEditing(path);
      return;
    }

    if (button.dataset.action === "delete") {
      await handleDelete(path, button.dataset.sha || null);
    }
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
  refreshInboxFromToken();
}

boot();
