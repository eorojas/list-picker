## Project Context: List-Picker
We are building a browser extension that optimizes dropdown lists (specifically country pickers) for rapid typing.

### 1. Data Structure Strategy
We use a client-side "Universal Indexer" rather than hard-coded JSON.
- **Goal:** Allow users to type "K" and match "Republic of Korea" or "United Kingdom" and match "Great Britain".
- **Logic:** Tokenize every word in the option text.
- **Storage:** Ephemeral in-memory index (Map<Char, Options[]>).

### 2. Core Logic (UniversalIndexer)
The solution must run in the browser (Content Script) and generalize to any dropdown (Dates, Countries, Numbers).
- **Tokenizer:** Split text by spaces, dashes, parens. Index every token's first letter.
- **Buffer:** specific 1.5s timeout buffer to allow "slow typing" (e.g. typing "1995" slowly).
- **Event Hijack:** Listen for `keydown`, prevent default, and search the internal index.

### 3. UI/UX
- **Detection:** Auto-detect lists with >30 items.
- **Activation:** Inject a subtle "⚡" button next to the dropdown.
- **Feedback:** Visual indicator (Green checkmark) when optimized.

