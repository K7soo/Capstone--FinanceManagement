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

    let chartOfAccountsMap = {};

    function loadChartOfAccountsList() {
        return fetch('/chartofacc/', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load charted accounts');
                }
                return response.json();
            })
            .then(chartedAccounts => {
                chartedAccounts.forEach(account => {
                    chartOfAccountsMap[account.id] = account.AccountDesc;
                });
            })
            .catch(error => console.error('Error fetching charted accounts:', error));
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
            case "trial-balance-tab":
                loadTrialBalance();
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
        let journalEntriesMap = {}; 

        // Populate the Transaction Types Dropdown
        function populateTransactionTypes() {
            loadTransactionTypes()
                .then(() => {
                    const dropdown = document.getElementById("transaction-type");
                    dropdown.innerHTML = '<option value="all">All Transaction Types</option>'; // Add "All" option first
                    
                    Object.entries(transactionTypeMap).forEach(([id, name]) => {
                        const option = document.createElement("option");
                        option.value = id;
                        option.textContent = name;
                        dropdown.appendChild(option);
                    });
                })
                .catch((error) => {
                    console.error("Error populating transaction types:", error);
                });
        }
        

        // Load Journal Entries Map
        function loadJournalEntriesMap() {
            return fetch("/journalentries/", {
                method: "GET",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            })
            .then((response) => {
                if (!response.ok) throw new Error("Failed to load journal entries");
                return response.json();
            })
            .then((data) => {
                console.log("Raw Journal Data:", data); // Debugging raw data
        
                journalEntriesMap = data.reduce((map, entry) => {
                    // Check for ID in different structures
                    const entryId = entry.journal_entry?.id || entry.id || entry.Entry_ID;
        
                    if (entryId) {
                        map[entryId] = {
                            Entry_No: entry.journal_entry.Entry_No || "N/A",
                            Entry_Date: entry.journal_entry.Entry_Date || "N/A",
                            EntryParticulars: entry.journal_entry.EntryParticulars || "No description provided.",
                        };
                    } else {
                        console.warn("Missing ID for journal entry:", entry); // Debug missing IDs
                    }
        
                    return map;
                }, {});
        
                console.log("Mapped Journal Entries:", journalEntriesMap); // Final mapped output
            })
            .catch((error) => console.error("Error loading journal entries:", error));
        }
        
        
        // Load Chart of Accounts
        function loadChartOfAccounts() {
            return fetch("/get-chart-types/") // Replace with your actual endpoint
                .then((response) => {
                    if (!response.ok) throw new Error("Failed to load chart of accounts");
                    return response.json();
                })
                .then((data) => {
                    console.log("Raw Chart of Accounts Data:", data); // Inspect API response
                    chartOfAccounts = data.reduce((map, account) => {
                        map[account.id] = account.AccountDesc; // Adjust keys/values as needed
                        return map;
                    }, {});
                    console.log("Mapped Chart of Accounts:", chartOfAccounts); // Verify mapped data
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
                transaction_type: transactionType === "all" ? "" : transactionType,
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
                    const fetchedData = mapAccountDetails(data); 
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
        function mapAccountDetails(generalJournalData) {
            return generalJournalData.map((entry) => {
                // Correctly map journal details
                entry.journal_details = entry.journal_details.map((detail) => ({
                    ...detail,
                    accountDesc: chartOfAccounts[detail.Account_FK] || "Unknown Account",
                }));
        
                // Correctly map journal entry details
                const journalEntry = journalEntriesMap[entry.journal_entry?.id] || {};
                entry.Entry_No = journalEntry.Entry_No || "N/A";
                entry.Entry_Date = journalEntry.Entry_Date || "N/A";
                entry.EntryParticulars = journalEntry.EntryParticulars || "No description provided.";
        
                console.log("Entry:", entry);
                console.log("Journal Entry ID:", entry.journal_entry?.id);
                return entry;
            });
        }

        function formatNumber(number) {
            return parseFloat(number).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        }


        const printjournal = document.querySelector(".btn.btn-primary");
        const exportButton = document.querySelector(".btn.btn-success");
    
        if (printjournal) {
            printjournal.addEventListener("click", handlePrint);
        }
    
        // if (exportButton) {
        //     exportButton.addEventListener("click", handleExport);
        // }
    
        // Handle Print
        function handlePrint() {
            fetchGeneralJournalData((data) => {
                console.log("Print Payload:", data);
                console.log("Fetched Data for Printing:", fetchedData);
                printReport(data); // Call the print function
            });
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
                            h1, h3, h4 {
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
                        <h1>General Journal Report</h1>
                        <h3>Company: Tikme Dine</h3>
                        <h4>Exported on: ${new Date().toLocaleDateString()}</h4>
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
                                    const journalDetails = entry.journal_details || []; // Ensure journal_details exists
                                    const date = entry.Entry_Date || "N/A";
                                    const particulars = entry.EntryParticulars || "No description provided.";
                                    const reference = entry.Entry_No || "N/A";
    
                                    return `
                                        ${journalDetails
                                            .map((detail, index) => `
                                                <tr>
                                                    <td>${index === 0 ? date : ""}</td>
                                                    <td>${detail.accountDesc || "Unknown Account"}</td>
                                                    <td>${index === 0 ? reference : ""}</td>
                                                    <td class="right-align">${detail.DebitAmount ? formatNumber(detail.DebitAmount) : ""}</td>
                                                    <td class="right-align">${detail.CreditAmount ? formatNumber(detail.CreditAmount) : ""}</td>
                                                </tr>
                                            `).join("")}
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
    
        // Populate Transaction Types
        populateTransactionTypes();
        Promise.all([loadChartOfAccounts(), loadJournalEntriesMap()])
        .then(() => {
            console.log("All data loaded successfully.");
        })
        .catch((error) => {
            console.error("Error loading initial data:", error);
        });
    }

    function loadGeneralLedger() {
        console.log("Initializing General Journal Tab...");
    
        let fetchedData = []; // Store the queried data for print/export operations
        let chartOfAccounts = {}; // Store Chart of Accounts mapping
        let journalEntriesMap = {}; 

        // Populate the Transaction Types Dropdown
        function populateChartOfAccounts() {
            loadChartOfAccountsList()
                .then(() => {
                    const dropdown = document.getElementById("ledger-account");
                    dropdown.innerHTML = '<option value="all">All Ledger Accounts</option>'; // Add "All" option first
                    
                    Object.entries(chartOfAccountsMap).forEach(([id, name]) => {
                        const option = document.createElement("option");
                        option.value = id;
                        option.textContent = name;
                        dropdown.appendChild(option);
                    });
                })
                .catch((error) => {
                    console.error("Error populating transaction types:", error);
                });
        }
        

        // Load Journal Entries Map
        function loadJournalEntriesMap() {
            return fetch("/journalentries/", {
                method: "GET",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            })
            .then((response) => {
                if (!response.ok) throw new Error("Failed to load journal entries");
                return response.json();
            })
            .then((data) => {
                console.log("Raw Journal Data:", data); // Debugging raw data
        
                journalEntriesMap = data.reduce((map, entry) => {
                    // Check for ID in different structures
                    const entryId = entry.journal_entry?.id || entry.id || entry.Entry_ID;
        
                    if (entryId) {
                        map[entryId] = {
                            Entry_No: entry.journal_entry.Entry_No || "N/A",
                            Entry_Date: entry.journal_entry.Entry_Date || "N/A",
                            EntryParticulars: entry.journal_entry.EntryParticulars || "No description provided.",
                        };
                    } else {
                        console.warn("Missing ID for journal entry:", entry); // Debug missing IDs
                    }
        
                    return map;
                }, {});
        
                console.log("Mapped Journal Entries:", journalEntriesMap); // Final mapped output
            })
            .catch((error) => console.error("Error loading journal entries:", error));
        }
        
        
        // Load Chart of Accounts
        function loadChartOfAccounts() {
            return fetch("/get-chart-types/") // Replace with your actual endpoint
                .then((response) => {
                    if (!response.ok) throw new Error("Failed to load chart of accounts");
                    return response.json();
                })
                .then((data) => {
                    console.log("Raw Chart of Accounts Data:", data); // Inspect API response
                    chartOfAccounts = data.reduce((map, account) => {
                        map[account.id] = account.AccountDesc; // Adjust keys/values as needed
                        return map;
                    }, {});
                    console.log("Mapped Chart of Accounts:", chartOfAccounts); // Verify mapped data
                })
                .catch((error) => console.error("Error loading chart of accounts:", error));
        }
    
        // Validate Filters
        function validateFilters() {
            const chartOfAccounts = document.getElementById("ledger-account").value;
            const asOfDateLedger = document.getElementById("as-of-ledger").value;
            const durationFromLedger = document.getElementById("duration-from-ledger").value;
            const durationToLedger = document.getElementById("duration-to-ledger").value;
    
            if (!chartOfAccounts) {
                Swal.fire("Validation Error", "Please select a Ledger Account.", "error");
                return false;
            }
    
            if (!asOfDateLedger && (!durationFromLedger || !durationToLedger)) {
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
        function fetchGeneralLedgerData(callback) {
            const chartOfAccounts = document.getElementById("ledger-account").value;
            const asOfDate = document.getElementById("as-of-ledger").value;
            const durationFrom = document.getElementById("duration-from-ledger").value;
            const durationTo = document.getElementById("duration-to-ledger").value;
        
            if (!validateFilters()) return;
        
            const params = new URLSearchParams({
                charted_account: chartOfAccounts === "all" ? "" : chartOfAccounts,
                as_of: asOfDate || "",
                duration_from: durationFrom || "",
                duration_to: durationTo || "",
            }).toString();
        
            fetch(`/querygeneralledger/?${params}`, {
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
                    console.log("Fetched General Ledger Data:", data);
                    if (!Array.isArray(data)) {
                        console.error("Expected an array but received:", data);
                        return;
                    }
                    const fetchedData = mapAccountDetails(data);
                    if (fetchedData.length > 0) {
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
        function mapAccountDetails(generalLedgerData) {
            return generalLedgerData.map(entry => {
                // Ensure journal_details exists and is an array
                if (!Array.isArray(entry.journal_details)) {
                    console.warn("journal_details is not an array:", entry.journal_details);
                    entry.journal_details = [];  // Ensure it's at least an empty array
                }
        
                entry.journal_details = entry.journal_details.map(detail => ({
                    accountDesc: chartOfAccounts[detail.Account_FK] || "Unknown Account",
                    debit: detail.DebitAmount ? formatNumber(detail.DebitAmount) : "0.00",
                    credit: detail.CreditAmount ? formatNumber(detail.CreditAmount) : "0.00"
                }));
        
                const journalEntry = journalEntriesMap[entry.journal_entry?.id] || {};
                entry.Entry_No = journalEntry.Entry_No || "N/A";
                entry.Entry_Date = journalEntry.Entry_Date || "N/A";
                entry.EntryParticulars = journalEntry.EntryParticulars || "No description provided.";
        
                return entry;
            });
        }
        
        function formatNumber(number) {
            return parseFloat(number).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
        }


        const printledger = document.getElementById("print-ledger");
        const exportButton = document.querySelector(".btn.btn-success");
    
        if (printledger) {
            printledger.addEventListener("click", handlePrint);
        }
    
        // if (exportButton) {
        //     exportButton.addEventListener("click", handleExport);
        // }
    
        // Handle Print
        function handlePrint() {
            fetchGeneralLedgerData((data) => {
                console.log("Print Payload:", data);
                fetchedData = data; // Store fetched data globally
                if (!fetchedData || fetchedData.length === 0) {
                    console.error("No data available for printing.");
                    Swal.fire("Error", "No data available to print.", "error");
                    return;
                }
                printReport(fetchedData); // Call the print function with fetched data
            });
        }
    
        function printReport(data) {
            console.log("Printing Data:", data); // Debugging
            if (!Array.isArray(data)) {
                console.error("Expected an array but received:", data);
                Swal.fire("Error", "Invalid data format for printing.", "error");
                return;
            }
        
            const printWindow = window.open("", "_blank");
            let htmlContent = `
                <html>
                    <head>
                        <title>General Ledger Report</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            h1, h3, h4 { text-align: center; }
                            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                            th, td { border: 1px solid black; padding: 8px; text-align: left; }
                            th { background-color: #f2f2f2; }
                            td.right-align { text-align: right; }
                            .total-row { font-weight: bold; background-color: #eaeaea; }
                            .account-header { font-weight: bold; font-size: 16px; margin-top: 10px; }
                            .net-movement { font-weight: bold; text-align: right; }
                        </style>
                    </head>
                    <body>
                        <h1>General Ledger Report</h1>
                        <h3>Company: Tikme Dine</h3>
                        <h4>Exported on: ${new Date().toLocaleDateString()}</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Transaction</th>
                                    <th>Debit</th>
                                    <th>Credit</th>
                                </tr>
                            </thead>
                            <tbody>`;
        
            // Group transactions by account
            const groupedData = data.reduce((acc, entry) => {
                const accountName = entry.journal_details.length > 0
                    ? entry.journal_details[0].accountDesc
                    : "Unknown Account";
                if (!acc[accountName]) acc[accountName] = [];
                acc[accountName].push(entry);
                return acc;
            }, {});
        
            // Generate table data grouped by account
            for (const account in groupedData) {
                const transactions = groupedData[account];
                let totalDebit = 0;
                let totalCredit = 0;
        
                // Add account header
                htmlContent += `<tr><td colspan="4" class="account-header">${account}</td></tr>`;
        
                transactions.forEach(entry => {
                    totalDebit += entry.journal_details.reduce((sum, d) => sum + (parseFloat(d.DebitAmount) || 0), 0);
                    totalCredit += entry.journal_details.reduce((sum, d) => sum + (parseFloat(d.CreditAmount) || 0), 0);
        
                    htmlContent += `
                        <tr>
                            <td>${entry.Entry_Date}</td>
                            <td>${entry.EntryParticulars}</td>
                            <td class="right-align">${totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                            <td class="right-align">${totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        </tr>`;
                });
        
                // Net movement row
                htmlContent += `
                    <tr class="total-row">
                        <td colspan="2">Net Movement</td>
                        <td class="right-align"><strong>${totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></td>
                        <td class="right-align"><strong>${totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></td>
                    </tr>`;
            }
        
            htmlContent += `</tbody></table></body></html>`;
        
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
        }
        
    
        // Populate Transaction Types
        populateChartOfAccounts();
        Promise.all([loadChartOfAccounts(), loadJournalEntriesMap()])
        .then(() => {
            console.log("All data loaded successfully.");
        })
        .catch((error) => {
            console.error("Error loading initial data:", error);
        });
    }
    
    
    

    function loadTrialBalance() {
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
