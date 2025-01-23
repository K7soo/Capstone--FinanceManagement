document.addEventListener("DOMContentLoaded", () => {
    console.log("Reports JS Loaded");
    const transactionTypeMap = {};

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

    let chartOfAccounts = {};

    function loadChartOfAccounts() {
        return fetch("/chartofacc/") // Replace with your actual endpoint
            .then((response) => {
                if (!response.ok) throw new Error("Failed to load chart of accounts");
                return response.json();
            })
            .then((data) => {
                chartOfAccounts = data.reduce((map, account) => {
                    map[account.id] = account.name; // Assume 'id' and 'name' are fields
                    return map;
                }, {});
                console.log("Chart of Accounts Loaded:", chartOfAccounts);
            })
            .catch((error) => console.error("Error loading chart of accounts:", error));
    }


    // Initialize Tabs
    function initTabs() {
        const tabs = document.querySelectorAll(".nav-link");

        tabs.forEach((tab) => {
            tab.addEventListener("click", (e) => {
                const tabId = e.target.getAttribute("id");
                handleTabSwitch(tabId);
            });
        });

        // Load the default active tab
        const activeTab = document.querySelector(".nav-link.active");
        if (activeTab) {
            const defaultTabId = activeTab.getAttribute("id");
            handleTabSwitch(defaultTabId);
        }
    }

    // Handle switching between tabs
    function handleTabSwitch(tabId) {
        console.log(`Switching to tab: ${tabId}`);

        switch (tabId) {
            case "general-journal-tab":
                loadGeneralJournal();
                break;
            case "general-ledger-tab":
                loadGeneralLedger();
                break;
            case "cash-flow-tab":
                loadCashFlow();
                break;
            case "income-expense-tab":
                loadIncomeVsExpense();
                break;
            case "balance-sheet-tab":
                loadBalanceSheet();
                break;
            default:
                console.error(`No logic defined for tab: ${tabId}`);
        }
    }

    // Functions for Each Tab
    function loadGeneralJournal() {
        console.log("Initializing General Journal Tab...");
    
        let fetchedData = []; // Store the queried data for print/export operations
        let chartOfAccounts = {}; // Store Chart of Accounts mapping
    
        // Populate the Transaction Types Dropdown
        function populateTransactionTypes() {
            loadTransactionTypes()
                .then(() => {
                    const dropdown = document.getElementById("transaction-type");
                    dropdown.innerHTML = '<option value="">Select a Transaction Type</option>'; // Reset options
                    Object.entries(transactionTypeMap).forEach(([id, name]) => {
                        const option = document.createElement("option");
                        option.value = id; // Use ID as the value
                        option.textContent = name; // Display name
                        dropdown.appendChild(option);
                    });
                })
                .catch((error) => {
                    console.error("Error populating transaction types:", error);
                });
        }
    
        // Load Chart of Accounts
        function loadChartOfAccounts() {
            return fetch("/get-chart-types/") // Replace with your actual endpoint
                .then((response) => {
                    if (!response.ok) throw new Error("Failed to load chart of accounts");
                    return response.json();
                })
                .then((data) => {
                    console.log("Raw Chart of Accounts Data:", data); // Log raw data to inspect structure
                    chartOfAccounts = data.reduce((map, account) => {
                        map[account.accountId] = account.accountName;
                        return map;
                    }, {});
                })
                .catch((error) => console.error("Error loading chart of accounts:", error));
        }
    
        // Validate Filters
        function validateFilters() {
            const transactionType = document.getElementById("transaction-type").value;
            const asOfDate = document.getElementById("as-of").value;
            const durationFrom = document.getElementById("duration-from").value;
            const durationTo = document.getElementById("duration-to").value;
    
            if (!transactionType) {
                Swal.fire("Validation Error", "Please select a Transaction Type.", "error");
                return false;
            }
    
            if (!asOfDate && (!durationFrom || !durationTo)) {
                Swal.fire(
                    "Validation Error",
                    "Please select either an 'As of' date or a valid duration range.",
                    "error"
                );
                return false;
            }
    
            return true;
        }
    
        // Fetch Data for General Journal
        function fetchGeneralJournalData(callback) {
            const transactionType = document.getElementById("transaction-type").value;
            const asOfDate = document.getElementById("as-of").value;
            const durationFrom = document.getElementById("duration-from").value;
            const durationTo = document.getElementById("duration-to").value;
    
            if (!validateFilters()) return;
    
            const params = new URLSearchParams({
                transaction_type: transactionType,
                as_of: asOfDate || "",
                duration_from: durationFrom || "",
                duration_to: durationTo || "",
            }).toString();
    
            fetch(`/querygeneraljournal/?${params}`, {
                method: "GET",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch filtered data");
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("Fetched General Journal Data:", data);
                    fetchedData = mapAccountDetails(data); // Map account names
                    if (fetchedData && fetchedData.length > 0) {
                        callback(fetchedData);
                    } else {
                        Swal.fire("No Data", "No records found for the selected filters.", "info");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching filtered data:", error);
                    Swal.fire("Error", "Failed to fetch data. Please try again.", "error");
                });
        }
    
        // Map Account Details
        function mapAccountDetails(journalEntries) {
            return journalEntries.map((entry) => {
                entry.journal_details = entry.journal_details.map((detail) => ({
                    ...detail,
                    accountDesc: chartOfAccounts[detail.Account_FK] || "Unknown Account", // Correctly map account names using Account_FK
                }));
                return entry;
            });
        }
    
        // Handle Print
        function handlePrint() {
            fetchGeneralJournalData((data) => {
                console.log("Print Payload:", data);
                printReport(data); // Call the print function
            });
        }
    
        // Handle Export
        function handleExport() {
            fetchGeneralJournalData((data) => {
                console.log("Export Payload:", data);
                exportToCSV(data, "general_journal.csv"); // Call the export function
            });
        }
    
        // Attach Event Listeners for Print and Export
        const printButton = document.querySelector(".btn.btn-primary");
        const exportButton = document.querySelector(".btn.btn-success");
    
        if (printButton) {
            printButton.addEventListener("click", handlePrint);
        }
    
        if (exportButton) {
            exportButton.addEventListener("click", handleExport);
        }
    
        // Print Report
        function printReport(data) {
            const printWindow = window.open("", "_blank");
            const htmlContent = `
                <html>
                    <head>
                        <title>General Journal Report</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 20px;
                            }
                            h1 {
                                text-align: center;
                                margin-bottom: 20px;
                            }
                            table {
                                border-collapse: collapse;
                                width: 100%;
                                margin-top: 20px;
                            }
                            th, td {
                                border: 1px solid black;
                                padding: 8px;
                                text-align: left;
                            }
                            th {
                                background-color: #f2f2f2;
                            }
                            td.right-align {
                                text-align: right;
                            }
                            .total-row {
                                font-weight: bold;
                                background-color: #eaeaea;
                            }
                            .description {
                                font-style: italic;
                                color: #555;
                                padding-left: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>General Journal</h1>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Account</th>
                                    <th>Ref</th>
                                    <th>Debit</th>
                                    <th>Credit</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data
                                    .map((entry) => {
                                        const journalDetails = entry.journal_details || [];
                                        const date = entry.Entry_Date || "N/A";
                                        const particulars = entry.EntryParticulars || "No description provided.";
                                        const reference = entry.Entry_No || "N/A";
        
                                        return `
                                            ${journalDetails
                                                .map((detail, index) => `
                                                    <tr>
                                                        <td>${index === 0 ? date : ""}</td>
                                                        <td>${detail.accountDesc || "N/A"}</td>
                                                        <td>${index === 0 ? reference : ""}</td>
                                                        <td class="right-align">${detail.DebitAmount ? formatNumber(detail.DebitAmount) : ""}</td>
                                                        <td class="right-align">${detail.CreditAmount ? formatNumber(detail.CreditAmount) : ""}</td>
                                                    </tr>
                                                `)
                                                .join("")}
                                            <tr>
                                                <td colspan="5" class="description">
                                                    ${particulars}
                                                </td>
                                            </tr>
                                        `;
                                    })
                                    .join("")}
                                <tr class="total-row">
                                    <td>Total</td>
                                    <td colspan="2"></td>
                                    <td class="right-align">${formatNumber(calculateTotal(data, "DebitAmount"))}</td>
                                    <td class="right-align">${formatNumber(calculateTotal(data, "CreditAmount"))}</td>
                                </tr>
                            </tbody>
                        </table>
                    </body>
                </html>
            `;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
        }
        
        
        function formatNumber(number) {
            return parseFloat(number).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        
        function calculateTotal(data, field) {
            return data.reduce((sum, entry) => {
                const details = entry.journal_details || [];
                return (
                    sum +
                    details.reduce((detailSum, detail) => detailSum + (parseFloat(detail[field]) || 0), 0)
                );
            }, 0);
        }
        
        function exportToCSV(data, filename) {
            const csvContent = [
                ["Date", "Account", "Ref", "Debit", "Credit"], // Header row
                ...data.flatMap((entry) => {
                    const journalDetails = entry.journal_details || [];
                    const totalDebit = journalDetails.reduce(
                        (sum, detail) => sum + (parseFloat(detail.DebitAmount) || 0),
                        0
                    );
                    const totalCredit = journalDetails.reduce(
                        (sum, detail) => sum + (parseFloat(detail.CreditAmount) || 0),
                        0
                    );
        
                    const rows = journalDetails.map((detail, index) => [
                        index === 0 ? entry.Entry_Date : "",
                        detail.Account_FK || "N/A",
                        entry.Entry_No || "N/A",
                        parseFloat(detail.DebitAmount || 0).toFixed(2),
                        parseFloat(detail.CreditAmount || 0).toFixed(2),
                    ]);
        
                    rows.push([
                        "", "Total", "", totalDebit.toFixed(2), totalCredit.toFixed(2),
                    ]);
        
                    return rows;
                }),
            ];
        
            const csvFormatted = csvContent.map((row) => row.join(",")).join("\n");
            const blob = new Blob([csvFormatted], { type: "text/csv" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        }
    
        // Attach Event Listeners for Print and Export
    
        // Populate Transaction Types
        populateTransactionTypes();
        loadChartOfAccounts();
    }
    

    function loadGeneralLedger() {
        console.log("Loading General Ledger Tab...");
        // Logic to load General Ledger data
    }

    function loadCashFlow() {
        console.log("Loading Cash Flow Tab...");
        // Logic to load Cash Flow data
    }

    function loadIncomeVsExpense() {
        console.log("Loading Income vs Expense Tab...");
        // Logic to load Income vs Expense data
    }

    function loadBalanceSheet() {
        console.log("Loading Balance Sheet Tab...");
        // Logic to load Balance Sheet data
    }


    // Initialize tabs on page load
    initTabs();
});
