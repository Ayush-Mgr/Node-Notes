import { handlePairs } from "./pairs.js";
import { handleBackspace } from "./backspace.js";
import { handleLists } from "./lists.js";
import { handleIndent } from "./indent.js";
import { handleShortcuts } from "./shortcuts.js";
import { handleAutocomplete } from "./autocomplete.js";
export function setupEditor(textarea, getState) {
  textarea.addEventListener("keydown", (e) => {
    if (handleAutocomplete(e, textarea, getState)) return;
    if (handleShortcuts(e, textarea)) return;
    if (handleBackspace(e, textarea)) return;
    if (handleIndent(e, textarea)) return;
    if (handleLists(e, textarea)) return;
    if (handlePairs(e, textarea)) return;
  });
}
