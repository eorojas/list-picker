/**
 * ListPicker Combobox
 * Replaces a native <select> with a searchable, filterable custom dropdown.
 */

// Common Country Aliases (Embedded Knowledge)
const COUNTRY_ALIASES = {
    "united kingdom": ["uk", "great britain", "england", "britain"],
    "united states": ["usa", "america", "us"],
    "netherlands": ["holland"],
    "korea, republic of": ["south korea"],
    "korea, democratic people's republic of": ["north korea"],
    "russian federation": ["russia"],
    "viet nam": ["vietnam"],
    "taiwan, province of china": ["taiwan"],
    "syrian arab republic": ["syria"],
    "moldova, republic of": ["moldova"],
    "iran, islamic republic of": ["iran"],
    "tanzania, united republic of": ["tanzania"],
    "venezuela, bolivarian republic of": ["venezuela"],
    "bolivia, plurinational state of": ["bolivia"],
    "lao people's democratic republic": ["laos"],
    "brunei darussalam": ["brunei"],
    "cabo verde": ["cape verde"],
    "czechia": ["czech republic"],
    "eswatini": ["swaziland"],
    "north macedonia": ["macedonia"],
    "myanmar": ["burma"],
    "holy see": ["vatican"],
    "united arab emirates": ["uae"]
};

class ListPickerCombobox {
    constructor(selectElement) {
        this.select = selectElement;
        this.options = [];
        this.filteredOptions = [];
        this.container = null;
        this.input = null;
        this.list = null;
        this.isOpen = false;
        this.highlightedIndex = -1;
        
        this.init();
    }

    init() {
        this.extractOptions();
        this.buildUI();
        this.select.style.display = 'none';
        this.select.parentNode.insertBefore(this.container, this.select.nextSibling);
        console.log("ListPicker: Combobox initialized.");
    }

    extractOptions() {
        this.options = Array.from(this.select.options).map((opt, idx) => {
            const lowerText = opt.text.toLowerCase();
            let searchTerms = [lowerText];
            
            // Add Aliases if we recognize the country name
            for (const [official, aliases] of Object.entries(COUNTRY_ALIASES)) {
                if (lowerText.includes(official) || official.includes(lowerText)) {
                    searchTerms.push(...aliases);
                }
            }

            return {
                index: idx,
                text: opt.text,
                value: opt.value,
                lowerText: lowerText,
                searchTerms: searchTerms.join(" ") // Combine for easy searching
            };
        });
        this.filteredOptions = this.options;
    }

    buildUI() {
        // Main Container
        this.container = document.createElement('div');
        this.container.className = 'list-picker-container';
        Object.assign(this.container.style, {
            position: 'relative',
            display: 'inline-block',
            width: this.select.offsetWidth > 0 ? this.select.offsetWidth + 'px' : '200px',
            fontFamily: 'sans-serif'
        });

        // Input Field
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Select...';
        // Handle case where nothing is selected (index -1)
        if (this.select.selectedIndex >= 0) {
             this.input.value = this.select.options[this.select.selectedIndex].text;
        }
        
        Object.assign(this.input.style, {
            width: '100%',
            padding: '8px',
            boxSizing: 'border-box',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
        });

        // Dropdown List
        this.list = document.createElement('ul');
        Object.assign(this.list.style, {
            position: 'absolute',
            top: '100%',
            left: '0',
            width: '100%',
            maxHeight: '200px',
            overflowY: 'auto',
            background: '#fff',
            border: '1px solid #ccc',
            borderTop: 'none',
            zIndex: '9999',
            listStyle: 'none',
            padding: '0',
            margin: '0',
            display: 'none',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        });

        // Events
        this.input.addEventListener('click', () => this.toggle());
        this.input.addEventListener('input', () => this.filter(this.input.value));
        this.input.addEventListener('keydown', (e) => this.handleKey(e));

        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.close();
            }
        });

        this.container.appendChild(this.input);
        this.container.appendChild(this.list);
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    open() {
        this.isOpen = true;
        this.list.style.display = 'block';
        this.input.placeholder = 'Type to filter...';
        this.input.select();
        this.renderList(this.options);
    }

    close() {
        this.isOpen = false;
        this.list.style.display = 'none';
        this.highlightedIndex = -1;
        if (this.select.selectedIndex >= 0) {
            this.input.value = this.select.options[this.select.selectedIndex].text;
        }
    }

    handleKey(e) {
        if (!this.isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
            this.open();
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.moveHighlight(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.moveHighlight(-1);
                break;
            case 'Enter':
                e.preventDefault();
                if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredOptions.length) {
                    this.selectOption(this.filteredOptions[this.highlightedIndex]);
                } else if (this.filteredOptions.length > 0) {
                    this.selectOption(this.filteredOptions[0]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
            case 'Tab':
                this.close();
                break;
        }
    }

    moveHighlight(direction) {
        this.highlightedIndex += direction;
        if (this.highlightedIndex < 0) this.highlightedIndex = 0;
        if (this.highlightedIndex >= this.filteredOptions.length) {
            this.highlightedIndex = this.filteredOptions.length - 1;
        }
        this.updateHighlightUI();
        this.scrollToHighlight();
    }

    updateHighlightUI() {
        const items = this.list.children;
        for (let i = 0; i < items.length; i++) {
            if (i === this.highlightedIndex) items[i].style.background = '#e9ecef';
            else items[i].style.background = '#fff';
        }
    }

    scrollToHighlight() {
        const item = this.list.children[this.highlightedIndex];
        if (item) item.scrollIntoView({ block: 'nearest' });
    }

    filter(query) {
        if (!this.isOpen) this.open();
        
        const q = query.toLowerCase();
        // Check both visible text AND our enriched search terms (aliases)
        this.filteredOptions = this.options.filter(opt => opt.searchTerms.includes(q));
        
        this.highlightedIndex = 0;
        this.renderList(this.filteredOptions);
    }

    renderList(items) {
        this.list.innerHTML = '';
        this.filteredOptions = items;

        if (items.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No matches found';
            li.style.padding = '8px';
            li.style.color = '#999';
            this.list.appendChild(li);
            return;
        }

        items.forEach((item, idx) => {
            const li = document.createElement('li');
            // Show alias match if applicable? For now just show standard text.
            li.textContent = item.text;
            Object.assign(li.style, {
                padding: '8px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee'
            });
            
            if (idx === this.highlightedIndex) li.style.background = '#e9ecef';

            li.onmouseover = () => {
                this.highlightedIndex = idx;
                this.updateHighlightUI();
            };

            li.onclick = () => {
                this.selectOption(item);
            };

            this.list.appendChild(li);
        });
    }

    selectOption(item) {
        this.select.selectedIndex = item.index;
        this.select.dispatchEvent(new Event('change', { bubbles: true }));
        this.input.value = item.text;
        this.close();
    }
}

window.UniversalIndexer = ListPickerCombobox;