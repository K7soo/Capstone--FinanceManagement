document.addEventListener('DOMContentLoaded', () => {
    const csrfToken = getCsrfToken();
    const modal = document.getElementById('addJournalEntriesModal');
    const openModalButton = document.getElementById('openAddJournalEntriesModal');
    const cancelButton = document.querySelector('[data-bs-dismiss="modal"]');
    const accountsTableBody = document.querySelector('#accounting-entries table tbody');
    const addTemplateSelect = document.getElementById('addTemplate');
    const addEntryButton = document.getElementById('addEntryBtn');

    const transactionTypeMap = {}; // Map for TransactionType IDs to names

    // Metronic Style Comment: Adding search functionality for Journal Entries
    document.addEventListener("DOMContentLoaded", function () {
        const searchInput = document.getElementById("searchInput"); // For Journal Entries only
        const tableBody = document.querySelector("#journalEntriesTableBody"); 

        searchInput.addEventListener("input", function () {
            const query = searchInput.value.toLowerCase(); // Get the search input value in lowercase
            const rows = tableBody.querySelectorAll("tr"); // Select all rows in the table body

            let hasResults = false; // Track if there are matching rows

            rows.forEach((row) => {
                const rowText = row.textContent.toLowerCase(); // Get the text content of the row
                if (rowText.includes(query)) {
                    row.style.display = ""; // Show matching row
                    hasResults = true; // Mark that we found a match
                } else {
                    row.style.display = "none"; // Hide non-matching row
                }
            });

            // Show a message if no rows match
            if (!hasResults && query !== "") {
                if (!document.querySelector(".no-results-row")) {
                    const noResultsRow = document.createElement("tr");
                    noResultsRow.classList.add("no-results-row");
                    noResultsRow.innerHTML = `
                    <td colspan="5" style="text-align: center; color: #6c757d;">
                        No matching records found.
                    </td>
                `;
                    tableBody.appendChild(noResultsRow);
                }
            } else {
                const noResultsRow = document.querySelector(".no-results-row");
                if (noResultsRow) {
                    noResultsRow.remove(); // Remove the message if there are results
                }
            }
        });
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
    loadJournalEntries();

    function generateEntryCode() {
        const timestamp = Date.now().toString().slice(-6); // Take the last 6 digits of the timestamp
        return `MNL-JEV-${timestamp}`;
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

    // Fetch all statuses
    function fetchStatuses() {
        return fetch('/entrystatuses/', {
            method: "GET",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch statuses");
                }
                return response.json();
            })
            .catch(error => console.error("Error fetching statuses:", error));
    }

    function loadTemplates() {
        fetch('/journaltemplatefull/?t=' + new Date().getTime(), {
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
                    const accountCode = chartOfAccounts.find(account => account.id === detail.Account_FK)?.AccountCode|| 'Unknown';

                    const newRow = document.createElement('tr');
                    newRow.innerHTML = `
                        <td>
                            <input type="hidden" class="account-id" value="${detail.Account_FK}" />
                            <input type="text" class="form-control text-muted" style="background-color: #e9ecef;" value="${accountDesc}" disabled />
                        </td>
                        <td>
                            <input type="hidden" class="account-id" value="${detail.Account_FK}" />
                            <input type="text" class="form-control text-muted" style="background-color: #e9ecef;" value="${accountCode}" disabled />
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

    function loadJournalEntries() {
        Promise.all([
            fetch('/journalentriessort/', {
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
            })
        ])
            .then(([entries, statuses]) => {
                const statusMap = {};
                statuses.forEach(status => {
                    statusMap[status.id] = status.Status_Name;
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

                    // Format date to MM-DD-YYYY
                    const formattedDate = new Date(journalEntry.Entry_Date).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                    });

                    // Add a row for the journal entry
                    const entryRow = document.createElement("tr");
                    entryRow.setAttribute("data-id", journalEntry.id);
                    entryRow.innerHTML = `
                        <td>${formattedDate}</td>
                        <td>${journalEntry.Entry_No}</td>
                        <td>${journalEntry.EntryParticulars}</td>
                        <td>${entryStatus}</td>
                        <td class="text-center align-middle">
                            <div class="dropdown d-inline-block">
                                <button
                                    class="btn btn-secondary dropdown-toggle btn-sm d-flex align-items-center justify-content-between"
                                    type="button"
                                    id="dropdownMenuButton${journalEntry.id}"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    style="border-radius: 8px; font-weight: 500; font-size: 0.875rem; padding: 0.5rem 1rem; position: relative; ">
                                    <span>MENU</span>
                                    <i class="bi bi-caret-down-fill ms-1" style="vertical-align: middle;"></i>
                                </button>
                                <ul
                                    class="dropdown-menu"
                                    aria-labelledby="dropdownMenuButton"${journalEntry.id}"
                                    style="border: none; border-radius: 8px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); font-size: 0.875rem; min-width: 200px; padding: 0.75rem 0">
                                    <li>
                                        <button
                                            class="dropdown-item text-success print-entry"
                                            type="button"
                                            data-entry-id="${journalEntry.id}"
                                            style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;">
                                            <i class="bi bi-printer me-2"></i>Print
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            class="dropdown-item text-primary view-entry"
                                            type="button"
                                            data-entry-id="${journalEntry.id}"
                                            style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;">
                                            <i class="bi bi-eye me-2"></i>View
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            class="dropdown-item text-warning edit-entry"
                                            type="button"
                                            data-bs-toggle="modal"
                                            data-bs-target="#editTemplateModal"
                                            data-entry-id="${journalEntry.id}"
                                            style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;">
                                            <i class="bi bi-pencil-square me-2"></i>Edit
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            class="dropdown-item text-danger delete-entry"
                                            type="button"
                                            data-entry-id="${journalEntry.id}"
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
                attachActionListeners();
            })
            .catch(error => console.error("Error loading journal entries:", error));
    }


    function addJournalEntry() {
        const entryCode = generateEntryCode();
        const entryDate = document.getElementById('entryDate')?.value || '';
        const entryDescription = document.getElementById('entryDescription')?.value || '';
        const selectedTemplate = document.getElementById('addTemplate')?.value || '';

        // Fetch TransactionType_FK from the dynamically updated textbox
        const transactionTypeFk = fetchTransactionTypeFromTemplate(selectedTemplate);

        if (!transactionTypeFk) {
            console.error('TransactionType_FK is required and missing.');
            Swal.fire({
                title: 'Invalid Template',
                text: 'Please select a valid template to set the transaction type.',
                icon: 'warning',
                confirmButtonText: 'OK',
                buttonsStyling: true
            });
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
                Swal.fire({
                    title: 'Success!',
                    text: 'Journal entry saved successfully!',
                    icon: 'success',
                    confirmButtonText: 'OK',
                }).then(() => {
                    // Hide modal and reload entries after user confirms success
                    const modal = document.getElementById('addJournalEntriesModal');
                    const bootstrapModal = bootstrap.Modal.getInstance(modal);
                    if (bootstrapModal) {
                        bootstrapModal.hide();
                    }
                    loadJournalEntries();
                });
            })
            .catch(error => {
                console.error('Error during fetch operation:', error);
                Swal.fire({
                    title: 'Error!',
                    text: 'An error occurred while saving the journal entry. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            });
        const modal = document.getElementById('addJournalEntriesModal');
        const bootstrapModal = bootstrap.Modal.getInstance(modal);

        if (bootstrapModal) {
            bootstrapModal.hide();
        }

    }

    function printEntry(entryId) {
        // Fetch chart of accounts first
        loadChartOfAccounts().then((accountMap) => {
            fetch(`/journalentries/${entryId}/`, {
                method: "GET",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch journal entry details for printing");
                    }
                    return response.json();
                })
                .then((data) => {
                    const mappedDetails = data.journal_details.map((detail) => {
                        const account = Object.values(accountMap).find(acc => acc.id === detail.Account_FK) || {
                            AccountCode: "N/A",
                            AccountDesc: "N/A",
                        };

                        const debitAmount =
                            detail.DebitAmount > 0
                                ? parseFloat(detail.DebitAmount).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })
                                : ""; // Leave blank if zero
                        const creditAmount =
                            detail.CreditAmount > 0
                                ? parseFloat(detail.CreditAmount).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })
                                : ""; // Leave blank if zero

                        return {
                            accountDesc: account.AccountDesc,
                            accountCode: account.AccountCode,
                            debitAmount: debitAmount,
                            creditAmount: creditAmount,
                            isCredit: creditAmount !== "", // Mark credited accounts for indentation
                        };
                    });

                    const rows = 10; // Total number of rows to display
                    const particulars = data.journal_entry.EntryParticulars || "N/A";

                    // Add empty rows to make up the difference if there are fewer than 10 rows
                    const emptyRowCount = Math.max(rows - mappedDetails.length - 2, 0); // Reserve 2 rows for particulars and totals
                    for (let i = 0; i < emptyRowCount; i++) {
                        mappedDetails.push({
                            accountDesc: "",
                            accountCode: "",
                            debitAmount: "",
                            creditAmount: "",
                            isCredit: false, // No indentation for empty rows
                        });
                    }

                    // Totals Calculation
                    const totalDebit = mappedDetails
                        .reduce(
                            (sum, detail) =>
                                sum + (detail.debitAmount ? parseFloat(detail.debitAmount.replace(/,/g, "")) : 0),
                            0
                        )
                        .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                    const totalCredit = mappedDetails
                        .reduce(
                            (sum, detail) =>
                                sum + (detail.creditAmount ? parseFloat(detail.creditAmount.replace(/,/g, "")) : 0),
                            0
                        )
                        .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                    const printWindow = window.open("", "_blank");
                    printWindow.document.write(`
                    <html>
                        <head>
                            <title>Print Journal Entry Voucher</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    margin: 20px;
                                    padding: 0;
                                    box-sizing: border-box;
                                }
                                table {
                                    width: 90%; /* Adjusted width */
                                    border-collapse: collapse;
                                    margin: 20px auto; /* Center table */
                                    font-size: 14px;
                                }
                                th, td {
                                    border: 1px solid #000;
                                    padding: 8px;
                                    height: 30px; /* Ensures uniform row height */
                                }
                                th {
                                    font-weight: bold;
                                    background-color: #f2f2f2;
                                }
                                .totals {
                                    font-weight: bold;
                                }
                                .header, .footer {
                                    margin-bottom: 20px;
                                    text-align: center;
                                }
                                .header h1 {
                                    margin: 5px 0;
                                    font-size: 18px; /* Adjusted title font size */
                                }
                                .header p {
                                    margin: 2px 0;
                                }
                                .credit-indent {
                                    text-indent: 20px; /* Indent credited accounts */
                                }
                                .right-align {
                                    text-align: right; /* Right align amounts */
                                }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>JOURNAL ENTRY VOUCHER</h1>
                                <p>Company: Tikme Dine</p>
                                <p>Date: ${data.journal_entry.Entry_Date || "N/A"}</p>
                                <p>JEV No.: ${data.journal_entry.Entry_No || "N/A"}</p>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Accounts</th>
                                        <th>Account Code</th>
                                        <th class="right-align">Debit</th>
                                        <th class="right-align">Credit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${mappedDetails
                            .map(
                                (detail) => `
                                                <tr>
                                                    <td class="${detail.isCredit ? "credit-indent" : ""}">
                                                        ${detail.accountDesc}
                                                    </td>
                                                    <td>${detail.accountCode}</td>
                                                    <td class="right-align">${detail.debitAmount}</td>
                                                    <td class="right-align">${detail.creditAmount}</td>
                                                </tr>
                                            `
                            )
                            .join("")}
                                    <tr>
                                        <td colspan="4">Particulars: ${particulars}</td>
                                    </tr>
                                    <tr class="totals">
                                        <td colspan="2">TOTAL</td>
                                        <td class="right-align">${totalDebit}</td>
                                        <td class="right-align">${totalCredit}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="footer">
                                <p><strong>Prepared By:</strong> ${data.journal_entry.Created_By || "N/A"}</p>
                                <p><strong>Approved By:</strong> ______________________</p>
                            </div>
                        </body>
                    </html>
                `);
                    printWindow.document.close();
                    printWindow.print();
                })
                .catch((error) => console.error("Error preparing print data:", error));
        });
    }

    function viewEntry(entryId) {
        loadChartOfAccounts().then((accountMap) => {
            fetch(`/journalentries/${entryId}/`, {
                method: "GET",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch journal entry details");
                    }
                    return response.json();
                })
                .then((data) => {
                    // Populate particulars and remarks
                    const dropdown = document.getElementById("statusDropdown");
                    fetchStatuses()
                        .then((statuses) => {
                            dropdown.innerHTML = "";
                            statuses.forEach((status) => {
                                const option = document.createElement("option");
                                option.value = status.id;
                                option.textContent = status.Status_Name;
                                if (status.id === data.journal_entry.EntryStatus_FK) {
                                    option.selected = true;
                                }
                                dropdown.appendChild(option);
                            });
                        })
                        .catch((error) =>
                            console.error("Error fetching statuses for dropdown:", error)
                        );

                    // Populate modal fields
                    document.getElementById("jevDate").textContent = new Date(
                        data.journal_entry.Entry_Date
                    ).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                    });
                    document.getElementById("jevNumber").textContent =
                        data.journal_entry.Entry_No || "N/A";
                    document.getElementById("remarks").value =
                        data.journal_entry.Review_Remarks || "";

                    // Map details and format amounts
                    const mappedDetails = data.journal_details.map((detail) => {
                        const account = Object.values(accountMap).find(acc => acc.id === detail.Account_FK) || {
                            AccountCode: "N/A",
                            AccountDesc: "N/A",
                        };
                        return {
                            accountDesc: account.AccountDesc,
                            accountCode: account.AccountCode,
                            debitAmount:
                                detail.DebitAmount > 0
                                    ? parseFloat(detail.DebitAmount).toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })
                                    : "",
                            creditAmount:
                                detail.CreditAmount > 0
                                    ? parseFloat(detail.CreditAmount).toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })
                                    : "",
                        };
                    });

                    // Render the table
                    const accountTableBody = document.getElementById("jevAccountTableBody");
                    accountTableBody.innerHTML = mappedDetails
                        .map(
                            (detail) => `
                            <tr>
                                <td>${detail.accountDesc}</td>
                                <td>${detail.accountCode}</td>
                                <td>${detail.debitAmount}</td>
                                <td>${detail.creditAmount}</td>
                            </tr>
                        `
                        )
                        .join("");

                    // Add totals and particulars row
                    accountTableBody.insertAdjacentHTML(
                        "beforeend",
                        `
                        <tr>
                            <td colspan="4">Particulars: ${data.journal_entry.EntryParticulars || "N/A"
                        }</td>
                        </tr>
                        <tr class="totals">
                            <td colspan="2">TOTAL</td>
                            <td>${mappedDetails
                            .reduce(
                                (sum, detail) =>
                                    sum +
                                    (detail.debitAmount
                                        ? parseFloat(detail.debitAmount.replace(/,/g, ""))
                                        : 0),
                                0
                            )
                            .toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}</td>
                            <td>${mappedDetails
                            .reduce(
                                (sum, detail) =>
                                    sum +
                                    (detail.creditAmount
                                        ? parseFloat(detail.creditAmount.replace(/,/g, ""))
                                        : 0),
                                0
                            )
                            .toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}</td>
                        </tr>
                        `
                    );

                    // Show the modal
                    const modalElement = document.getElementById("jevApprovalModal");
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();

                    // Ensure backdrop is removed properly on modal hide
                    modalElement.addEventListener("hidden.bs.modal", () => {
                        // Remove lingering modal backdrops
                        document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
                            backdrop.remove();
                        });
                        // Remove modal-specific body classes
                        document.body.classList.remove("modal-open");
                        document.body.style.paddingRight = "";
                    });

                    // Close another modal (addJournalEntriesModal) if open
                    const addEntriesModalElement = document.getElementById("addJournalEntriesModal");
                    if (addEntriesModalElement) {
                        const bootstrapAddEntriesModal =
                            bootstrap.Modal.getInstance(addEntriesModalElement);
                        if (bootstrapAddEntriesModal) {
                            bootstrapAddEntriesModal.hide();
                        }
                    }
                })
                .catch((error) =>
                    console.error("Error fetching journal entry details:", error)
                );
        });
    }

    function editEntry(entryId) {
        loadChartOfAccounts().then((accountMap) => {
            fetch(`/journalentries/${entryId}/`, {
                method: "GET",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch journal entry details");
                    }
                    return response.json();
                })
                .then((data) => {
                    const { journal_entry, journal_details } = data;

                    // Populate the modal fields
                    document.getElementById("jevEditDate").textContent = new Date(journal_entry.Entry_Date)
                        .toLocaleDateString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                        });
                    document.getElementById("jevEditNumber").textContent =
                        journal_entry.Entry_No || "N/A";
                    document.getElementById("editRemarks").value =
                        journal_entry.Review_Remarks || "";

                    // Populate status dropdown
                    const dropdown = document.getElementById("statusEditDropdown");
                    fetchStatuses()
                        .then((statuses) => {
                            dropdown.innerHTML = "";
                            statuses.forEach((status) => {
                                const option = document.createElement("option");
                                option.value = status.id;
                                option.textContent = status.Status_Name;
                                if (status.id === journal_entry.EntryStatus_FK) {
                                    option.selected = true;
                                }
                                dropdown.appendChild(option);
                            });
                        })
                        .catch((error) =>
                            console.error("Error fetching statuses for dropdown:", error)
                        );

                    const accountTableBody = document.getElementById("jevEditAccountTableBody");
                    accountTableBody.innerHTML = ""; // Clear previous data

                    // Map details and render rows
                    const mappedDetails = journal_details.map((detail) => {
                        const account = accountMap[detail.Account_FK] || {
                            AccountCode: "N/A",
                            AccountDesc: "N/A",
                        };
                        return {
                            accountDesc: account.AccountDesc,
                            accountCode: account.AccountCode,
                            debitAmount: parseFloat(detail.DebitAmount) || 0,
                            creditAmount: parseFloat(detail.CreditAmount) || 0,
                            accountId: detail.Account_FK,
                        };
                    });

                    mappedDetails.forEach((detail) => {
                        const row = document.createElement("tr");

                        // Account Description
                        const accountDescCell = document.createElement("td");
                        accountDescCell.textContent = detail.accountDesc;
                        row.appendChild(accountDescCell);

                        // Account Code
                        const accountCodeCell = document.createElement("td");
                        accountCodeCell.textContent = detail.accountCode;
                        row.appendChild(accountCodeCell);

                        // Debit Amount
                        const debitCell = document.createElement("td");
                        const debitInput = document.createElement("input");
                        debitInput.type = "number";
                        debitInput.value = detail.debitAmount.toFixed(2);
                        debitInput.classList.add("form-control", "debit-input");
                        if (detail.debitAmount === 0) debitInput.disabled = true;
                        debitCell.appendChild(debitInput);
                        row.appendChild(debitCell);

                        // Credit Amount
                        const creditCell = document.createElement("td");
                        const creditInput = document.createElement("input");
                        creditInput.type = "number";
                        creditInput.value = detail.creditAmount.toFixed(2);
                        creditInput.classList.add("form-control", "credit-input");
                        if (detail.creditAmount === 0) creditInput.disabled = true;
                        creditCell.appendChild(creditInput);
                        row.appendChild(creditCell);

                        accountTableBody.appendChild(row);

                        detail.debitInput = debitInput;
                        detail.creditInput = creditInput;
                    });

                    // Add totals and particulars row
                    const particularsRow = document.createElement("tr");
                    particularsRow.innerHTML = `
                        <td colspan="4">Particulars: ${journal_entry.EntryParticulars || "N/A"}</td>
                    `;
                    accountTableBody.appendChild(particularsRow);

                    const totalRow = document.createElement("tr");
                    totalRow.classList.add("totals");
                    totalRow.innerHTML = `
                        <td colspan="2">TOTAL</td>
                        <td id="debitTotal">${mappedDetails
                            .reduce((sum, detail) => sum + detail.debitAmount, 0)
                            .toFixed(2)}</td>
                        <td id="creditTotal">${mappedDetails
                            .reduce((sum, detail) => sum + detail.creditAmount, 0)
                            .toFixed(2)}</td>
                    `;
                    accountTableBody.appendChild(totalRow);

                    // Update totals on input change
                    accountTableBody.addEventListener("input", () => {
                        let totalDebit = 0;
                        let totalCredit = 0;

                        mappedDetails.forEach((detail) => {
                            const debitValue = parseFloat(detail.debitInput.value) || 0;
                            const creditValue = parseFloat(detail.creditInput.value) || 0;
                            totalDebit += debitValue;
                            totalCredit += creditValue;
                        });

                        document.getElementById("debitTotal").textContent = totalDebit.toFixed(2);
                        document.getElementById("creditTotal").textContent = totalCredit.toFixed(2);
                    });

                    // Show the modal
                    const modalElement = document.getElementById("jevEditModal");
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();

                    // Add Save Changes button
                    const modalFooter = modalElement.querySelector(".modal-footer");
                    modalFooter.innerHTML = ""; // Clear existing buttons
                    const saveButton = document.createElement("button");

                    saveButton.textContent = "Save Changes";
                    saveButton.classList.add("btn", "btn-primary");
                    saveButton.addEventListener("click", () => {
                        let totalDebit = 0;
                        let totalCredit = 0;

                        // Calculate total debit and credit amounts
                        mappedDetails.forEach((detail) => {
                            const debitValue = parseFloat(detail.debitInput.value) || 0;
                            const creditValue = parseFloat(detail.creditInput.value) || 0;
                            totalDebit += debitValue;
                            totalCredit += creditValue;
                        });

                        // Validate if totals match
                        if (totalDebit.toFixed(2) !== totalCredit.toFixed(2)) {
                            Swal.fire({
                                title: "Error!",
                                text: "Debit and Credit totals must be equal before saving.",
                                icon: "error",
                                confirmButtonText: "OK",
                            });
                            return; // Prevent submission if totals do not match
                        }

                        // Prepare payload for the PUT request
                        const updatedDetails = mappedDetails.map((detail) => ({
                            Account_FK: detail.accountId,
                            DebitAmount: parseFloat(detail.debitInput.value) || 0,
                            CreditAmount: parseFloat(detail.creditInput.value) || 0,
                        }));

                        const payload = {
                            journal_entry: {
                                Entry_ID: journal_entry.Entry_ID,
                                Review_Remarks: document.getElementById("editRemarks").value || "",
                                EntryStatus_FK: dropdown.value,
                            },
                            journal_details: updatedDetails,
                        };

                        console.log("Sending payload:", JSON.stringify(payload, null, 2));

                        // Send the PUT request
                        fetch(`/journalentries/${entryId}/`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                "X-CSRFToken": getCsrfToken(),
                            },
                            body: JSON.stringify(payload),
                        })
                            .then((response) => {
                                if (!response.ok) {
                                    return response.json().then((err) => {
                                        console.error("Backend validation failed:", err);
                                        throw new Error("Failed to save changes");
                                    });
                                }
                                return response.json();
                            })
                            .then((updatedEntry) => {
                                console.log("Successfully updated entry:", updatedEntry);
                                Swal.fire({
                                    title: "Success!",
                                    text: "Changes saved successfully.",
                                    icon: "success",
                                    confirmButtonText: "OK",
                                }).then(() => {
                                    modal.hide();
                                    loadJournalEntries(); // Reload the entries table
                                });
                            })
                            .catch((error) => {
                                console.error("Error saving changes:", error);
                                Swal.fire({
                                    title: "Error!",
                                    text: "Failed to save changes. Please try again.",
                                    icon: "error",
                                    confirmButtonText: "OK",
                                });
                            });
                    });
                    modalFooter.appendChild(saveButton);
                })
                .catch((error) =>
                    console.error("Error fetching journal entry details:", error)
                );
        });
    }


    function deleteEntry(entryId) {
        Swal.fire({
            title: "Are you sure?",
            text: "This action will permanently delete the journal entry.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/journalentriesdetail/${entryId}/`, {
                    method: "DELETE",
                    headers: {
                        "X-CSRFToken": getCsrfToken(), // Ensure CSRF token is passed
                    },
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Failed to delete journal entry");
                        }
                        Swal.fire("Deleted!", "The journal entry has been deleted.", "success");
                        loadJournalEntries(); // Reload the table after deletion
                    })
                    .catch((error) => {
                        console.error("Error deleting journal entry:", error);
                        Swal.fire(
                            "Error!",
                            "An error occurred while trying to delete the journal entry.",
                            "error"
                        );
                    });
            }
        });
    }


    function attachActionListeners() {
        const viewButtons = document.querySelectorAll(".view-entry");
        const printButtons = document.querySelectorAll(".print-entry");
        const editButtons = document.querySelectorAll(".edit-entry");
        const deleteButtons = document.querySelectorAll(".delete-entry");

        viewButtons.forEach(button => {
            button.addEventListener("click", event => {
                const entryId = event.target.dataset.entryId;
                viewEntry(entryId);
            });
        });

        printButtons.forEach(button => {
            button.addEventListener("click", event => {
                const entryId = event.target.dataset.entryId;
                printEntry(entryId);
            });
        });

        editButtons.forEach(button => {
            button.addEventListener("click", event => {
                const entryId = event.target.dataset.entryId;
                editEntry(entryId);
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener("click", event => {
                const entryId = event.target.dataset.entryId;
                deleteEntry(entryId);
            });
        });
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

    document.getElementById('addTemplate').addEventListener('change', function () {
        const selectedTemplate = this.value;
        const transactionType = fetchTransactionTypeFromTemplate(selectedTemplate);
        console.log('TransactionType_FK fetched from template:', transactionType);
    });

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

    if (addEntryButton) {
        addEntryButton.addEventListener('click', () => {
            console.log("Add Journal Entry button clicked"); // Debugging
    
            // Get form elements safely using correct IDs
            const dateInput = document.querySelector('#entryDate');
            const particularsInput = document.querySelector('#entryDescription');
            const templateInput = document.querySelector('#addTemplate');
    
            // Ensure elements exist before accessing value
            const date = dateInput ? dateInput.value.trim() : "";
            const particulars = particularsInput ? particularsInput.value.trim() : "";
            const template = templateInput ? templateInput.value.trim() : "";
    
            // Validate required fields
            if (!date || !particulars || !template || template === "Select Template") {
                console.error("Validation failed: Missing required fields"); // Debugging
                Swal.fire({
                    title: 'Validation Error',
                    text: 'All fields (Date, Particulars, and Template) must be filled before adding a journal entry.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }
    
            // Gather journal details for validation
            const accountRows = document.querySelectorAll('#accounting-entries table tbody tr');
    
            if (accountRows.length === 0) {
                console.error("Validation failed: No accounts added"); // Debugging
                Swal.fire({
                    title: 'Validation Error',
                    text: 'Please add at least one account entry before submitting.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }
    
            const journalDetails = Array.from(accountRows).map(row => {
                const debitInput = row.querySelector('.debit-input');
                const creditInput = row.querySelector('.credit-input');
    
                return {
                    DebitAmount: debitInput ? parseFloat(debitInput.value.trim() || '0') : 0,
                    CreditAmount: creditInput ? parseFloat(creditInput.value.trim() || '0') : 0,
                };
            });
    
            console.log("Journal Details:", journalDetails); // Debugging
    
            // Ensure at least one row has a debit or credit value
            const hasValidEntry = journalDetails.some(detail => detail.DebitAmount > 0 || detail.CreditAmount > 0);
    
            if (!hasValidEntry) {
                console.error("Validation failed: No debit or credit values entered"); // Debugging
                Swal.fire({
                    title: 'Validation Error',
                    text: 'At least one Debit or Credit value must be entered.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }
    
            // Validate debit and credit amounts
            const totalDebit = journalDetails.reduce((sum, detail) => sum + detail.DebitAmount, 0);
            const totalCredit = journalDetails.reduce((sum, detail) => sum + detail.CreditAmount, 0);
    
            if (totalDebit !== totalCredit) {
                console.error("Validation failed: Debit and credit not balanced"); // Debugging
                Swal.fire({
                    title: 'Validation Error',
                    text: 'The total debit and credit amounts must be equal.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return;
            }
    
            // Proceed to add journal entry if validation passes
            console.log("Validation passed: Adding journal entry"); // Debugging
            Swal.fire({
                title: 'Success',
                text: 'Journal entry added successfully!',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                addJournalEntry();
            });
        });
    }
    
    
});
