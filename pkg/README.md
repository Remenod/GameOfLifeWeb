# Game of Life Web

A lightweight, interactive implementation of Conway’s Game of Life for the browser — built with Rust, compiled to WebAssembly, and enhanced with modern UI and customization features.

[Live Demo](https://remenod.github.io/GameOfLifeWeb/)

---

## Features

* Supports custom rules in `B/S` format (e.g., `B3/S23`)
* Adjustable **neighbor mask** — define which of the 25 surrounding cells are counted
* Responsive canvas with configurable **width** and **height**
* Several **field encoding formats**: `v1`, `v2`, and compact `v3` (Base62)
* Copy/export tools:

  * Copy field template
  * Copy sharable URL (preserves state)
* Built-in tooltips and modals with Markdown-powered tutorials
* No external dependencies or backend — pure static site

---

## Technologies

* **Rust** with [`wasm-pack`](https://rustwasm.github.io/wasm-pack/) for WebAssembly
* **JavaScript** UI glue logic
* **Static site** hosted on GitHub Pages
* **Markdown-based** contextual help for each control

---

## Project Structure

```
.
├── index.html             # Main HTML entry point
├── css/                   # Styling (modularized)
├── js/                    # Core JS logic, canvas, events
├── help/                  # Markdown-based help content
├── src/                   # Game of life logic on Rust
└── pkg/                   # WASM output from Rust
```

---

## Running Locally

To run the project locally after cloning:

1. **Install Rust and `wasm-pack`** (if not already installed):

   ```bash
   cargo install wasm-pack
   ```

2. **Build the WebAssembly package**:

   ```bash
   wasm-pack build --target web --out-dir pkg --release
   ```

3. **Serve the project root** with a static server (e.g. using `npx serve`):

   ```bash
   npx serve .
   ```
    or
   ```bash
   python3 -m http.server
   ```

Then open the provided local address (e.g. `http://localhost:8000`) in your browser.

---

## Roadmap

* [ ] Fullscreen mode with navigation controls
* [ ] Embedded visual editor
* [ ] Pattern gallery and examples
* [ ] Zoom, pan, and advanced canvas controls
