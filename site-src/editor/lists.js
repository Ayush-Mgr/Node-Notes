import { insertTextAtCursor, replaceTextRange } from "./utils.js";

export function handleLists(e, textarea) {
  if (e.key !== "Enter") return false;

  const start = textarea.selectionStart;
  const val = textarea.value;

  const textBeforeCursor = val.substring(0, start);
  const lastNewline = textBeforeCursor.lastIndexOf("\n");
  const currentLine = textBeforeCursor.substring(lastNewline + 1);

  const trimmedLine = currentLine.trim();
  let isBlock = false;
  let delimiter = "";
  let closeDelimiter = "";

  if (trimmedLine.startsWith("```")) {
    isBlock = true;
    delimiter = "```";
    closeDelimiter = "```";
  } else if (trimmedLine.startsWith("~~~")) {
    isBlock = true;
    delimiter = "~~~";
    closeDelimiter = "~~~";
  } else if (trimmedLine === "$$") {
    isBlock = true;
    delimiter = "$$";
    closeDelimiter = "$$";
  }

  if (isBlock) {
    const linesBefore = textBeforeCursor.split("\n");
    let fenceChar = null;
    let fenceLength = 0;
    let inMath = false;

    for (let i = 0; i < linesBefore.length; i++) {
      const l = linesBefore[i].trim();

      if (fenceChar !== null) {
        const closeRegex = new RegExp(`^\\s*${fenceChar}{${fenceLength},}\\s*$`);
        if (l.match(closeRegex)) {
          fenceChar = null;
          fenceLength = 0;
        }
      } else if (inMath) {
        if (l.match(/^\s*\$\$\s*$/)) {
          inMath = false;
        }
      } else {
        const fenceMatch = l.match(/^\s*(\`{3,}|~{3,})/);
        if (fenceMatch) {
          fenceChar = fenceMatch[1][0];
          fenceLength = fenceMatch[1].length;
        } else if (l.match(/^\s*\$\$\s*$/)) {
          inMath = true;
        }
      }
    }

    const insideBlock = (delimiter === "$$") ? inMath : (fenceChar !== null);

    if (insideBlock) {
      e.preventDefault();
      const textToInsert = "\n\n" + closeDelimiter;
      insertTextAtCursor(textarea, textToInsert, -(closeDelimiter.length + 1));
      return true;
    } else {
      return false;
    }
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
