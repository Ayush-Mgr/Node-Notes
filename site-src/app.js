const state = {
  data: null,
  nodeById: new Map(),
  activeNoteId: null,
  resolveAssetTarget: () => null,
  resolveNoteTarget: () => null,
};

const graphView = document.getElementById("graph-view");
const appStatus = document.getElementById("app-status");
const noteBackdrop = document.getElementById("note-backdrop");
const notePanel = document.getElementById("note-panel");
const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");
const closeNoteButton = document.getElementById("close-note");
const tooltip = document.getElementById("tooltip");

let currentNeighborMap = new Map();
let currentZoomTransform = d3.zoomIdentity;
let canvas, context, simulation;
let hoveredNode = null;
let redrawGraph = () => {};

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

const mathExtension = {
  name: 'math',
  level: 'inline',
  start: (src) => src.match(/\$/)?.index ?? -1,
  tokenizer(src) {
    const block = /^\$\$([\s\S]*?)\$\$/.exec(src);
    if (block) return { type: 'math', raw: block[0], text: block[1], displayMode: true };
    const inline = /^\$([^$\n]+?)\$/.exec(src);
    if (inline) return { type: 'math', raw: inline[0], text: inline[1], displayMode: false };
  },
  renderer(token) {
    return token.displayMode ? `\\[${escapeHtml(token.text)}\\]` : `\\(${escapeHtml(token.text)}\\)`;
  }
};
if (typeof marked !== 'undefined') marked.use({ extensions: [mathExtension] });


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
    if (!resolved) return label;
    return `<a href="#note=${encodeURIComponent(resolved)}" class="internal-note-link" data-note-id="${resolved}">${label}</a>`;
  });
}

function preprocessObsidianMarkdown(markdown) {
  return rewriteHtmlImageSources(
    rewriteMarkdownImageSources(
      rewriteWikilinks(
        stripFrontmatter(markdown),
      ),
    ),
  );
}

async function openNote(noteId, pushHash = true) {
  const node = state.nodeById.get(noteId);
  if (!node) return;

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
    MathJax.typesetPromise([noteContent]).catch(() => {});
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
  redrawGraph();
  setStatus(`${state.data?.nodes.length ?? 0} notes`);
  if (clearHash) {
    history.replaceState(null, "", window.location.pathname);
  }
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
    
    links.forEach(d => {
       if (!focusId) {
           normalLinks.push(d);
       } else if (d.source.id === focusId || d.target.id === focusId) {
           highlightedLinks.push(d);
       } else {
           fadedLinks.push(d);
       }
    });
    
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

    const normalNodes = [];
    const fadedNodes = [];
    const highlightedNodes = [];
    
    nodes.forEach(d => {
        const isActive = d.id === focusId;
        const isNeighbor = neighbors.has(d.id);
        
        if (!focusId) {
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
}

function syncHashToNote() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash.startsWith("note=")) {
    closeNote(false);
    return;
  }
  const noteId = decodeURIComponent(hash.slice("note=".length));
  openNote(noteId, false);
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

let searchSelectedIndex = -1;
let searchActive = false;

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

function searchNodes(query) {
  const q = query.toLowerCase().trim();
  if (!q || !state.data) return [];
  return state.data.nodes
    .map((node) => {
      const titleIdx = node.title.toLowerCase().indexOf(q);
      const idIdx = node.id.toLowerCase().indexOf(q);
      const score = titleIdx === 0 ? 3 : titleIdx > 0 ? 2 : idIdx >= 0 ? 1 : 0;
      return { node, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.node.degree - a.node.degree)
    .slice(0, 8)
    .map((r) => r.node);
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return escapeHtml(text);
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return `${escapeHtml(before)}<mark>${escapeHtml(match)}</mark>${escapeHtml(after)}`;
}

function renderSearchResults(nodes, query) {
  searchResults.innerHTML = "";
  searchSelectedIndex = -1;
  nodes.forEach((node, i) => {
    const li = document.createElement("li");
    li.className = "search-result-item";
    li.setAttribute("role", "option");
    li.innerHTML = `
      <span class="search-result-title">${highlightMatch(node.title, query)}</span>
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
