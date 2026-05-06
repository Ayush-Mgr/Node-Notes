#!/usr/bin/env python3
"""
Build script for Node-Notes graph site.

Reads notes from vault/ (committed to git — the single source of truth),
builds graph-data.json, and assembles the static site into docs/.

Usage:
    python3 scripts/build_graph_site.py

Private notes are excluded from both the graph and docs/content/ using
the patterns defined in publish.exclude.
"""

from __future__ import annotations

import json
import re
import shutil
from collections import Counter, defaultdict
from pathlib import Path


REPO_ROOT  = Path(__file__).resolve().parent.parent
VAULT_DIR  = REPO_ROOT / "vault"          # notes live here (git-tracked)
DOCS_DIR   = REPO_ROOT / "docs"           # built output (gitignored, deployed by CI)
SITE_SRC_DIR  = REPO_ROOT / "site-src"
EXCLUDE_FILE  = REPO_ROOT / "publish.exclude"
IGNORED_NOTE_IDS = {"index"}

WIKILINK_RE = re.compile(r"(!)?\[\[([^\]]+)\]\]")
HEADING_RE  = re.compile(r"^\s*#\s+(.+?)\s*$", re.MULTILINE)


# ---------------------------------------------------------------------------
# Exclude-pattern helpers
# ---------------------------------------------------------------------------

def load_exclude_patterns() -> set[str]:
    """Parse publish.exclude into a set of bare names (no trailing slash)."""
    if not EXCLUDE_FILE.exists():
        return set()
    patterns: set[str] = set()
    for line in EXCLUDE_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            patterns.add(line.rstrip("/"))
    return patterns


def _is_excluded(rel: Path, exclude_patterns: set[str]) -> bool:
    """Return True if any path component matches an exclude pattern."""
    return any(part in exclude_patterns for part in rel.parts)


# ---------------------------------------------------------------------------
# Note helpers
# ---------------------------------------------------------------------------

def normalize_target(value: str) -> str:
    return value.strip().replace("\\", "/").removesuffix(".md").lower()


def extract_title(markdown: str, fallback: str) -> str:
    match = HEADING_RE.search(markdown)
    if match:
        return match.group(1).strip()
    return fallback


def note_files(exclude_patterns: set[str]):
    """Yield (path, note_id) for every non-excluded .md file in vault/."""
    for path in sorted(VAULT_DIR.rglob("*.md")):
        rel = path.relative_to(VAULT_DIR)
        if _is_excluded(rel, exclude_patterns):
            continue
        note_id = rel.with_suffix("").as_posix()
        if note_id in IGNORED_NOTE_IDS:
            continue
        yield path, note_id


# ---------------------------------------------------------------------------
# Graph data
# ---------------------------------------------------------------------------

def build_graph_data(exclude_patterns: set[str]) -> dict:
    notes: dict[str, dict] = {}
    basename_map: dict[str, list[str]] = defaultdict(list)

    for path, note_id in note_files(exclude_patterns):
        markdown = path.read_text(encoding="utf-8", errors="replace")
        notes[note_id] = {
            "id":       note_id,
            "path":     path.relative_to(VAULT_DIR).as_posix(),
            "title":    extract_title(markdown, path.stem),
            "folder":   note_id.split("/", 1)[0] if "/" in note_id else "root",
            "markdown": markdown,
        }
        basename_map[normalize_target(path.stem)].append(note_id)
        basename_map[normalize_target(note_id)].append(note_id)

    links: list[dict[str, str]] = []
    outgoing_counts: Counter[str] = Counter()
    incoming_counts: Counter[str] = Counter()
    seen_links: set[tuple[str, str]] = set()

    wikilink_re = re.compile(r"(!)?\[\[([^\]]+)\]\]")

    for note in notes.values():
        for embed_flag, raw_target in wikilink_re.findall(note["markdown"]):
            if embed_flag:
                continue

            target = raw_target.split("|", 1)[0].split("#", 1)[0].strip()
            if not target:
                continue

            normalized = normalize_target(target)
            resolved = None

            if normalized in notes:
                resolved = normalized
            elif normalized in basename_map and len(basename_map[normalized]) == 1:
                resolved = basename_map[normalized][0]
            else:
                leaf = normalize_target(Path(normalized).name)
                if leaf in basename_map and len(basename_map[leaf]) == 1:
                    resolved = basename_map[leaf][0]

            if not resolved or resolved == note["id"]:
                continue

            key = (note["id"], resolved)
            if key in seen_links:
                continue

            seen_links.add(key)
            links.append({"source": note["id"], "target": resolved})
            outgoing_counts[note["id"]] += 1
            incoming_counts[resolved] += 1

    nodes = [
        {
            "id":     note_id,
            "title":  note["title"],
            "path":   note["path"],
            "folder": note["folder"],
            "degree": outgoing_counts[note_id] + incoming_counts[note_id],
        }
        for note_id, note in notes.items()
    ]

    return {"nodes": nodes, "links": links}


# ---------------------------------------------------------------------------
# Site assembly
# ---------------------------------------------------------------------------

def copy_site_scaffold() -> None:
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    for item in SITE_SRC_DIR.iterdir():
        target = DOCS_DIR / item.name
        if item.is_dir():
            shutil.copytree(item, target, dirs_exist_ok=True)
        else:
            shutil.copy2(item, target)

    img_dir = REPO_ROOT / "img"
    if img_dir.exists() and img_dir.is_dir():
        target = DOCS_DIR / "img"
        if target.exists():
            shutil.rmtree(target)
        shutil.copytree(img_dir, target)


def copy_vault_for_browser(exclude_patterns: set[str]) -> None:
    """Copy vault/ → docs/content/ skipping excluded paths."""
    target = DOCS_DIR / "content"
    if target.exists():
        shutil.rmtree(target)

    def ignore_excluded(_directory: str, contents: list[str]) -> set[str]:
        return {item for item in contents if item in exclude_patterns}

    shutil.copytree(VAULT_DIR, target, ignore=ignore_excluded)


def write_graph_data(graph_data: dict) -> None:
    graph_path = DOCS_DIR / "graph-data.json"
    graph_path.write_text(json.dumps(graph_data, ensure_ascii=False), encoding="utf-8")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    exclude_patterns = load_exclude_patterns()
    graph_data = build_graph_data(exclude_patterns)
    copy_site_scaffold()
    copy_vault_for_browser(exclude_patterns)
    write_graph_data(graph_data)
    print(
        f"Built: {len(graph_data['nodes'])} notes, "
        f"{len(graph_data['links'])} links → docs/"
    )


if __name__ == "__main__":
    main()
