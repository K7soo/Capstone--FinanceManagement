document.addEventListener('DOMContentLoaded', () => {
    const csrfToken = getCsrfToken();
    const modal = document.getElementById('addJournalEntriesModal');
    const openModalButton = document.getElementById('openAddJournalEntriesModal');
    const cancelButton = document.querySelector('[data-bs-dismiss="modal"]');
    const accountsTableBody = document.querySelector('#accounting-entries table tbody');
    const addTemplateSelect = document.getElementById('addTemplate');
    const transactionTypeSelect = document.getElementById('transactionType');

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
                if (!transactionTypeSelect || !accountsTableBody) {
                    console.error('Transaction Type Select or Accounts Table Body element not found');
                    return;
                }
                transactionTypeSelect.innerHTML = `<option value="${templateData.template.TransactionType_FK}">${transactionTypeMap[templateData.template.TransactionType_FK] || 'Unknown'}</option>`;

                accountsTableBody.innerHTML = ''; // Clear existing rows

                const detailAccounts = templateData.details || [];
                detailAccounts.forEach(detail => {
                    const accountOptions = chartOfAccounts.map(account => `
                        <option value="${account.id}" ${account.id === detail.Account_FK ? 'selected' : ''}>${account.AccountDesc}</option>
                    `).join('');

                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td>
                            <select class="form-select account-dropdown">
                                ${accountOptions}
                            </select>
                        </td>
                        <td><input type="text" class="form-control debit-input" value="${detail.Debit}" ${detail.Debit > 0 ? '' : 'disabled'} /></td>
                        <td><input type="text" class="form-control credit-input" value="${detail.Credit}" ${detail.Credit > 0 ? '' : 'disabled'} /></td>
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
            if (transactionTypeSelect) transactionTypeSelect.innerHTML = '<option value="">Select Transaction Type</option>';
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
});
