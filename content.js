// Configuration
const MIN_OPTIONS_THRESHOLD = 30;

/**
 * Main Logic: Watch the DOM for new dropdowns
 */
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Ensure it's an Element
                if (node.tagName === 'SELECT') {
                    processSelect(node);
                }
                // Check children of added nodes (e.g., when a whole div is injected)
                else if (node.querySelectorAll) {
                    node.querySelectorAll('select').forEach(processSelect);
                }
            }
        });
    });
});

// Start watching
observer.observe(document.body, { childList: true, subtree: true });

// Process existing dropdowns on initial load
document.querySelectorAll('select').forEach(processSelect);

/**
 * Decides if a dropdown should be optimized and injects the button
 */
function processSelect(selectElement) {
    // 1. Avoid duplicates or tiny lists
    if (selectElement.dataset.listPickerProcessed) return;
    if (selectElement.options.length < MIN_OPTIONS_THRESHOLD) return;

    // 2. Mark as processed
    selectElement.dataset.listPickerProcessed = "true";

    // 3. Inject the UI
    addOptimizeButton(selectElement);
}

/**
 * Injects the "⚡" button next to the dropdown
 */
function addOptimizeButton(selectElement) {
    const btn = document.createElement("button");
    btn.innerText = "⚡";
    btn.title = "Optimize list for rapid typing";
    btn.className = "list-picker-btn"; // Class for potential CSS styling

    // Inline styles for isolation
    Object.assign(btn.style, {
        marginLeft: "8px",
        cursor: "pointer",
        border: "1px solid #ccc",
        background: "#fff",
        borderRadius: "4px",
        padding: "2px 6px",
        fontSize: "12px",
        verticalAlign: "middle",
        height: "fit-content"
    });

    btn.onclick = (e) => {
        e.preventDefault();
        
        // Avoid double-injection
        if (selectElement.previousSibling && selectElement.previousSibling.className === 'list-picker-search') return;

        // Initialize Indexer
        const IndexerClass = window.UniversalIndexer || UniversalIndexer;
        const indexer = new IndexerClass(selectElement);

        // Create Search Box
        const searchBox = document.createElement('input');
        searchBox.type = "text";
        searchBox.className = "list-picker-search";
        searchBox.placeholder = "Type to search...";
        
        Object.assign(searchBox.style, {
            marginRight: "8px",
            padding: "4px",
            border: "2px solid #007bff",
            borderRadius: "4px",
            width: "150px"
        });

        // Insert BEFORE the select
        selectElement.parentNode.insertBefore(searchBox, selectElement);
        searchBox.focus();

        // Handle Search
        searchBox.addEventListener('input', () => {
            const foundText = indexer.search(searchBox.value);
            if (foundText) {
                searchBox.style.borderColor = "#28a745"; // Success green
            } else {
                searchBox.style.borderColor = "#dc3545"; // Error red
            }
        });

        // Handle Keys
        searchBox.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchBox.value = ""; // Clear for next use
                searchBox.style.borderColor = "#007bff";
                selectElement.focus();
            }
            if (e.key === 'Escape') {
                searchBox.value = "";
                searchBox.blur();
            }
        });

        // Update Button State
        btn.innerText = "🔍";
        btn.title = "Search active";
    };

    // Insert button immediately after the select element
    if (selectElement.nextSibling) {
        selectElement.parentNode.insertBefore(btn, selectElement.nextSibling);
    } else {
        selectElement.parentNode.appendChild(btn);
    }
}

