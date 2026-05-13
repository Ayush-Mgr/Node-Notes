# Node-Notes

Node-Notes publishes an Obsidian-style vault as a graph site and ships a browser-based Vault Manager for phone-friendly note creation, editing, and deletion.

## Architecture

Git is the source of truth.

```text
vault/                 source notes (git-tracked)
site-src/              graph UI + Vault Manager sources
scripts/build_graph_site.py
  -> docs/             generated site bundle (gitignored)
  -> GitHub Pages      deployed by Actions artifact upload
```

Every push that touches `vault/`, `site-src/`, `scripts/build_graph_site.py`, or `publish.exclude` rebuilds the site in GitHub Actions.

## Active files

| Path | Purpose |
| --- | --- |
| `vault/` | Markdown notes and local assets |
| `publish.exclude` | Excludes private paths from the public site |
| `site-src/index.html` | Graph page shell |
| `site-src/app.js` | Graph runtime |
| `site-src/styles.css` | Graph page styles |
| `site-src/manager.html` | Vault Manager markup |
| `site-src/manager.js` | Vault Manager behavior |
| `site-src/manager.css` | Vault Manager styles |
| `scripts/build_graph_site.py` | Build pipeline from `vault/` to `docs/` |
| `.github/workflows/deploy-pages.yml` | CI build and Pages deploy |

## Local preview

```bash
./scripts/preview-site.sh
```

Then open [http://localhost:8080](http://localhost:8080).

The script rebuilds the site into `docs/` and serves that generated output locally.

## Vault Manager

`site-src/manager.html` is a lightweight single-page manager for your vault.

- Uses a GitHub fine-grained PAT with `Contents: Read & Write`
- Keeps the token in `sessionStorage`, never `localStorage`
- Autosaves title/body drafts locally
- Supports live Markdown preview
- Can browse, edit, and delete vault notes with path safety guards

## Private notes

Add folder or file patterns to `publish.exclude`. Matching paths are excluded from both the graph data and `docs/content/`.

```text
# publish.exclude example
private/
Random Shits and Notes/
```

If the repository itself is public, keep truly private notes out of git as well.

## Build output

`docs/` is generated build output for local preview. It is gitignored here and should not be hand-edited.
