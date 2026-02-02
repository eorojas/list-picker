/**
 * UniversalIndexer
 * Logic:
 * 1. Scans a <select> element.
 * 2. Builds a reverse-index map of all words (tokens) to option indices.
 * 3. Provides a search(query) method for rapid lookup.
 */

class UniversalIndexer {
    constructor(selectElement) {
        this.select = selectElement;
        this.index = {};
        this.init();
    }

    init() {
        this.buildIndex();
        console.log(`UniversalIndexer: Ready. Indexed ${this.select.options.length} items.`);
    }

    buildIndex() {
        this.index = {};
        Array.from(this.select.options).forEach((option, idx) => {
            const rawText = option.text.toLowerCase();
            // Split by common separators: spaces, commas, dashes, parens, dots
            const tokens = rawText.split(/[\s,\-\(\)\.]+/);
            
            tokens.forEach(token => {
                // Ignore empty tokens or very common noise words
                if (!token || ['of', 'the', 'and'].includes(token)) return;
                
                const firstChar = token[0];
                if (!this.index[firstChar]) this.index[firstChar] = [];
                
                this.index[firstChar].push({
                    optionIndex: idx,
                    fullToken: token
                });
            });
        });
    }

    /**
     * Finds the first option where any word starts with the query.
     * Returns the matched text or null.
     */
    search(query) {
        if (!query) return null;
        query = query.toLowerCase();
        
        const firstChar = query[0];
        const candidates = this.index[firstChar];
        if (!candidates) return null;

        // Find match where a token starts with the user's input
        const match = candidates.find(c => c.fullToken.startsWith(query));
        
        if (match) {
            this.select.selectedIndex = match.optionIndex;
            // Trigger change event for framework compatibility (React/Angular)
            this.select.dispatchEvent(new Event('change', { bubbles: true }));
            return this.select.options[match.optionIndex].text;
        }
        return null;
    }
}

// Make it globally available for content.js
window.UniversalIndexer = UniversalIndexer;