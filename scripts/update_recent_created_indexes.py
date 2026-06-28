#!/usr/bin/env python3
import os
import glob
import re
import sys

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

INDEX_CONFIGS = [
    {
        "name": "Stats",
        "notes_dir": "vault/DataScience/Stats/notes",
        "index_file": "vault/DataScience/Stats/index/STATS index.md",
        "heading": "Recently Created Stats Notes",
        "link_prefix": "DataScience/Stats/notes",
        "marker": "AUTO_STATS_RECENT_CREATED",
    },
]

def main():
    for config in INDEX_CONFIGS:
        notes_dir = os.path.join(REPO_ROOT, config["notes_dir"])
        index_file = os.path.join(REPO_ROOT, config["index_file"])
        marker_start = f"<!-- {config['marker']}_START -->"
        marker_end = f"<!-- {config['marker']}_END -->"
        heading = config["heading"]
        link_prefix = config["link_prefix"]

        if not os.path.isdir(notes_dir):
            print(f"Notes directory not found: {notes_dir}", file=sys.stderr)
            continue

        if not os.path.exists(index_file):
            print(f"Index file not found: {index_file}", file=sys.stderr)
            continue

        search_pattern = os.path.join(notes_dir, "*.md")
        files = glob.glob(search_pattern)
        
        try:
            # Sort by creation time descending (macOS specific)
            files.sort(key=lambda x: os.stat(x).st_birthtime, reverse=True)
        except AttributeError:
            # Fallback for Linux CI environments
            files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
            print(f"Warning: st_birthtime not found on OS. Using mtime for {config['name']}.", file=sys.stderr)
        
        latest_files = files[:14]
        
        links = []
        for f in latest_files:
            basename = os.path.basename(f)
            name_without_ext = os.path.splitext(basename)[0]
            links.append(f"- [[{link_prefix}/{name_without_ext}|{name_without_ext}]]")
        
        generated_block = (
            marker_start + "\n" +
            f"## {heading}\n" +
            "\n".join(links) + "\n" +
            marker_end
        )

        with open(index_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Remove legacy marker block from previous version if present
        legacy_start = "<!-- AUTO_STATS_RECENT_START -->"
        legacy_end = "<!-- AUTO_STATS_RECENT_END -->"
        legacy_pattern = re.compile(r'\n*' + re.escape(legacy_start) + r".*?" + re.escape(legacy_end) + r'\n*', re.DOTALL)
        content = legacy_pattern.sub('\n', content)

        pattern = re.compile(re.escape(marker_start) + r".*?" + re.escape(marker_end), re.DOTALL)
        
        if pattern.search(content):
            new_content = pattern.sub(generated_block, content)
        else:
            if not content.endswith("\n"):
                content += "\n"
            new_content = content + "\n" + generated_block + "\n"

        if new_content == content:
            print(f"{config['name']} index already up to date.")
            continue

        with open(index_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        print(f"Successfully updated {config['name']} index with latest 14 notes.")

    return 0

if __name__ == "__main__":
    raise SystemExit(main())
