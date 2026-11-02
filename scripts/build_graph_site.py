#!/usr/bin/env python3
"""
Build script for Node-Notes graph site.
Reads notes from vault/, builds graph-data.json, assembles the SPA into docs/,
and generates static SEO-optimized HTML pages, sitemap.xml, etc.
"""
from __future__ import annotations
import json
import re
import shutil
import urllib.parse
import xml.sax.saxutils as saxutils
from collections import Counter, defaultdict
from pathlib import Path
import markdown

REPO_ROOT  = Path(__file__).resolve().parent.parent
VAULT_DIR  = REPO_ROOT / "vault"
DOCS_DIR   = REPO_ROOT / "docs"
SITE_SRC_DIR  = REPO_ROOT / "site-src"
EXCLUDE_FILE  = REPO_ROOT / "publish.exclude"
IGNORED_NOTE_IDS = {"index"}

WIKILINK_RE = re.compile(r"(!)?\[\[([^\]]+)\]\]")
HEADING_RE  = re.compile(r"^\s*#\s+(.+?)\s*$", re.MULTILINE)
FRONTMATTER_RE = re.compile(r"^---\r?\n(.*?)\r?\n---\r?\n?", re.DOTALL | re.MULTILINE)
FRONTMATTER_TITLE_RE = re.compile(r'^title\s*:\s*(?:"((?:\\"|[^"])*)"|\'([^\']*)\'|(.+))\s*$', re.MULTILINE)

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Node Notes</title>
    <meta name="description" content="{description}">
    <link rel="canonical" href="{canonical_url}">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    <style>
        body {{ font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; color: #333; background: #fafafa; }}
        @media (prefers-color-scheme: dark) {{
            body {{ color: #c9d1d9; background: #0d1117; }}
            a {{ color: #58a6ff; }}
            .breadcrumb {{ border-bottom-color: #30363d; color: #8b949e; }}
            .view-graph-btn {{ background: #238636; color: #fff; }}
            pre {{ background: #161b22; }}
            code {{ background: rgba(110,118,129,0.4); }}
            blockquote {{ border-left-color: #30363d; color: #8b949e; }}
        }}
        a {{ color: #0366d6; text-decoration: none; }}
        a:hover {{ text-decoration: underline; }}
        .breadcrumb {{ font-size: 0.9rem; color: #666; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #eaeaea; }}
        .breadcrumb a {{ margin: 0 0.2rem; }}
        .view-graph-btn {{ display: inline-block; background: #24292e; color: #fff; padding: 0.5rem 1rem; border-radius: 6px; margin-bottom: 2rem; font-weight: 600; }}
        .view-graph-btn:hover {{ background: #000; text-decoration: none; }}
        pre {{ background: #f6f8fa; padding: 1rem; border-radius: 6px; overflow-x: auto; }}
        code {{ font-family: monospace; padding: 0.2em 0.4em; border-radius: 6px; }}
        blockquote {{ border-left: 4px solid #dfe2e5; padding-left: 1rem; margin-left: 0; }}
        img {{ max-width: 100%; border-radius: 6px; }}
        .toc {{ background: rgba(0,0,0,0.05); padding: 1rem; border-radius: 6px; margin-bottom: 2rem; }}
        .toc ul {{ list-style: none; padding-left: 1rem; }}
        @media (prefers-color-scheme: dark) {{ .toc {{ background: rgba(255,255,255,0.05); }} }}
    </style>
    <script type="application/ld+json">
{json_ld}
    </script>
</head>
<body>
    <nav class="breadcrumb">
        {breadcrumbs}
    </nav>
    
    <a href="{spa_url}" class="view-graph-btn">← View in Interactive Graph</a>
    
    <main class="note-content">
        {content}
    </main>
</body>
</html>
"""

def load_exclude_patterns() -> set[str]:
    if not EXCLUDE_FILE.exists(): return set()
    patterns = set()
    for line in EXCLUDE_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            patterns.add(line.rstrip("/"))
    return patterns

def _is_excluded(rel: Path, exclude_patterns: set[str]) -> bool:
    return any(part in exclude_patterns for part in rel.parts)

def normalize_target(value: str) -> str:
    return value.strip().replace("\\", "/").removesuffix(".md").lower()

def extract_title(markdown: str, fallback: str) -> str:
    frontmatter = FRONTMATTER_RE.match(markdown)
    if frontmatter:
        title_match = FRONTMATTER_TITLE_RE.search(frontmatter.group(1))
        if title_match:
            q, sq, b = title_match.groups()
            raw_title = q if q is not None else sq if sq is not None else b
            if raw_title: return raw_title.replace('\\"', '"').strip()
    match = HEADING_RE.search(markdown)
    if match: return match.group(1).strip()
    return fallback

def strip_frontmatter(md: str) -> str:
    return FRONTMATTER_RE.sub("", md, count=1).strip()

def asset_files(exclude_patterns: set[str]):
    for path in sorted(VAULT_DIR.rglob("*")):
        if not path.is_file() or path.suffix.lower() == ".md": continue
        if _is_excluded(path.relative_to(VAULT_DIR), exclude_patterns): continue
        yield path.relative_to(VAULT_DIR).as_posix()

def note_files(exclude_patterns: set[str]):
    for path in sorted(VAULT_DIR.rglob("*.md")):
        rel = path.relative_to(VAULT_DIR)
        if _is_excluded(rel, exclude_patterns): continue
        note_id = rel.with_suffix("").as_posix()
        if note_id in IGNORED_NOTE_IDS: continue
        yield path, note_id

def resolve_note_target(target: str, notes: dict, basename_map: dict) -> str | None:
    normalized = normalize_target(target)
    if normalized in notes: return normalized
    if normalized in basename_map and len(basename_map[normalized]) == 1:
        return basename_map[normalized][0]
    leaf = normalize_target(Path(normalized).name)
    if leaf in basename_map and len(basename_map[leaf]) == 1:
        return basename_map[leaf][0]
    return None

def build_graph_data(exclude_patterns: set[str]) -> dict:
    notes: dict[str, dict] = {}
    basename_map: dict[str, list[str]] = defaultdict(list)

    for path, note_id in note_files(exclude_patterns):
        markdown_text = path.read_text(encoding="utf-8", errors="replace")
        notes[note_id] = {
            "id":       note_id,
            "path":     path.relative_to(VAULT_DIR).as_posix(),
            "title":    extract_title(markdown_text, path.stem),
            "folder":   note_id.split("/", 1)[0] if "/" in note_id else "root",
            "markdown": markdown_text,
        }
        basename_map[normalize_target(path.stem)].append(note_id)
        basename_map[normalize_target(note_id)].append(note_id)

    links: list[dict[str, str]] = []
    outgoing = Counter()
    incoming = Counter()
    seen_links = set()
    ghost_nodes = {}

    for note in notes.values():
        for embed_flag, raw_target in WIKILINK_RE.findall(note["markdown"]):
            if embed_flag: continue
            target = raw_target.split("|", 1)[0].split("#", 1)[0].strip()
            if not target: continue
            resolved = resolve_note_target(target, notes, basename_map)
            if resolved == note["id"]: continue
            ghost = resolved is None
            target_id = resolved
            if ghost:
                ghost_key = normalize_target(target)
                target_id = f"ghost:{ghost_key}"
                if target_id not in ghost_nodes:
                    ghost_nodes[target_id] = {
                        "id": target_id, "title": Path(target.split("/")[-1]).stem or target,
                        "path": None, "folder": "Missing", "degree": 0, "ghost": True,
                        "missingTarget": target.strip(),
                    }
            key = (note["id"], target_id)
            if key in seen_links: continue
            seen_links.add(key)
            links.append({"source": note["id"], "target": target_id, "ghost": ghost})
            outgoing[note["id"]] += 1
            incoming[target_id] += 1

    nodes = [{
        "id": n_id, "title": n["title"], "path": n["path"], "folder": n["folder"],
        "degree": outgoing[n_id] + incoming[n_id], "ghost": False,
    } for n_id, n in notes.items()]
    
    nodes.extend([{**n, "degree": outgoing[n_id] + incoming[n_id]} for n_id, n in ghost_nodes.items()])

    return {
        "nodes": nodes,
        "links": links,
        "assets": list(asset_files(exclude_patterns)),
        "_raw_notes": notes # Pass through raw notes for static generation
    }

def generate_static_pages(graph_data: dict) -> list[str]:
    """Generates static HTML pages for each note and returns a list of URLs for the sitemap."""
    md = markdown.Markdown(extensions=['meta', 'fenced_code', 'tables', 'toc', 'pymdownx.tasklist', 'pymdownx.arithmatex'])
    sitemap_urls = []
    
    raw_notes = graph_data.pop("_raw_notes", {})
    
    for note_id, note in raw_notes.items():
        # Prepare URL
        url_path = f"notes/{urllib.parse.quote(note_id)}/"
        full_url = f"https://ayush-mgr.github.io/Node-Notes/{url_path}"
        spa_url = f"https://ayush-mgr.github.io/Node-Notes/#note={urllib.parse.quote(note_id)}"
        
        # Breadcrumbs
        parts = note_id.split("/")
        breadcrumbs = '<a href="https://ayush-mgr.github.io/">Home</a> / <a href="https://ayush-mgr.github.io/Node-Notes/">Node Notes</a>'
        for i, part in enumerate(parts):
            if i == len(parts) - 1:
                breadcrumbs += f' / <span>{part}</span>'
            else:
                breadcrumbs += f' / <span>{part}</span>'
                
        # Process Markdown: replace obsidian links with standard links pointing to static pages
        def replace_wikilink(match):
            embed = match.group(1)
            inner = match.group(2)
            if embed: return match.group(0) # Keep images as is for now, or handle them
            
            target, *alias = inner.split('|')
            display = alias[0] if alias else target
            clean_target = urllib.parse.quote(target.strip().removesuffix(".md"))
            return f'<a href="https://ayush-mgr.github.io/Node-Notes/#note={clean_target}">{display}</a>'
            
        content_md = WIKILINK_RE.sub(replace_wikilink, strip_frontmatter(note["markdown"]))
        
        # Ensure H1 title exists in HTML
        if not content_md.startswith("# "):
            content_md = f"# {note['title']}\n\n" + content_md
            
        html_content = md.convert(content_md)
        
        # Description
        desc_text = re.sub(r'<[^>]+>', '', html_content)[:160].replace('"', '&quot;').replace('\n', ' ')
        
        # JSON-LD
        json_ld = {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "headline": note['title'],
            "author": {
                "@type": "Person",
                "name": "Ayush"
            },
            "url": full_url
        }
        
        # Render Template
        page_html = HTML_TEMPLATE.format(
            title=saxutils.escape(note['title']),
            description=desc_text,
            canonical_url=full_url,
            json_ld=json.dumps(json_ld, indent=2),
            breadcrumbs=breadcrumbs,
            spa_url=spa_url,
            content=html_content
        )
        
        # Save File
        out_path = DOCS_DIR / "notes" / note_id / "index.html"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(page_html, encoding="utf-8")
        
        sitemap_urls.append(full_url)
        md.reset()
        
    return sitemap_urls

def generate_sitemap(sitemap_urls: list[str]):
    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for loc in sitemap_urls:
        xml.append('  <url>')
        xml.append(f'    <loc>{saxutils.escape(loc)}</loc>')
        xml.append('    <changefreq>weekly</changefreq>')
        xml.append('  </url>')
    xml.append('</urlset>')
    (DOCS_DIR / "sitemap.xml").write_text("\n".join(xml), encoding="utf-8")

def copy_site_scaffold() -> None:
    if DOCS_DIR.exists():
        for item in DOCS_DIR.iterdir():
            if item.name == ".git": continue
            if item.is_dir(): shutil.rmtree(item)
            else: item.unlink()
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    for item in SITE_SRC_DIR.iterdir():
        target = DOCS_DIR / item.name
        if item.is_dir(): shutil.copytree(item, target, dirs_exist_ok=True)
        else: shutil.copy2(item, target)
    img_dir = REPO_ROOT / "img"
    if img_dir.exists() and img_dir.is_dir():
        target = DOCS_DIR / "img"
        if target.exists(): shutil.rmtree(target)
        shutil.copytree(img_dir, target)

def copy_vault_for_browser(exclude_patterns: set[str]) -> None:
    target = DOCS_DIR / "content"
    if target.exists(): shutil.rmtree(target)
    def ignore_excluded(_dir: str, contents: list[str]) -> set[str]:
        return {item for item in contents if item in exclude_patterns}
    shutil.copytree(VAULT_DIR, target, ignore=ignore_excluded)

def write_graph_data(graph_data: dict) -> None:
    (DOCS_DIR / "graph-data.json").write_text(json.dumps(graph_data, ensure_ascii=False), encoding="utf-8")

def main() -> None:
    exclude_patterns = load_exclude_patterns()
    graph_data = build_graph_data(exclude_patterns)
    copy_site_scaffold()
    copy_vault_for_browser(exclude_patterns)
    
    # New Architecture Additions
    static_urls = generate_static_pages(graph_data)
    generate_sitemap(static_urls)
    
    write_graph_data(graph_data)
    print(f"Built: {len(graph_data['nodes'])} notes, {len(graph_data['links'])} links → docs/")
    print(f"Generated {len(static_urls)} Static HTML pages and docs/sitemap.xml.")

if __name__ == "__main__":
    main()
