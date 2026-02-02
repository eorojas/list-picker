# Project Context: list-picker

## Project Description
A browser extension that intercepts generic HTML `<select>` elements and optimizes them for rapid keyboard navigation using multi-word indexing and input buffering.

## Repository Info
* **Name:** `list-picker`
* **Default Branch:** `master`

## Architecture Summary

### 1. `indexer.js` (The Core Logic)
* **Class:** `UniversalIndexer`
* **Tokenization:** Splits option text by `[\s,\-\(\)\.]+`. Indexes every token (e.g., "Republic of Korea" -> indexed under 'R' and 'K').
* **Input Buffer:** Uses a 1500ms timeout (vs browser default ~500ms) to allow slow typing of multi-digit years or long names.
* **Event Hijacking:** Listens for `keydown`, prevents default behavior, and performs lookup in the client-side index.

### 2. `content.js` (The UI & Detection)
* **Detection:** Uses `MutationObserver` to detect dynamic content.
* **Heuristic:** Optimizes any `<select>` with > 30 items.
* **UI Strategy:** Injects a "⚡" button next to the dropdown.
* **Interaction:** Clicking "⚡" instantiates `UniversalIndexer` and changes icon to "✅".

### 3. Decisions & constraints
* **Data Source:** No hardcoded JSON files. We parse the live DOM to support any list type (Countries, Dates, etc.).
* **Privacy:** All logic runs client-side (Content Script). No data exfiltration.
* **Compatibility:** Framework agnostic, but forces state updates via `dispatchEvent(new Event('change'))` to support React/Angular.

## Current File Structure
* `manifest.json` (Extension Config)
* `content.js` (DOM Watcher & UI Injection)
* `indexer.js` (Search Logic Class)
* `DESIGN.md` (Detailed specs)

