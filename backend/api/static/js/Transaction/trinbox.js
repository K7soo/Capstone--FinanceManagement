document.addEventListener("DOMContentLoaded", () => {
    const csrfToken = getCsrfToken();
    // Metronic Style Comment: Adding search functionality for Trinbox
    document.addEventListener("DOMContentLoaded", function () {
        const searchInput = document.getElementById("searchTrinbox"); // Select the input with the new ID
        const tableBody = document.getElementById("payment-records"); // Select the table body

        searchInput.addEventListener("input", function () {
            const query = searchInput.value.toLowerCase().trim(); // Get the search input value in lowercase and trim spaces
            const rows = tableBody.querySelectorAll("tr"); // Select all rows in the table body

            let hasResults = false; // Track if there are matching rows

            rows.forEach((row) => {
                const cells = row.querySelectorAll("td"); // Select all table cells in the row
                let rowMatches = false;

                // Check if any cell in the row contains the search query
                cells.forEach((cell) => {
                    if (cell.textContent.toLowerCase().includes(query)) {
                        rowMatches = true;
                    }
                });

                if (rowMatches || query === "") {
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
    
    let chartOfAccounts = {};
    let journalTemplates = {};
    let entryStatuses = {};

    // Fetch payment records from the backend
    function fetchPaymentRecords() {
        fetch("/get-payments/", {
            headers: { "X-Requested-With": "XMLHttpRequest" },
        })
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch payment records");
                return response.json();
            })
            .then((data) => populateTable(data))
            .catch((error) => console.error("Error fetching payment records:", error));
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const month = date.getMonth() + 1; // Months are zero-based
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}-${day}-${year}`;
    }

    function formatDateForAPI(dateString) {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    // Fetch Chart of Accounts
    function loadChartOfAccounts() {
        return fetch("/get-chart-types/", {
            method: "GET",
            headers: { 
                "X-Requested-With": "XMLHttpRequest" 
            },
        })
            .then(response => response.json())
            .then(data => {
                chartOfAccounts = data.reduce((acc, account) => {
                    acc[account.id] = account;  // Store the entire account object
                    return acc;
                }, {});
                console.log("Chart of Accounts:", chartOfAccounts);
            })
            .catch(error => console.error("Error loading Chart of Accounts:", error));
    }

    function loadEntryStatuses() {
        return fetch("/entrystatuses/") // Replace with your actual API endpoint
            .then(response => response.json())
            .then(data => {
                entryStatuses = data.reduce((acc, status) => {
                    acc[status.id] = status.Status_Name;
                    return acc;
                }, {});
                console.log("Entry Statuses:", entryStatuses);
            })
            .catch(error => console.error("Error loading Entry Statuses:", error));
    }

    // Fetch Journal Templates
    function loadJournalTemplates() {
        return fetch("/journaltemplate/", {
            method: "GET",
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            },
        })
        .then(response => response.json())
        .then(data => {
            journalTemplates = data.reduce((acc, template) => {
                if (template.template && template.template.TRTemplateCode) {
                    acc[template.template.TRTemplateCode] = template; // Store using TRTemplateCode as key
                }
                return acc;
            }, {});
            console.log("Journal Templates:", journalTemplates);
        })
        .catch(error => console.error("Error loading Journal Templates:", error));
    }

    // Dynamically populate the table
    function populateTable(records) {
        const tableBody = document.getElementById("payment-records");
        records.forEach((record) => {
            const formattedDate = record.PaymentDate ? formatDate(record.PaymentDate) : 'N/A'; // Date formatted here
            const formattedAmount = record.Amount ? parseFloat(record.Amount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) : '0.00';

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${record.transaction_id}</td>
                <td>${formattedDate}</td> 
                <td>${record.Description}</td>
                <td>${formattedAmount}</td>
                <td>${record.PaymentMethod}</td>
                <td>
                    <button
                        class="btn btn-primary create-jev-btn" 
                        style="
                            background-color: #6f42c1;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 400;
                            padding: 0.5rem 1rem;
                            transition: background-color 0.3s ease, color 0.3s ease;
                        "
                        onmouseover="this.style.backgroundColor='#5a3795';"
                        onmouseout="this.style.backgroundColor='#6f42c1';"
                        data-transaction='${JSON.stringify(record)}'
                    >
                        <i class="bi bi-pencil-square me-2"></i>
                        Create JEV
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        initializeJEVCreation();
    }

    function initializeJEVCreation() {
        document.querySelectorAll('.create-jev-btn').forEach(button => {
            button.addEventListener('click', function () {
                const transactionData = JSON.parse(this.getAttribute('data-transaction'));
    
                // 🟢 Store the correct ID, not transaction_id
                window.currentRecordId = transactionData.id;
    
                console.log("✅ Record ID Set:", window.currentRecordId);
    
                autoGenerateJEV(transactionData);
            });
        });
    }

    function autoGenerateJEV(transaction) {
        const jevNumber = generateJEVNumber(transaction.Description);
        const statusId = 2; // Default to Approved
        
        let templateType;
        if (transaction.Description === 'Reservation Dine-in') {
            templateType = 'Reservation Dine In';
        } else if (transaction.Description === 'Reservation Event') {
            templateType = 'Reservation Event';
        } else if (transaction.Description === 'Logistics Purchase') {
            templateType = 'Logistics Purchase';
        } else {
            console.error(`No template found for ${transaction.Description}`);
            Swal.fire({
                icon: 'warning',
                title: 'No preset template found!',
                text: 'Please create the necessary template for auto-generation.',
                confirmButtonColor: '#6f42c1'
            });
            return; // Exit if no matching description
        }
        
        const template = journalTemplates[templateType];
    
        if (template && template.details && template.details.length > 0) {
            const mappedDetails = template.details.map(detail => {
                const account = chartOfAccounts[detail.Account_FK];
                return account
                    ? {
                        accountDesc: account.AccountDesc,
                        accountCode: account.AccountCode,
                        debit: parseFloat(detail.Debit) === 1 ? transaction.Amount : '',
                        credit: parseFloat(detail.Credit) === 1 ? transaction.Amount : ''
                    }
                    : null;
            }).filter(detail => detail !== null);
    
            populateJEVModal(transaction, jevNumber, statusId, mappedDetails, template);
        } else {
            console.error(`No template found for ${templateType} or the template has no details.`);
        }
    }

    function generateJEVNumber(description) {
        const timestamp = Date.now().toString().slice(-6);
        let prefix;
    
        if (description === 'Reservation Dine-in') {
            prefix = 'RE-JEV';
        } else if (description === 'Reservation Event') {
            prefix = 'RD-JEV';
        } else if (description === 'Logistics Purchase') {
            prefix = 'LP-JEV';
        } else {
            prefix = 'FM-JEV';
        }
    
        return `${prefix}-${timestamp}`;
    }

    function populateJEVModal(transaction, jevNumber, statusId, mappedDetails, template) {
        const formattedDate = transaction.PaymentDate ? formatDate(transaction.PaymentDate) : 'N/A';
        document.getElementById('jevDate').textContent = formattedDate;
        // document.getElementById('jevNumber').textContent = jevNumber;
    
        console.log("Modal Data:", {
            Transaction: transaction,
            TemplateCode: template?.template?.TRTemplateCode,
            TemplateID: template?.template?.id
        });
    
        const statusDropdown = document.getElementById('statusDropdown');
        statusDropdown.innerHTML = '';
        Object.entries(entryStatuses).forEach(([id, name]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = name;
            if (parseInt(id) === statusId) option.selected = true;
            statusDropdown.appendChild(option);
        });
    
        document.getElementById('remarks').value = transaction.Description || '';
    
        const accountsTable = document.getElementById('jevAccountTableBody');
        accountsTable.innerHTML = '';

        mappedDetails.forEach(detail => {
            const rawDebit = detail.debit || '0.00';
            const rawCredit = detail.credit || '0.00';
        
            const row = `
                <tr>
                    <td>${detail.accountDesc}</td>
                    <td>${detail.accountCode}</td>
                    <td class="text-end">${rawDebit}</td>
                    <td class="text-end">${rawCredit}</td>
                </tr>
            `;
            accountsTable.insertAdjacentHTML('beforeend', row);
        });
    

        window.currentTemplateId = template?.template?.id;
    
        const jevModal = new bootstrap.Modal(document.getElementById('createInboxJev'));
        jevModal.show();
    }

    document.getElementById('createJevBtn').addEventListener('click', function () {
        const transactionId = window.currentTransactionId;
        const jevDate = document.getElementById('jevDate').textContent;
        const jevDateAPI = formatDateForAPI(jevDate);
        const jevNumber = generateJEVNumber();
        const remarks = document.getElementById('remarks').value;
        const TRTemplate_FK = window.currentTemplateId;
    
        const currentTemplateCode = remarks;
        const selectedTemplate = Object.values(journalTemplates).find(template =>
            template.template.TRTemplateCode === currentTemplateCode
        );
    
        const journalDetails = [];
        document.querySelectorAll('#jevAccountTableBody tr').forEach(row => {
            const accountCode = row.cells[1].textContent;
            const account = Object.values(chartOfAccounts).find(acc => acc.AccountCode === accountCode);
            const accountId = account ? account.id : null;
    
            const debitAmount = parseFloat(row.cells[2].textContent) || 0;
            const creditAmount = parseFloat(row.cells[3].textContent) || 0;
    
            if (accountId) {
                journalDetails.push({
                    Account_FK: accountId,
                    DebitAmount: debitAmount,
                    CreditAmount: creditAmount
                });
            }
        });
    
        if (!jevDate || !jevNumber || journalDetails.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields!',
                text: 'Please ensure all required fields are filled out.',
                confirmButtonColor: '#6f42c1'
            });
            return; // Prevent submission if validation fails
        }
    
        const journalEntryPayload = {
            journal_entry: {
                TransactionType_FK: 3,
                TRTemplate_FK: TRTemplate_FK,
                Entry_No: jevNumber,
                EntryStatus_FK: 2,
                Entry_Date: jevDateAPI,
                EntryParticulars: remarks,
                Created_By: "",
            },
            journal_details: journalDetails
        };
    
        console.log('Payload:', JSON.stringify(journalEntryPayload, null, 2));
        console.log('CSRF Token:', csrfToken);
    
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to create this journal entry?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#6f42c1',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, create it!'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/journalentries/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify(journalEntryPayload)
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(errorData => {
                            throw errorData;
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    patchEntryCreated();
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: error.message || 'Failed to create journal entry.',
                        confirmButtonColor: '#6f42c1'
                    });
                });
            }
        });
    });
    
    function patchEntryCreated() {
        const recordId = window.currentRecordId; // Use the correct record ID
    
        if (!recordId) {
            console.error("❌ Record ID is missing when calling PATCH!");
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Record ID is not available. Please try again.',
                confirmButtonColor: '#6f42c1'
            });
            return;
        }
    
        console.log("🔄 Sending PATCH Request for Record ID:", recordId);
    
        fetch(`/get-payments/${recordId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({ EntryCreated: true }) // Update EntryCreated to True
        })
        .then(response => {
            console.log("PATCH Response Status:", response.status);
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw errorData;
                });
            }
            return response.json();
        })
        .then(updatedData => {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Journal Entry successfully created!',
                confirmButtonColor: '#6f42c1'
            }).then(() => {
                location.reload(); 
            });
        })
        .catch(error => {
            console.error("❌ PATCH Request Failed:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.message || 'Failed to update payment record.',
                confirmButtonColor: '#6f42c1'
            });
        });
    }

    // Initial Load
    Promise.all([loadChartOfAccounts(), loadJournalTemplates(), loadEntryStatuses()])
        .then(fetchPaymentRecords);
});
