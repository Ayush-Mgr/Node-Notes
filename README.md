# Node-Notes

Transforms a private Obsidian vault into a public-facing, interactive, Zen-inspired **"Ink & Void"** node graph — hosted on GitHub Pages.

## Architecture

GitHub is the single source of truth.

```
vault/*.md  (committed to git)
    │
    ├─── push → GitHub Actions → build_graph_site.py → docs/ → GitHub Pages
    │
    ├─── Obsidian Git (PC)    — auto-pull on startup, auto-push on save
    └─── Obsidian Git (Phone) — auto-pull on startup, auto-push on save
```

Every push automatically rebuilds and deploys the live site (~60 seconds).

---

## Files that matter

| File | Purpose |
|---|---|
| `vault/` | Your notes — the source of truth |
| `publish.exclude` | Patterns for private notes excluded from site |
| `scripts/build_graph_site.py` | Reads `vault/`, outputs `docs/` |
| `scripts/publish.sh` | One-command sync + commit + push |
| `scripts/preview-graph-site.sh` | Local preview at localhost:8080 |
| `site-src/` | App shell (HTML, CSS, JS) |
| `.github/workflows/deploy-pages.yml` | CI: build + deploy on push |

---

## Local preview

```bash
./scripts/preview-graph-site.sh
```

Open: [http://localhost:8080](http://localhost:8080)

---

## Publishing from PC (via Google Drive)

If you still sync from Google Drive first:

```bash
./scripts/publish.sh
# or with a custom message:
./scripts/publish.sh "add: new investing notes"
```

This runs rsync from your vault, commits the changes to `vault/`, and pushes. CI does the rest.

---

## Publishing from phone

Install **Obsidian Mobile** + **Obsidian Git** community plugin.

1. Clone this repo as your Obsidian vault
2. Point vault root to the `vault/` subfolder
3. Enable "Auto-commit and push on file change" in Obsidian Git settings
4. Write a note → it auto-pushes → site updates in ~60 seconds

---

## Private notes

Add folder or file patterns to `publish.exclude`. Matched paths are excluded from both the graph and `docs/content/` (they never leave your machine during CI).

```text
# publish.exclude example
Random Shits and Notes/
private/
```

> **Note:** The files still exist in the git repo (`vault/`). If your repo is public, use a `private/` subfolder pattern **and** add `vault/private/` to `.gitignore` so those notes are never committed.
