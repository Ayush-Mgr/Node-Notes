const state = {
  data: null,
  nodeById: new Map(),
  activeNoteId: null,
};

const graphView = document.getElementById("graph-view");
const appStatus = document.getElementById("app-status");
const noteBackdrop = document.getElementById("note-backdrop");
const notePanel = document.getElementById("note-panel");
const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");
const closeNoteButton = document.getElementById("close-note");
const tooltip = document.getElementById("tooltip");

let currentNodeSelection = null;
let currentLinkSelection = null;
let currentNeighborMap = new Map();
let currentZoomTransform = d3.zoomIdentity;
let svg = null;
let simulation = null;

const NODE_FILL = "#333";

function stripFrontmatter(markdown) {
  return markdown.replace(/^---\n[\s\S]*?\n---\n?/, "");
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

function preprocessObsidianMarkdown(markdown) {
  const resolveTarget = buildInternalLinkResolver();
  return stripFrontmatter(markdown).replace(/(!)?\[\[([^\]]+)\]\]/g, (_, bang, inner) => {
    const [targetPart, aliasPart] = inner.split("|");
    const target = (targetPart || "").split("#")[0].trim();
    const label = (aliasPart || target || "Untitled").trim();
    if (!target) return "";

    const lower = target.toLowerCase();
    const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(lower);

    if (bang || isImage) {
      const src = `content/${encodeURI(target)}`;
      return `![${label}](${src})`;
    }

    const resolved = resolveTarget(target);
    if (!resolved) return label;
    return `<a href="#note=${encodeURIComponent(resolved)}" class="internal-note-link" data-note-id="${resolved}">${label}</a>`;
  });
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
  highlightSelection(noteId);
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
  highlightSelection(null);
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

function updateGlow(gSelection, d, stateName) {
  const aura = gSelection.select(".node-aura");
  const shadow = gSelection.select(".node-shadow");
  
  if (d.degree < 1) {
    aura.attr("r", 0);
    shadow.attr("r", 0);
    return;
  }

  const scale = 1 + Math.min(Math.log10(d.degree), 1.2) * 0.6;
  let auraSpread = 0;
  let shadowSpread = 0;
  let auraOpacity = 0;
  let shadowOpacity = 0;

  if (stateName === "hover") {
    auraSpread = 12 * scale; 
    shadowSpread = 6 * scale;
    auraOpacity = 0.4;
    shadowOpacity = 0.5;
  } else if (stateName === "active") {
    auraSpread = 9 * scale;
    shadowSpread = 4 * scale;
    auraOpacity = 0.3;
    shadowOpacity = 0.4;
  } else {
    // base
    auraSpread = 6 * scale;
    shadowSpread = 3 * scale;
    auraOpacity = 0.15;
    shadowOpacity = 0.3;
  }

  aura.attr("r", d.radius + auraSpread)
      .attr("fill", `rgba(30, 30, 30, ${auraOpacity})`)
      .attr("filter", "url(#aura-blur)");

  shadow.attr("r", d.radius + shadowSpread)
        .attr("fill", `rgba(30, 30, 30, ${shadowOpacity})`)
        .attr("filter", "url(#shadow-blur)");
}
function highlightSelection(noteId) {
  if (!currentNodeSelection || !currentLinkSelection) return;

  if (!noteId) {
    currentNodeSelection.each(function(d) {
      const g = d3.select(this);
      updateGlow(g, d, "base");
      g.select(".node-core")
        .attr("fill-opacity", 0.95)
        .attr("stroke", "none")
        .attr("stroke-width", 0)
        .attr("r", d.radius)
        .attr("fill", NODE_FILL);
    });

    currentLinkSelection
      .attr("stroke", "var(--edge)")
      .attr("stroke-opacity", 1)
      .attr("stroke-width", 0.8);
    return;
  }

  const neighbors = currentNeighborMap.get(noteId) || new Set();

  currentNodeSelection.each(function(d) {
    const g = d3.select(this);
    const isActive = d.id === noteId;
    const isNeighbor = neighbors.has(d.id);
    
    updateGlow(g, d, isActive ? "active" : "base");
    
    g.select(".node-core")
      .attr("fill-opacity", isActive || isNeighbor ? 1 : 0.18)
      .attr("stroke", isActive ? "#000000" : "none")
      .attr("stroke-width", isActive ? 1.5 : 0)
      .attr("fill", NODE_FILL)
      .attr("r", isActive ? d.radius + 2 : d.radius);
  });

  currentLinkSelection
    .attr("stroke", (d) =>
      d.source.id === noteId || d.target.id === noteId ? "rgba(0,0,0,0.4)" : "var(--edge)",
    )
    .attr("stroke-opacity", (d) =>
      d.source.id === noteId || d.target.id === noteId ? 1 : 0.08,
    )
    .attr("stroke-width", (d) =>
      d.source.id === noteId || d.target.id === noteId ? 1.25 : 0.55,
    );
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

  svg = d3
    .select(graphView)
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("role", "img")
    .attr("aria-label", "Interactive notes graph");

  const zoomLayer = svg.append("g");

  const defs = svg.append("defs");

  const auraBlur = defs.append("filter").attr("id", "aura-blur").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
  auraBlur.append("feGaussianBlur").attr("stdDeviation", "4");

  const shadowBlur = defs.append("filter").attr("id", "shadow-blur").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
  shadowBlur.append("feGaussianBlur").attr("in", "SourceGraphic").attr("stdDeviation", "3").attr("result", "blur");
  shadowBlur.append("feOffset").attr("in", "blur").attr("dx", "2").attr("dy", "3");

  const link = zoomLayer
    .append("g")
    .attr("stroke", "var(--edge)")
    .attr("stroke-opacity", 1)
    .selectAll("line")
    .data(links)
    .join("line")
    .attr("stroke-width", 0.8);

  const node = zoomLayer
    .append("g")
    .selectAll("g.node")
    .data(nodes)
    .join(enter => {
      const g = enter.append("g")
        .attr("class", "node")
        .attr("cursor", "pointer")
        .on("click", (_, d) => openNote(d.id))
        .on("mouseenter", function (event, d) {
          updateGlow(d3.select(this), d, "hover");
          showTooltip(d.title, event.clientX, event.clientY);
        })
        .on("mousemove", (event, d) => showTooltip(d.title, event.clientX, event.clientY))
        .on("mouseleave", function (event, d) {
          const stateName = (state.activeNoteId === d.id) ? "active" : "base";
          updateGlow(d3.select(this), d, stateName);
          hideTooltip();
        });

      g.append("circle").attr("class", "node-shadow").style("pointer-events", "none");
      g.append("circle").attr("class", "node-aura").style("pointer-events", "none");
      g.append("circle").attr("class", "node-core");
      return g;
    });

  simulation = d3
    .forceSimulation(nodes)
    .force("link", d3.forceLink(links).id((d) => d.id).distance(45).strength(0.5))
    .force("charge", d3.forceManyBody().strength(-150))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(0.8))
    .force("y", d3.forceY(height / 2).strength(0.8))
    .force("collision", d3.forceCollide().radius((d) => d.radius + 2))
    .alpha(1)
    .alphaDecay(0.035)
    .on("tick", ticked);

  const drag = d3
    .drag()
    .on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(0.2).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on("drag", (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });

  node.call(drag);
  currentNodeSelection = node;
  currentLinkSelection = link;

  svg.call(
    d3.zoom().scaleExtent([0.35, 3]).on("zoom", (event) => {
      currentZoomTransform = event.transform;
      zoomLayer.attr("transform", event.transform);
    }),
  );
  
  if (currentZoomTransform !== d3.zoomIdentity) {
    svg.call(d3.zoom().transform, currentZoomTransform);
  }

  highlightSelection(state.activeNoteId);

  function ticked() {
    const padding = 20;

    // Soft viewport containment nudging based on inverse zoom transform
    const minX = (padding - currentZoomTransform.x) / currentZoomTransform.k;
    const minY = (padding - currentZoomTransform.y) / currentZoomTransform.k;
    const maxX = (window.innerWidth - padding - currentZoomTransform.x) / currentZoomTransform.k;
    const maxY = (window.innerHeight - padding - currentZoomTransform.y) / currentZoomTransform.k;

    nodes.forEach(d => {
      if (d.x < minX) d.vx += (minX - d.x) * 0.05;
      if (d.x > maxX) d.vx += (maxX - d.x) * 0.05;
      if (d.y < minY) d.vy += (minY - d.y) * 0.05;
      if (d.y > maxY) d.vy += (maxY - d.y) * 0.05;
    });

    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("transform", (d) => `translate(${d.x},${d.y})`);
  }
}

function handleResize() {
  if (svg) {
    svg.attr("viewBox", [0, 0, window.innerWidth, window.innerHeight]);
  }
  if (simulation) {
    simulation.force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));
    simulation.force("x", d3.forceX(window.innerWidth / 2).strength(0.8));
    simulation.force("y", d3.forceY(window.innerHeight / 2).strength(0.8));
    simulation.alpha(0.3).restart();
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
