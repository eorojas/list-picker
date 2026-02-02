// Configuration
const MIN_OPTIONS_THRESHOLD = 10;

console.log("ListPicker: Content script loaded.");

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
                if (node.tagName === 'SELECT') checkAndReplace(node);
                else if (node.querySelectorAll) node.querySelectorAll('select').forEach(checkAndReplace);
            }
        });
    });
});

observer.observe(document.body, { childList: true, subtree: true });
document.querySelectorAll('select').forEach(checkAndReplace);

function checkAndReplace(selectElement) {
    if (selectElement.dataset.listPickerProcessed) return;
    
    // Safety check: wait for options
    if (selectElement.options.length < MIN_OPTIONS_THRESHOLD) {
        // Use a small timeout to check if options are populated dynamically
        setTimeout(() => {
             if (selectElement.options.length >= MIN_OPTIONS_THRESHOLD) {
                 replace(selectElement);
             }
        }, 1000);
        return;
    }

    replace(selectElement);
}

function replace(selectElement) {
    if (selectElement.dataset.listPickerProcessed) return;
    selectElement.dataset.listPickerProcessed = "true";

    console.log("ListPicker: Replacing", selectElement);
    
    const ComboboxClass = window.UniversalIndexer || UniversalIndexer; // It's actually Combobox now
    new ComboboxClass(selectElement);
}