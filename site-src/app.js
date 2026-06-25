const state = {
  data: null,
  nodeById: new Map(),
  activeNoteId: null,
  resolveAssetTarget: () => null,
  resolveNoteTarget: () => null,
  history: [null],
  historyIndex: 0,
};

// Tunable graph constants
const HUB_DEGREE_THRESHOLD = 30;   // nodes with degree above this are treated as hubs
const LOCAL_GRAPH_MAX_NEIGHBORS = 25; // max neighbors shown in the local graph panel

const graphView = document.getElementById("graph-view");
const appStatus = document.getElementById("app-status");
const noteBackdrop = document.getElementById("note-backdrop");
const notePanel = document.getElementById("note-panel");
const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");
const closeNoteButton = document.getElementById("close-note");
const navBackBtn = document.getElementById("note-nav-back");
const navForwardBtn = document.getElementById("note-nav-forward");
const tooltip = document.getElementById("tooltip");

function updateNavButtons() {
  if (navBackBtn) navBackBtn.disabled = state.historyIndex <= 0;
  if (navForwardBtn) navForwardBtn.disabled = state.historyIndex >= state.history.length - 1;
}

if (navBackBtn) navBackBtn.addEventListener("click", () => goBack());
if (navForwardBtn) navForwardBtn.addEventListener("click", () => goForward());

function goBack() {
  if (state.historyIndex > 0) {
    window.history.back();
  }
}

function goForward() {
  if (state.historyIndex < state.history.length - 1) {
    window.history.forward();
  }
}

let currentNeighborMap = new Map();
let currentZoomTransform = d3.zoomIdentity;
let canvas, context, simulation;
let hoveredNode = null;
let redrawGraph = () => { };
let localGraphSimulation = null;
let localGraphSvg = null;
let localGraphZoom = null;

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

const mathBlockExtension = {
  name: 'mathBlock',
  level: 'block',
  start: (src) => src.indexOf('$$'),
  tokenizer(src) {
    const match = /^\$\$([\s\S]*?)\$\$(?:[ \t]*(?:\n|$))/.exec(src);
    if (!match) return undefined;
    return { type: 'mathBlock', raw: match[0], text: match[1].trim() };
  },
  renderer(token) {
    return `<div class="math-block">\\[${escapeHtml(token.text)}\\]</div>`;
  }
};

const mathInlineExtension = {
  name: 'mathInline',
  level: 'inline',
  start: (src) => src.match(/\$/)?.index ?? -1,
  tokenizer(src) {
    const inline = /^\$([^$\n]+?)\$/.exec(src);
    if (inline) return { type: 'mathInline', raw: inline[0], text: inline[1] };
  },
  renderer(token) {
    return `\\(${escapeHtml(token.text)}\\)`;
  }
};

if (typeof marked !== 'undefined') marked.use({ extensions: [mathBlockExtension, mathInlineExtension] });


function stripFrontmatter(markdown) {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

function isExternalUrl(value) {
  return /^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("#");
}

function decodeAssetTarget(target) {
  try {
    return decodeURIComponent(target);
  } catch {
    return target;
  }
}

function buildAssetResolver() {
  const exact = new Map();
  const byLeaf = new Map();

  for (const assetPath of state.data.assets || []) {
    const normalized = assetPath.toLowerCase();
    exact.set(normalized, assetPath);

    const leaf = normalized.split("/").pop();
    if (!byLeaf.has(leaf)) byLeaf.set(leaf, []);
    byLeaf.get(leaf).push(assetPath);
  }

  return (target) => {
    const clean = decodeAssetTarget(target).trim().replace(/\\/g, "/").replace(/^\.?\//, "");
    if (!clean || isExternalUrl(clean)) return null;

    const normalized = clean.toLowerCase();
    if (exact.has(normalized)) return exact.get(normalized);

    const matches = byLeaf.get(normalized.split("/").pop()) || [];
    return matches.length >= 1 ? matches[0] : null;
  };
}

function resolveAssetUrl(target) {
  const resolved = state.resolveAssetTarget(target);
  return resolved ? `content/${encodeURI(resolved)}` : null;
}

function rewriteHtmlImageSources(markdown) {
  return markdown.replace(/<img\b([^>]*?)\bsrc\s*=\s*(['"]?)([^"'>\s]+(?:\s[^"'>\s]+)*)\2([^>]*)>/gi, (match, before, quote, src, after) => {
    if (isExternalUrl(src) || src.startsWith("content/")) return match;
    const resolved = resolveAssetUrl(src);
    if (!resolved) return match;
    const q = quote || '"';
    return `<img${before}src=${q}${resolved}${q}${after}>`;
  });
}

function rewriteMarkdownImageSources(markdown) {
  return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, rawTarget) => {
    const parts = rawTarget.trim().match(/^(<)?([^>]+?)(>)?(?:\s+"[^"]*")?$/);
    if (!parts) return match;
    const target = parts[2].trim();
    if (isExternalUrl(target) || target.startsWith("content/")) return match;
    const resolved = resolveAssetUrl(target);
    if (!resolved) return match;
    return `![${alt}](${resolved})`;
  });
}

function buildInternalLinkResolver() {
  const exact = new Map();
  const byLeaf = new Map();

  for (const node of state.data.nodes) {
    if (node.ghost) continue;
    exact.set(node.id.toLowerCase(), node.id);
    const leaf = node.id.split("/").pop().toLowerCase();
    if (!byLeaf.has(leaf)) byLeaf.set(leaf, []);
    byLeaf.get(leaf).push(node.id);
  }

  return (target) => {
    const clean = target.trim().replace(/\\/g, "/").replace(/\.md$/i, "").toLowerCase();
    if (exact.has(clean)) return exact.get(clean);
    const leaf = clean.split("/").pop();
    const matches = byLeaf.get(leaf) || [];
    return matches.length === 1 ? matches[0] : null;
  };
}

function rewriteWikilinks(markdown) {
  return markdown.replace(/(!)?\[\[([^\]]+)\]\]/g, (_, bang, inner) => {
    const [targetPart, aliasPart] = inner.split("|");
    const target = (targetPart || "").split("#")[0].trim();
    const label = (aliasPart || target || "Untitled").trim();
    if (!target) return "";

    const lower = target.toLowerCase();
    const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(lower);

    if (bang || isImage) {
      const src = resolveAssetUrl(target);
      return src ? `![${label}](${src})` : `<span class="missing-attachment">Missing Attachment: ${label}</span>`;
    }

    const resolved = state.resolveNoteTarget(target);
    if (!resolved) {
      return `<span class="internal-note-link internal-note-link--ghost" title="Missing note: ${escapeHtml(target)}">${escapeHtml(label)}</span>`;
    }
    return `<a href="#note=${encodeURIComponent(resolved)}" class="internal-note-link" data-note-id="${resolved}">${escapeHtml(label)}</a>`;
  });
}

function protectMarkdownSegments(markdown) {
  const protectedSegments = [];
  const save = (segment) => {
    const index = protectedSegments.push(segment) - 1;
    return `NNPROTECT${index}END`;
  };

  let output = markdown;
  output = output.replace(/(^|\n)(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\2[ \t]*(?=\n|$)/g, (match) => save(match));
  output = output.replace(/`[^`\n]*`/g, (match) => save(match));
  output = output.replace(/\$\$[\s\S]*?\$\$/g, (match) => save(match));
  output = output.replace(/\$(?!\$)(?:\\.|[^$\n])+?\$/g, (match) => save(match));

  return {
    markdown: output,
    restore(value) {
      return value.replace(/NNPROTECT(\d+)END/g, (_, index) => protectedSegments[Number(index)] ?? "");
    }
  };
}

function countMathBlockDelimiters(line) {
  const matches = line.match(/\$\$/g);
  return matches ? matches.length : 0;
}

function getCalloutIcon(type) {
  const icons = {
    note: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
    abstract: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 14h6"/><path d="M9 18h6"/><path d="M9 10h6"/></svg>`,
    summary: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 14h6"/><path d="M9 18h6"/><path d="M9 10h6"/></svg>`,
    tldr: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 14h6"/><path d="M9 18h6"/><path d="M9 10h6"/></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    todo: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
    tip: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A7 7 0 0 0 4 8c0 1.3.5 2.6 1.5 3.5.7.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
    hint: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A7 7 0 0 0 4 8c0 1.3.5 2.6 1.5 3.5.7.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
    done: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
    question: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`,
    help: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`,
    faq: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
    caution: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
    failure: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
    danger: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    bug: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="14" x="8" y="6" rx="4"/><path d="m19 7-3 2"/><path d="m5 7 3 2"/><path d="m19 19-3-2"/><path d="m5 19 3-2"/><path d="M20 13h-4"/><path d="M4 13h4"/><path d="m10 4 1 2"/><path d="m14 4-1 2"/></svg>`,
    error: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>`,
    quote: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1Z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1Z"/></svg>`
  };
  const norm = type.toLowerCase();
  return icons[norm] || icons.note;
}

function getCalloutTitle(type, userTitle) {
  if (userTitle && userTitle.trim()) {
    return userTitle.trim();
  }
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
}

function renderCallout(type, collapseSign, title, innerContentMarkdown) {
  const normType = type.toLowerCase();
  const icon = getCalloutIcon(normType);
  const displayTitle = getCalloutTitle(type, title);
  const parsedContent = marked.parse(innerContentMarkdown, { breaks: true, gfm: true });
  const isCollapsible = collapseSign === "-" || collapseSign === "+";
  const isOpen = collapseSign === "+";

  if (isCollapsible) {
    return `
<details class="callout callout--${normType}" data-callout="${normType}" ${isOpen ? "open" : ""}>
  <summary class="callout-header">
    <span class="callout-icon">${icon}</span>
    <span class="callout-title">${escapeHtml(displayTitle)}</span>
    <span class="callout-fold-icon"></span>
  </summary>
  <div class="callout-content">
    ${parsedContent}
  </div>
</details>
`;
  } else {
    return `
<div class="callout callout--${normType}" data-callout="${normType}">
  <div class="callout-header">
    <span class="callout-icon">${icon}</span>
    <span class="callout-title">${escapeHtml(displayTitle)}</span>
  </div>
  <div class="callout-content">
    ${parsedContent}
  </div>
</div>
`;
  }
}

function parseCallouts(markdown) {
  const lines = markdown.split(/\r?\n/);
  const result = [];
  let i = 0;

  let fenceChar = null;
  let fenceLength = 0;
  let inMathBlock = false;

  while (i < lines.length) {
    const line = lines[i];

    let cleanLine = line;
    const bqMatch = line.match(/^(?:\s*>\s*)+/);
    if (bqMatch) {
      cleanLine = line.slice(bqMatch[0].length);
    }

    if (fenceChar !== null) {
      const closeRegex = new RegExp(`^\\s*${fenceChar}{${fenceLength},}\\s*$`);
      if (cleanLine.match(closeRegex)) {
        fenceChar = null;
        fenceLength = 0;
      }
    } else if (inMathBlock) {
      if (countMathBlockDelimiters(cleanLine) % 2 === 1) {
        inMathBlock = false;
      }
    } else {
      const fenceMatch = cleanLine.match(/^\s*(\`{3,}|~{3,})/);
      if (fenceMatch) {
        fenceChar = fenceMatch[1][0];
        fenceLength = fenceMatch[1].length;
      } else if (countMathBlockDelimiters(cleanLine) % 2 === 1) {
        inMathBlock = true;
      }
    }

    const inFencedRegion = (fenceChar !== null || inMathBlock);

    if (!inFencedRegion) {
      const match = line.match(/^\s*>\s?(.*)$/);

      if (match) {
        const contentLine = match[1];
        const headerMatch = contentLine.match(/^\[!([a-zA-Z0-9_-]+)\]([-+])?\s*(.*)$/);

        if (headerMatch) {
          const type = headerMatch[1];
          const collapseSign = headerMatch[2];
          const title = headerMatch[3];

          const blockquoteLines = [];
          while (i < lines.length) {
            const innerMatch = lines[i].match(/^\s*>\s?(.*)$/);
            if (!innerMatch) {
              break;
            }
            blockquoteLines.push(innerMatch[1]);
            i++;
          }

          const innerContentMarkdown = blockquoteLines.slice(1).join("\n");
          const calloutHtml = renderCallout(type, collapseSign, title, innerContentMarkdown);
          result.push(calloutHtml);
          continue;
        }
      }
    }

    result.push(line);
    i++;
  }

  return result.join("\n");
}

function preprocessObsidianMarkdown(markdown) {
  let stripped = stripFrontmatter(markdown);
  const placeholders = [];
  
  stripped = stripped.replace(/(\$\$[\s\S]*?\$\$|`{3,}[\s\S]*?`{3,}|`[^`]+`|\$[^$\n]+\$)/g, (match) => {
    placeholders.push(match);
    return `__PLACEHOLDER_${placeholders.length - 1}__`;
  });

  let processed = parseCallouts(
    rewriteHtmlImageSources(
      rewriteMarkdownImageSources(
        rewriteWikilinks(stripped)
      )
    )
  );

  return processed.replace(/__PLACEHOLDER_(\d+)__/g, (_, index) => placeholders[index]);
}

async function openNote(noteId, pushHash = true) {
  const node = state.nodeById.get(noteId);
  if (!node) return;
  if (node.ghost || !node.path) {
    setStatus(`Missing note: ${node.missingTarget || node.title}`);
    return;
  }

  hoveredNode = null;
  hideTooltip();
  if (canvas) canvas.style.cursor = "default";

  setStatus(`Opening ${node.title}`);
  const response = await fetch(`content/${encodeURI(node.path)}`);
  if (!response.ok) {
    setStatus(`Failed to load note: HTTP ${response.status}`);
    return;
  }
  const markdown = await response.text();
  const processed = preprocessObsidianMarkdown(markdown);

  noteTitle.textContent = node.title;
  noteContent.innerHTML = DOMPurify.sanitize(marked.parse(processed, { breaks: true, gfm: true }));

  if (window.MathJax) {
    MathJax.typesetPromise([noteContent]).catch(() => { });
  }

  noteContent.querySelectorAll('pre code.language-mermaid').forEach((block) => {
    const pre = block.parentNode;
    const div = document.createElement('div');
    div.className = 'mermaid';
    div.textContent = block.textContent;
    pre.parentNode.replaceChild(div, pre);
  });

  if (window.mermaid) {
    const mermaidNodes = noteContent.querySelectorAll('.mermaid');
    if (mermaidNodes.length > 0) {
      mermaid.run({ nodes: mermaidNodes }).catch((e) => {
        console.error('Mermaid render error:', e);
      });
    }
  }

  notePanel.classList.remove("hidden");
  noteBackdrop.classList.remove("hidden");
  notePanel.setAttribute("aria-hidden", "false");
  noteBackdrop.setAttribute("aria-hidden", "false");
  document.body.classList.add("note-open");
  state.activeNoteId = noteId;
  redrawGraph();
  setStatus(node.title);

  if (pushHash) {
    window.location.hash = `note=${encodeURIComponent(noteId)}`;
  }

  cleanupLocalGraph();

  const neighborIds = currentNeighborMap.get(noteId) || new Set();
  const view = document.getElementById("local-graph-view");
  if (neighborIds.size === 0) {
    if (view) {
      view.innerHTML = `<div class="local-graph-empty">No direct note connections yet.</div>`;
    }
  } else {
    const activeNodeSrc = state.nodeById.get(noteId);

    // Sort neighbors: degree desc, then title asc for stability
    let sortedNeighborIds = [...neighborIds].sort((a, b) => {
      const na = state.nodeById.get(a);
      const nb = state.nodeById.get(b);
      const degDiff = (nb?.degree ?? 0) - (na?.degree ?? 0);
      if (degDiff !== 0) return degDiff;
      return (na?.title ?? a).localeCompare(nb?.title ?? b);
    });

    const overflowCount = Math.max(0, sortedNeighborIds.length - LOCAL_GRAPH_MAX_NEIGHBORS);
    if (overflowCount > 0) {
      sortedNeighborIds = sortedNeighborIds.slice(0, LOCAL_GRAPH_MAX_NEIGHBORS);
    }

    const localNodes = [];
    if (activeNodeSrc) localNodes.push({ ...activeNodeSrc });
    sortedNeighborIds.forEach(id => {
      const nNode = state.nodeById.get(id);
      if (nNode) localNodes.push({ ...nNode });
    });

    const localNodeIds = new Set(localNodes.map(d => d.id));
    const localLinks = state.data.links
      .filter(link => {
        const s = typeof link.source === "object" ? link.source.id : link.source;
        const t = typeof link.target === "object" ? link.target.id : link.target;
        return localNodeIds.has(s) && localNodeIds.has(t);
      })
      .map(link => ({
        source: typeof link.source === "object" ? link.source.id : link.source,
        target: typeof link.target === "object" ? link.target.id : link.target
      }));

    requestAnimationFrame(() => {
      renderLocalGraph(noteId, localNodes, localLinks, overflowCount);
    });
  }

  noteContent.querySelectorAll("[data-note-id]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openNote(link.dataset.noteId);
    });
  });
}

function closeNote(clearHash = true) {
  notePanel.classList.add("hidden");
  noteBackdrop.classList.add("hidden");
  notePanel.setAttribute("aria-hidden", "true");
  noteBackdrop.setAttribute("aria-hidden", "true");
  document.body.classList.remove("note-open");
  noteContent.innerHTML = "";
  state.activeNoteId = null;
  cleanupLocalGraph();
  redrawGraph();
  setStatus(`${state.data?.nodes.length ?? 0} notes`);
  if (clearHash) {
    history.pushState(null, "", window.location.pathname);
    if (state.history[state.historyIndex] !== null) {
      if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
      }
      state.history.push(null);
      state.historyIndex++;
      updateNavButtons();
    }
  }
}

function cleanupLocalGraph() {
  if (localGraphSimulation) {
    localGraphSimulation.stop();
    localGraphSimulation = null;
  }
  localGraphSvg = null;
  localGraphZoom = null;
  const view = document.getElementById("local-graph-view");
  if (view) {
    view.innerHTML = "";
  }
}

function renderLocalGraph(activeNoteId, localNodes, localLinks, overflowCount = 0) {
  const view = document.getElementById("local-graph-view");
  if (!view) return;

  const width = view.clientWidth || 300;
  const height = view.clientHeight || 280;
  const cx = width / 2;
  const cy = height / 2;

  // Pin active note in the exact center
  const activeNode = localNodes.find(d => d.id === activeNoteId);
  if (activeNode) {
    activeNode.fx = cx;
    activeNode.fy = cy;
  }

  const svg = d3.select(view)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("height", "100%");

  localGraphSvg = svg;

  // Overflow badge — rendered as SVG text at the bottom so it stays clipped within view
  if (overflowCount > 0) {
    svg.append("text")
      .attr("class", "local-graph-overflow-text")
      .attr("x", width / 2)
      .attr("y", height - 8)
      .attr("text-anchor", "middle")
      .text(`+${overflowCount} more connections not shown`);
  }

  const g = svg.append("g");

  // D3 zoom filter
  localGraphZoom = d3.zoom()
    .scaleExtent([0.6, 2.5])
    .filter((event) => {
      if (event.type === "wheel") {
        return event.ctrlKey || event.metaKey;
      }
      return !event.button;
    })
    .on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

  svg.call(localGraphZoom);

  const linkSelection = g.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(localLinks)
    .join("line")
    .attr("class", d => {
      const isActiveLink = (d.source === activeNoteId || d.target === activeNoteId);
      const ghostClass = d.ghost ? " ghost-link" : "";
      return isActiveLink ? `local-graph-link active-link${ghostClass}` : `local-graph-link${ghostClass}`;
    });

  const nodeSelection = g.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(localNodes)
    .join("g")
    .attr("class", d => {
      const classes = ["local-graph-node"];
      if (d.id === activeNoteId) classes.push("active-node");
      if (d.ghost) classes.push("ghost-node");
      return classes.join(" ");
    })
    .on("click", (event, d) => {
      if (d.ghost) {
        setStatus(`Missing note: ${d.missingTarget || d.title}`);
        return;
      }
      if (d.id !== activeNoteId) {
        openNote(d.id);
      }
    });

  nodeSelection.append("title")
    .text(d => d.title);

  nodeSelection.append("circle")
    .attr("r", d => d.id === activeNoteId ? d.radius + 3 : d.radius);

  // Labels — placed per tick via angle from center
  const labelSelection = nodeSelection.append("text")
    .attr("class", "local-graph-label")
    .text(d => d.title.length > 18 ? d.title.slice(0, 18) + "…" : d.title);

  nodeSelection
    .on("mouseenter", (event, d) => {
      linkSelection.style("stroke-opacity", l => (l.source.id === d.id || l.target.id === d.id) ? 1.0 : 0.1);
      linkSelection.style("stroke", l => (l.source.id === d.id || l.target.id === d.id) ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.08)");

      const connectedIds = new Set();
      connectedIds.add(d.id);
      localLinks.forEach(l => {
        if (l.source.id === d.id) connectedIds.add(l.target.id);
        if (l.target.id === d.id) connectedIds.add(l.source.id);
      });

      nodeSelection.style("opacity", n => connectedIds.has(n.id) ? 1.0 : 0.2);
    })
    .on("mouseleave", () => {
      linkSelection.style("stroke-opacity", null);
      linkSelection.style("stroke", null);
      nodeSelection.style("opacity", null);
    });

  localGraphSimulation = d3.forceSimulation(localNodes)
    .force("link", d3.forceLink(localLinks).id(d => d.id).distance(80).strength(0.8))
    .force("charge", d3.forceManyBody().strength(-220))
    .force("collide", d3.forceCollide().radius(d => d.radius + 15 + Math.min((d.title || "").length * 4.5, 55)))
    .force("center", d3.forceCenter(cx, cy));

  const LABEL_PADDING = 5; // px gap between node edge and label start

  localGraphSimulation.on("tick", () => {
    linkSelection
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    nodeSelection
      .attr("transform", d => `translate(${d.x}, ${d.y})`);

    // Angle-based label placement: outward from graph center, clamped to viewport
    const LABEL_MARGIN = 4; // px padding from SVG edge
    const APPROX_LABEL_W = 70; // rough max label width in px (18 chars × ~4px)
    const APPROX_LABEL_H = 10; // label line height in px

    labelSelection.each(function(d) {
      const el = d3.select(this);
      const nx = d.x ?? cx;
      const ny = d.y ?? cy;
      const ddx = nx - cx;
      const ddy = ny - cy;
      const angle = Math.atan2(ddy, ddx);

      const isRightSide = Math.cos(angle) >= 0;
      const r = (d.id === activeNoteId ? d.radius + 3 : d.radius) + LABEL_PADDING;

      // Raw label anchor in graph-space (relative to node center)
      const rawLx = Math.cos(angle) * r;
      const rawLy = Math.sin(angle) * r + 4;

      // Absolute label anchor in SVG space
      let absX = nx + rawLx;
      let absY = ny + rawLy;

      // Clamp so the label text stays within the SVG viewport
      // For right-anchored text: origin is left edge of text → clamp right boundary
      // For left-anchored text (text-anchor=end): origin is right edge → clamp left boundary
      if (isRightSide) {
        absX = Math.min(absX, width - LABEL_MARGIN - APPROX_LABEL_W);
      } else {
        absX = Math.max(absX, LABEL_MARGIN + APPROX_LABEL_W);
      }
      absY = Math.max(absY, LABEL_MARGIN + APPROX_LABEL_H);
      absY = Math.min(absY, height - LABEL_MARGIN - APPROX_LABEL_H);

      // Convert back to node-relative dx/dy
      el.attr("dx", absX - nx)
        .attr("dy", absY - ny)
        .attr("text-anchor", isRightSide ? "start" : "end");
    });
  });
}


function showTooltip(text, x, y) {
  tooltip.textContent = text;
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
  tooltip.classList.remove("hidden");
}

function hideTooltip() {
  tooltip.classList.add("hidden");
}

function setStatus(text) {
  appStatus.textContent = text;
}

function renderGraph() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const nodes = state.data.nodes.map((node) => ({ ...node }));
  const links = state.data.links.map((link) => ({ ...link }));
  currentNeighborMap = new Map();

  for (const link of links) {
    if (!currentNeighborMap.has(link.source)) currentNeighborMap.set(link.source, new Set());
    if (!currentNeighborMap.has(link.target)) currentNeighborMap.set(link.target, new Set());
    currentNeighborMap.get(link.source).add(link.target);
    currentNeighborMap.get(link.target).add(link.source);
  }

  graphView.innerHTML = "";

  canvas = d3
    .select(graphView)
    .append("canvas")
    .node();

  context = canvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.scale(dpr, dpr);

  currentZoomTransform = d3.zoomIdentity;

  simulation = d3
    .forceSimulation(nodes)
    .force("link", d3.forceLink(links).id((d) => d.id).distance(45).strength(0.5))
    .force("charge", d3.forceManyBody().strength(-150))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(0.8))
    .force("y", d3.forceY(height / 2).strength(0.8))
    .force("collision", d3.forceCollide().radius((d) => d.radius + 2));

  simulation.on("tick", drawCanvas);

  d3.select(canvas)
    .call(
      d3.drag()
        .subject((event) => {
          const transform = currentZoomTransform;
          const x = transform.invertX(event.x);
          const y = transform.invertY(event.y);
          return simulation.find(x, y, 20);
        })
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    )
    .call(
      d3.zoom()
        .scaleExtent([0.35, 3])
        .on("zoom", (event) => {
          currentZoomTransform = event.transform;
          drawCanvas();
        })
    )
    .on("mousemove", (event) => {
      if (state.activeNoteId) {
        if (hoveredNode) {
          hoveredNode = null;
          hideTooltip();
          canvas.style.cursor = "default";
        }
        return;
      }
      const [mx, my] = d3.pointer(event);
      const x = currentZoomTransform.invertX(mx);
      const y = currentZoomTransform.invertY(my);
      const found = simulation.find(x, y, 20);

      if (found !== hoveredNode) {
        hoveredNode = found;
        if (hoveredNode) {
          showTooltip(hoveredNode.title, mx, my);
          canvas.style.cursor = "pointer";
        } else {
          hideTooltip();
          canvas.style.cursor = "default";
        }
        if (simulation.alpha() < simulation.alphaMin()) drawCanvas();
      } else if (hoveredNode) {
        showTooltip(hoveredNode.title, mx, my);
      }
    })
    .on("click", () => {
      if (hoveredNode) openNote(hoveredNode.id);
    });

  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  function drawCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(currentZoomTransform.x, currentZoomTransform.y);
    context.scale(currentZoomTransform.k, currentZoomTransform.k);

    const activeId = state.activeNoteId;
    const hoverId = hoveredNode ? hoveredNode.id : null;
    const focusId = hoverId || activeId;

    let neighbors = new Set();
    if (focusId) {
      neighbors = currentNeighborMap.get(focusId) || new Set();
    }

    const normalLinks = [];
    const fadedLinks = [];
    const highlightedLinks = [];
    const hubLinks = [];       // hub-suppressed: ultra-faint unless focused
    const hubFadedLinks = [];  // hub links that are also faded
    const ghostNormalLinks = [];
    const ghostFadedLinks = [];
    const ghostHighlightedLinks = [];

    links.forEach(d => {
      const srcDeg = d.source.degree ?? 0;
      const tgtDeg = d.target.degree ?? 0;
      const isHubLink = (srcDeg > HUB_DEGREE_THRESHOLD || tgtDeg > HUB_DEGREE_THRESHOLD);
      const hubFocused = isHubLink && (d.source.id === focusId || d.target.id === focusId);

      if (d.ghost) {
        // Ghost links: keep existing ghost bucketing
        if (!focusId) {
          ghostNormalLinks.push(d);
        } else if (d.source.id === focusId || d.target.id === focusId) {
          ghostHighlightedLinks.push(d);
        } else {
          ghostFadedLinks.push(d);
        }
        return;
      }

      if (!focusId) {
        isHubLink ? hubLinks.push(d) : normalLinks.push(d);
      } else if (d.source.id === focusId || d.target.id === focusId) {
        highlightedLinks.push(d); // always fully visible when focused endpoint
      } else if (isHubLink && !hubFocused) {
        hubFadedLinks.push(d);    // hub link, not focused: extra faint
      } else {
        fadedLinks.push(d);
      }
    });

    // Hub links (unfocused): ultra-faint
    if (hubLinks.length > 0) {
      context.beginPath();
      hubLinks.forEach(d => {
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
      });
      context.strokeStyle = "rgba(0, 0, 0, 0.025)";
      context.lineWidth = 0.6;
      context.stroke();
    }

    if (hubFadedLinks.length > 0) {
      context.beginPath();
      hubFadedLinks.forEach(d => {
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
      });
      context.strokeStyle = "rgba(0, 0, 0, 0.01)";
      context.lineWidth = 0.5;
      context.stroke();
    }

    if (normalLinks.length > 0) {
      context.beginPath();
      normalLinks.forEach(d => {
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
      });
      context.strokeStyle = "rgba(0, 0, 0, 0.08)";
      context.lineWidth = 0.8;
      context.stroke();
    }

    if (fadedLinks.length > 0) {
      context.beginPath();
      fadedLinks.forEach(d => {
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
      });
      context.strokeStyle = "rgba(0, 0, 0, 0.02)";
      context.lineWidth = 0.55;
      context.stroke();
    }

    if (highlightedLinks.length > 0) {
      context.beginPath();
      highlightedLinks.forEach(d => {
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
      });
      context.strokeStyle = "rgba(0,0,0,0.4)";
      context.lineWidth = 1.25;
      context.stroke();
    }

    if (ghostNormalLinks.length > 0) {
      context.beginPath();
      ghostNormalLinks.forEach(d => {
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
      });
      context.setLineDash([4, 4]);
      context.strokeStyle = "rgba(107, 114, 128, 0.28)";
      context.lineWidth = 0.9;
      context.stroke();
      context.setLineDash([]);
    }

    if (ghostFadedLinks.length > 0) {
      context.beginPath();
      ghostFadedLinks.forEach(d => {
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
      });
      context.setLineDash([4, 4]);
      context.strokeStyle = "rgba(107, 114, 128, 0.12)";
      context.lineWidth = 0.75;
      context.stroke();
      context.setLineDash([]);
    }

    if (ghostHighlightedLinks.length > 0) {
      context.beginPath();
      ghostHighlightedLinks.forEach(d => {
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
      });
      context.setLineDash([5, 4]);
      context.strokeStyle = "rgba(120, 53, 15, 0.45)";
      context.lineWidth = 1.15;
      context.stroke();
      context.setLineDash([]);
    }

    const normalNodes = [];
    const fadedNodes = [];
    const highlightedNodes = [];
    const ghostNodes = [];
    const ghostFadedNodes = [];
    const ghostHighlightedNodes = [];

    nodes.forEach(d => {
      const isActive = d.id === focusId;
      const isNeighbor = neighbors.has(d.id);

      if (d.ghost && !focusId) {
        ghostNodes.push(d);
      } else if (d.ghost && (isActive || isNeighbor)) {
        ghostHighlightedNodes.push(d);
      } else if (d.ghost) {
        ghostFadedNodes.push(d);
      } else if (!focusId) {
        normalNodes.push(d);
      } else if (isActive || isNeighbor) {
        highlightedNodes.push(d);
      } else {
        fadedNodes.push(d);
      }
    });

    if (normalNodes.length > 0) {
      context.beginPath();
      normalNodes.forEach(d => {
        context.moveTo(d.x + d.radius, d.y);
        context.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
      });
      context.fillStyle = "rgba(51, 51, 51, 0.95)";
      context.fill();
    }

    if (fadedNodes.length > 0) {
      context.beginPath();
      fadedNodes.forEach(d => {
        context.moveTo(d.x + d.radius, d.y);
        context.arc(d.x, d.y, d.radius, 0, 2 * Math.PI);
      });
      context.fillStyle = "rgba(51, 51, 51, 0.18)";
      context.fill();
    }

    if (highlightedNodes.length > 0) {
      highlightedNodes.forEach(d => {
        context.beginPath();
        const r = (d.id === focusId) ? d.radius + 2 : d.radius;
        context.arc(d.x, d.y, r, 0, 2 * Math.PI);
        context.fillStyle = "rgba(51, 51, 51, 1)";
        context.fill();
        if (d.id === focusId) {
          context.lineWidth = 1.5;
          context.strokeStyle = "#000000";
          context.stroke();
        }
      });
    }

    if (ghostNodes.length > 0) {
      ghostNodes.forEach(d => {
        context.beginPath();
        context.arc(d.x, d.y, d.radius + 0.5, 0, 2 * Math.PI);
        context.fillStyle = "rgba(255, 251, 235, 0.95)";
        context.fill();
        context.setLineDash([3, 3]);
        context.lineWidth = 1;
        context.strokeStyle = "rgba(146, 64, 14, 0.5)";
        context.stroke();
        context.setLineDash([]);
      });
    }

    if (ghostFadedNodes.length > 0) {
      ghostFadedNodes.forEach(d => {
        context.beginPath();
        context.arc(d.x, d.y, d.radius + 0.5, 0, 2 * Math.PI);
        context.fillStyle = "rgba(255, 251, 235, 0.45)";
        context.fill();
        context.setLineDash([3, 3]);
        context.lineWidth = 1;
        context.strokeStyle = "rgba(146, 64, 14, 0.18)";
        context.stroke();
        context.setLineDash([]);
      });
    }

    if (ghostHighlightedNodes.length > 0) {
      ghostHighlightedNodes.forEach(d => {
        context.beginPath();
        context.arc(d.x, d.y, d.radius + 1, 0, 2 * Math.PI);
        context.fillStyle = "rgba(255, 251, 235, 1)";
        context.fill();
        context.setLineDash([3, 3]);
        context.lineWidth = 1.25;
        context.strokeStyle = "rgba(146, 64, 14, 0.68)";
        context.stroke();
        context.setLineDash([]);
      });
    }

    context.restore();
  }

  redrawGraph = drawCanvas;
  redrawGraph();
}

function handleResize() {
  if (canvas) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(dpr, dpr);

    if (simulation) {
      simulation.force("center", d3.forceCenter(width / 2, height / 2));
      simulation.force("x", d3.forceX(width / 2).strength(0.8));
      simulation.force("y", d3.forceY(height / 2).strength(0.8));
      simulation.alpha(0.3).restart();
    }
  }

  if (localGraphSimulation && localGraphSvg && localGraphZoom) {
    const view = document.getElementById("local-graph-view");
    if (view) {
      const width = view.clientWidth || 300;
      const height = view.clientHeight || 280;

      localGraphSvg.attr("viewBox", `0 0 ${width} ${height}`);

      // Reset zoom transform to ensure visual centering
      localGraphSvg.call(localGraphZoom.transform, d3.zoomIdentity);

      localGraphSimulation.force("center", d3.forceCenter(width / 2, height / 2));

      const nodes = localGraphSimulation.nodes();
      const activeNode = nodes.find(d => d.id === state.activeNoteId);
      if (activeNode) {
        activeNode.fx = width / 2;
        activeNode.fy = height / 2;
      }

      localGraphSimulation.alpha(0.3).restart();
    }
  }
}

let lastSyncedNoteId = undefined;

function syncHashToNote() {
  const hash = window.location.hash.replace(/^#/, "");
  const noteId = hash.startsWith("note=") ? decodeURIComponent(hash.slice("note=".length)) : null;
  
  if (noteId === lastSyncedNoteId) return;
  lastSyncedNoteId = noteId;
  
  if (state.historyIndex > 0 && state.history[state.historyIndex - 1] === noteId) {
    state.historyIndex--;
  } else if (state.historyIndex < state.history.length - 1 && state.history[state.historyIndex + 1] === noteId) {
    state.historyIndex++;
  } else if (state.history[state.historyIndex] !== noteId) {
    if (state.historyIndex < state.history.length - 1) {
      state.history = state.history.slice(0, state.historyIndex + 1);
    }
    state.history.push(noteId);
    state.historyIndex++;
  }
  updateNavButtons();
  
  if (noteId === null) {
    closeNote(false);
  } else {
    openNote(noteId, false);
  }
}

async function init() {
  setStatus("Loading graph...");
  const response = await fetch("./graph-data.json");
  if (!response.ok) {
    setStatus(`Failed to load graph: HTTP ${response.status}`);
    return;
  }
  state.data = await response.json();
  state.resolveAssetTarget = buildAssetResolver();
  state.resolveNoteTarget = buildInternalLinkResolver();
  state.nodeById = new Map(state.data.nodes.map((node) => {
    node.radius = 3 + Math.sqrt(Math.max(node.degree, 1)) * 1.3;
    return [node.id, node];
  }));
  renderGraph();
  setStatus(`${state.data.nodes.length} notes`);
  syncHashToNote();
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

const searchBackdrop = document.getElementById("search-backdrop");
const searchContainer = document.getElementById("search-container");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");
const searchTrigger = document.getElementById("search-trigger");
const searchDeeperToggle = document.getElementById("search-deeper-toggle");
const searchLoadingIndicator = document.getElementById("search-loading-indicator");

let searchSelectedIndex = -1;
let searchActive = false;

const noteContentCache = new Map();
let noteContentsLoading = false;
let noteContentsLoaded = false;

async function loadAllNoteContents() {
  if (noteContentsLoaded || noteContentsLoading || !state.data) return;
  noteContentsLoading = true;
  searchLoadingIndicator.classList.remove("hidden");

  const nonGhostNodes = state.data.nodes.filter(node => !node.ghost && node.path);

  // Load in parallel batches to be fast but respect resources
  const batchSize = 15;
  for (let i = 0; i < nonGhostNodes.length; i += batchSize) {
    const batch = nonGhostNodes.slice(i, i + batchSize);
    await Promise.all(batch.map(async (node) => {
      try {
        const response = await fetch(`content/${encodeURI(node.path)}`);
        if (response.ok) {
          const text = await response.text();
          noteContentCache.set(node.id, text);
        }
      } catch (e) {
        console.error(`Failed to load content for ${node.id}:`, e);
      }
    }));
  }

  noteContentsLoading = false;
  noteContentsLoaded = true;
  searchLoadingIndicator.classList.add("hidden");

  // Re-run search if query exists
  const query = searchInput.value.trim();
  if (query) {
    const results = searchNodes(query);
    renderSearchResults(results, query);
  }
}

function openSearch() {
  if (searchActive) return;
  searchActive = true;
  searchSelectedIndex = -1;
  searchInput.value = "";
  searchResults.innerHTML = "";
  searchBackdrop.classList.remove("hidden");
  searchContainer.classList.remove("hidden");
  searchBackdrop.setAttribute("aria-hidden", "false");
  searchContainer.setAttribute("aria-hidden", "false");
  searchInput.focus();

  // Prefetch if deeper search checked
  if (searchDeeperToggle && searchDeeperToggle.checked) {
    loadAllNoteContents();
  }
}

function closeSearch() {
  if (!searchActive) return;
  searchActive = false;
  searchBackdrop.classList.add("hidden");
  searchContainer.classList.add("hidden");
  searchBackdrop.setAttribute("aria-hidden", "true");
  searchContainer.setAttribute("aria-hidden", "true");
  searchInput.value = "";
  searchResults.innerHTML = "";
  searchSelectedIndex = -1;
}

function cleanMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/^---\r?\n[\s\S]*?\r?\n---/, "")
    .replace(/!\[\[.*?\]\]/g, "")
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*#+\s+/gm, "")
    .replace(/^\s*>\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getSnippet(cleanedText, index, query) {
  if (index < 0 || index >= cleanedText.length) return "";

  const start = Math.max(0, index - 35);
  const end = Math.min(cleanedText.length, index + query.length + 35);

  let snippet = cleanedText.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < cleanedText.length) snippet = snippet + "...";

  return snippet;
}

function searchNodes(query) {
  const q = query.toLowerCase().trim();
  if (!q || !state.data) return [];

  const isDeeper = searchDeeperToggle && searchDeeperToggle.checked;

  return state.data.nodes
    .filter((node) => !node.ghost)
    .map((node) => {
      const titleIdx = node.title.toLowerCase().indexOf(q);
      const idIdx = node.id.toLowerCase().indexOf(q);

      let score = 0;
      let matchSnippet = "";

      if (titleIdx === 0) {
        score = 10;
      } else if (titleIdx > 0) {
        score = 8;
      } else if (idIdx >= 0) {
        score = 5;
      }

      if (isDeeper) {
        const bodyText = noteContentCache.get(node.id);
        if (bodyText) {
          const cleaned = cleanMarkdown(bodyText);
          const bodyIdx = cleaned.toLowerCase().indexOf(q);
          if (bodyIdx >= 0) {
            if (score === 0) {
              score = 3;
            } else {
              score += 2; // match both
            }
            matchSnippet = getSnippet(cleaned, bodyIdx, query);
          }
        }
      }

      return { node, score, matchSnippet };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.node.degree - a.node.degree)
    .slice(0, 8)
    .map((r) => {
      return {
        ...r.node,
        _searchSnippet: r.matchSnippet
      };
    });
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return escapeHtml(text);
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return `${escapeHtml(before)}<mark>${escapeHtml(match)}</mark>${escapeHtml(after)}`;
}

function highlightSnippet(snippet, query) {
  const idx = snippet.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return escapeHtml(snippet);
  const before = snippet.slice(0, idx);
  const match = snippet.slice(idx, idx + query.length);
  const after = snippet.slice(idx + query.length);
  return `${escapeHtml(before)}<mark>${escapeHtml(match)}</mark>${escapeHtml(after)}`;
}

function renderSearchResults(nodes, query) {
  searchResults.innerHTML = "";
  searchSelectedIndex = -1;
  nodes.forEach((node, i) => {
    const li = document.createElement("li");
    li.className = "search-result-item";
    li.setAttribute("role", "option");

    let snippetHtml = "";
    if (node._searchSnippet) {
      snippetHtml = `<span class="search-result-snippet">${highlightSnippet(node._searchSnippet, query)}</span>`;
    }

    li.innerHTML = `
      <span class="search-result-title">${highlightMatch(node.title, query)}</span>
      ${snippetHtml}
      <span class="search-result-path">${node.folder}/${node.id.split("/").pop()}</span>
    `;
    li.addEventListener("click", () => {
      closeSearch();
      openNote(node.id);
    });
    li.addEventListener("mouseenter", () => {
      updateSearchSelection(i);
    });
    searchResults.appendChild(li);
  });
}

function updateSearchSelection(index) {
  const items = searchResults.querySelectorAll(".search-result-item");
  items.forEach((el) => el.classList.remove("selected"));
  searchSelectedIndex = index;
  if (index >= 0 && index < items.length) {
    items[index].classList.add("selected");
    items[index].scrollIntoView({ block: "nearest" });
  }
}

if (searchDeeperToggle) {
  searchDeeperToggle.addEventListener("change", () => {
    if (searchDeeperToggle.checked) {
      loadAllNoteContents();
    }
    const query = searchInput.value.trim();
    if (query) {
      const results = searchNodes(query);
      renderSearchResults(results, query);
    }
  });
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (!query) {
    searchResults.innerHTML = "";
    searchSelectedIndex = -1;
    return;
  }
  const results = searchNodes(query);
  renderSearchResults(results, query);
});

searchInput.addEventListener("keydown", (event) => {
  const items = searchResults.querySelectorAll(".search-result-item");
  const count = items.length;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    updateSearchSelection(searchSelectedIndex < count - 1 ? searchSelectedIndex + 1 : 0);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    updateSearchSelection(searchSelectedIndex > 0 ? searchSelectedIndex - 1 : count - 1);
  } else if (event.key === "Enter") {
    event.preventDefault();
    if (searchSelectedIndex >= 0 && searchSelectedIndex < count) {
      items[searchSelectedIndex].click();
    }
  } else if (event.key === "Escape") {
    event.preventDefault();
    closeSearch();
  }
});

searchBackdrop.addEventListener("click", closeSearch);
searchTrigger.addEventListener("click", openSearch);

closeNoteButton.addEventListener("click", () => closeNote());
noteBackdrop.addEventListener("click", () => closeNote());
window.addEventListener("hashchange", syncHashToNote);
window.addEventListener("popstate", syncHashToNote);
window.addEventListener("resize", handleResize);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (searchActive) {
      closeSearch();
    } else if (state.activeNoteId) {
      closeNote();
    }
    return;
  }
  if (event.key === "/" && !searchActive && !state.activeNoteId) {
    const activeEl = document.activeElement;
    const tag = activeEl ? activeEl.tagName : null;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    event.preventDefault();
    openSearch();
  }
});

init();
