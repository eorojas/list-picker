// Only optimize lists with a reasonable number of items
const MIN_OPTIONS_THRESHOLD = 10;

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
                if (node.tagName === 'SELECT') processSelect(node);
                else if (node.querySelectorAll) node.querySelectorAll('select').forEach(processSelect);
            }
        });
    });
});

observer.observe(document.body, { childList: true, subtree: true });
document.querySelectorAll('select').forEach(processSelect);

function processSelect(selectElement) {
    if (selectElement.dataset.listPickerProcessed) return;
    if (selectElement.options.length < MIN_OPTIONS_THRESHOLD) return;

    selectElement.dataset.listPickerProcessed = "true";

    // Initialize the invisible indexer
    const IndexerClass = window.UniversalIndexer || UniversalIndexer;
    if (IndexerClass) {
        new IndexerClass(selectElement);
    }
}
