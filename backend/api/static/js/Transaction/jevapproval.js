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
    
                const tableBody = document.querySelector("#jevApprovalTable tbody");
                if (!tableBody) {
                    console.error("Table body not found.");
                    return;
                }
                tableBody.innerHTML = ""; // Clear existing rows
    
                entries.forEach(entry => {
                    const journalEntry = entry.journal_entry;
                    const entryStatus = statusMap[journalEntry.EntryStatus_FK] || "N/A";
    
                    // Add a row for the journal entry
                    const entryRow = document.createElement("tr");
                    entryRow.setAttribute("data-id", journalEntry.id);
                    entryRow.innerHTML = `
                        <td>${journalEntry.Entry_Date}</td>
                        <td>${journalEntry.Entry_No}</td>
                        <td>${journalEntry.EntryParticulars}</td>
                        <td>${journalEntry.Created_By || ""}</td>
                        <td>${entryStatus}</td>
                        <td>${journalEntry.Review_Remarks || ""}</td>
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
                                            class="dropdown-item text-info view-entry"
                                            data-entry-id="${journalEntry.id}"
                                            style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;">
                                            <i class="bi bi-eye me-2"></i>Notes and Remarks
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            class="dropdown-item text-success print-entry"
                                            data-entry-id="${journalEntry.id}"
                                            style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;">
                                            <i class="bi bi-printer me-2"></i>Print
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

    function viewEntry(entryId) {
        fetch(`/journalentries/${entryId}/`, {
            method: "GET",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch JEV details");
            return response.json();
        })
        .then(data => {
            document.getElementById("jevDate").innerText = data.Entry_Date || "N/A";
            document.getElementById("status").innerText = data.Status_Name || "N/A";
            document.getElementById("jevNumber").innerText = data.Entry_No || "N/A";
            document.getElementById("template").innerText = data.TemplateCode || "N/A";
            document.getElementById("particulars").innerText = data.Entry_Particulars || "N/A";

            const accountTableBody = document.getElementById("jevAccountTableBody");
            accountTableBody.innerHTML = "";
            data.Accounts.forEach(account => {
                const row = `
                    <tr>
                        <td>${account.Account || ""}</td>
                        <td>${account.Debit || ""}</td>
                        <td>${account.Credit || ""}</td>
                    </tr>
                `;
                accountTableBody.insertAdjacentHTML("beforeend", row);
            });

            new bootstrap.Modal(document.getElementById("jevApprovalModal")).show();
        })
        .catch(error => console.error("Error fetching JEV details:", error));
    }

    function printEntry(entryId) {
        fetch(`/journalentries/${entryId}/`, {
            method: "GET",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch JEV details for printing");
            return response.json();
        })
        .then(data => {
            const printWindow = window.open("", "_blank");
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print JEV</title>
                    </head>
                    <body>
                        <h1>JEV Details</h1>
                        <p><strong>Date:</strong> ${data.Entry_Date || "N/A"}</p>
                        <p><strong>Status:</strong> ${data.Status_Name || "N/A"}</p>
                        <p><strong>JEV Number:</strong> ${data.Entry_No || "N/A"}</p>
                        <p><strong>Template:</strong> ${data.Template || "N/A"}</p>
                        <p><strong>Particulars:</strong> ${data.Entry_Particulars || "N/A"}</p>
                        <table border="1" cellpadding="5" cellspacing="0">
                            <thead>
                                <tr>
                                    <th>Account</th>
                                    <th>Debit</th>
                                    <th>Credit</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.Accounts.map(account => `
                                    <tr>
                                        <td>${account.Account || ""}</td>
                                        <td>${account.Debit || ""}</td>
                                        <td>${account.Credit || ""}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        })
        .catch(error => console.error("Error preparing print data:", error));
    }

    loadJournalEntries();
});
