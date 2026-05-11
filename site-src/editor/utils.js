export function insertTextAtCursor(
  textarea,
  text,
  selectionOffset = 0,
  selectionLength = 0,
) {
  textarea.focus();
  const success = document.execCommand("insertText", false, text);

  if (!success) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;
    textarea.value = val.substring(0, start) + text + val.substring(end);
    textarea.selectionStart = start + text.length + selectionOffset;
    textarea.selectionEnd = textarea.selectionStart + selectionLength;
  } else if (selectionOffset !== 0 || selectionLength !== 0) {
    const start = textarea.selectionStart;
    textarea.selectionStart = start + selectionOffset;
    textarea.selectionEnd = textarea.selectionStart + selectionLength;
  }
}

export function wrapSelection(textarea, prefix, suffix = prefix) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = textarea.value.substring(start, end);

  textarea.focus();
  const success = document.execCommand(
    "insertText",
    false,
    prefix + text + suffix,
  );

  if (!success) {
    const val = textarea.value;
    textarea.value =
      val.substring(0, start) + prefix + text + suffix + val.substring(end);
  }

  textarea.selectionStart = start + prefix.length;
  textarea.selectionEnd = start + prefix.length + text.length;
}

export function replaceTextRange(textarea, start, end, text) {
  textarea.focus();
  textarea.selectionStart = start;
  textarea.selectionEnd = end;
  const success = document.execCommand("insertText", false, text);
  if (!success) {
    const val = textarea.value;
    textarea.value = val.substring(0, start) + text + val.substring(end);
  }
}

