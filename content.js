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
        
        // Initialize the Indexer (from indexer.js)
        new UniversalIndexer(selectElement);

        // Visual Feedback
        btn.innerText = "✅";
        btn.style.borderColor = "green";
        btn.style.color = "green";
        btn.title = "Optimized!";
        
        // Optional: Fade out button
        setTimeout(() => {
            btn.style.opacity = "0.5";
            btn.style.pointerEvents = "none";
        }, 1500);
    };

    // Insert button immediately after the select element
    if (selectElement.nextSibling) {
        selectElement.parentNode.insertBefore(btn, selectElement.nextSibling);
    } else {
        selectElement.parentNode.appendChild(btn);
    }
}

