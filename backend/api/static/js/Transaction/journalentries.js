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
                transactionTypeSelect.outerHTML = `<input type="text" id="transactionType" class="form-control text-muted"; background-color: #e9ecef;" value="${transactionTypeName}" disabled />`;

                accountsTableBody.innerHTML = ''; // Clear existing rows

                const detailAccounts = templateData.details || [];
                detailAccounts.forEach(detail => {
                    const accountDesc = chartOfAccounts.find(account => account.id === detail.Account_FK)?.AccountDesc || 'Unknown';

                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td>
                            <input type="text" class="form-control text-muted"; background-color: #e9ecef;" value="${accountDesc}" disabled />
                        </td>
                        <td><input type="text" class="form-control debit-input" value="${detail.Debit > 0 ? '' : ''}" ${detail.Debit > 0 ? '' : 'disabled'} /></td>
                        <td><input type="text" class="form-control credit-input" value="${detail.Credit > 0 ? '' : ''}" ${detail.Credit > 0 ? '' : 'disabled'} /></td>
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
});
