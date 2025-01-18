document.addEventListener('DOMContentLoaded', () => {
    const csrfToken = getCsrfToken();
    const modal = document.getElementById('addJournalEntriesModal');
    const openModalButton = document.getElementById('openAddJournalEntriesModal');
    const cancelButton = document.querySelector('[data-bs-dismiss="modal"]');
    const accountsTableBody = document.querySelector('#accounting-entries table tbody');
    const addTemplateSelect = document.getElementById('addTemplate');

    const transactionTypeMap = {}; // Map for TransactionType IDs to names
    document.addEventListener("DOMContentLoaded", function () {
        const particularsTab = document.getElementById("particulars-tab");
        if (particularsTab) {
            particularsTab.click(); // Programmatically activate the Particulars tab
        }
    });

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
                if (target.value.trim() !== '') {
                    creditInput.value = ''; // Clear the value
                    creditInput.disabled = true; // Keep it disabled
                } else {
                    creditInput.disabled = true; // Ensure it stays disabled
                }
            }
        } else if (target.classList.contains('credit-input')) {
            const debitInput = target.closest('tr').querySelector('.debit-input');
            if (debitInput) {
                if (target.value.trim() !== '') {
                    debitInput.value = ''; // Clear the value
                    debitInput.disabled = true; // Keep it disabled
                } else {
                    debitInput.disabled = true; // Ensure it stays disabled
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
        const modal = document.getElementById('addJournalEntriesModal');
        const bootstrapModal = bootstrap.Modal.getInstance(modal);

        if (bootstrapModal) {
            bootstrapModal.hide();
        }

    }

    document.getElementById('addTemplate').addEventListener('change', function () {
        const selectedTemplate = this.value;
        const transactionType = fetchTransactionTypeFromTemplate(selectedTemplate);
        console.log('TransactionType_FK fetched from template:', transactionType);
    });

    function sortTableByColumn(columnIndex) {
        const table = document.querySelector('.journal-entries-table tbody');
        const rows = Array.from(table.querySelectorAll('tr'));

        const sortedRows = rows.sort((a, b) => {
            const aValue = a.children[columnIndex].textContent;
            const bValue = b.children[columnIndex].textContent;

            return columnIndex === 0 // If sorting by date
                ? new Date(aValue) - new Date(bValue)
                : aValue.localeCompare(bValue);
        });

        // Reattach sorted rows
        table.innerHTML = '';
        sortedRows.forEach(row => table.appendChild(row));
    }

    function loadJournalEntries() {
        Promise.all([
            fetch('/journalentries/', {
                method: "GET",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            }).then(response => {
                if (!response.ok) throw new Error("Failed to load journal entries");
                return response.json();
            }),
            fetch('/entrystatuses/', {
                method: "GET",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            }).then(response => {
                if (!response.ok) throw new Error("Failed to load entry statuses");
                return response.json();
            }),
            fetch('/journaltemplate/', {
                method: "GET",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            }).then(response => {
                if (!response.ok) throw new Error("Failed to load journal templates");
                return response.json();
            }),
        ])
            .then(([entries, statuses, templates]) => {
                const statusMap = {};
                statuses.forEach(status => {
                    statusMap[status.id] = status.Status_Name;
                });

                const templateMap = {};
                templates.forEach(template => {
                    templateMap[template.id] = template.TRTemplateCode;
                });

                const tableBody = document.querySelector("#journalEntriesTable tbody");
                if (!tableBody) {
                    console.error("Table body not found.");
                    return;
                }
                tableBody.innerHTML = ""; // Clear existing rows

                entries.forEach(entry => {
                    const journalEntry = entry.journal_entry;
                    const entryStatus = statusMap[journalEntry.EntryStatus_FK] || "N/A";
                    const templateCode = templateMap[journalEntry.TRTemplate_FK] || "N/A";

                    // Add a row for the journal entry
                    const entryRow = document.createElement("tr");
                    entryRow.setAttribute("data-id", journalEntry.id);
                    entryRow.innerHTML = `
                        <td>${journalEntry.Entry_Date}</td>
                        <td>${journalEntry.Entry_No}</td>
                        <td>${journalEntry.EntryParticulars}</td>
                        <td>${entryStatus}</td>
                        <td>${templateCode}</td>
                        <td class="text-center align-middle">
                            <div class="dropdown d-inline-block">
                                <button
                                    class="btn btn-secondary dropdown-toggle btn-sm d-flex align-items-center justify-content-between"
                                    type="button"
                                    id="dropdownMenuButton${journalEntry.id}"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    style="border-radius: 8px; font-weight: 500; font-size: 0.875rem; padding: 0.5rem 1rem; position: relative; z-index: 1050;">
                                    <span>MENU</span>
                                    <i class="bi bi-caret-down-fill ms-1" style="vertical-align: middle;"></i>
                                </button>
                                <ul
                                    class="dropdown-menu"
                                    aria-labelledby="dropdownMenuButton${journalEntry.id}"
                                    style="border: none; border-radius: 8px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); font-size: 0.875rem; min-width: 200px; padding: 0.75rem 0; z-index: 1060;">
                                    <li>
                                        <button
                                            class="dropdown-item text-info"
                                            type="button"
                                            onclick="viewTemplate(${journalEntry.id})"
                                            style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;">
                                            <i class="bi bi-eye me-2"></i>View
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            class="dropdown-item text-warning"
                                            type="button"
                                            data-bs-toggle="modal"
                                            data-bs-target="#editTemplateModal"
                                            onclick="editTemplate(${journalEntry.id})"
                                            style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;">
                                            <i class="bi bi-pencil-square me-2"></i>Edit
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            class="dropdown-item text-danger"
                                            type="button"
                                            onclick="deleteTemplate(${journalEntry.id})"
                                            style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;">
                                            <i class="bi bi-trash-fill me-2"></i>Delete
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </td>
                    `;
                    tableBody.appendChild(entryRow);
                });

                attachActionListeners(); // Attach event listeners to action buttons
            })
            .catch(error => console.error("Error loading journal entries:", error));
    }

    function attachActionListeners() {
        const viewButtons = document.querySelectorAll(".view-entry");
        const editButtons = document.querySelectorAll(".edit-entry");
        const deleteButtons = document.querySelectorAll(".delete-entry");

        viewButtons.forEach(button => {
            button.addEventListener("click", event => {
                const entryId = event.target.dataset.entryId;
                console.log(`Viewing entry with ID: ${entryId}`);
                // Logic for viewing the entry (modal or page redirection)
            });
        });

        editButtons.forEach(button => {
            button.addEventListener("click", event => {
                const entryId = event.target.dataset.entryId;
                console.log(`Editing entry with ID: ${entryId}`);
                // Logic for editing the entry
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener("click", event => {
                const entryId = event.target.dataset.entryId;
                console.log(`Deleting entry with ID: ${entryId}`);
                // Logic for deleting the entry
            });
        });
    }

    function sortTable(tableId, ascending = true) {
        const table = document.getElementById(tableId);

        if (!table) {
            console.error(`Table with id '${tableId}' not found.`);
            return;
        }

        const tbody = table.querySelector("tbody");

        if (!tbody) {
            console.error(`Table body not found for table with id '${tableId}'.`);
            return;
        }

        const rows = Array.from(tbody.querySelectorAll("tr"));

        rows.sort((a, b) => {
            const aDate = new Date(a.cells[0]?.innerText.trim()); // Assuming date is in the first column
            const bDate = new Date(b.cells[0]?.innerText.trim());

            if (aDate < bDate) return ascending ? -1 : 1;
            if (aDate > bDate) return ascending ? 1 : -1;
            return 0;
        });

        rows.forEach(row => tbody.appendChild(row));
    }

    const modalElement = document.getElementById('addJournalEntriesModal');

    // Add an event listener to clear the modal when it's hidden
    modalElement.addEventListener('hidden.bs.modal', () => {
        // Clear all input fields in the modal
        modalElement.querySelectorAll('input, textarea, select').forEach((field) => {
            field.value = '';
        });

        // Clear the accounts table body
        const accountsTableBody = modalElement.querySelector('#accounting-entries table tbody');
        if (accountsTableBody) {
            accountsTableBody.innerHTML = '';
        }

        // Reset the transaction type textbox to its default state
        const transactionTypeTextbox = document.getElementById('transactionType');
        if (transactionTypeTextbox) {
            transactionTypeTextbox.outerHTML = '<input type="text" id="transactionType" class="form-control text-muted" style="cursor: not-allowed; background-color: #e9ecef;" value="" readonly />';
        }

        // Reset the template dropdown
        const addTemplateSelect = document.getElementById('addTemplate');
        if (addTemplateSelect) {
            addTemplateSelect.value = '';
        }
    });

    // Call the function on page load
    document.addEventListener('DOMContentLoaded', loadJournalEntries);

    const addEntryButton = document.getElementById('addEntryBtn');
    if (addEntryButton) {
        addEntryButton.addEventListener('click', addJournalEntry);
    }

    loadJournalEntries();
});
