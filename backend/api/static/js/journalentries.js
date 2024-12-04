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

// Select modal elements
const modal = document.getElementById('addJournalTemplateModal');
const openModalButton = document.getElementById('openAddJournalTemplateModal'); // Fixed selector
const closeModalButton = document.querySelector('.close-btn'); // Fixed selector
const cancelButton = document.getElementById('cancelJournalTemplateButton');

// Open modal
openModalButton.addEventListener('click', () => {
    modal.style.display = 'block';
});

// Close modal on "X" button
closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal on "Cancel" button
cancelButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});
