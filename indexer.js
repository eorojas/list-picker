/**
 * UniversalIndexer
 * Seamlessly enhances native <select> elements with multi-word search.
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
                this.index[firstChar].push({ optionIndex: idx, fullToken: token });
            });
        });
    }

    attachListeners() {
        // Use capture: true to intercept events before native handlers
        this.select.addEventListener('keydown', (e) => {
            // Ignore modifiers or long keys (Tab, Enter, etc.)
            if (e.key.length > 1 || e.altKey || e.ctrlKey || e.metaKey) return;

            e.preventDefault();
            e.stopPropagation();
            
            this.handleInput(e.key.toLowerCase());
        }, true);
    }

    handleInput(char) {
        this.buffer += char;
        if (this.bufferTimer) clearTimeout(this.bufferTimer);
        this.bufferTimer = setTimeout(() => { this.buffer = ""; }, this.TIMEOUT_MS);
        
        this.findAndSelect();
    }

    findAndSelect() {
        if (!this.buffer) return;
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

window.UniversalIndexer = UniversalIndexer;
