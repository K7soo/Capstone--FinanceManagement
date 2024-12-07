document.addEventListener('DOMContentLoaded', () => {
    // Select modal elements
    const modal = document.getElementById('addJournalEntriesModal');
    const openModalButton = document.getElementById('openAddJournalEntriesModal'); // Open button
    const cancelButton = document.getElementById('cancelJournalEntriesButton'); // Cancel button
    const journalEntriesForm = document.getElementById('journalEntriesForm'); // Form
    const journalEntriesTable = document.querySelector('.journal-entries-table tbody'); // Table body
    const journalEntriesTableContainer = document.querySelector('.journal-entries-table-container'); // Table container

    // Ensure modal and buttons are found
    if (!modal || !openModalButton || !cancelButton || !journalEntriesForm || !journalEntriesTable) {
        console.error('Modal or buttons not found in the DOM. Check the HTML structure and element IDs.');
        return;
    }

    // Open modal
    openModalButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Close modal on "Cancel" button
    cancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Add new journal entry
    journalEntriesForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form submission

        // Fetch values from the form
        const entryCode = document.getElementById('entryCode').value.trim();
        const transactionType = document.getElementById('transactionType').value.trim();
        const addTemplate = document.getElementById('addTemplate').value.trim();
        const entriesDate = document.getElementById('entriesDate').value.trim();
        const entriesDescription = document.getElementById('EntriesDescription').value.trim();

        // Check if all fields are filled
        if (!entryCode || !transactionType || !addTemplate || !entriesDate || !entriesDescription) {
            alert('All fields are required.');
            return;
        }

        // Show the table container if hidden
        journalEntriesTableContainer.style.display = 'block';

        // Create a new row with the values
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${transactionType}</td>
            <td>${addTemplate}</td>
            <td>${entryCode}</td>
            <td>${entriesDate}</td>
            <td><i>${entriesDescription}</i></td>
        `;

        // Append the row to the table body
        journalEntriesTable.appendChild(newRow);

        // Close the modal
        modal.style.display = 'none';

        // Clear the form
        journalEntriesForm.reset();
    });
});
