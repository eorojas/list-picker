/**
 * ListPicker Combobox
 * Replaces a native <select> with a searchable, filterable custom dropdown.
 */

class ListPickerCombobox {
    constructor(selectElement) {
        this.select = selectElement;
        this.options = [];
        this.container = null;
        this.input = null;
        this.list = null;
        this.isOpen = false;
        
        this.init();
    }

    init() {
        // 1. Extract Data
        this.extractOptions();
        
        // 2. Build UI
        this.buildUI();
        
        // 3. Hide Native Select
        this.select.style.display = 'none';
        
        // 4. Insert UI
        this.select.parentNode.insertBefore(this.container, this.select.nextSibling);
        
        console.log("ListPicker: Combobox initialized.");
    }

    extractOptions() {
        this.options = Array.from(this.select.options).map((opt, idx) => ({
            index: idx,
            text: opt.text,
            value: opt.value,
            lowerText: opt.text.toLowerCase()
        }));
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

        // Input Field (The "Closed" Dropdown)
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Select...';
        this.input.value = this.select.options[this.select.selectedIndex].text;
        Object.assign(this.input.style, {
            width: '100%',
            padding: '8px',
            boxSizing: 'border-box',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
        });

        // Dropdown List (The "Open" Menu)
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
            display: 'none', // Hidden by default
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        });

        // Events
        this.input.addEventListener('click', () => this.toggle());
        this.input.addEventListener('input', () => this.filter(this.input.value));
        
        // Close on outside click
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
        this.input.select(); // Highlight text for easy replacing
        this.renderList(this.options); // Show all
    }

    close() {
        this.isOpen = false;
        this.list.style.display = 'none';
        // Reset input to selected value
        this.input.value = this.select.options[this.select.selectedIndex].text;
    }

    filter(query) {
        if (!this.isOpen) this.open();
        
        const q = query.toLowerCase();
        const filtered = this.options.filter(opt => opt.lowerText.includes(q));
        this.renderList(filtered);
    }

    renderList(items) {
        this.list.innerHTML = '';
        
        if (items.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No matches found';
            li.style.padding = '8px';
            li.style.color = '#999';
            this.list.appendChild(li);
            return;
        }

        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.text;
            Object.assign(li.style, {
                padding: '8px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee'
            });
            
            // Highlight on hover
            li.onmouseover = () => li.style.background = '#f0f0f0';
            li.onmouseout = () => li.style.background = '#fff';

            li.onclick = () => {
                this.selectOption(item);
            };

            this.list.appendChild(li);
        });
    }

    selectOption(item) {
        // Update real select
        this.select.selectedIndex = item.index;
        this.select.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Update UI
        this.input.value = item.text;
        this.close();
    }
}

// Export
window.UniversalIndexer = ListPickerCombobox;