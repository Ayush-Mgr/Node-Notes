export const MAX_HISTORY = 200;

let undoStack = [];
let redoStack = [];
let lastValue = "";
let saveTimeout = null;

export function initHistory(textarea) {
  undoStack = [getState(textarea)];
  redoStack = [];
  lastValue = textarea.value;

  textarea.addEventListener("input", () => {
    if (textarea.value !== lastValue) {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveState(textarea);
      }, 500);
    }
  });
}

function getState(textarea) {
  return {
    value: textarea.value,
    selectionStart: textarea.selectionStart,
    selectionEnd: textarea.selectionEnd,
  };
}

export function saveState(textarea) {
  const currentState = getState(textarea);
  if (
    undoStack.length === 0 ||
    undoStack[undoStack.length - 1].value !== currentState.value
  ) {
    undoStack.push(currentState);
    if (undoStack.length > MAX_HISTORY) {
      undoStack.shift();
    }
    redoStack = []; // Clear redo stack on new explicit save
    lastValue = currentState.value;
  }
}

export function handleHistory(e, textarea) {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

  if (isCmdOrCtrl && (e.key.toLowerCase() === "z" || e.key.toLowerCase() === "y")) {
    e.preventDefault();

    if ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y") {
      // Redo
      if (redoStack.length > 0) {
        // Before redoing, push the current state to undo stack
        const currentState = getState(textarea);
        if (
          undoStack.length === 0 ||
          undoStack[undoStack.length - 1].value !== currentState.value
        ) {
          undoStack.push(currentState);
        }

        const nextState = redoStack.pop();
        applyState(textarea, nextState);
        lastValue = nextState.value;
      }
    } else {
      // Undo
      if (undoStack.length > 0) {
        const currentState = getState(textarea);

        // If there are unsaved changes, reverting means going back to top of undoStack
        if (undoStack[undoStack.length - 1].value !== currentState.value) {
          redoStack.push(currentState);
          const prevState = undoStack[undoStack.length - 1];
          applyState(textarea, prevState);
          lastValue = prevState.value;
        } else if (undoStack.length > 1) {
          // Current state is same as top of undo stack, so we go back one more
          redoStack.push(undoStack.pop());
          const prevState = undoStack[undoStack.length - 1];
          applyState(textarea, prevState);
          lastValue = prevState.value;
        }
      }
    }
    return true;
  }
  return false;
}

function applyState(textarea, state) {
  textarea.value = state.value;
  textarea.selectionStart = state.selectionStart;
  textarea.selectionEnd = state.selectionEnd;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}
