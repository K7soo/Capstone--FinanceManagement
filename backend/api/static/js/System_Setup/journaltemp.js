// Function to get CSRF token from the browser's cookies
function getCsrfToken() {
    let csrfToken = null;
    if (document.cookie && document.cookie !== "") {
        document.cookie.split(";").forEach((cookie) => {
            const trimmedCookie = cookie.trim();
            if (trimmedCookie.startsWith("csrftoken=")) {
                csrfToken = trimmedCookie.split("=")[1];
            }
        });
    }
    return csrfToken;
}

// Define Constant Elements
const csrfToken = getCsrfToken();
const addTemplateBtn = document.querySelector(".btn-add");
const addTemplateModal = document.getElementById("addTemplateModal");
const closeModalBtns = document.querySelectorAll(".close");
const addTemplateForm = document.getElementById("addTemplateForm");
const templateTableBody = document.getElementById("journalTemplateTable");
const templateRowsContainer = document.getElementById("templateRows");

// Global variable to store the list of journal templates
window.journalTemplates = [];
window.transactionTypeMap = {}; // Map for TransactionType IDs to names
window.accountMap = {}; // Map for Account IDs to descriptions
window.removedRows = [];

console.log("JavaScript loaded successfully");

function loadTransactionTypes() {
    return fetch("/get-transaction-types/", {
        // Replace with your actual endpoint for fetching transaction types
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
        .then((transactionTypes) => {
            console.log("Fetched transaction types:", transactionTypes);
            const transactionTypeSelect = document.getElementById("transactionType");
            transactionTypeSelect.innerHTML = "<option value=''>Choose Transaction Type</option>"; // Add placeholder option

            transactionTypes.forEach((type) => {
                const option = document.createElement("option");
                option.value = type.id; // Use ID as the value
                option.textContent = type.TransactionTypeName; // Display name in the dropdown
                transactionTypeSelect.appendChild(option);

                // Add to global transactionTypeMap
                window.transactionTypeMap[type.id] = type.TransactionTypeName;
            });
        })
        .catch((error) => console.error("Error fetching transaction types:", error));
}

function loadChartOfAccounts() {
    fetch("/get-chart-types/", {
        // Replace with your actual endpoint for fetching chart of accounts
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to load chart of accounts");
            }
            return response.json();
        })
        .then((accounts) => {
            console.log("Fetched chart of accounts:", accounts);
            accounts.forEach((account) => {
                window.accountMap[account.id] = account.AccountDesc; // Add to global accountMap
            });
            window.chartOfAccounts = accounts;
        })
        .catch((error) => console.error("Error fetching chart of accounts:", error));
}

// Load and display the journal templates
function loadJournalTemplates() {
    fetch("/journaltemplate/?t=" + new Date().getTime(), {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to load journal templates");
            }
            return response.json();
        })
        .then((templates) => {
            console.log("Fetched journal templates:", templates);
            templateTableBody.innerHTML = ""; // Clear the table body
            templates.forEach((template) => addRowToTable(template));
        })
        .catch((error) => console.error("Error fetching journal templates:", error));
}

function loadTransactionTypeMap() {
    return fetch("/get-transaction-types/", {
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
        .then((transactionTypes) => {
            transactionTypes.forEach((type) => {
                transactionTypeMap[type.id] = type.TransactionTypeName; // Map ID to TransactionTypeName
            });
            console.log("TransactionType map loaded:", transactionTypeMap);
        })
        .catch((error) => console.error("Error fetching transaction types:", error));
}

// Add a row to the journal template table
function addRowToTable(template) {
    // Retrieve the transaction type name from the map
    const transactionTypeName = transactionTypeMap[parseInt(template.TransactionType_FK)] || "Unknown";

    const newRow = document.createElement("tr");
    newRow.setAttribute("data-id", template.id);
    newRow.innerHTML = `
        <td>${template.TRTemplateCode}</td>
        <td>${transactionTypeName}</td>
        <td class="text-center align-middle">
            <div class="dropdown d-inline-block">
                <button
                    class="btn btn-secondary dropdown-toggle btn-sm d-flex align-items-center justify-content-between"
                    type="button"
                    id="dropdownMenuButton${template.id}"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style="border-radius: 8px; font-weight: 500; font-size: 0.875rem; padding: 0.5rem 1rem; position: relative;">
                    <span>MENU</span>
                    <i class="bi bi-caret-down-fill ms-1" style="vertical-align: middle;"></i>
                </button>
                <ul
                    class="dropdown-menu"
                    aria-labelledby="dropdownMenuButton${template.id}"
                    style="border: none; border-radius: 8px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); font-size: 0.875rem; min-width: 200px; padding: 0.75rem 0;">
                    <li>
                        <button
                            class="dropdown-item text-info"
                            type="button"
                            onclick="viewTemplate(${template.id})"
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
                            onclick="editTemplate(${template.id})"
                            style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;">
                            <i class="bi bi-pencil-square me-2"></i>Edit
                        </button>
                    </li>
                    <li>
                        <button
                            class="dropdown-item text-danger"
                            type="button"
                            onclick="deleteTemplate(${template.id})"
                            style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;">
                            <i class="bi bi-trash-fill me-2"></i>Delete
                        </button>
                    </li>
                </ul>
            </div>
        </td>
    `;
    templateTableBody.appendChild(newRow);

    // Reinitialize the dropdown for dynamically added elements
    const dropdownToggle = document.querySelectorAll('[data-bs-toggle="dropdown"]');
    dropdownToggle.forEach((dropdown) => {
        new bootstrap.Dropdown(dropdown);
    });
}

// Show the Add Template modal
function openAddTemplateModal() {
    console.log("Add Template button clicked, opening modal.");
    addTemplateModal.style.display = "block";
    loadTransactionTypes(); // Load transaction types when the modal is opened
    loadChartOfAccounts(); // Load chart of accounts when the modal is opened
    document.getElementById("templateHeaderSection").style.display = "block"; // Show right-hand section by default
}
window.openAddTemplateModal = openAddTemplateModal;

// Close Add Template modal
function closeAddTemplateModal() {
    addTemplateModal.style.display = "none";
}

// Handle Add Template form submission
addTemplateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const templateCode = document.getElementById("templateCode").value;
    const transactionType = document.getElementById("transactionType").value;

    if (!templateCode || !transactionType) {
        Swal.fire({
            title: "Validation Error",
            text: "Please fill in all fields before submitting.",
            icon: "error",
            confirmButtonText: "OK",
        });
        return;
    }
    // Validate that at least one account is added
    const templateRows = document.querySelectorAll("#templateRows tr");
    if (templateRows.length === 0) {
        Swal.fire({
            title: "Validation Error",
            text: "You need to attach at least one account to the template.",
            icon: "error",
            confirmButtonText: "OK",
        });
        return;
    }
    // Validation for at least two account rows
    if (templateRows.length < 2) {
        Swal.fire({
            title: "Error",
            text: "You must add at least two accounts to create a template.",
            icon: "error",
            confirmButtonText: "OK",
        });
        return;
    }

    // Validate Select Account in each row
    let allRowsValid = true;
    templateRows.forEach((row) => {
        const accountCode = row.querySelector(".account-code").value;
        if (!accountCode) {
            allRowsValid = false;
        }
    });

    if (!allRowsValid) {
        Swal.fire({
            title: "Error",
            text: "Please select an account for each row.",
            icon: "error",
            confirmButtonText: "OK",
        });
        return;
    }
    const newTemplate = { TRTemplateCode: templateCode, TransactionType_FK: parseInt(transactionType) };

    // Create template header first
    fetch("/journaltemplate/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify(newTemplate),
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((errorData) => {
                    console.error("Backend validation errors:", errorData);
                    throw new Error("Failed to add template");
                });
            }
            return response.json();
        })
        .then((createdTemplate) => {
            console.log("Template header added successfully:", createdTemplate);

            // Add template details for each row
            const promises = [];
            templateRows.forEach((row) => {
                const accountCode = row.querySelector(".account-code").value;
                const debitCheckbox = row.querySelector(".debit-checkbox").checked;
                const creditCheckbox = row.querySelector(".credit-checkbox").checked;

                const newTemplateDetail = {
                    Template_FK: createdTemplate.id,
                    Account_FK: accountCode,
                    Debit: debitCheckbox ? 1 : 0,
                    Credit: creditCheckbox ? 1 : 0,
                };

                promises.push(
                    fetch("/journaltemplatedetails/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRFToken": csrfToken,
                        },
                        body: JSON.stringify(newTemplateDetail),
                    })
                );
            });

            Promise.all(promises)
                .then(() => {
                    console.log("All template details added successfully.");
                    Swal.fire({
                        title: "Success!",
                        text: "Journal template added successfully.",
                        icon: "success",
                        confirmButtonText: "OK",
                    }).then(() => {
                        location.reload(); // Refresh the page
                    });

                    // Reset the form and hide the modal
                    addTemplateForm.reset();
                    const modalInstance = bootstrap.Modal.getInstance(
                        document.getElementById("addTemplateModal")
                    );
                    if (modalInstance) {
                        modalInstance.hide();
                    }

                    // Fetch and render the updated table
                    fetchAndRenderTemplates();
                })
                .catch((error) => {
                    console.error("Error adding template details:", error);
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to add all template details. Please try again.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                });
        })
        .catch((error) => {
            console.error("Error adding template:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to add the journal template. Please try again.",
                icon: "error",
                confirmButtonText: "OK",
            });
        });
});

function fetchAndRenderTemplates() {
    fetch("/journaltemplate/")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch templates.");
            }
            return response.text();
        })
        .then((templates) => {
            const tableBody = document.getElementById("templateRows");
            if (!tableBody) {
                console.error("Table body element not found!");
                return;
            }

            // Clear existing rows
            tableBody.innerHTML = "";

            // Append all templates to the table
            templates.forEach((template) => {
                const newRow = document.createElement("tr");
                newRow.innerHTML = `
                    <td>${template.TRTemplateCode}</td>
                    <td>${template.TransactionType_FK}</td>
                    <td>
                        <button class="btn btn-info btn-sm">Edit</button>
                        <button class="btn btn-danger btn-sm">Delete</button>
                    </td>
                `;
                tableBody.appendChild(newRow);
            });
        })
        .catch((error) => {
            console.error("Error fetching templates:", error);
        });
}


// Add a row to the template (modal)
function addTemplateRow(containerId = "templateRows") {
    console.log(`Adding row to container: ${containerId}`);
    const templateRowsContainer = document.getElementById(containerId);
    if (!templateRowsContainer) {
        console.error(`Container with ID '${containerId}' not found.`);
        return;
    }

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td>
            <select class="form-select account-code">
                <option value="">Select Account</option>
                ${window.chartOfAccounts
            .map(
                (account) => `
                            <option value="${account.id}">${account.AccountDesc}</option>
                        `
            )
            .join("")}
            </select>
        </td>
        <td>
            <div class="form-check d-flex justify-content-center align-items-center">
                <input 
                    type="checkbox" 
                    class="form-check-input debit-checkbox" 
                    style="width: 20px; height: 20px; border: 1px solid rgba(0, 0, 0, 0.5); border-radius: 4px;"

                    onchange="toggleDebitCredit(this, 'debit')" 
                />
            </div>
        </td>
        <td>
            <div class="form-check d-flex justify-content-center align-items-center">
                <input 
                    type="checkbox" 
                    class="form-check-input credit-checkbox" 
                    style="width: 20px; height: 20px; border: 1px solid rgba(0, 0, 0, 0.5); border-radius: 4px;"
                    onchange="toggleDebitCredit(this, 'credit')" 
                />
            </div>
        </td>
        <td class="text-center align-middle">
            <button type="button" class="btn btn-danger btn-sm btn-remove" onclick="removeRow(this)">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    templateRowsContainer.appendChild(newRow);
}

function toggleDebitCredit(checkbox, type) {
    const row = checkbox.closest("tr");
    if (!row) {
        console.error("Row not found for the checkbox");
        return;
    }

    // Locate debit and credit checkboxes within the same row
    const debitCheckbox = row.querySelector(".debit-checkbox");
    const creditCheckbox = row.querySelector(".credit-checkbox");

    if (type === "debit" && creditCheckbox) {
        // Toggle credit checkbox based on debit checkbox
        creditCheckbox.checked = !checkbox.checked;
    } else if (type === "credit" && debitCheckbox) {
        // Toggle debit checkbox based on credit checkbox
        debitCheckbox.checked = !checkbox.checked;
    } else {
        console.error("Checkbox elements are missing in the row.");
    }
}


function viewTemplate(templateId) {
    console.log("Viewing template:", templateId);

    fetch(`/journaltemplate/${templateId}/`, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch template and details");
            }
            return response.json();
        })
        .then((data) => {
            console.log("Fetched template details:", data);

            const template = data.template;
            const details = data.details;

            // Update modal header with template information
            document.getElementById("viewTemplateCode").textContent = template.TRTemplateCode;
            document.getElementById("viewTransactionType").textContent =
                window.transactionTypeMap[template.TransactionType_FK] || "Unknown";

            // Clear and populate the modal table
            const viewTemplateRows = document.getElementById("viewTemplateRows");
            viewTemplateRows.innerHTML = ""; // Clear existing rows

            if (details && details.length > 0) {
                details.forEach((detail) => {
                    const account = window.chartOfAccounts.find(acc => acc.id === detail.Account_FK);
                    const accountCode = account ? account.AccountCode : "Unknown";
                    const accountDesc = account ? account.AccountDesc : "Unknown";

                    const newRow = document.createElement("tr");
                    newRow.innerHTML = `
                        <td>${accountCode}</td>
                        <td>${accountDesc}</td>
                        <td>
                            <input type="checkbox" ${detail.Debit > 0 ? "checked" : ""} disabled />
                        </td>
                        <td>
                            <input type="checkbox" ${detail.Credit > 0 ? "checked" : ""} disabled />
                        </td>
                    `;
                    viewTemplateRows.appendChild(newRow);
                });
            } else {
                const emptyRow = document.createElement("tr");
                emptyRow.innerHTML = `
                    <td colspan="4" class="text-center">No details available.</td>
                `;
                viewTemplateRows.appendChild(emptyRow);
            }

            // Use Bootstrap modal API to show the modal
            const viewModal = new bootstrap.Modal(document.getElementById("viewTemplateModal"));
            viewModal.show();
        })
        .catch((error) => console.error("Error viewing template:", error));
}


document.addEventListener("DOMContentLoaded", () => {
    // Close modal logic is handled by Bootstrap automatically
    // Optional: Add custom logic if needed, but this isn't necessary for Bootstrap modals
});

// Function to edit a template //

// Open the Edit Template Modal and Load Data
// Function to toggle Debit and Credit checkboxes
function toggleDebitCredit(checkbox, type) {
    const row = checkbox.closest("tr");
    if (!row) {
        console.error("Row not found for the checkbox");
        return;
    }

    // Locate debit and credit checkboxes within the same row
    const debitCheckbox = row.querySelector(".debit-checkbox");
    const creditCheckbox = row.querySelector(".credit-checkbox");

    if (type === "debit" && creditCheckbox) {
        // Toggle credit checkbox based on debit checkbox
        creditCheckbox.checked = !checkbox.checked;
    } else if (type === "credit" && debitCheckbox) {
        // Toggle debit checkbox based on credit checkbox
        debitCheckbox.checked = !checkbox.checked;
    } else {
        console.error("Checkbox elements are missing in the row.");
    }
}

// Open the Edit Template Modal and Load Data
function editTemplate(templateId) {
    console.log("Editing template:", templateId);

    // Fetch the template data
    fetch(`/journaltemplate/${templateId}/`, {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch template for editing");
            }
            return response.json();
        })
        .then((data) => {
            const template = data.template;
            const details = data.details;

            // Set the hidden input value for templateId
            document.getElementById("editTemplateId").value = templateId;

            // Populate transaction type dropdown
            const editTransactionTypeDropdown = document.getElementById("editTransactionType");
            editTransactionTypeDropdown.innerHTML = ""; // Clear existing options

            loadTransactionTypes().then(() => {
                Object.keys(window.transactionTypeMap).forEach((transactionTypeId) => {
                    const option = document.createElement("option");
                    option.value = transactionTypeId;
                    option.textContent = window.transactionTypeMap[transactionTypeId];

                    // Pre-select the current Transaction Type
                    if (parseInt(transactionTypeId) === template.TransactionType_FK) {
                        option.selected = true;
                    }

                    editTransactionTypeDropdown.appendChild(option);
                });
            });

            // Populate the edit modal fields
            document.getElementById("editTemplateCode").value = template.TRTemplateCode;

            // Clear and populate the template details section
            const editTemplateRowsContainer = document.getElementById("editTemplateRows");
            editTemplateRowsContainer.innerHTML = ""; // Clear existing rows

            if (details && details.length > 0) {
                details.forEach((detail) => {
                    const newRow = document.createElement("tr");
                    newRow.setAttribute("data-id", detail.id);
                    newRow.innerHTML = `
                        <td>
                            <select class="form-select account-code">
                                <option value="">Select Account</option>
                                ${window.chartOfAccounts
                            .map(
                                (account) => `
                                            <option value="${account.id}" ${account.id === detail.Account_FK ? "selected" : ""}>
                                                ${account.AccountDesc}
                                            </option>
                                        `
                            )
                            .join("")}
                            </select>
                        </td>
                        <td>
                            <div class="form-check d-flex justify-content-center align-items-center">
                                <input 
                                    type="checkbox" 
                                    class="form-check-input debit-checkbox" 
                                    style="width: 20px; height: 20px; border: 1px solid rgba(0, 0, 0, 0.5); border-radius: 4px;"
                                    id="debit-${detail.Account_FK}" 
                                    ${detail.Debit > 0 ? "checked" : ""}
                                    onchange="toggleDebitCredit(this, 'debit')"
                                />
                            </div>
                        </td>
                        <td>
                            <div class="form-check d-flex justify-content-center align-items-center">
                                <input 
                                    type="checkbox" 
                                    class="form-check-input credit-checkbox" 
                                    style="width: 20px; height: 20px; border: 1px solid rgba(0, 0, 0, 0.5); border-radius: 4px;"
                                    id="credit-${detail.Account_FK}" 
                                    ${detail.Credit > 0 ? "checked" : ""}
                                    onchange="toggleDebitCredit(this, 'credit')"
                                />
                            </div>
                        </td>
                        <td class="text-center align-middle">
                            <button type="button" class="btn btn-danger btn-sm btn-remove" onclick="removeRow(this)">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    `;
                    editTemplateRowsContainer.appendChild(newRow);
                });
            } else {
                console.warn("No details found for this template.");
            }

            // Show the edit modal
            const editModalElement = document.getElementById("editTemplateModal");
            const editModal = new bootstrap.Modal(editModalElement);

            editModalElement.addEventListener("hidden.bs.modal", () => {
                // Ensure backdrop is removed when the modal is closed
                const backdrop = document.querySelector(".modal-backdrop");
                if (backdrop) {
                    backdrop.remove();
                }
            });

            editModal.show();
        })
        .catch((error) => console.error("Error fetching template for editing:", error));
}

// Ensure both functions are globally accessible
window.editTemplate = editTemplate;
window.toggleDebitCredit = toggleDebitCredit;

let removedRows = [];

function removeRow(button) {
    const row = button.closest("tr");
    const existingDetailId = row.getAttribute("data-id");

    if (existingDetailId) {
        removedRows.push(parseInt(existingDetailId)); // Track removed row IDs
    }

    row.remove();
}
window.removeRow = removeRow;

// Save Edited Template
function saveEditedTemplate(event) {
    if (event) {
        event.preventDefault(); // Prevent default form submission behavior
    }

    const templateId = document.getElementById("editTemplateId").value; // Fetch template ID
    if (!templateId) {
        Swal.fire({
            title: "Error!",
            text: "Template ID is missing. Please reload the page and try again.",
            icon: "error",
            confirmButtonText: "OK",
        });
        return; // Exit if template ID is missing
    }

    // Gather updated template data
    const updatedTemplate = {
        TRTemplateCode: document.getElementById("editTemplateCode").value, // Template Code
        TransactionType_FK: parseInt(document.getElementById("editTransactionType").value), // Transaction Type
    };

    // Validation: Ensure fields are filled
    if (!updatedTemplate.TRTemplateCode || isNaN(updatedTemplate.TransactionType_FK)) {
        Swal.fire({
            title: "Validation Error",
            text: "Please provide a valid Template Code and Transaction Type.",
            icon: "error",
            confirmButtonText: "OK",
        });
        return; // Exit on validation error
    }

    const rows = document.querySelectorAll("#editTemplateRows tr"); // Get table rows
    const details = []; // Collect all rows' data
    let hasInvalidRow = false;

    // Process each row in the table
    rows.forEach((row) => {
        const accountCode = parseInt(row.querySelector(".account-code").value); // Fetch Account Code
        const debitChecked = row.querySelector(".debit-checkbox").checked; // Debit selected
        const creditChecked = row.querySelector(".credit-checkbox").checked; // Credit selected

        // Validate row
        if (!accountCode || debitChecked === creditChecked) {
            hasInvalidRow = true; // Mark row as invalid
            console.warn("Invalid row data:", { accountCode, debitChecked, creditChecked }); // Log invalid row
            return; // Skip this row
        }

        const detail = {
            Template_FK: parseInt(templateId), // Template ID
            Account_FK: accountCode, // Account Code
            Debit: debitChecked ? 1.0 : 0.0, // Debit Value
            Credit: creditChecked ? 1.0 : 0.0, // Credit Value
        };

        const existingDetailId = row.getAttribute("data-id"); // Check if existing or new
        if (existingDetailId) {
            detail.id = parseInt(existingDetailId); // Add existing ID for updates
        }

        details.push(detail); // Add row to the details array
    });

    // Validation: Check for invalid rows
    if (hasInvalidRow) {
        Swal.fire({
            title: "Validation Error",
            text: "All rows must have a valid account and either debit or credit selected.",
            icon: "error",
            confirmButtonText: "OK",
        });
        return; // Exit if rows are invalid
    }

    // Validation: Ensure at least two accounts are included
    if (details.length < 2) {
        Swal.fire({
            title: "Validation Error",
            text: "You must include at least two accounts in the template.",
            icon: "error",
            confirmButtonText: "OK",
        });
        return; // Exit if fewer than two accounts
    }

    // Confirm Save Changes
    Swal.fire({
        title: "Are you sure?",
        text: "Do you want to save these changes?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, save it!",
        cancelButtonText: "Cancel",
        cancelButtonColor: "#d33",
    }).then((result) => {
        if (result.isConfirmed) {
            // Send the update request
            fetch(`/journaltemplate/${templateId}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                body: JSON.stringify({
                    template: updatedTemplate,
                    details: details, // Pass collected details
                }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to update template");
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("Template updated successfully:", data);
                    Swal.fire({
                        title: "Success!",
                        text: "Template updated successfully.",
                        icon: "success",
                        confirmButtonText: "OK",
                    }).then(function () {
                        window.location.reload(); // Reload the page after success
                    });
                })
                .catch((error) => {
                    console.error("Error updating template:", error);
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to update the template. Please try again.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                });
        }
    });
}

window.saveEditedTemplate = saveEditedTemplate;





// Function to delete a template
function deleteTemplate(templateId) {
    console.log("Deleting template:", templateId);

    // SweetAlert confirmation dialog
    Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this template? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonColor: '#fffff',
        cancelButtonText: "Cancel",
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/journaltemplate/${templateId}/`, {
                method: "DELETE",
                headers: {
                    "X-CSRFToken": csrfToken,
                    "X-Requested-With": "XMLHttpRequest",
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to delete template");
                    }

                    console.log("Template deleted successfully:", templateId);

                    // Remove the deleted template's row from the table
                    const rowToDelete = document.querySelector(`tr[data-id='${templateId}']`);
                    if (rowToDelete) {
                        rowToDelete.remove();
                    }

                    // SweetAlert success message
                    Swal.fire({
                        title: "Deleted!",
                        text: "The template has been deleted successfully.",
                        icon: "success",
                        confirmButtonText: "OK",
                    });
                })
                .catch((error) => {
                    console.error("Error deleting template:", error);

                    // SweetAlert error message
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to delete the template. Please try again.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                });
        }
    });
}

// Expose the functions globally to make them accessible from the HTML
window.viewTemplate = viewTemplate;
window.editTemplate = editTemplate;
window.deleteTemplate = deleteTemplate;

// Remove a row from the template (modal) // Global variable to track removed rows
// Global variable to track removed rows

function removeRow(button) {
    const row = button.closest("tr");
    const existingDetailId = row.getAttribute("data-id");

    if (existingDetailId) {
        if (!removedRows.includes(parseInt(existingDetailId))) {
            removedRows.push(parseInt(existingDetailId)); // Track removed row IDs
            console.log(`Row with ID ${existingDetailId} marked for deletion.`);
        }
    }

    row.remove(); // Remove the row from the DOM
}
window.removeRow = removeRow;

function addRow(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("Container not found for adding row:", containerId);
        return;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>
            <select class="account-code">
                <option value="">Select Account</option>
                <!-- Populate dynamically with account options -->
            </select>
        </td>
        <td><input type="checkbox" class="debit-checkbox" /></td>
        <td><input type="checkbox" class="credit-checkbox" /></td>
        <td><button type="button" class="remove-row-btn">Remove</button></td>
    `;
    container.appendChild(row);

    console.log("Adding row to container:", containerId);
}

// Close modals on clicking the close button or outside modal
closeModalBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        closeAddTemplateModal();
    });
});

window.addEventListener("click", (event) => {
    if (event.target === addTemplateModal) {
        closeAddTemplateModal();
    }
});

function closeEditTemplateModal() {
    const editTemplateModal = document.getElementById("editTemplateModal");
    editTemplateModal.style.display = "none";
}
window.closeEditTemplateModal = closeEditTemplateModal;

window.addEventListener("click", (event) => {
    if (event.target === addTemplateModal) {
        closeAddTemplateModal();
    }

    const editTemplateModal = document.getElementById("editTemplateModal");
    if (event.target === editTemplateModal) {
        closeEditTemplateModal();
    }
});

// Initial load
document.addEventListener("DOMContentLoaded", () => {
    loadTransactionTypes()
        .then(() => {
            loadJournalTemplates();
            loadChartOfAccounts();
            console.log("Page fully loaded, journal templates and transaction types fetched.");
        })
        .catch((error) => console.error("Error loading transaction types:", error));
});
console.log("Payload being sent:", JSON.stringify({
    template: updatedTemplate,
    details: details,
}));