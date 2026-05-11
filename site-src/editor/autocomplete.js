import { insertTextAtCursor, replaceTextRange } from "./utils.js";

let isAutocompleteActive = false;
let autocompleteStart = -1;
let selectedIndex = 0;
let suggestions = [];
let suggestionPanel = null;

function createSuggestionPanel() {
  if (suggestionPanel) return;
  suggestionPanel = document.createElement("div");
  suggestionPanel.className = "autocomplete-panel hidden";
  document.querySelector(".editor-pane.active").appendChild(suggestionPanel);
}

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
      updateSuggestions("", getState().notes);
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
      insertSuggestion(textarea, suggestions[selectedIndex].displayPath);
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
    updateSuggestions(query, getState().notes);
  }, 10);

  return false;
}

function updateSuggestions(query, notes) {
  if (!query.trim()) {
    suggestions = notes.slice(0, 10);
  } else {
    const qLower = query.toLowerCase();
    suggestions = notes
      .filter(
        (n) =>
          n.title.toLowerCase().includes(qLower) ||
          n.displayPath.toLowerCase().includes(qLower),
      )
      .slice(0, 10);
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
