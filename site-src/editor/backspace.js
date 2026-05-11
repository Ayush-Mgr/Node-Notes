import { replaceTextRange } from "./utils.js";

const pairMap = {
  "[]": true,
  "()": true,
  "{}": true,
  '""': true,
  "''": true,
  "``": true,
  $$: true,
  "**": true,
};

export function handleBackspace(e, textarea) {
  if (e.key !== "Backspace") return false;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  if (start !== end || start === 0) return false;

  const val = textarea.value;
  const before = val[start - 1];
  const after = val[start];

  if (before && after && pairMap[before + after]) {
    e.preventDefault();
    replaceTextRange(textarea, start - 1, start + 1, "");
    textarea.selectionStart = start - 1;
    textarea.selectionEnd = start - 1;
    return true;
  }

  return false;
}
