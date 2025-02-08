document.addEventListener('DOMContentLoaded', () => {
    const csrfToken = getCsrfToken();
    const viewButton = document.getElementById('view_JEV');
    const printButton = document.getElementById('print_JEV');

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

    function fetchChartOfAccounts() {
        return fetch("/chartofacc/", {
            method: "GET",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch chart of accounts");
                }
                return response.json();
            })
            .then((accounts) => {
                // Map accounts by their IDs for easier lookups
                const accountMap = accounts.reduce((map, account) => {
                    map[account.id] = {
                        AccountCode: account.AccountCode || "N/A",
                        AccountDesc: account.AccountDesc || "N/A",
                    };
                    return map;
                }, {});
                console.log("Mapped Chart of Accounts:", accountMap);
                return accountMap;
            })
            .catch((error) => {
                console.error("Error fetching chart of accounts:", error);
                return {}; // Return an empty object on failure
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


    function loadJournalEntries() {
        Promise.all([
            fetch('/journalentriessort/', {
                method: "GET",
                headers: { "X-Requested-With": "XMLHttpRequest" },
            }).then(response => response.json()),
    
            fetch('/entrystatuses/', {
                method: "GET",
                headers: { "X-Requested-With": "XMLHttpRequest" },
            }).then(response => response.json()),
        ])
        .then(([entries, statuses]) => {
            const statusMap = {};
            statuses.forEach(status => {
                statusMap[status.id] = status.Status_Name;
            });
    
            // Clear previous data
            const tables = {
                all: document.querySelector("#all tbody"),
                pending: document.querySelector("#pending tbody"),
                rejected: document.querySelector("#rejected tbody"),
                approved: document.querySelector("#approved tbody"),
            };
    
            Object.values(tables).forEach(table => table.innerHTML = "");
    
            entries.forEach(entry => {
                const journalEntry = entry.journal_entry;
                const entryStatus = statusMap[journalEntry.EntryStatus_FK] || "N/A";
                const formattedDate = new Date(journalEntry.Entry_Date).toLocaleDateString("en-US", {
                    month: "2-digit", day: "2-digit", year: "numeric"
                });
    
                const entryRow = document.createElement("tr");
                entryRow.setAttribute("data-id", journalEntry.id);
    
                // Disable button if the entry is "Rejected"
                const isRejected = entryStatus === "Rejected";
                const menuButtonDisabled = isRejected ? "disabled" : "";
    
                entryRow.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${journalEntry.Entry_No}</td>
                    <td>${journalEntry.EntryParticulars}</td>
                    <td>${journalEntry.Created_By || ""}</td>
                    <td>${journalEntry.Review_Remarks || ""}</td>
                    <td>${entryStatus}</td>
                    <td class="text-center align-middle">
                        <div class="dropdown d-inline-block">
                            <button
                                class="btn btn-secondary dropdown-toggle btn-sm d-flex align-items-center justify-content-between"
                                type="button"
                                id="dropdownMenuButton${journalEntry.id}"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                style="border-radius: 8px; font-weight: 500; font-size: 0.875rem; padding: 0.5rem 1rem; position: relative;"
                                ${menuButtonDisabled}>
                                <span>MENU</span>
                                <i class="bi bi-caret-down-fill ms-1" style="vertical-align: middle;"></i>
                            </button>
                            <ul
                                class="dropdown-menu"
                                aria-labelledby="dropdownMenuButton${journalEntry.id}"
                                style="border: none; border-radius: 8px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); font-size: 0.875rem; min-width: 200px; padding: 0.75rem 0;">
                                <li>
                                    <button
                                        class="dropdown-item text-info view-entry"
                                        data-entry-id="${journalEntry.id}"
                                        style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;"
                                        ${menuButtonDisabled}>
                                        <i class="bi bi-clipboard-check"></i> Review
                                    </button>
                                </li>
                                <li>
                                    <button
                                        class="dropdown-item text-success print-entry"
                                        data-entry-id="${journalEntry.id}"
                                        style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;"
                                        ${menuButtonDisabled}>
                                        <i class="bi bi-printer me-2"></i>Print
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </td>
                `;
    
                // Append to the "All" table
                tables.all.appendChild(entryRow);
    
                // Append to the appropriate status-based table
                if (entryStatus === "Pending") tables.pending.appendChild(entryRow.cloneNode(true));
                if (entryStatus === "Rejected") tables.rejected.appendChild(entryRow.cloneNode(true));
                if (entryStatus === "Approved") tables.approved.appendChild(entryRow.cloneNode(true));
            });
    
            attachActionListeners();
        })
        .catch(error => console.error("Error loading journal entries:", error));
    }
    
    
    

    function attachActionListeners() {
        const viewButtons = document.querySelectorAll(".view-entry");
        const printButtons = document.querySelectorAll(".print-entry");

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
    }

    function saveApproval(entryId) {
        if (!entryId) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Unable to save. Entry ID is missing!",
            });
            return;
        }
    
        const selectedStatus = document.getElementById("statusDropdown").value;
        const remarks = document.getElementById("remarks").value;
    
        if (!selectedStatus) {
            Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Please select a status before saving.",
            });
            return;
        }
    
        // Confirm Save Action
        Swal.fire({
            title: "Are you sure?",
            text: "Do you want to save these changes?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Save it!"
        }).then((result) => {
            if (result.isConfirmed) {
                // Prepare the payload
                const payload = {
                    EntryStatus_FK: parseInt(selectedStatus), // Ensure status is a number
                    Review_Remarks: remarks,
                };
    
                fetch(`/journalentries/${entryId}/`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCsrfToken(),
                    },
                    body: JSON.stringify(payload),
                })
                .then((response) => {
                    if (!response.ok) {
                        return response.json().then((errorData) => {
                            console.error("Server-side validation errors:", errorData);
                            throw new Error("Failed to update journal entry");
                        });
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("Journal entry updated successfully:", data);
    
                    // Close modal after successful save
                    const modal = bootstrap.Modal.getInstance(document.getElementById("jevApprovalModal"));
                    modal.hide(); 
    
                    // Success Message
                    Swal.fire({
                        icon: "success",
                        title: "Success",
                        text: "Journal entry updated successfully!",
                        timer: 2000,
                        showConfirmButton: false
                    });
    
                    // Reload the table with updated data
                    loadJournalEntries();
                })
                .catch((error) => {
                    console.error("Error updating journal entry status and remarks:", error);
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Failed to update journal entry. Please try again.",
                    });
                });
            }
        });
    }
    

    function viewEntry(entryId) {
        document.getElementById("saveApprovalButton").onclick = () => saveApproval(entryId);
        fetchChartOfAccounts().then((accountMap) => {
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
                        const account = accountMap[detail.Account_FK] || {
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
                            <td colspan="4">Particulars: ${
                                data.journal_entry.EntryParticulars || "N/A"
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


    function printEntry(entryId) {
        // Fetch chart of accounts first
        fetchChartOfAccounts().then((accountMap) => {
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
                        const account = accountMap[detail.Account_FK] || {
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

    loadJournalEntries();
});
