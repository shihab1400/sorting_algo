# Repository Guidelines

## Project Structure & Module Organization

This repository is a small, dependency-free sorting visualizer. The app files live in the repository root:

- `index.html` defines the sorting controls and bar elements.
- `index.js` handles randomization, sorting animations, and button state.
- `styles.css` contains the layout, colors, and responsive styling.

There are currently no separate source, asset, or test directories. Keep additions similarly simple unless the project grows enough to justify a clearer structure.

## Build, Test, and Development Commands

There is no build step, package manager manifest, or automated test command. Open `index.html` directly in a modern browser to use the app. For local HTTP testing, run `python -m http.server 8000` from the repository root and visit `http://localhost:8000`; stop the server with Ctrl+C.

## Coding Style & Naming Conventions

Match the existing style: JavaScript and CSS use three-space indentation, semicolons, and double-quoted JavaScript strings. Use descriptive camelCase names for JavaScript variables and functions, and kebab-case class names in HTML/CSS (for example, `.bar-container`). Keep browser behavior in `index.js`, presentation in `styles.css`, and document structure in `index.html`. No formatter or linter is configured.

## Testing Guidelines

No testing framework or coverage requirement is configured. For changes, manually verify the page in a browser: confirm every algorithm, test preset, playback control, custom input, and comparison mode work, counters update, and each sorting method orders the bars, and the layout remains usable at desktop and narrow viewport widths. If automated tests are introduced, document their command and use names that describe the behavior under test.

## Commit & Pull Request Guidelines

Git history is not available in this checkout, so existing commit conventions cannot be determined. As a practical default, use short, imperative commit subjects such as `Add merge sort control`. Pull requests should describe the visible or behavioral change, note manual checks performed, and include screenshots for visual changes.

## Security & Configuration

The app has no external dependencies or configuration files. Keep changes self-contained and avoid adding third-party scripts or services unless the project needs them.




