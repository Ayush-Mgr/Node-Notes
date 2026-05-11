import { wrapSelection } from "./utils.js";

export function handleShortcuts(e, textarea) {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const cmdKey = isMac ? e.metaKey : e.ctrlKey;

  if (!cmdKey) return false;

  const key = e.key.toLowerCase();
  const hasSelection = textarea.selectionStart !== textarea.selectionEnd;

  if (key === "b") {
    e.preventDefault();
    if (hasSelection) {
      wrapSelection(textarea, "**", "**");
    }
    return true;
  }

  if (key === "i") {
    e.preventDefault();
    if (hasSelection) {
      wrapSelection(textarea, "*", "*");
    }
    return true;
  }

  if (key === "k") {
    e.preventDefault();
    if (hasSelection) {
      wrapSelection(textarea, "[", "]()");
      textarea.selectionStart = textarea.selectionEnd - 1;
      textarea.selectionEnd = textarea.selectionStart;
    } else {
      wrapSelection(textarea, "[]()");
      textarea.selectionStart -= 3;
      textarea.selectionEnd = textarea.selectionStart;
    }
    return true;
  }

  return false;
}
