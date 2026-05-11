import { insertTextAtCursor, replaceTextRange } from "./utils.js";

export function handleLists(e, textarea) {
  if (e.key !== "Enter") return false;

  const start = textarea.selectionStart;
  const val = textarea.value;

  const textBeforeCursor = val.substring(0, start);
  const lastNewline = textBeforeCursor.lastIndexOf("\n");
  const currentLine = textBeforeCursor.substring(lastNewline + 1);

  const blockMap = {
    "```": true,
    $$: true,
  };

  const trimmedLine = currentLine.trim();
  if (blockMap[trimmedLine]) {
    e.preventDefault();
    const textToInsert = "\n\n" + trimmedLine;
    insertTextAtCursor(textarea, textToInsert, -(trimmedLine.length + 1));
    return true;
  }

  const listRegex = /^(\s*)([-*+]|\d+\.|>)( \[([ x])\])?\s+(.*)$/i;
  const emptyListRegex = /^(\s*)([-*+]|\d+\.|>)( \[([ x])\])?\s*$/i;

  const emptyMatch = currentLine.match(emptyListRegex);
  if (emptyMatch) {
    e.preventDefault();
    replaceTextRange(textarea, lastNewline + 1, start, "");
    textarea.selectionStart = lastNewline + 1;
    textarea.selectionEnd = lastNewline + 1;
    return true;
  }

  const match = currentLine.match(listRegex);
  if (match) {
    e.preventDefault();
    const indent = match[1];
    let marker = match[2];
    const checkbox = match[3];

    if (/^\d+\.$/.test(marker)) {
      const num = parseInt(marker, 10);
      marker = `${num + 1}.`;
    }

    let prefix = `\n${indent}${marker} `;
    if (checkbox) {
      prefix += "[ ] ";
    }

    insertTextAtCursor(textarea, prefix);
    return true;
  }

  return false;
}
