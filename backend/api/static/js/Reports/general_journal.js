document.addEventListener("DOMContentLoaded", function () {
    const transactionTypeDropdown = document.querySelector("#specificAccount");
    const asOfDateInput = document.querySelector("#asOfDate");
    const durationStartDateInput = document.querySelector("#durationDateStart");
    const durationEndDateInput = document.querySelector("#durationDateEnd");
    const printButton = document.querySelector(".btn.btn-primary");
    const exportButton = document.querySelector(".btn.btn-success");
    const transactionTypeMap = {}; // Global map for transaction types

    /**
     * 1. Fetch transaction types and populate dropdown and map.
     */
    function loadTransactionTypes() {
        return fetch("/transactiontype/", {
            method: "GET",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load transaction types");
                }
                return response.json();
            })
            .then((data) => {
                transactionTypeDropdown.innerHTML = '<option value="" selected>Select an option</option>';
                data.forEach((type) => {
                    transactionTypeMap[type.id] = type.TransactionTypeName; // Map ID to name
                    const option = document.createElement("option");
                    option.value = type.id; // Use ID as value
                    option.textContent = type.TransactionTypeName; // Display name
                    transactionTypeDropdown.appendChild(option);
                });
            })
            .catch((error) => {
                console.error("Error fetching transaction types:", error);
            });
    }

    /**
     * 2. Fetch journal entries from the backend with filters.
     */
    function fetchJournalEntries() {
        const params = new URLSearchParams();
        const transactionType = transactionTypeDropdown.value;
        const asOfDate = asOfDateInput.value;
        const durationStartDate = durationStartDateInput.value;
        const durationEndDate = durationEndDateInput.value;

        if (!transactionType && !asOfDate && (!durationStartDate || !durationEndDate)) {
            alert("Please select at least one filter: transaction type or date range.");
            return Promise.resolve([]);
        }

        if (transactionType) {
            params.append("transaction_type", transactionType); // TransactionType_FK
        }
        if (asOfDate) {
            params.append("as_of_date", asOfDate); // Filter for entries before this date
        }
        if (durationStartDate && durationEndDate) {
            params.append("start_date", durationStartDate); // Duration start
            params.append("end_date", durationEndDate); // Duration end
        }

        return fetch(`/generaljournalquery/?${params.toString()}`, {
            method: "GET",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load journal entries");
                }
                return response.json();
            })
            .catch((error) => {
                console.error("Error fetching journal entries:", error);
                return [];
            });
    }

    /**
     * 3. Format data for printing and exporting.
     * @param {Array} data - Filtered journal entries.
     * @returns {Array} Formatted journal data.
     */
    function formatJournalData(data) {
        return data.map((entry) => {
            const particulars = entry.journal_entry.EntryParticulars;
            return entry.journal_details.map((detail, index) => ({
                date: entry.journal_entry.Entry_Date,
                account: detail.Account_FK__AccountDesc || "Undefined",
                accountCode: detail.Account_FK__AccountCode || "Undefined",
                debit: detail.DebitAmount,
                credit: detail.CreditAmount,
                particulars: index === 0 ? particulars : "", // Display particulars only once
            }));
        }).flat();
    }

    /**
     * 4. Export to Excel with formatted data.
     */
    function exportToExcel(data) {
        if (data.length === 0) {
            alert("No data available to export.");
            return;
        }

        const confirmation = confirm("Do you want to download the Excel file?");
        if (!confirmation) return;

        const formattedData = formatJournalData(data);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [
                ["Date", "Account", "Account Code", "Debit", "Credit", "Particulars"],
                ...formattedData.map((row) => [
                    row.date,
                    row.account,
                    row.accountCode,
                    row.debit,
                    row.credit,
                    row.particulars,
                ]),
            ]
                .map((row) => row.join(","))
                .join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "general_journal.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * 5. Print formatted journal data.
     */
    function printData(data) {
        if (data.length === 0) {
            alert("No data available to print.");
            return;
        }

        const formattedData = formatJournalData(data);
        const printWindow = window.open("", "_blank");

        let content = `
            <html>
            <head>
                <title>Print General Journal</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; }
                </style>
            </head>
            <body>
                <h1>General Journal</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Account</th>
                            <th>Account Code</th>
                            <th>Debit</th>
                            <th>Credit</th>
                            <th>Particulars</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        formattedData.forEach((row) => {
            content += `
                <tr>
                    <td>${row.date}</td>
                    <td>${row.account}</td>
                    <td>${row.accountCode}</td>
                    <td>${row.debit}</td>
                    <td>${row.credit}</td>
                    <td>${row.particulars}</td>
                </tr>
            `;
        });

        content += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    }

    function filterParameters() {
        const transactionType = transactionTypeDropdown.value;
        const asOfDate = asOfDateInput.value;
        const durationStartDate = durationStartDateInput.value;
        const durationEndDate = durationEndDateInput.value;
    
        // Validate if a transaction type or date filter is applied
        if (!transactionType && !asOfDate && (!durationStartDate || !durationEndDate)) {
            alert("Please select a transaction type or set a valid date range before proceeding.");
            return false; // Invalid filters
        }
        return true; // Valid filters
    }

    // Event listeners for buttons
    // Event listener for the Print button
    printButton.addEventListener("click", function (event) {
        event.preventDefault();

        if (!filterParameters()) return; // Stop execution if filters are invalid

        // Proceed with fetching data and printing
        fetchJournalEntries()
            .then((data) => {
                if (data.length === 0) {
                    alert("No data available to print based on the applied filters.");
                    return;
                }
                printData(data);
            })
            .catch((error) => console.error("Error during print request:", error));
    });

    // Event listener for the Export button
    exportButton.addEventListener("click", function (event) {
        event.preventDefault();

        if (!filterParameters()) return; // Stop execution if filters are invalid

        // Proceed with fetching data and exporting
        fetchJournalEntries()
            .then((data) => {
                if (data.length === 0) {
                    alert("No data available to export based on the applied filters.");
                    return;
                }
                exportToExcel(data);
            })
            .catch((error) => console.error("Error during export request:", error));
    });
    // Initialize transaction types on page load
    loadTransactionTypes();
});
