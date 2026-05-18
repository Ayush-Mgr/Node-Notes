import { replaceTextRange } from "./utils.js";

let isAutocompleteActive = false;
let autocompleteStart = -1;
let selectedIndex = 0;
let suggestions = [];
let suggestionPanel = null;
let activeTextarea = null;

function getEditorWrapper() {
  return document.querySelector(".editor-pane.active .editor-wrapper");
}

function getCaretPositionInWrapper(textarea, position) {
  const wrapper = getEditorWrapper();
  if (!wrapper) return null;

  const mirror = document.createElement("div");
  const mirrorStyle = window.getComputedStyle(textarea);
  const wrapperRect = wrapper.getBoundingClientRect();
  const textareaRect = textarea.getBoundingClientRect();

  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.pointerEvents = "none";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordBreak = "break-word";
  mirror.style.overflowWrap = "break-word";
  mirror.style.top = `${textarea.offsetTop}px`;
  mirror.style.left = `${textarea.offsetLeft}px`;
  mirror.style.width = `${textarea.clientWidth}px`;
  mirror.style.padding = mirrorStyle.padding;
  mirror.style.border = "0";
  mirror.style.font = mirrorStyle.font;
  mirror.style.fontSize = mirrorStyle.fontSize;
  mirror.style.fontFamily = mirrorStyle.fontFamily;
  mirror.style.fontWeight = mirrorStyle.fontWeight;
  mirror.style.fontStyle = mirrorStyle.fontStyle;
  mirror.style.letterSpacing = mirrorStyle.letterSpacing;
  mirror.style.lineHeight = mirrorStyle.lineHeight;
  mirror.style.textTransform = mirrorStyle.textTransform;
  mirror.style.textIndent = mirrorStyle.textIndent;
  mirror.style.tabSize = mirrorStyle.tabSize;

  const before = document.createTextNode(textarea.value.slice(0, position));
  const marker = document.createElement("span");
  marker.textContent = "\u200b";

  mirror.append(before, marker);
  wrapper.appendChild(mirror);

  const markerRect = marker.getBoundingClientRect();
  const top = markerRect.top - wrapperRect.top - textarea.scrollTop;
  const left = markerRect.left - wrapperRect.left - textarea.scrollLeft;
  const lineHeight = Number.parseFloat(mirrorStyle.lineHeight) || Number.parseFloat(mirrorStyle.fontSize) * 1.4;
  const maxLeft = Math.max(0, textareaRect.width - 320);

  wrapper.removeChild(mirror);

  return {
    top: textarea.offsetTop + top + lineHeight + 6,
    left: textarea.offsetLeft + Math.min(Math.max(0, left), maxLeft),
  };
}

function createSuggestionPanel() {
  if (suggestionPanel) return;
  suggestionPanel = document.createElement("div");
  suggestionPanel.className = "autocomplete-panel hidden";
  
  suggestionPanel.addEventListener("mousedown", (e) => {
    e.preventDefault();
  });

  suggestionPanel.addEventListener("click", (e) => {
    const item = e.target.closest(".autocomplete-item");
    if (!item) return;
    const index = parseInt(item.getAttribute("data-index"), 10);
    const s = suggestions[index];
    if (s) {
      const textarea = document.getElementById("note-body");
      if (textarea) {
        insertSuggestion(textarea, s.linkTarget);
      }
    }
  });

  const wrapper = getEditorWrapper();
  if (wrapper) {
    wrapper.appendChild(suggestionPanel);
  }

  const textarea = document.getElementById("note-body");
  if (textarea) {
    activeTextarea = textarea;
    textarea.addEventListener("scroll", () => {
      if (isAutocompleteActive) updatePanel();
    });
  }

  window.addEventListener("resize", () => {
    if (isAutocompleteActive) updatePanel();
  });
}

document.addEventListener("click", (e) => {
  if (!isAutocompleteActive) return;
  const textarea = document.getElementById("note-body");
  if (suggestionPanel && !suggestionPanel.contains(e.target) && e.target !== textarea) {
    cancelAutocomplete();
  }
});

function updatePanel() {
  if (!suggestionPanel) return;
  if (!isAutocompleteActive || suggestions.length === 0) {
    suggestionPanel.classList.add("hidden");
    return;
  }

  const textarea = activeTextarea || document.getElementById("note-body");
  if (textarea) {
    const position = Math.max(0, textarea.selectionStart);
    const coords = getCaretPositionInWrapper(textarea, position);
    if (coords) {
      suggestionPanel.style.top = `${coords.top}px`;
      suggestionPanel.style.left = `${coords.left}px`;
      suggestionPanel.style.bottom = "auto";
    }
  }

  suggestionPanel.innerHTML = suggestions
    .map(
      (s, i) => `
    <div class="autocomplete-item ${i === selectedIndex ? "selected" : ""}" data-index="${i}">
      ${escapeHtml(s.title)}
      <div class="autocomplete-meta">${escapeHtml(s.displayPath)}</div>
    </div>
  `,
    )
    .join("");

  suggestionPanel.classList.remove("hidden");

  const selectedEl = suggestionPanel.querySelector(".selected");
  if (selectedEl) {
    selectedEl.scrollIntoView({ block: "nearest" });
  }
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
}

export function handleAutocomplete(e, textarea, getState) {
  activeTextarea = textarea;
  createSuggestionPanel();

  if (e.key === "[" && !isAutocompleteActive) {
    const val = textarea.value;
    const start = textarea.selectionStart;
    if (start > 0 && val[start - 1] === "[") {
      isAutocompleteActive = true;
      autocompleteStart = start + 1;
      selectedIndex = 0;
      updateSuggestions("", getState().vault.notes);
      return false;
    }
  }

  if (!isAutocompleteActive) return false;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIndex = (selectedIndex + 1) % suggestions.length;
    updatePanel();
    return true;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex =
      (selectedIndex - 1 + suggestions.length) % suggestions.length;
    updatePanel();
    return true;
  }

  if (e.key === "Enter") {
    e.preventDefault();
    if (suggestions[selectedIndex]) {
      insertSuggestion(textarea, suggestions[selectedIndex].linkTarget);
    } else {
      cancelAutocomplete();
    }
    return true;
  }

  if (e.key === "Escape") {
    e.preventDefault();
    cancelAutocomplete();
    return true;
  }

  if (e.key === "Backspace" && textarea.selectionStart <= autocompleteStart) {
    cancelAutocomplete();
    return false;
  }

  setTimeout(() => {
    if (!isAutocompleteActive) return;
    const val = textarea.value;
    const query = val.substring(autocompleteStart, textarea.selectionStart);
    if (query.includes("]")) {
      cancelAutocomplete();
      return;
    }
    updateSuggestions(query, getState().vault.notes);
  }, 10);

  return false;
}

function updateSuggestions(query, notes) {
  if (!notes || !Array.isArray(notes)) notes = [];
  
  if (!query.trim()) {
    suggestions = notes.slice(0, 10);
  } else {
    const qLower = query.toLowerCase();
    
    const startsWith = [];
    const includesTitle = [];
    const includesPath = [];

    for (const n of notes) {
      if (!n.title || !n.displayPath) continue;
      const tLower = n.title.toLowerCase();
      const pLower = n.displayPath.toLowerCase();
      
      if (tLower.startsWith(qLower)) {
        startsWith.push(n);
      } else if (tLower.includes(qLower)) {
        includesTitle.push(n);
      } else if (pLower.includes(qLower)) {
        includesPath.push(n);
      }
    }
    
    suggestions = [...startsWith, ...includesTitle, ...includesPath].slice(0, 10);
  }
  selectedIndex = 0;
  updatePanel();
}

function insertSuggestion(textarea, path) {
  const end = textarea.selectionStart;
  const val = textarea.value;

  textarea.focus();
  const replacement = path + "]]";

  replaceTextRange(textarea, autocompleteStart, end, replacement);
  textarea.selectionStart = autocompleteStart + replacement.length;
  textarea.selectionEnd = textarea.selectionStart;

  cancelAutocomplete();
}

function cancelAutocomplete() {
  isAutocompleteActive = false;
  suggestions = [];
  updatePanel();
}
