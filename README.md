# Node-Notes

This repository transforms a private Obsidian vault into a public-facing, interactive, Zen-inspired "Ink & Void" node graph.

## Vision & Purpose

This project was created to fulfill two primary goals:
1. **Personal Web Showcase**: To serve as a high-fidelity, interactive portfolio piece hosted on GitHub Pages. It acts as a public window into your structured knowledge and notes, demonstrating technical proficiency and a refined design aesthetic.
2. **Ubiquitous Access**: To provide a seamless, mobile-friendly way to view and access your knowledge base from anywhere. You don't need your primary computer to access your Obsidian vault.
    - *Future Potential*: In the future, this project may evolve beyond a static viewer into an application that allows adding new notes or editing existing ones directly from the web on the go.

## Source Data

Your source notes stay in your configured local Obsidian vault path.

The site does only two things:

- show the notes as an interactive node graph
- open a note when you click a node

## Files that matter

- [scripts/build_graph_site.py](./scripts/build_graph_site.py): syncs the vault and generates the site data
- [scripts/preview-graph-site.sh](./scripts/preview-graph-site.sh): builds and runs localhost preview
- [site-src/index.html](./site-src/index.html): the app shell
- [site-src/styles.css](./site-src/styles.css): the visual style
- [site-src/app.js](./site-src/app.js): graph + note panel behavior
- [publish.exclude](./publish.exclude): files and folders excluded from sync

## Local preview

```bash
./scripts/preview-graph-site.sh
```

Then open:

[http://localhost:8080](http://localhost:8080)

## Build static output

```bash
python3 ./scripts/build_graph_site.py
```

This writes the static site into `docs/`.

## Publish model

The generated site is committed from `docs/`.
GitHub Pages can serve that folder directly.

## Hide private content

Add folders or files you do not want public to [publish.exclude](./publish.exclude).

Example:

```text
Random Shits and Notes/
```
