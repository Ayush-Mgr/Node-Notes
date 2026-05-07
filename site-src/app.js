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
let canvas = null;
let context = null;
let simulation = null;
let hoveredNode = null;
let redrawGraph = () => {};

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
  const markdown = await response.text();
  const processed = preprocessObsidianMarkdown(markdown);

  noteTitle.textContent = node.title;
  noteContent.innerHTML = DOMPurify.sanitize(marked.parse(processed, { breaks: true, gfm: true }));
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

  // Handle High DPI displays
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
    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(currentZoomTransform.x, currentZoomTransform.y);
    context.scale(currentZoomTransform.k, currentZoomTransform.k);

    const activeId = state.activeNoteId;
    const hoverId = hoveredNode?.id;
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
    
    context.setTransform(1, 0, 0, 1, 0, 0); // reset transform before scaling
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

closeNoteButton.addEventListener("click", () => closeNote());
noteBackdrop.addEventListener("click", () => closeNote());
window.addEventListener("hashchange", syncHashToNote);
window.addEventListener("resize", handleResize);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.activeNoteId) {
    closeNote();
  }
});

init();
