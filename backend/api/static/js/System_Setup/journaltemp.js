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
window.viewTemplate = viewTemplate;
window.editTemplate = editTemplate;
window.deleteTemplate = deleteTemplate;
window.removeRow = removeRow;
window.editTemplate = editTemplate;
window.saveEditedTemplate = saveEditedTemplate;
window.toggleDebitCredit = toggleDebitCredit;
window.openAddTemplateModal = openAddTemplateModal;


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

//Search Function on Journal Tempalte Table
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const tableBody = document.getElementById("journalTemplateTable"); // Select the table body

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
                    <td colspan="3" style="text-align: center; color: #6c757d;">
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

// function to load transaction types dropdown on add journal template modal
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

// function to the aacount code on the aacount when adding
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

// function to load and display the journal templates
function loadJournalTemplates() {
    fetch("/journaltemplatefull/?t=" + new Date().getTime(), {
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

// function to add a row to the journal template table and the menu button
function addRowToTable(template) {
    // Retrieve the transaction type name from the map
    const transactionTypeName = transactionTypeMap[parseInt(template.TransactionType_FK)] || "Unknown";

    const newRow = document.createElement("tr");
    newRow.setAttribute("data-id", template.id);
    newRow.classList.add("journal-template-row"); // ✅ Add this class for search functionality
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
    const templateTableBody = document.getElementById("journalTemplateTable");
    templateTableBody.appendChild(newRow);

    // Reinitialize the dropdown for dynamically added elements
    const dropdownToggle = document.querySelectorAll('[data-bs-toggle="dropdown"]');
    dropdownToggle.forEach((dropdown) => {
        new bootstrap.Dropdown(dropdown);
    });
}   

// Show the Add Journal Template modal 
function openAddTemplateModal() {
    $('#addTemplateModal').show();
    loadTransactionTypes(); // Load transaction types when the modal is opened
    loadChartOfAccounts(); // Load chart of accounts when the modal is opened
    $('#templateHeaderSection').show(); // Show right-hand section by default
}
// Close Add Journal Template modal
function closeAddTemplateModal() {
    $('#addTemplateModal').hide();
}

// Handle Add Journal Template form submission to reflect on the table
$('#addTemplateForm').submit(function(event) {
    event.preventDefault();
    const templateCode = $('#templateCode').val();
    const transactionType = $('#transactionType').val();

    if (!templateCode || !transactionType) {
        Swal.fire({
            title: "Validation Error",
            text: "Please fill in all fields before submitting.",
            icon: "error",
            confirmButtonText: "OK",
        });
        return;
    }

    // Validate that at least two accounts are added
    const templateRows = $('#templateRows tr');
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
    templateRows.each(function() {
        const accountCode = $(this).find(".account-code").val();
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
    $.ajax({
        url: "/journaltemplatefull/",
        method: "POST",
        contentType: "application/json",
        headers: { "X-CSRFToken": csrfToken },
        data: JSON.stringify(newTemplate),
        success: function(createdTemplate) {
            console.log("Template header added successfully:", createdTemplate);

            // Add template details for each row
            let promises = [];
            templateRows.each(function() {
                const accountCode = $(this).find(".account-code").val();
                const debitCheckbox = $(this).find(".debit-checkbox").prop("checked");
                const creditCheckbox = $(this).find(".credit-checkbox").prop("checked");

                const newTemplateDetail = {
                    Template_FK: createdTemplate.id,
                    Account_FK: accountCode,
                    Debit: debitCheckbox ? 1 : 0,
                    Credit: creditCheckbox ? 1 : 0,
                };

                promises.push(
                    $.ajax({
                        url: "/journaltemplatedetails/",
                        method: "POST",
                        contentType: "application/json",
                        headers: { "X-CSRFToken": csrfToken },
                        data: JSON.stringify(newTemplateDetail)
                    })
                );
            });

            Promise.all(promises).then(() => {
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
                $('#addTemplateForm')[0].reset();
                $('#addTemplateModal').modal('hide');
                fetchAndRenderTemplates();
            }).catch((error) => {
                console.error("Error adding template details:", error);
                Swal.fire({
                    title: "Error!",
                    text: "Failed to add all template details. Please try again.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            });
        },
        error: function(error) {
            console.error("Error adding template:", error);
            Swal.fire({
                title: "Error!",
                text: "Failed to add the journal template. Please try again.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    });
});

// function to fetch the available templates and dynamically updates an HTML table 
function fetchAndRenderTemplates() {
    $.ajax({
        url: "/journaltemplate/",
        type: "GET",
        dataType: "json", // Expect JSON response
        success: function (templates) {
            let tableBody = $("#templateRows");

            if (tableBody.length === 0) {
                console.error("Table body element not found!");
                return;
            }

            // Clear existing rows
            tableBody.empty();

            // Append all templates to the table
            templates.forEach((template) => {
                let newRow = `
                    <tr>
                        <td>${template.TRTemplateCode}</td>
                        <td>${template.TransactionType_FK}</td>
                        <td>
                            <button class="btn btn-info btn-sm">Edit</button>
                            <button class="btn btn-danger btn-sm">Delete</button>
                        </td>
                    </tr>
                `;
                tableBody.append(newRow);
            });
        },
        error: function (xhr, status, error) {
            console.error("Error fetching templates:", error);
        },
    });
}

// function to add a template row in the modal
function addTemplateRow(containerId = "templateRows") {
    console.log(`Adding row to container: ${containerId}`);
    
    let templateRowsContainer = $(`#${containerId}`);
    if (templateRowsContainer.length === 0) {
        console.error(`Container with ID '${containerId}' not found.`);
        return;
    }

    let newRow = $(`
        <tr>
            <td>
                <select class="form-select account-code">
                    <option value="">Select Account</option>
                    ${window.chartOfAccounts
                        .map(
                            (account) => `<option value="${account.id}">${account.AccountDesc}</option>`
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
                <button type="button" class="btn btn-danger btn-sm btn-remove">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `);

    // Append the new row to the table
    templateRowsContainer.append(newRow);

    // Attach event listener to remove button using jQuery
    newRow.find(".btn-remove").on("click", function () {
        $(this).closest("tr").remove();
    });
}

// Add a row from the template 
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
// Remove a row from the template 
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

// Function to toggle Debit and Credit checkboxes using jQuery
function toggleDebitCredit(checkbox, type) {
    let row = $(checkbox).closest("tr");
    
    if (row.length === 0) {
        console.error("Row not found for the checkbox");
        return;
    }

    // Locate debit and credit checkboxes within the same row
    let debitCheckbox = row.find(".debit-checkbox");
    let creditCheckbox = row.find(".credit-checkbox");

    if (type === "debit" && creditCheckbox.length) {
        // Toggle credit checkbox based on debit checkbox
        creditCheckbox.prop("checked", !$(checkbox).prop("checked"));
    } else if (type === "credit" && debitCheckbox.length) {
        // Toggle debit checkbox based on credit checkbox
        debitCheckbox.prop("checked", !$(checkbox).prop("checked"));
    } else {
        console.error("Checkbox elements are missing in the row.");
    }
}

// EDIT JORUNAL TEMPLATE

// Function to edit a template and load data 
function editTemplate(templateId) {
    console.log("Editing template:", templateId);

    // Fetch the template data
    $.ajax({
        url: `/journaltemplate/${templateId}/`,
        type: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        },
        dataType: "json",
        success: function (data) {
            let template = data.template;
            let details = data.details;

            // Set the hidden input value for templateId
            $("#editTemplateId").val(templateId);

            // Populate transaction type dropdown
            let editTransactionTypeDropdown = $("#editTransactionType");
            editTransactionTypeDropdown.empty(); // Clear existing options

            loadTransactionTypes().then(() => {
                $.each(window.transactionTypeMap, function (transactionTypeId, transactionTypeName) {
                    let option = $("<option>", {
                        value: transactionTypeId,
                        text: transactionTypeName,
                        selected: parseInt(transactionTypeId) === template.TransactionType_FK
                    });
                    editTransactionTypeDropdown.append(option);
                });
            });

            // Populate the edit modal fields
            $("#editTemplateCode").val(template.TRTemplateCode);

            // Clear and populate the template details section
            let editTemplateRowsContainer = $("#editTemplateRows");
            editTemplateRowsContainer.empty(); // Clear existing rows

            if (details && details.length > 0) {
                $.each(details, function (index, detail) {
                    let newRow = $(`
                        <tr data-id="${detail.id}">
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
                                        id="credit-${detail.Account_FK}" 
                                        ${detail.Credit > 0 ? "checked" : ""}
                                        onchange="toggleDebitCredit(this, 'credit')"
                                    />
                                </div>
                            </td>
                            <td class="text-center align-middle">
                                <button type="button" class="btn btn-danger btn-sm btn-remove">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `);

                    // Append the row
                    editTemplateRowsContainer.append(newRow);
                });

                // Attach remove row event handler
                $(".btn-remove").on("click", function () {
                    $(this).closest("tr").remove();
                });
            } else {
                console.warn("No details found for this template.");
            }

            // Show the edit modal
            let editModalElement = $("#editTemplateModal");
            let editModal = new bootstrap.Modal(editModalElement[0]);

            editModalElement.on("hidden.bs.modal", function () {
                $(".modal-backdrop").remove();
            });

            editModal.show();
        },
        error: function (xhr, status, error) {
            console.error("Error fetching template for editing:", error);
        }
    });
}

// Function to save edited template
function saveEditedTemplate(event) {
    if (event) {
        event.preventDefault(); // Prevent default form submission behavior
    }

    const templateId = $("#editTemplateId").val();
    if (!templateId) {
        Swal.fire({
            title: "Error!",
            text: "Template ID is missing. Please reload the page and try again.",
            icon: "error",
            confirmButtonText: "OK",
        });
        return;
    }

    // Gather updated template data
    let updatedTemplate = {
        TRTemplateCode: $("#editTemplateCode").val().trim(),
        TransactionType_FK: parseInt($("#editTransactionType").val()),
    };

    // Validation: Ensure fields are filled
    if (!updatedTemplate.TRTemplateCode || isNaN(updatedTemplate.TransactionType_FK)) {
        Swal.fire({
            title: "Validation Error",
            text: "Please provide a valid Template Code and Transaction Type.",
            icon: "error",
            confirmButtonText: "OK",
        });
        return;
    }

    const rows = $("#editTemplateRows tr");
    let details = [];
    let hasInvalidRow = false;

    rows.each(function () {
        let row = $(this);
        let accountCode = parseInt(row.find(".account-code").val());
        let debitChecked = row.find(".debit-checkbox").prop("checked");
        let creditChecked = row.find(".credit-checkbox").prop("checked");

        // Validate row
        if (!accountCode || debitChecked === creditChecked) {
            hasInvalidRow = true;
            console.warn("Invalid row data:", { accountCode, debitChecked, creditChecked });
            return;
        }

        let detail = {
            Template_FK: parseInt(templateId),
            Account_FK: accountCode,
            Debit: debitChecked ? 1.0 : 0.0,
            Credit: creditChecked ? 1.0 : 0.0,
        };

        let existingDetailId = row.attr("data-id");
        if (existingDetailId) {
            detail.id = parseInt(existingDetailId);
        }

        details.push(detail);
    });

    if (hasInvalidRow) {
        Swal.fire({
            title: "Validation Error",
            text: "All rows must have a valid account and either debit or credit selected.",
            icon: "error",
            confirmButtonText: "OK",
        });
        return;
    }

    if (details.length < 2) {
        Swal.fire({
            title: "Validation Error",
            text: "You must include at least two accounts in the template.",
            icon: "error",
            confirmButtonText: "OK",
        });
        return;
    }

    // Debugging: Log payload before sending request
    console.log("Payload being sent:", JSON.stringify({
        template: updatedTemplate,
        details: details,
    }));

    // Show confirmation prompt before saving
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
            $.ajax({
                url: `/journaltemplate/${templateId}/`,
                type: "PUT",
                contentType: "application/json",
                headers: {
                    "X-CSRFToken": csrfToken,
                },
                data: JSON.stringify({
                    template: updatedTemplate,
                    details: details,
                }),
                success: function (data) {
                    console.log("Template updated successfully:", data);
                    Swal.fire({
                        title: "Success!",
                        text: "Template updated successfully.",
                        icon: "success",
                        confirmButtonText: "OK",
                    }).then(() => {
                        window.location.reload();
                    });
                },
                error: function (xhr, status, error) {
                    console.error("Error updating template:", error);
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to update the template. Please try again.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                },
            });
        }
    });
}

// VIEW JOURNAL TEMPLATE
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
                            <input type="checkbox"
                            style="width: 20px; height: 20px; border: 1px solid rgba(0, 0, 0, 0.5); border-radius: 4px;"
                            ${detail.Debit > 0 ? "checked" : ""} disabled />
                        </td>
                        <td>
                            <input type="checkbox" 
                            style="width: 20px; height: 20px; border: 1px solid rgba(0, 0, 0, 0.5); border-radius: 4px;"
                            ${detail.Credit > 0 ? "checked" : ""} disabled />
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

// DELETE JOURNAL TEMPLATE
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

// Close modal when clicking outside the modal
$(document).on("click", function(event) {
    if ($(event.target).is("#addTemplateModal")) {
        closeAddTemplateModal();
    }
});

// Close modal when clicking the close button
$(".close-modal-btn").on("click", function() {
    closeAddTemplateModal();
});

