document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('addJournalEntriesModal');
    const openModalButton = document.getElementById('openAddJournalEntriesModal');
    const cancelButton = document.getElementById('cancelJournalEntriesButton');
    const journalEntriesForm = document.getElementById('particulars');
    const journalEntriesTableContainer = document.querySelector('.journal-entries-table-container');
    const journalEntriesBody = document.getElementById('journalEntriesBody');
    const viewModal = document.getElementById('viewJournalEntryModal');
    const closeViewModalButton = document.getElementById('closeViewJournalEntryModal');
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabPanels = document.querySelectorAll('.tab-panel');

    // Load Templates and Update Modal Dynamically
    const addTemplateSelect = document.getElementById('addTemplate');
    const transactionTypeSelect = document.getElementById('transactionType');
    const accountsTableBody = document.querySelector('.accounts-table tbody');

    function loadTemplates() {
        fetch('/journaltemplate/?t=' + new Date().getTime(), {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load journal templates');
            }
            return response.json();
        })
        .then(templates => {
            addTemplateSelect.innerHTML = '<option value="">Select Template</option>'; // Reset options
            templates.forEach(template => {
                const option = document.createElement('option');
                option.value = template.id;
                option.textContent = template.TRTemplateCode;
                addTemplateSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading templates:', error));
    }

    function loadTemplateDetails(templateId) {
        fetch(`/journaltemplate/${templateId}/`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load template details');
            }
            return response.json();
        })
        .then(data => {
            // Update Transaction Type
            transactionTypeSelect.innerHTML = `<option value="${data.template.TransactionType_FK}">${data.template.TransactionTypeName}</option>`;

            accountsTableBody.innerHTML = ''; // Clear existing rows
            data.details.forEach(detail => {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>
                        <select class="account-dropdown">
                            ${data.accounts.map(account => `
                                <option value="${account.AccountCode}" ${account.AccountCode === detail.Account_FK ? 'selected' : ''}>${account.AccountDesc}</option>
                            `).join('')}
                        </select>
                    </td>
                    <td><input type="text" class="debit-input" value="${detail.Debit}" ${detail.Debit > 0 ? '' : 'disabled'} /></td>
                    <td><input type="text" class="credit-input" value="${detail.Credit}" ${detail.Credit > 0 ? '' : 'disabled'} /></td>
                `;
                accountsTableBody.appendChild(newRow);
            });
        })
        .catch(error => console.error('Error loading template details:', error));
    }

    function viewTemplate(templateId) {
        fetch(`/journaltemplate/${templateId}/`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch template and details');
            }
            return response.json();
        })
        .then(data => {
            transactionTypeSelect.innerHTML = `<option value="${data.template.TransactionType_FK}">${data.template.TransactionTypeName}</option>`;
            accountsTableBody.innerHTML = ''; // Clear existing rows

            data.details.forEach(detail => {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>
                        <select class="account-dropdown">
                            ${data.accounts.map(account => `
                                <option value="${account.AccountCode}" ${account.AccountCode === detail.Account_FK ? 'selected' : ''}>${account.AccountDesc}</option>
                            `).join('')}
                        </select>
                    </td>
                    <td><input type="text" class="debit-input" value="${detail.Debit}" ${detail.Debit > 0 ? '' : 'disabled'} /></td>
                    <td><input type="text" class="credit-input" value="${detail.Credit}" ${detail.Credit > 0 ? '' : 'disabled'} /></td>
                `;
                accountsTableBody.appendChild(newRow);
            });
        })
        .catch(error => console.error('Error viewing template details:', error));
    }

    addTemplateSelect.addEventListener('change', event => {
        const selectedTemplateId = event.target.value;
        if (selectedTemplateId) {
            loadTemplateDetails(selectedTemplateId);
        } else {
            accountsTableBody.innerHTML = ''; // Clear table if no template selected
            transactionTypeSelect.innerHTML = '<option value="">Select Transaction Type</option>';
        }
    });

    // Open Modal
    openModalButton.addEventListener('click', () => {
        modal.style.display = 'block';
        loadTemplates();
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

    // Ensure only one of Debit or Credit can be filled
    accountsTableBody.addEventListener('input', event => {
        const target = event.target;
        if (target.classList.contains('debit-input')) {
            const creditInput = target.closest('tr').querySelector('.credit-input');
            if (target.value) {
                creditInput.value = '';
                creditInput.disabled = true;
            } else {
                creditInput.disabled = false;
            }
        } else if (target.classList.contains('credit-input')) {
            const debitInput = target.closest('tr').querySelector('.debit-input');
            if (target.value) {
                debitInput.value = '';
                debitInput.disabled = true;
            } else {
                debitInput.disabled = false;
            }
        }
    });

    // Tab Switching Logic
    tabLinks.forEach((tab) => {
        tab.addEventListener('click', function () {
            tabLinks.forEach((link) => link.classList.remove('active'));
            tabPanels.forEach((panel) => panel.classList.remove('active'));
            this.classList.add('active');
            const targetPanel = document.getElementById(this.getAttribute('data-tab'));
            targetPanel.classList.add('active');
        });
    });
});
