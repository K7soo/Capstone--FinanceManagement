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

// Global variable to store the mapping of AccountType_FK to AccountName
let accountTypeMap = {};

console.log("JavaScript loaded successfully");

// Fetch and map AccountType IDs to Names
function loadAccountTypeMap() {
    return fetch('/get-account-types/', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
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
                accountTypeMap[type.id] = type.AccountName; // Map ID to AccountName
            });
            console.log("AccountType map loaded:", accountTypeMap);
        })
        .catch(error => console.error('Error fetching account types:', error));
}

// Function to add a row to the table
function addRowToTable(account) {
    const accountTypeName = accountTypeMap[account.AccountType_FK] || 'Unknown';

    const newRow = document.createElement('tr');
    newRow.setAttribute('data-id', account.id);
    newRow.innerHTML = `
        <td>${account.AccountCode}</td>
        <td>${account.AccountDesc}</td>
        <td>${account.NatureFlag ? 'Debit' : 'Credit'}</td>
        <td>${accountTypeName}</td>
        <td>
            <button class="btn-view">VIEW</button>
            <button class="btn-edit">EDIT</button>
            <button class="btn-delete">DELETE</button>
        </td>
    `;

    // Attach event listeners to buttons
    newRow.querySelector('.btn-view').addEventListener('click', () =>
        viewAccount(account.AccountCode, account.AccountDesc, account.NatureFlag, accountTypeName)
    );
    newRow.querySelector('.btn-edit').addEventListener('click', () =>
        openEditModal(account.id, account.AccountCode, account.AccountDesc, account.NatureFlag, account.AccountType_FK)
    );
    newRow.querySelector('.btn-delete').addEventListener('click', (event) =>
        deleteAccount(event.target)
    );

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
                throw new Error('Failed to load chart of accounts: ' + response.statusText);
            }
            return response.json();
        })
        .then(accounts => {
            console.log("Fetched accounts data:", accounts);
            tableBody.innerHTML = ""; // Clear existing rows to avoid duplicates
            accounts.forEach(account => addRowToTable(account));
        })
        .catch(error => console.error('Error fetching accounts:', error));
}

// LOADING CHART OF ACCOUNTS
document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded, fetching chart of accounts...");
    loadAccountTypeMap().then(loadChartOfAccounts);
});

// Show Add Account modal
addChartBtn.addEventListener('click', () => {
    console.log("Add Account button clicked, opening add modal.");
    addChartModal.style.display = 'block';
    loadAccountTypes();
});

// Close any modal when 'X' button or 'Cancel' button is clicked
closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        addChartModal.style.display = 'none';
        editChartModal.style.display = 'none';
    });
});

cancelModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        addChartModal.style.display = 'none';
        editChartModal.style.display = 'none';
    });
});

// Close the modal when clicking outside the modal content
window.addEventListener('click', (event) => {
    if (event.target === addChartModal) {
        addChartModal.style.display = 'none';
    }
    if (event.target === editChartModal) {
        editChartModal.style.display = 'none';
    }
});

// Load account types for the dropdown
function loadAccountTypes() {
    fetch('/get-account-types/', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load account types');
            }
            return response.json();
        })
        .then(accountTypes => {
            console.log("Fetched account types:", accountTypes);
            accountTypeDropdown.innerHTML = '<option value="">Select Account Type</option>'; // Clear existing options

            accountTypes.forEach(accountType => {
                const option = document.createElement('option');
                option.value = accountType.id;
                option.textContent = accountType.AccountName;
                accountTypeDropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching account types:', error));
}

// ADD NEW ACCOUNT
addChartForm.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log("Form submission event triggered for adding a new account");

    const AccountCode = document.querySelector('input[name="AccountCode"]').value;
    const AccountDesc = document.querySelector('input[name="AccountDesc"]').value;
    const NatureFlag = document.querySelector('select[name="NatureFlag"]').value === "Debit";
    const AccountType_FK = parseInt(accountTypeDropdown.value);

    if (!AccountType_FK) {
        alert("Please select a valid account type.");
        return;
    }

    const NewAccount = {
        AccountCode,
        AccountDesc,
        NatureFlag,
        AccountType_FK,
    };

    fetch('/chartofacc/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(NewAccount),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add account: ' + response.statusText);
            }
            return response.json();
        })
        .then(createdAccount => {
            console.log("Account successfully added:", createdAccount);
            addRowToTable(createdAccount);
            addChartForm.reset();
            addChartModal.style.display = 'none';
        })
        .catch(error => console.error('Failed to add account:', error));
});

// EDIT ACCOUNT
function openEditModal(id, code, desc, flag, type) {
    console.log("Opening edit modal for:", { id, code, desc, flag, type });

    // Pre-fill the form with the selected account's data
    document.getElementById('EditAccountId').value = id;
    document.getElementById('EditAccountCode').value = code;
    document.getElementById('EditAccountDesc').value = desc;
    document.getElementById('EditNatureFlag').value = flag ? 'Debit' : 'Credit';

    const editAccountTypeDropdown = document.getElementById('EditAccountType');
    editAccountTypeDropdown.innerHTML = '<option value="">Loading...</option>'; // Temporary placeholder

    // Fetch account types and populate dropdown
    fetch('/get-account-types/', { // Replace with the correct endpoint
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch account types: ' + response.statusText);
            }
            return response.json();
        })
        .then(accountTypes => {
            console.log("Fetched account types for edit modal:", accountTypes);

            // Clear and populate the dropdown
            editAccountTypeDropdown.innerHTML = '<option value="">Select Account Type</option>';
            accountTypes.forEach(accountType => {
                const option = document.createElement('option');
                option.value = accountType.id;
                option.textContent = accountType.AccountName;

                // Pre-select the account type if it matches the current one
                if (accountType.id === parseInt(type)) {
                    option.selected = true;
                }

                editAccountTypeDropdown.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading account types for edit modal:', error);
            editAccountTypeDropdown.innerHTML = '<option value="">Failed to load account types</option>';
        });

    // Display the modal
    editChartModal.style.display = 'block';
}

editChartForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const accountId = document.getElementById('EditAccountId').value;

    const updatedData = {
        AccountCode: document.getElementById('EditAccountCode').value,
        AccountDesc: document.getElementById('EditAccountDesc').value,
        NatureFlag: document.getElementById('EditNatureFlag').value === 'Debit',
        AccountType_FK: parseInt(document.getElementById('EditAccountType').value),
    };

    fetch(`/chartofacc/${accountId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(updatedData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update account: ' + response.statusText);
            }
            return response.json();
        })
        .then(updatedAccount => {
            console.log("Account updated successfully:", updatedAccount);

            // Update the corresponding row
            const row = document.querySelector(`tr[data-id="${accountId}"]`);
            if (row) row.remove(); // Remove existing row
            addRowToTable(updatedAccount); // Add updated row
            editChartForm.reset();
            editChartModal.style.display = 'none';
        })
        .catch(error => console.error('Error updating account:', error));
});

// DELETE ACCOUNT
function deleteAccount(button) {
    const row = button.closest('tr');
    const accountId = row.dataset.id;

    fetch(`/chartofacc/${accountId}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrfToken,
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete account: ' + response.statusText);
            }
            row.remove();
            console.log("Account deleted successfully.");
        })
        .catch(error => console.error('Error deleting account:', error));
}

// VIEW ACCOUNT
function viewAccount(code, desc, flag, type) {
    alert(`Account Code: ${code}\nDescription: ${desc}\nNature Flag: ${flag ? 'Debit' : 'Credit'}\nAccount Type: ${type}`);
}
