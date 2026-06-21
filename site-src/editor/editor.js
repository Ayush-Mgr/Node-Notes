import { handlePairs } from "./pairs.js";
import { handleBackspace } from "./backspace.js";
import { handleLists } from "./lists.js";
import { handleIndent } from "./indent.js";
import { handleShortcuts } from "./shortcuts.js";
import { handleAutocomplete, handleAutocompleteInput, handleSelectionChange } from "./autocomplete.js";
import { initHistory, handleHistory, saveState } from "./history.js";
export function setupEditor(textarea, getState) {
  initHistory(textarea);

  textarea.addEventListener("keydown", (e) => {
    if (handleHistory(e, textarea)) return;
    
    // For specific shortcuts that modify text without triggering native input flow
    // save state before the action to ensure clean undo.
    const isSpecialAction = e.ctrlKey || e.metaKey || e.key === "Tab" || e.key === "Enter" || e.key === "Backspace" || e.key.length === 1 && !e.ctrlKey && !e.metaKey && ["'", '"', "(", "[", "{", "`"].includes(e.key);
    
    if (isSpecialAction) {
      saveState(textarea);
    }

    if (handleAutocomplete(e, textarea, getState)) return;
    if (handleShortcuts(e, textarea)) return;
    if (handleBackspace(e, textarea)) return;
    if (handleIndent(e, textarea)) return;
    if (handleLists(e, textarea)) return;
    if (handlePairs(e, textarea)) return;
  });

  textarea.addEventListener("input", () => {
    handleAutocompleteInput(textarea, getState);
  });

  ["click", "keyup", "touchend"].forEach((event) => {
    textarea.addEventListener(event, () => {
      handleSelectionChange(textarea);
    });
  });
}
