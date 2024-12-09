document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('addJournalEntriesModal');
    const openModalButton = document.getElementById('openAddJournalEntriesModal');
    const cancelButton = document.getElementById('cancelJournalEntriesButton');
    const journalEntriesForm = document.getElementById('journalEntriesForm');
    const journalEntriesTableContainer = document.querySelector('.journal-entries-table-container');
    const journalEntriesBody = document.getElementById('journalEntriesBody');
    const viewModal = document.getElementById('viewJournalEntryModal');
    const closeViewModalButton = document.getElementById('closeViewJournalEntryModal');

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

        // Create a new row with the values
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${entriesDate}</td>
            <td><i>${entriesDescription}</i></td>
            <td>--</td>
            <td>--</td>
            <td>
                <button class="btn-view" data-entry-code="${entryCode}" data-transaction-type="${transactionType}" data-template="${addTemplate}" data-description="${entriesDescription}">View</button>
                <button class="btn-delete">Delete</button>
            </td>
        `;

        // Append the new row to the table body
        journalEntriesBody.appendChild(newRow);

        // Reset modal form inputs
        journalEntriesForm.reset();

        // Close the modal
        modal.style.display = 'none';
    });

    // Handle View button click
    journalEntriesBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-view')) {
            const entryCode = event.target.getAttribute('data-entry-code');
            const transactionType = event.target.getAttribute('data-transaction-type');
            const addTemplate = event.target.getAttribute('data-template');
            const description = event.target.getAttribute('data-description');

            document.getElementById('viewEntryCode').textContent = entryCode;
            document.getElementById('viewTransactionType').textContent = transactionType;
            document.getElementById('viewTemplate').textContent = addTemplate;
            document.getElementById('viewDescription').textContent = description;

            viewModal.style.display = 'block';
        }
    });

    // Handle Delete button click
    journalEntriesBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-delete')) {
            const row = event.target.closest('tr');
            row.remove();
        }
    });

    // Close View Modal
    closeViewModalButton.addEventListener('click', () => {
        viewModal.style.display = 'none';
    });
});
