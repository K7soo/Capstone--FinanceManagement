document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('addJournalEntriesModal');
    const openModalButton = document.getElementById('openAddJournalEntriesModal');
    const cancelButton = document.getElementById('cancelJournalEntriesButton');
    const journalEntriesForm = document.getElementById('journalEntriesForm');
    const journalEntriesTableContainer = document.querySelector('.journal-entries-table-container');
    const journalEntriesBody = document.getElementById('journalEntriesBody');

    // Open Modal
    openModalButton.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Close Modal
    cancelButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close Modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Add new Journal Entry
    journalEntriesForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const entryCode = document.getElementById('entryCode').value.trim();
        const transactionType = document.getElementById('transactionType').value.trim();
        const addTemplate = document.getElementById('addTemplate').value.trim();
        const entriesDate = document.getElementById('entriesDate').value.trim();
        const entriesDescription = document.getElementById('EntriesDescription').value.trim();

        if (!entryCode || !transactionType || !addTemplate || !entriesDate || !entriesDescription) {
            alert('All fields are required.');
            return;
        }

        // Show the table container if hidden
        journalEntriesTableContainer.style.display = 'block';

        // Update the table headers dynamically
        const entryCodeHeader = document.querySelector('.entry-code-header');
        const transactionTypeHeader = document.querySelector('.transaction-type-header');
        const templateHeader = document.querySelector('.template-header');

        // Add the dynamic values to the header
        entryCodeHeader.textContent = entryCode;
        transactionTypeHeader.textContent = transactionType;
        templateHeader.textContent = addTemplate;

        // Create a new row with the values
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${entriesDate}</td>
            <td><i>${entriesDescription}</i></td>
            <td>--</td>
            <td>--</td>
        `;

        // Append the new row to the table body
        journalEntriesBody.appendChild(newRow);

        // Reset modal form inputs
        journalEntriesForm.reset();

        // Close the modal
        modal.style.display = 'none';
    });
});
