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
     * 3. Filter journal entries by transaction type and dates.
     * @param {Array} data - Fetched journal entry data.
     * @returns {Array} Filtered journal entries.
     */
    function filterJournalEntries(data) {
        const selectedTypeId = transactionTypeDropdown.value;
        const asOfDate = asOfDateInput.value ? new Date(asOfDateInput.value) : null;
        const startDate = durationStartDateInput.value ? new Date(durationStartDateInput.value) : null;
        const endDate = durationEndDateInput.value ? new Date(durationEndDateInput.value) : null;

        return data.filter((entry) => {
            const transactionTypeId = entry.journal_entry.TransactionType_FK; // ID from entry
            const entryDate = new Date(entry.journal_entry.Entry_Date);

            // Check transaction type and date filters
            const matchesTransactionType = selectedTypeId ? parseInt(transactionTypeId) === parseInt(selectedTypeId) : true;
            const matchesAsOfDate = asOfDate ? entryDate <= asOfDate : true;
            const matchesDurationDate =
                startDate && endDate ? entryDate >= startDate && entryDate <= endDate : true;

            return matchesTransactionType && (matchesAsOfDate || matchesDurationDate);
        });
    }

    /**
     * 4. Export the filtered data to an Excel (CSV) file.
     */
    function exportToExcel(data) {
        if (data.length > 0) {
            const confirmation = confirm("Do you want to download the Excel file?");
            if (!confirmation) return;

            const csvContent =
                "data:text/csv;charset=utf-8," +
                [
                    ["Entry No", "Date", "Particulars", "Transaction Type", "Account Code", "Account Description", "Debit Amount", "Credit Amount"],
                    ...data.flatMap((entry) =>
                        entry.journal_details.map((detail) => [
                            entry.journal_entry.Entry_No,
                            entry.journal_entry.Entry_Date,
                            entry.journal_entry.EntryParticulars,
                            transactionTypeMap[entry.journal_entry.TransactionType_FK] || "Unknown",
                            detail.Account_FK__AccountCode,
                            detail.Account_FK__AccountDesc,
                            detail.DebitAmount,
                            detail.CreditAmount,
                        ])
                    ),
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
        } else {
            alert("No data available for the selected transaction type and date filters.");
        }
    }

    /**
     * 5. Print the filtered data in a new window.
     */
    function printData(data) {
        if (data.length > 0) {
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
                                <th>Entry No</th>
                                <th>Date</th>
                                <th>Particulars</th>
                                <th>Transaction Type</th>
                                <th>Account Code</th>
                                <th>Account Description</th>
                                <th>Debit Amount</th>
                                <th>Credit Amount</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            data.forEach((entry) => {
                entry.journal_details.forEach((detail) => {
                    content += `
                        <tr>
                            <td>${entry.journal_entry.Entry_No}</td>
                            <td>${entry.journal_entry.Entry_Date}</td>
                            <td>${entry.journal_entry.EntryParticulars}</td>
                            <td>${transactionTypeMap[entry.journal_entry.TransactionType_FK] || "Unknown"}</td>
                            <td>${detail.Account_FK__AccountCode}</td>
                            <td>${detail.Account_FK__AccountDesc}</td>
                            <td>${detail.DebitAmount}</td>
                            <td>${detail.CreditAmount}</td>
                        </tr>
                    `;
                });
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
        } else {
            alert("No data available for the selected transaction type and date filters.");
        }
    }

    // Event listeners for buttons
    printButton.addEventListener("click", function (event) {
        event.preventDefault();
        fetchJournalEntries()
            .then((data) => {
                const filteredData = filterJournalEntries(data);
                printData(filteredData);
            })
            .catch((error) => console.error("Error during print request:", error));
    });

    exportButton.addEventListener("click", function (event) {
        event.preventDefault();
        fetchJournalEntries()
            .then((data) => {
                const filteredData = filterJournalEntries(data);
                exportToExcel(filteredData);
            })
            .catch((error) => console.error("Error during export request:", error));
    });

    // Initialize transaction types on page load
    loadTransactionTypes();
});
