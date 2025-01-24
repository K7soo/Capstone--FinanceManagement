// Function to get CSRF token from the browser's cookies
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

// Define Constant Elements
const csrfToken = getCsrfToken();
const addChartBtn = document.querySelector('.add-chart-btn');
const addChartModal = document.getElementById('addChartModal');
const editChartModal = document.getElementById('editChartModal');
const closeModalBtns = document.querySelectorAll('.close-btn');
const cancelModalBtns = document.querySelectorAll('.modal-cancel-btn');
const addChartForm = document.getElementById('addChartForm');
const editChartForm = document.getElementById('editChartForm');
const tableBody = document.querySelector('.table-acc tbody');
const accountTypeDropdown = document.querySelector("select[name='AccountType']");
const editAccountTypeDropdown = document.getElementById('EditAccountType');
const paginationNav = document.querySelector('.pagination-nav');
// search function
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const tableBody = document.querySelector("table tbody"); // Select the table body

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
        if (!hasResults) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #6c757d;">
                        No matching records found.
                    </td>
                </tr>
            `;
        }
    });
});


// end of search function

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
    loadAccountTypeMap().then(loadChartOfAccounts);
});
// Global variable to store the mapping of AccountType_FK to AccountTypeDesc
let accountTypeMap = {};
// Fetch and map AccountType IDs to AccountTypeDesc
function loadAccountTypeMap() {
    return fetch('/get-account-types/', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load account types');
            }
            return response.json();
        })
        .then(accountTypes => {
            accountTypes.forEach(type => {
                accountTypeMap[type.id] = type.AccountTypeDesc; // Map ID to AccountTypeDesc
            });
            populateAccountTypeDropdown(accountTypeDropdown, accountTypes);
            console.log("AccountType map loaded:", accountTypeMap);
        })
        .catch(error => console.error('Error fetching account types:', error));
}

// Populate dropdown for Account Types
function populateAccountTypeDropdown(dropdown, accountTypes) {
    dropdown.innerHTML = '<option value="">Select Account Type</option>';
    accountTypes.forEach(accountType => {
        const option = document.createElement('option');
        option.value = accountType.id;
        option.textContent = accountType.AccountTypeDesc; // Display AccountTypeDesc in the dropdown
        dropdown.appendChild(option);
    });
}

function sortTable(columnIndex) {
    const table = document.getElementById("chartOfAccTable");
    if (!table) {
        console.error("Table with ID 'chartOfAccTable' not found");
        return;
    }

    const tbody = table.querySelector("tbody");
    if (!tbody) {
        console.error("Tbody element not found in the table");
        return;
    }

    // Clear previous sort indicators
    const headers = table.querySelectorAll("th");
    headers.forEach(header => {
        header.classList.remove("sort-asc", "sort-desc");
    });

    const rows = Array.from(tbody.rows);
    let ascending = table.dataset.sortOrder !== "asc"; // Toggle sort order
    table.dataset.sortOrder = ascending ? "asc" : "desc";

    // Add sort indicator
    const currentHeader = headers[columnIndex];
    currentHeader.classList.add(ascending ? "sort-asc" : "sort-desc");

    rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent.trim();
        const bText = b.cells[columnIndex].textContent.trim();

        if (!isNaN(aText) && !isNaN(bText)) {
            return ascending ? aText - bText : bText - aText;
        }

        return ascending ? aText.localeCompare(bText) : bText.localeCompare(aText);
    });

    rows.forEach(row => tbody.appendChild(row));
}

function paginateTable(tableId, rowsPerPage) {
    const table = document.getElementById(tableId);
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.rows);
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    let currentPage = 1;

    function renderPage() {
        tbody.innerHTML = ""; // Clear the table
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        rows.slice(start, end).forEach(row => tbody.appendChild(row));
    }

    function createPaginationControls() {
        const paginationControls = document.getElementById("paginationControls");
        paginationControls.innerHTML = ""; // Clear existing controls

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.className = "pagination-button";
            button.onclick = () => {
                currentPage = i;
                renderPage();
                updateActiveButton();
            };
            paginationControls.appendChild(button);
        }
    }

    function updateActiveButton() {
        const buttons = document.querySelectorAll("#paginationControls .pagination-button");
        buttons.forEach((button, index) => {
            button.classList.toggle("active", index === currentPage - 1);
        });
    }

    renderPage();
    createPaginationControls();
    updateActiveButton();
}
// Call paginateTable with your table ID and desired rows per page
paginateTable("chartOfAccTable", 10);

// Add a row to the table
function addRowToTable(account) {
    const accountTypeName = accountTypeMap[account.AccountType_FK] || 'Unknown';
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-id', account.id);
    newRow.innerHTML = `
        <td>${account.AccountCode}</td>
        <td>${account.AccountDesc}</td>
        <td>${accountTypeName}</td>
        <td class="text-center align-middle">
    <div class="dropdown d-inline-block">
        <button
            class="btn btn-secondary dropdown-toggle btn-sm d-flex align-items-center justify-content-between"
            type="button"
            id="dropdownMenuButton${account.id}"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style="border-radius: 8px; font-weight: 500; font-size: 0.875rem; padding: 0.5rem 1rem; position: relative;">
            <span>MENU</span>
            <i class="bi bi-caret-down-fill ms-1" style="vertical-align: middle;"></i>
        </button>
        <ul
            class="dropdown-menu"
            aria-labelledby="dropdownMenuButton${account.id}"
            style="border: none; border-radius: 8px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); font-size: 0.875rem; min-width: 200px; padding: 0.75rem 0;">
            <li>
                <button
                    class="dropdown-item text-warning"
                    type="button"
                    onclick="openEditModal('${account.id}', '${account.AccountCode}', '${account.AccountDesc}', '${account.AccountType_FK}')"
                    style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;">
                    <i class="bi bi-pencil-square me-2"></i>Edit
                </button>
            </li>
            <li>
                <button
                    class="dropdown-item text-danger"
                    type="button"
                    onclick="deleteAccountConfirmation(this)"
                    style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;">
                    <i class="bi bi-trash-fill me-2"></i>Delete
                </button>
            </li>
        </ul>
    </div>
</td>

    `;
    // Append the new row to the table body
    tableBody.appendChild(newRow);
}
// Load and display the chart of accounts
function loadChartOfAccounts() {
    fetch('/chartofacc/?t=' + new Date().getTime(), {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load chart of accounts');
            }
            return response.json();
        })
        .then(accounts => {
            console.log("Fetched chart of accounts:", accounts);
            tableBody.innerHTML = ""; // Clear the table body
            accounts.forEach(account => {
                if (account && account.AccountType_FK && accountTypeMap[account.AccountType_FK]) {
                    addRowToTable(account);
                } else {
                    console.warn("Category has no accounts or is malformed:", account);
                }
            });
        })
        .catch(error => console.error('Error fetching chart of accounts:', error));
}

// Show the Add Account modal
addChartBtn.addEventListener('click', () => {
    console.log("Add Account button clicked, opening modal.");
    addChartModal.style.display = 'block';
    loadAccountTypeMap(); // Ensure dropdown is populated
});

// Handle Add Account form submission
addChartForm.addEventListener('submit', event => {
    event.preventDefault();
    const accountCode = document.querySelector('input[name="AccountCode"]').value.trim();
    const accountDesc = document.querySelector('input[name="AccountDesc"]').value.trim();
    const accountTypeFK = parseInt(accountTypeDropdown.value);

    if (!accountTypeFK) {
        Swal.fire({
            title: 'Validation Error!',
            text: 'Please select a valid account type.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }

    const newAccount = { AccountCode: accountCode, AccountDesc: accountDesc, AccountType_FK: accountTypeFK };

    fetch('/chartofacc/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(newAccount)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add account');
            }
            return response.json();
        })
        .then(createdAccount => {
            console.log("Account added successfully:", createdAccount);
            addRowToTable(createdAccount);
            addChartForm.reset();

            // Use Sweet Alert to show success message
            showSuccessAlert('Account has been added successfully!');

            // Use Bootstrap API to hide the modal
            const bootstrapModal = bootstrap.Modal.getInstance(addChartModal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            } else {
                console.warn("Bootstrap modal instance not found. Forcing cleanup.");
                cleanupModal();
            }
        })
        .catch(error => console.error('Error adding account:', error));
});

// Handle Modal Hidden Event
document.getElementById('addChartModal').addEventListener('hidden.bs.modal', () => {
    console.log("Modal hidden event triggered.");
    cleanupModal();
});

editChartForm.addEventListener('submit', event => {
    event.preventDefault();

    const accountId = document.getElementById('EditAccountId').value;
    const accountCode = document.getElementById('EditAccountCode').value.trim();
    const accountDesc = document.getElementById('EditAccountDesc').value.trim();
    const accountTypeFK = parseInt(editAccountTypeDropdown.value);

    // Retrieve original values from data attributes
    const originalAccountCode = editChartForm.dataset.originalAccountCode?.trim() || ""; // Original AccountCode
    const originalAccountDesc = editChartForm.dataset.originalAccountDesc?.trim() || ""; // Original AccountDesc
    const originalAccountTypeFK = parseInt(editChartForm.dataset.originalAccountTypeFK || "0"); // Original AccountType_FK

    // Check if any changes were made
    if (
        accountCode === originalAccountCode &&
        accountDesc === originalAccountDesc &&
        accountTypeFK === originalAccountTypeFK
    ) {
        // Show Sweet Alert if no changes are made
        Swal.fire({
            title: 'No Changes Made',
            text: 'You have not made any changes to the account.',
            icon: 'info',
            showConfirmButton: false,
            timer: 2000, // Auto-close after 2 seconds
            timerProgressBar: true
        });
        return; // Exit without submitting
    }

    // Proceed with submitting the changes
    const updatedAccount = {
        AccountCode: accountCode,
        AccountDesc: accountDesc,
        AccountType_FK: accountTypeFK,
    };

    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to save changes to this account?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, save it!',
        cancelButtonText: 'Cancel',
        cancelButtonColor: '#d33',
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/chartofacc/${accountId}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
                body: JSON.stringify(updatedAccount),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to update account');
                    }
                    return response.json();
                })
                .then(updatedData => {
                    console.log("Account updated successfully:", updatedData);
                    loadChartOfAccounts(); // Refresh the table

                    // Hide the modal using Bootstrap's Modal class
                    const bootstrapModal = bootstrap.Modal.getInstance(document.getElementById('editChartModal'));
                    bootstrapModal.hide();

                    Swal.fire({
                        title: 'Updated!',
                        text: 'Account updated successfully.',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1500 // Auto-close after 1.5 seconds
                    });
                })
                .catch(error => {
                    console.error('Error updating account:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to update the account.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                });
        }
    });
});


// Utility Function to Clean Up Modal
function cleanupModal() {
    // Ensure the modal is hidden
    addChartModal.classList.remove('show');
    addChartModal.style.display = 'none';
    document.body.classList.remove('modal-open');

    // Remove any lingering backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    console.log("Forced modal cleanup completed.");
}

// Handle Edit Account modal opening
function openEditModal(id, code, desc, typeFK) {
    console.log("Opening edit modal for account:", { id, code, desc, typeFK });

    // Populate the modal fields with the selected account's data
    document.getElementById('EditAccountId').value = id;
    document.getElementById('EditAccountCode').value = code;
    document.getElementById('EditAccountDesc').value = desc;

    // Populate the Account Type dropdown with options and select the current type
    loadAccountTypeMap().then(() => {
        editAccountTypeDropdown.innerHTML = ''; // Clear existing options

        Object.keys(accountTypeMap).forEach(accountTypeId => {
            const option = document.createElement('option');
            option.value = accountTypeId;
            option.textContent = accountTypeMap[accountTypeId];

            // Pre-select the current AccountType
            if (parseInt(accountTypeId) === parseInt(typeFK)) {
                option.selected = true;
            }

            editAccountTypeDropdown.appendChild(option);
        });
    });

    // Initialize and show the modal using Bootstrap's Modal class
    const bootstrapModal = new bootstrap.Modal(document.getElementById('editChartModal'));
    bootstrapModal.show();
}

function showEditConfirmationAlert(message, confirmCallback) {
    Swal.fire({
        title: "Are you sure?",
        text: message,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, save it!",
        cancelButtonText: "Cancel",
        cancelButtonColor: "#d33",
    }).then((result) => {
        if (result.isConfirmed) {
            confirmCallback();
        }
    });
    then((result) => {
        if (result.isConfirmed) {
            confirmCallback();
        }
    });
}


// Close modals on clicking the close button or outside modal
closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        addChartModal.style.display = 'none';
        editChartModal.style.display = 'none';
    });
});

window.addEventListener('click', event => {
    if (event.target === addChartModal) {
        addChartModal.style.display = 'none';
    }
    if (event.target === editChartModal) {
        editChartModal.style.display = 'none';
    }
});



// View account details in an alert
function viewAccount(accountCode, accountDesc, accountType) {
    Swal.fire({
        title: 'Account Details',
        text: `Account Code: ${accountCode}\nDescription: ${accountDesc}\nAccount Type: ${accountType}`,
        icon: 'info',
        confirmButtonText: 'OK'
    });
}

// Show confirmation alert using Sweet Alert
function showDeleteConfirmationAlert(message, confirmCallback) {
    Swal.fire({
        title: "Are you sure?",
        text: message,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        cancelButtonColor: "#d33",
    }).then((result) => {
        if (result.isConfirmed) {
            confirmCallback();
        }
    });
}
// Delete Account Swal
function deleteAccountConfirmation(button) {
    const row = button.closest("tr");
    const accountId = row.dataset.id;

    Swal.fire({
        title: "Are you sure?",
        text: "Are you sure you want to delete this account? This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#fffff",
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/chartofacc/${accountId}/`, {
                method: "DELETE",
                headers: { "X-CSRFToken": csrfToken },
            })
                .then((response) => {
                    if (response.ok) {
                        row.remove();
                        console.log("Account deleted successfully.");

                        Swal.fire({
                            title: "Deleted!",
                            text: "Account deleted successfully.",
                            icon: "success",
                            showConfirmButton: false,
                            timer: 1500,
                        });
                    } else {
                        throw new Error("Failed to delete account");
                    }
                })
                .catch((error) => {
                    console.error("Error deleting account:", error);
                    Swal.fire({
                        title: "Error!",
                        text: "Failed to delete the account.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                });
            // Show no changes alert using Sweet Alert
            function showNoChangesAlert() {
                Swal.fire({
                    title: "No Changes Made",
                    text: "You have not made any changes to the account.",
                    icon: "info",
                    confirmButtonText: "OK",
                });
            }
        }
    });
}

// Show success alert using Sweet Alert
function showSuccessAlert(message) {
    Swal.fire({
        title: "Success!",
        text: message,
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
    });
}
