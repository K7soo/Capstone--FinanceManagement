document.addEventListener('DOMContentLoaded', () => {
    const csrfToken = getCsrfToken();
    const modal = document.getElementById('addJournalEntriesModal');
    const openModalButton = document.getElementById('openAddJournalEntriesModal');
    const cancelButton = document.querySelector('[data-bs-dismiss="modal"]');
    const accountsTableBody = document.querySelector('#accounting-entries table tbody');
    const addTemplateSelect = document.getElementById('addTemplate');

    const transactionTypeMap = {}; // Map for TransactionType IDs to names

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

    function loadTransactionTypes() {
        return fetch('/get-transaction-types/', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load transaction types');
                }
                return response.json();
            })
            .then(transactionTypes => {
                transactionTypes.forEach(type => {
                    transactionTypeMap[type.id] = type.TransactionTypeName;
                });
            })
            .catch(error => console.error('Error fetching transaction types:', error));
    }

    function loadChartOfAccounts() {
        return fetch('/get-chart-types/', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load chart of accounts');
                }
                return response.json();
            });
    }

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
                if (!addTemplateSelect) {
                    console.error('Add Template Select element not found');
                    return;
                }
                addTemplateSelect.innerHTML = '<option value="">Select Template</option>';
                templates.forEach(template => {
                    const option = document.createElement('option');
                    option.value = template.id;
                    option.textContent = template.TRTemplateCode;
                    option.dataset.transactionType = template.TransactionType_FK;
                    addTemplateSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error loading templates:', error));
    }

    function loadTemplateDetails(templateId) {
        Promise.all([
            loadChartOfAccounts(),
            fetch(`/journaltemplate/${templateId}/`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load template details');
                }
                return response.json();
            })
        ])
            .then(([chartOfAccounts, templateData]) => {
                const transactionTypeSelect = document.getElementById('transactionType');
                const accountsTableBody = document.querySelector('#accounting-entries table tbody');

                if (!transactionTypeSelect || !accountsTableBody) {
                    console.error('Transaction Type or Accounts Table Body element not found');
                    return;
                }

                // Convert transaction type dropdown to a readonly, greyed-out textbox without cursor
                const transactionTypeName = transactionTypeMap[templateData.template.TransactionType_FK] || 'Unknown';
                transactionTypeSelect.outerHTML = `<input type="text" id="transactionType" class="form-control text-muted" style="background-color: #e9ecef;" value="${transactionTypeName}" disabled />`;

                accountsTableBody.innerHTML = ''; // Clear existing rows

                const detailAccounts = templateData.details || [];
                detailAccounts.forEach(detail => {
                    const accountDesc = chartOfAccounts.find(account => account.id === detail.Account_FK)?.AccountDesc || 'Unknown';

                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td>
                            <input type="hidden" class="account-id" value="${detail.Account_FK}" />
                            <input type="text" class="form-control text-muted" style="background-color: #e9ecef;" value="${accountDesc}" disabled />
                        </td>
                        <td>
                            <input type="text" class="form-control debit-input" placeholder="" ${detail.Debit > 0 ? '' : 'disabled'} />
                        </td>
                        <td>
                            <input type="text" class="form-control credit-input" placeholder="" ${detail.Credit > 0 ? '' : 'disabled'} />
                        </td>
                        `;
                    accountsTableBody.appendChild(newRow);
                });
            })
            .catch(error => console.error('Error loading data:', error));
    }

    addTemplateSelect?.addEventListener('change', event => {
        const selectedTemplateId = event.target.value;
        if (selectedTemplateId) {
            loadTemplateDetails(selectedTemplateId);
        } else {
            if (accountsTableBody) accountsTableBody.innerHTML = '';
            const transactionTypeTextbox = document.getElementById('transactionType');
            if (transactionTypeTextbox) transactionTypeTextbox.outerHTML = '<input type="text" id="transactionType" class="form-control text-muted" style="cursor: not-allowed; background-color: #e9ecef;" value="" readonly />';
        }
    });

    openModalButton?.addEventListener('click', () => {
        if (!modal) {
            console.error('Modal element not found');
            return;
        }
        modal.style.display = 'block';
        loadTransactionTypes().then(loadTemplates);
    });

    cancelButton?.addEventListener('click', () => {
        if (modal) modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    accountsTableBody?.addEventListener('input', event => {
        const target = event.target;
        if (target.classList.contains('debit-input')) {
            const creditInput = target.closest('tr').querySelector('.credit-input');
            if (creditInput) {
                if (target.value) {
                    creditInput.value = '';
                    creditInput.disabled = true;
                } else {
                    creditInput.disabled = false;
                }
            }
        } else if (target.classList.contains('credit-input')) {
            const debitInput = target.closest('tr').querySelector('.debit-input');
            if (debitInput) {
                if (target.value) {
                    debitInput.value = '';
                    debitInput.disabled = true;
                } else {
                    debitInput.disabled = false;
                }
            }
        }
    });

    function fetchTransactionTypeFromTemplate(templateId) {
        if (!templateId) {
            console.error('Template ID is invalid.');
            return null;
        }

        // Simulate fetching transaction type from a backend API or dataset
        const templateDropdown = document.getElementById('addTemplate');
        const selectedOption = templateDropdown.options[templateDropdown.selectedIndex];

        if (selectedOption?.dataset.transactionType) {
            const transactionType = parseInt(selectedOption.dataset.transactionType, 10);
            console.log('TransactionType_FK fetched from template:', transactionType);
            return transactionType;
        }

        console.error('TransactionType_FK not found for the selected template.');
        return null;
    }

    function addJournalEntry() {
        const entryCode = document.getElementById('entryCode')?.value || '';
        const entryDate = document.getElementById('entryDate')?.value || '';
        const entryDescription = document.getElementById('entryDescription')?.value || '';
        const selectedTemplate = document.getElementById('addTemplate')?.value || '';
    
        // Fetch TransactionType_FK from the dynamically updated textbox
        const transactionTypeFk = fetchTransactionTypeFromTemplate(selectedTemplate);
    
        if (!transactionTypeFk) {
            console.error('TransactionType_FK is required and missing.');
            alert('Please select a valid template to set the transaction type.');
            return;
        }
    
        const accountRows = document.querySelectorAll('#accounting-entries table tbody tr');
        const journalDetails = Array.from(accountRows).map(row => {
            const accountId = row.querySelector('.account-id')?.value || '';
            const debitInput = row.querySelector('.debit-input')?.value || '0';
            const creditInput = row.querySelector('.credit-input')?.value || '0';

            return {
                Account_FK: accountId, // Use the Account ID here
                DebitAmount: parseFloat(debitInput),
                CreditAmount: parseFloat(creditInput),
            };
        });
    
        const data = {
            journal_entry: {
                Entry_No: entryCode,
                Entry_Date: entryDate,
                EntryParticulars: entryDescription,
                TRTemplate_FK: selectedTemplate,
                TransactionType_FK: parseInt(transactionTypeFk, 10), // Ensure it's an integer
                EntryStatus_FK: 1, // Default to 1
                Created_By: null, // Nullable for now
            },
            journal_details: journalDetails,
        };
    
        console.log('Submitting journal entry:', data); // Debugging log
    
        fetch('/journalentries/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify(data),
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        console.error('Error saving journal entry:', err);
                        throw new Error('Failed to save journal entry');
                    });
                }
                return response.json();
            })
            .then(savedEntry => {
                console.log('Journal entry saved successfully:', savedEntry);
                alert('Journal entry saved successfully!');
                document.getElementById('addJournalEntriesModal').style.display = 'none';
            })
            .catch(error => {
                console.error('Error during fetch operation:', error);
                alert('An error occurred while saving the journal entry. Please try again.');
            });
    }

    document.getElementById('addTemplate').addEventListener('change', function () {
        const selectedTemplate = this.value;
        const transactionType = fetchTransactionTypeFromTemplate(selectedTemplate);
        console.log('TransactionType_FK fetched from template:', transactionType);
    });

    const addEntryButton = document.getElementById('addEntryBtn');
    if (addEntryButton) {
        addEntryButton.addEventListener('click', addJournalEntry);
    }
});
