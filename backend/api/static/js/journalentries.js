// Function to get CSRF token from the browser's cookies
function getCsrfToken() {
    let csrfToken = null;
    if (document.cookie && document.cookie !== '') {
        document.cookie.split(';').forEach(cookie => {
            const trimmedCookie = cookie.trim();
            if (trimmedCookie.startsWith('csrftoken=')) {
                csrfToken = trimmedCookie.split('=')[1];
            }
        });
    }
    return csrfToken;
}

// Ensure this code runs after the DOM has fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Select modal elements
    const modal = document.getElementById('addJournalTemplateModal');
    const openModalButton = document.getElementById('openAddJournalTemplateModal'); // Open button
    const cancelButton = document.getElementById('cancelJournalTemplateButton'); // Cancel button

    // Ensure modal and buttons are found
    if (!modal || !openModalButton || !cancelButton) {
        console.error("Modal or buttons not found in the DOM. Check the HTML structure and element IDs.");
        return;
    }

    // Open modal
    openModalButton.addEventListener('click', () => {
        console.log("Open modal button clicked");
        modal.style.display = 'block';
    });

    // Close modal on "Cancel" button
    cancelButton.addEventListener('click', () => {
        console.log("Cancel button clicked");
        modal.style.display = 'none';
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            console.log("Clicked outside the modal");
            modal.style.display = 'none';
        }
    });
});
