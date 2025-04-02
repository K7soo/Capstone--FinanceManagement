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
            const period = document.getElementById("period-filter").value;
            const year = document.getElementById("year-filter").value;
            const month = document.getElementById("month-filter").value;

            if (!transactionType) {
                Swal.fire("Validation Error", "Please select a Transaction Type.", "error");
                return false;
            }

            if (!year) {
                Swal.fire("Validation Error", "Please enter a valid Year.", "error");
                return false;
            }

            if (period === "Monthly" && !month) {
                Swal.fire("Validation Error", "Please select a Month for the Monthly period.", "error");
                return false;
            }

            return true;
        }
    
        // Fetch Data for General Journal
        function fetchGeneralJournalData(callback) {
            const transactionType = document.getElementById("transaction-type").value;
            const period = document.getElementById("period-filter").value;
            const year = document.getElementById("year-filter").value;
            const month = document.getElementById("month-filter").value;
            const monthMapping = {
                "January": 1, "February": 2, "March": 3, "April": 4,
                "May": 5, "June": 6, "July": 7, "August": 8,
                "September": 9, "October": 10, "November": 11, "December": 12
            };
            const formattedMonth = monthMapping[month] || "";

            if (!validateFilters()) return;

            const params = new URLSearchParams({
                transaction_type: transactionType === "all" ? "" : transactionType,
                period: period || "",
                year: year || "",
                month: formattedMonth || "",
            }).toString();

            console.log("Request URL:", `/querygeneraljournal/?${params}`); // Debugging log
            console.log("Sending Parameters:", { transactionType, period, year, month }); // Debugging log

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

        function formatDate(dateString) {
            if (!dateString) return "N/A";
            
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Invalid Date"; // Ensure the date is valid
        
            const month = date.getMonth() + 1; // Months are 0-based
            const day = date.getDate();
            const year = date.getFullYear();
        
            return `${month}/${day}/${year}`;
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
                                margin-bottom: 15px;
                            }
                            table {
                                border-collapse: collapse;
                                width: 100%;
                                margin-top: 15px;
                            }
                            th, td {
                                border: 1px solid black; /* Ensure all cells have black borders */
                                padding: 6px;
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
                                font-weight: bold;
                                color: #000;
                                padding-left: 10px;
                                border-left: 1px solid black;
                                border-right: 1px solid black;
                                border-bottom: 1px solid black;
                            }
                            .credit-indent {
                                padding-left: 20px;
                            }
                            /* Adjust column widths */
                            .col-date { width: 12%; }
                            .col-account { width: 40%; }
                            .col-ref { width: 18%; }
                            .col-debit { width: 15%; }
                            .col-credit { width: 15%; }
                        </style>
                    </head>
                    <body>
                        <h1>General Journal Report</h1>
                        <h3>Company: Tikme Dine</h3>
                        <h4>Exported on: ${new Date().toLocaleDateString()}</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th class="col-date">Date</th>
                                    <th class="col-account">Explanation</th>
                                    <th class="col-ref">Post Ref.</th>
                                    <th class="col-debit">Debit</th>
                                    <th class="col-credit">Credit</th>
                                </tr>
                            </thead>
                            <tbody>
                            ${data
                                .map((entry, entryIndex) => {
                                    const journalDetails = entry.journal_details || [];
                                    const date = new Date(entry.Entry_Date).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
                                    const particulars = entry.EntryParticulars || "No description provided.";
                                    const reference = entry.Entry_No || "N/A";
                                    const refRowSpan = journalDetails.length;
        
                                    let rowHtml = `
                                        <tr>
                                            <td class="col-date">${date}</td>
                                            <td class="col-account">${journalDetails[0]?.accountDesc || "Unknown Account"}</td>
                                            <td class="col-ref" rowspan="${refRowSpan}">${reference}</td>
                                            <td class="right-align col-debit">${journalDetails[0]?.DebitAmount || ""}</td>
                                            <td class="right-align col-credit">${journalDetails[0]?.CreditAmount || ""}</td>
                                        </tr>`;
        
                                    journalDetails.slice(1).forEach(detail => {
                                        rowHtml += `
                                            <tr>
                                                <td></td>
                                                <td class="col-account ${detail.CreditAmount > 0 ? "credit-indent" : ""}">${detail.accountDesc || "Unknown Account"}</td>
                                                <td class="right-align col-debit">${detail.DebitAmount || ""}</td>
                                                <td class="right-align col-credit">${detail.CreditAmount || ""}</td>
                                            </tr>`;
                                    });
        
                                    // Particulars row under the "Account" column with black side & bottom border
                                    rowHtml += `
                                        <tr>
                                            <td></td>
                                            <td colspan="4" class="description">Particulars: ${particulars}</td>
                                        </tr>`;
        
                                    return rowHtml;
                                })
                                .join("")}
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

    function loadGeneralLedger() 
    {
        console.log("Initializing General Ledger Tab...");
    
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
            const period = document.getElementById("period-filter").value;
            const year = document.getElementById("year-filter").value;
            const month = document.getElementById("month-filter").value;
    
            if (!chartOfAccounts) {
                Swal.fire("Validation Error", "Please select a Ledger Account.", "error");
                return false;
            }
    
            if (!year) {
                Swal.fire("Validation Error", "Please enter a valid Year.", "error");
                return false;
            }

            if (period === "Monthly" && !month) {
                Swal.fire("Validation Error", "Please select a Month for the Monthly period.", "error");
                return false;
            }

            return true;
        }
    
        // Fetch Data for General Journal
        function fetchGeneralLedgerData(callback) {
            const chartOfAccounts = document.getElementById("ledger-account").value;
            const period = document.getElementById("period-filter").value;
            const year = document.getElementById("year-filter").value;
            const month = document.getElementById("month-filter").value;
            const monthMapping = {
                "January": 1, "February": 2, "March": 3, "April": 4,
                "May": 5, "June": 6, "July": 7, "August": 8,
                "September": 9, "October": 10, "November": 11, "December": 12
            };
            const formattedMonth = monthMapping[month] || "";

            if (!validateFilters()) return;
        
            const params = new URLSearchParams({
                charted_account: chartOfAccounts === "all" ? "" : chartOfAccounts,
                period: period || "",
                year: year || "",
                month: formattedMonth || "",
            }).toString();

            console.log("Request URL:", `/querygeneraljournal/?${params}`); // Debugging log
            console.log("Sending Parameters:", { chartOfAccounts, period, year, month }); // Debugging log
        
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
                // Ensure journal_details is an array
                if (!Array.isArray(entry.journal_details)) {
                    console.warn("journal_details is not an array, converting:", entry.journal_details);
                    entry.journal_details = entry.journal_details ? [entry.journal_details] : [];
                }
        
                // Map journal details properly
                entry.journal_details = entry.journal_details.map(detail => {
                    console.log("Processing detail:", detail); // Debugging log
        
                    return {
                        accountDesc: chartOfAccounts[detail.Account_FK] || "Unknown Account",
                        debit: detail.DebitAmount ? parseFloat(detail.DebitAmount).toFixed(2) : "0.00",
                        credit: detail.CreditAmount ? parseFloat(detail.CreditAmount).toFixed(2) : "0.00"
                    };
                });
        
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
            // Group data by AccountDesc
            const groupedData = data.reduce((acc, entry) => {
                const accountDesc = entry.journal_details.length > 0
                    ? entry.journal_details[0].accountDesc || "Unknown Account"
                    : "Unknown Account";
        
                if (!acc[accountDesc]) {
                    acc[accountDesc] = [];
                }
                acc[accountDesc].push(entry);
                return acc;
            }, {});
        
            const printWindow = window.open("", "_blank");
            const currentDate = new Date().toLocaleDateString("en-US");
        
            let htmlContent = `
                <html>
                    <head>
                        <title>General Ledger Report</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            h1 { text-align: center; margin-bottom: 5px; }
                            h2 { text-align: center; margin-top: 0; font-size: 1.1rem; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { 
                                border: 1px solid black; 
                                padding: 6px; 
                                text-align: left; 
                                font-size: 14px;
                                word-wrap: break-word;
                            }
                            th { 
                                background-color: #f2f2f2; 
                                text-align: center;
                            }
                            td.right-align { text-align: right; }
                            .account-header { 
                                font-weight: bold; 
                                font-style: italic; 
                                background-color: #eaeaea;
                                text-transform: uppercase;
                            }
                            .net-movement-row {
                                font-weight: bold; 
                                text-align: right; 
                            }
                            .bold-line {
                                border-top: 2px solid black; /* Bold line directly below Net Movement */
                            }
                        </style>
                    </head>
                    <body>
                        <h1>General Ledger Report</h1>
                        <h2>Company: Tikme Dine</h2>
                        <h2>Exported on: ${currentDate}</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 12%;">Date</th>
                                    <th style="width: 46%;">Transaction</th>
                                    <th style="width: 20%;">Reference</th>
                                    <th style="width: 11%;">Debit</th>
                                    <th style="width: 11%;">Credit</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${generateLedgerRows(data)}
                            </tbody>
                        </table>
                    </body>
                </html>`;
        
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
        }
        
        // Function to generate the ledger rows with the correct Net Movement underline placement
        function generateLedgerRows(data) {
            let rows = "";
            let accountGroups = {};
        
            // Group entries by account
            data.forEach((entry) => {
                const accountName = entry.journal_details.length > 0
                    ? entry.journal_details[0].accountDesc || "Unknown Account"
                    : "Unknown Account";
        
                if (!accountGroups[accountName]) {
                    accountGroups[accountName] = [];
                }
                accountGroups[accountName].push(entry);
            });
        
            // Generate table rows
            Object.entries(accountGroups).forEach(([account, entries]) => {
                let totalDebit = 0;
                let totalCredit = 0;
        
                // Account Header
                rows += `<tr><td colspan="5" class="account-header">${account}</td></tr>`;
        
                entries.forEach((entry) => {
                    const formattedDate = entry.Entry_Date 
                        ? new Date(entry.Entry_Date).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }) 
                        : "N/A";
        
                    const particulars = entry.EntryParticulars || "N/A";
                    const reference = entry.Entry_No || "N/A";
        
                    entry.journal_details.forEach((detail, index) => {
                        const debit = parseFloat(detail.debit || 0);
                        const credit = parseFloat(detail.credit || 0);
                        totalDebit += debit;
                        totalCredit += credit;
        
                        rows += `
                            <tr>
                                <td>${index === 0 ? formattedDate : ""}</td>
                                <td>${index === 0 ? particulars : ""}</td>
                                <td>${index === 0 ? reference : ""}</td>
                                <td class="right-align">${debit > 0 ? debit.toLocaleString("en-US", { minimumFractionDigits: 2 }) : ""}</td>
                                <td class="right-align">${credit > 0 ? credit.toLocaleString("en-US", { minimumFractionDigits: 2 }) : ""}</td>
                            </tr>
                        `;
                    });
                });
        
                // Calculate Net Movement: Place under larger amount column
                const netMovement = Math.abs(totalDebit - totalCredit);
                const netDebit = totalDebit > totalCredit ? netMovement : 0;
                const netCredit = totalCredit > totalDebit ? netMovement : 0;
        
                // Net Movement Row (Now bold underline is **directly below** it)
                rows += `
                    <tr class="net-movement-row">
                        <td colspan="3" class="net-movement">Net Movement</td>
                        <td class="right-align">${netDebit > 0 ? `<strong>${netDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>` : ""}</td>
                        <td class="right-align">${netCredit > 0 ? `<strong>${netCredit.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>` : ""}</td>
                    </tr>
                    <tr class="bold-line">
                        <td colspan="5"></td> <!-- Bold underline is now directly below Net Movement -->
                    </tr>
                `;
            });
        
            return rows;
        }
        
        
        
        
        function formatNumber(number) {
            return number.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
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
        console.log("Initializing Trial Balance Tab...");
    
        // Validate Filters
        function validateFilters() {
            const period = document.getElementById("period-filter").value;
            const year = document.getElementById("year-filter").value;
            const month = document.getElementById("month-filter").value;
    
            if (!year) {
                Swal.fire("Validation Error", "Please enter a valid Year.", "error");
                return false;
            }

            if (period === "Monthly" && !month) {
                Swal.fire("Validation Error", "Please select a Month for the Monthly period.", "error");
                return false;
            }

            return true;
        }
    
        // Fetch Trial Balance Data with Date Filters
        function fetchTrialBalanceData() {
            const period = document.getElementById("period-filter").value;
            const year = document.getElementById("year-filter").value;
            const month = document.getElementById("month-filter").value;
        
            const monthMapping = {
                "January": 1, "February": 2, "March": 3, "April": 4,
                "May": 5, "June": 6, "July": 7, "August": 8,
                "September": 9, "October": 10, "November": 11, "December": 12
            };
            const formattedMonth = monthMapping[month] || "";
        
            if (!validateFilters()) return Promise.reject("Invalid filters");
        
            const params = new URLSearchParams({
                period: period || "",
                year: year || "",
                month: formattedMonth || "",
            }).toString();
        
            console.log("Request URL:", `/querytrialbalance/?${params}`); // Debugging log
            console.log("Sending Parameters:", { period, year, month: formattedMonth }); // Debugging log
        
            return fetch(`/querytrialbalance/?${params}`, {
                method: "GET",
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                },
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch trial balance data");
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Fetched Trial Balance Data:", data);
        
                    if (!Array.isArray(data)) {
                        console.error("Expected an array but received:", data);
                        return [];
                    }
        
                    // Calculate total debit & credit from the response
                    let totalDebit = 0;
                    let totalCredit = 0;
        
                    data.forEach(entry => {
                        totalDebit += entry.Debit || 0;
                        totalCredit += entry.Credit || 0;
                    });
        
                    // If both totals are zero, show an alert and return an empty response
                    if (totalDebit === 0 && totalCredit === 0) {
                        Swal.fire("No Data", "No trial balance data found for the selected filters.", "info");
                        return Promise.reject("No data found.");
                    }
        
                    return data; // ✅ Return data instead of using an undefined `callback`
                })
                .catch(error => {
                    console.error("Error fetching trial balance data:", error);
                    Swal.fire("Error", "Failed to fetch data. Please try again.", "error");
                    throw error; // Ensure the error propagates
                });
        }
    
        // Print Function
        function handleTrialBalancePrint(data) {
            const printWindow = window.open("", "_blank");
            const htmlContent = `
                <html>
                    <head>
                        <title>Trial Balance Report</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 20px;
                            }
                            h1, h3, h4 {
                                text-align: center;
                                margin-bottom: 15px;
                            }
                            table {
                                border-collapse: collapse;
                                width: 100%;
                                margin-top: 15px;
                            }
                            th, td {
                                border: 1px solid black;
                                padding: 6px;
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
                        </style>
                    </head>
                    <body>
                        <h1>Trial Balance Report</h1>
                        <h3>Company: Tikme Dine</h3>
                        <h4>Exported on: ${new Date().toLocaleDateString()}</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Account Code</th>
                                    <th>Account Description</th>
                                    <th>Debit</th>
                                    <th>Credit</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.map(entry => `
                                    <tr>
                                        <td>${entry.AccountCode}</td>
                                        <td>${entry.AccountDesc}</td>
                                        <td class="right-align">${entry.Debit > 0 ? entry.Debit.toLocaleString("en-US", { minimumFractionDigits: 2 }) : ""}</td>
                                        <td class="right-align">${entry.Credit > 0 ? entry.Credit.toLocaleString("en-US", { minimumFractionDigits: 2 }) : ""}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </body>
                </html>
            `;
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
        }
    
        // Set Up Print Action Listener
        const printButton = document.getElementById("print-trial-balance");
        if (printButton) {
            printButton.addEventListener("click", () => {
                fetchTrialBalanceData()
                    .then(data => handleTrialBalancePrint(data))
                    .catch(error => console.error("Failed to load trial balance:", error));
            });
        }
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

// Function to export general journal data to CSV


// Group the data by account for CSV export
function groupByAccount(data) {
    return data.reduce((acc, entry) => {
        const accountDesc = entry.journal_details.length > 0
            ? entry.journal_details[0].accountDesc || "Unknown Account"
            : "Unknown Account";

        if (!acc[accountDesc]) {
            acc[accountDesc] = [];
        }
        acc[accountDesc].push(entry);
        return acc;
    }, {});
}

// Format Date for CSV
function formatDate(dateString) {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date"; // Ensure the date is valid

    const month = date.getMonth() + 1; // Months are 0-based
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
}

// Format Number for CSV (e.g., 1000.00 -> 1,000.00)
function formatNumber(number) {
    return parseFloat(number).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

