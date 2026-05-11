import { replaceTextRange } from "./utils.js";

export function handleIndent(e, textarea) {
  if (e.key !== "Tab") return false;
  e.preventDefault();

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;

  const startOfLine = val.lastIndexOf("\n", start - 1) + 1;
  let endOfLine = val.indexOf("\n", end);
  if (endOfLine === -1) endOfLine = val.length;

  const lines = val.substring(startOfLine, endOfLine).split("\n");
  const isShift = e.shiftKey;

  let newText = "";
  let startOffset = 0;
  let endOffset = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isShift) {
      if (line.startsWith("  ")) {
        newText += line.substring(2);
        if (i === 0) startOffset -= 2;
        endOffset -= 2;
      } else if (line.startsWith(" ")) {
        newText += line.substring(1);
        if (i === 0) startOffset -= 1;
        endOffset -= 1;
      } else {
        newText += line;
      }
    } else {
      newText += "  " + line;
      if (i === 0) startOffset += 2;
      endOffset += 2;
    }

    if (i < lines.length - 1) {
      newText += "\n";
    }
  }

  replaceTextRange(textarea, startOfLine, endOfLine, newText);

  textarea.selectionStart = Math.max(startOfLine, start + startOffset);
  textarea.selectionEnd = Math.max(startOfLine, end + endOffset);

  return true;
}
