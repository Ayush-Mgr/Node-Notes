import { handlePairs } from "./pairs.js";
import { handleBackspace } from "./backspace.js";
import { handleLists } from "./lists.js";
import { handleIndent } from "./indent.js";
import { handleShortcuts } from "./shortcuts.js";
import { handleAutocomplete, handleAutocompleteInput, handleSelectionChange } from "./autocomplete.js";
export function setupEditor(textarea, getState) {
  textarea.addEventListener("keydown", (e) => {
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
