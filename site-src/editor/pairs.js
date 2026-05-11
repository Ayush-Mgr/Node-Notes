import { insertTextAtCursor, wrapSelection } from "./utils.js";

const pairs = {
  "(": ")",
  "[": "]",
  "{": "}",
  '"': '"',
  "'": "'",
  "`": "`",
};

export function handlePairs(e, textarea) {
  const char = e.key;

  if (pairs[char]) {
    e.preventDefault();
    const hasSelection = textarea.selectionStart !== textarea.selectionEnd;

    if (hasSelection) {
      wrapSelection(textarea, char, pairs[char]);
    } else {
      insertTextAtCursor(textarea, char + pairs[char], -1);
    }
    return true;
  }

  if (char === "*") {
    const val = textarea.value;
    const start = textarea.selectionStart;
    const hasSelection = textarea.selectionStart !== textarea.selectionEnd;

    if (hasSelection) {
      e.preventDefault();
      wrapSelection(textarea, "*", "*");
      return true;
    }

    if (
      start > 0 &&
      val[start - 1] === "*" &&
      (start === 1 || /[\s\n]/.test(val[start - 2]))
    ) {
      e.preventDefault();
      textarea.selectionStart = start - 1;
      insertTextAtCursor(textarea, "****", -2);
      return true;
    }
  }

  if (char === "$") {
    const val = textarea.value;
    const start = textarea.selectionStart;
    const hasSelection = textarea.selectionStart !== textarea.selectionEnd;

    if (hasSelection) {
      e.preventDefault();
      wrapSelection(textarea, "$", "$");
      return true;
    }

    if (
      start > 0 &&
      val[start - 1] === "$" &&
      (start === 1 || /[\s\n]/.test(val[start - 2]))
    ) {
      e.preventDefault();
      textarea.selectionStart = start - 1;
      insertTextAtCursor(textarea, "$$$$", -2);
      return true;
    }
  }

  return false;
}
