import { replaceTextRange } from "./utils.js";

let isAutocompleteActive = false;
let autocompleteStart = -1;
let selectedIndex = 0;
let suggestions = [];
let suggestionPanel = null;

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

  document.querySelector(".editor-pane.active .editor-wrapper").appendChild(suggestionPanel);
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
