#!/usr/bin/env python3

from __future__ import annotations

import json
import re
import shutil
import subprocess
from collections import Counter, defaultdict
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
VAULT_PATH = Path(
    "/Users/yush/Library/CloudStorage/GoogleDrive-yushmgrcode@gmail.com/My Drive/obs"
)
CONTENT_DIR = REPO_ROOT / "content"
DOCS_DIR = REPO_ROOT / "docs"
SITE_SRC_DIR = REPO_ROOT / "site-src"
EXCLUDE_FILE = REPO_ROOT / "publish.exclude"
IGNORED_NOTE_IDS = {"index"}

WIKILINK_RE = re.compile(r"(!)?\[\[([^\]]+)\]\]")
HEADING_RE = re.compile(r"^\s*#\s+(.+?)\s*$", re.MULTILINE)


def sync_content() -> None:
    CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "rsync",
            "-a",
            "--delete",
            "--delete-excluded",
            f"--exclude-from={EXCLUDE_FILE}",
            f"{VAULT_PATH}/",
            f"{CONTENT_DIR}/",
        ],
        check=True,
    )


def normalize_target(value: str) -> str:
    return value.strip().replace("\\", "/").removesuffix(".md").lower()


def extract_title(markdown: str, fallback: str) -> str:
    match = HEADING_RE.search(markdown)
    if match:
      return match.group(1).strip()
    return fallback


def note_files():
    for path in sorted(CONTENT_DIR.rglob("*.md")):
        rel = path.relative_to(CONTENT_DIR).with_suffix("")
        note_id = rel.as_posix()
        if note_id in IGNORED_NOTE_IDS:
            continue
        yield path, note_id


def build_graph_data() -> dict:
    notes: dict[str, dict] = {}
    basename_map: dict[str, list[str]] = defaultdict(list)

    for path, note_id in note_files():
        markdown = path.read_text(encoding="utf-8", errors="replace")
        notes[note_id] = {
            "id": note_id,
            "path": path.relative_to(CONTENT_DIR).as_posix(),
            "title": extract_title(markdown, path.stem),
            "folder": note_id.split("/", 1)[0] if "/" in note_id else "root",
            "markdown": markdown,
        }
        basename_map[normalize_target(path.stem)].append(note_id)
        basename_map[normalize_target(note_id)].append(note_id)

    links: list[dict[str, str]] = []
    outgoing_counts: Counter[str] = Counter()
    incoming_counts: Counter[str] = Counter()
    seen_links: set[tuple[str, str]] = set()

    for note in notes.values():
        for embed_flag, raw_target in WIKILINK_RE.findall(note["markdown"]):
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

    nodes = []
    for note_id, note in notes.items():
        degree = outgoing_counts[note_id] + incoming_counts[note_id]
        nodes.append(
            {
                "id": note_id,
                "title": note["title"],
                "path": note["path"],
                "folder": note["folder"],
                "degree": degree,
            }
        )

    return {"nodes": nodes, "links": links}


def copy_site_scaffold() -> None:
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    for item in SITE_SRC_DIR.iterdir():
        target = DOCS_DIR / item.name
        if item.is_dir():
            shutil.copytree(item, target, dirs_exist_ok=True)
        else:
            shutil.copy2(item, target)
            
    # Also copy the root img directory to docs/img
    img_dir = REPO_ROOT / "img"
    if img_dir.exists() and img_dir.is_dir():
        target = DOCS_DIR / "img"
        if target.exists():
            shutil.rmtree(target)
        shutil.copytree(img_dir, target)


def copy_content_for_browser() -> None:
    target = DOCS_DIR / "content"
    if target.exists():
        shutil.rmtree(target)
    shutil.copytree(CONTENT_DIR, target)


def write_graph_data(graph_data: dict) -> None:
    graph_path = DOCS_DIR / "graph-data.json"
    graph_path.write_text(json.dumps(graph_data, ensure_ascii=False), encoding="utf-8")


def main() -> None:
    sync_content()
    graph_data = build_graph_data()
    copy_site_scaffold()
    copy_content_for_browser()
    write_graph_data(graph_data)
    print(f"Built graph site with {len(graph_data['nodes'])} notes and {len(graph_data['links'])} links.")


if __name__ == "__main__":
    main()
