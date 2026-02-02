:/**
 * UniversalIndexer
 * Imports knowledge from 'pickCountry' project.
 * * Logic:
 * 1. Scans a <select> element.
 * 2. Builds a reverse-index map of all words (tokens) to option indices.
 * 3. Hijacks keystrokes to allow searching by any word in the option name.
 * 4. Buffers input to allow for "slow typing" (1.5s timeout).
 */

class UniversalIndexer {
    constructor(selectElement) {
        this.select = selectElement;
        this.index = {};
        this.buffer = "";
        this.bufferTimer = null;
        this.TIMEOUT_MS = 1500;
        this.init();
    }

    init() {
        this.buildIndex();
        this.attachListeners();
        console.log(`OmniPicker: Optimized ${this.select.options.length} items.`);
    }

    buildIndex() {
        this.index = {};
        Array.from(this.select.options).forEach((option, idx) => {
            const rawText = option.text.toLowerCase();
            const tokens = rawText.split(/[\s,\-\(\)\.]+/);
            tokens.forEach(token => {
                if (!token || ['of', 'the', 'and'].includes(token)) return;
                const firstChar = token[0];
                if (!this.index[firstChar]) this.index[firstChar] = [];
                this.index[firstChar].push({
                    optionIndex: idx,
                    fullToken: token,
                    displayText: option.text
                });
            });
        });
    }

    attachListeners() {
        this.select.addEventListener('keydown', (e) => {
            if (e.key.length > 1) return;
            e.preventDefault();
            this.handleInput(e.key.toLowerCase());
        });
    }

    handleInput(char) {
        this.buffer += char;
        if (this.bufferTimer) clearTimeout(this.bufferTimer);
        this.bufferTimer = setTimeout(() => { this.buffer = ""; }, this.TIMEOUT_MS);
        this.findAndSelect();
    }

    findAndSelect() {
        const firstChar = this.buffer[0];
        const candidates = this.index[firstChar];
        if (!candidates) return;
        const match = candidates.find(c => c.fullToken.startsWith(this.buffer));
        if (match) {
            this.select.selectedIndex = match.optionIndex;
            this.select.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}

