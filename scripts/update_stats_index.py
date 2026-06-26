#!/usr/bin/env python3
import os
import glob
import re
import sys

NOTES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "vault", "DataScience", "Stats", "notes"))
INDEX_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "vault", "DataScience", "Stats", "index", "STATS index.md"))

MARKER_START = "<!-- AUTO_STATS_RECENT_START -->"
MARKER_END = "<!-- AUTO_STATS_RECENT_END -->"

def main():
    if not os.path.isdir(NOTES_DIR):
        print(f"Stats notes directory not found: {NOTES_DIR}", file=sys.stderr)
        return 1

    if not os.path.exists(INDEX_FILE):
        print(f"Index file not found: {INDEX_FILE}", file=sys.stderr)
        return 1

    # 1. Get all markdown files in the notes directory
    search_pattern = os.path.join(NOTES_DIR, "*.md")
    files = glob.glob(search_pattern)
    
    # 2. Sort by modification time descending
    files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    
    # 3. Keep newest 14
    latest_files = files[:14]
    
    # 4. Generate links without .md
    links = []
    for f in latest_files:
        basename = os.path.basename(f)
        name_without_ext = os.path.splitext(basename)[0]
        links.append(f"- [[DataScience/Stats/notes/{name_without_ext}|{name_without_ext}]]")
    
    generated_block = (
        MARKER_START + "\n" +
        "## Recently Updated Stats Notes\n" +
        "\n".join(links) + "\n" +
        MARKER_END
    )

    # 5. Read index file
    with open(INDEX_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # 6. Replace marker block or append
    pattern = re.compile(re.escape(MARKER_START) + r".*?" + re.escape(MARKER_END), re.DOTALL)
    
    if pattern.search(content):
        new_content = pattern.sub(generated_block, content)
    else:
        # Append to the end
        if not content.endswith("\n"):
            content += "\n"
        new_content = content + "\n" + generated_block + "\n"

    if new_content == content:
        print("STATS index.md already up to date.")
        return 0

    # 7. Write back
    with open(INDEX_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print(f"Successfully updated STATS index.md with latest 14 notes.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
