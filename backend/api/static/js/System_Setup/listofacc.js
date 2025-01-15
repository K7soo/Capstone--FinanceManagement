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
const addAccountForm = document.getElementById('addAccountForm');
const editAccountForm = document.getElementById('editAccountForm');
const tableBody = document.querySelector('tbody');

console.log("JavaScript loaded successfully"); // Check if JS file is loaded

// LOADING ACCOUNTS
document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded, fetching accounts...");
    fetch('/listofacc/?t=' + new Date().getTime(), {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load accounts: ' + response.statusText);
            }
            return response.json();
        })
        .then(accounts => {
            console.log("Fetched accounts data:", accounts);
            tableBody.innerHTML = ""; // Clear existing rows to avoid duplicates
            accounts.forEach(account => {
                console.log("Adding row for account:", account);

                // Create new rows
                addAccountRow(account); // Use the reusable function
            });

            // Reinitialize dropdowns for all rows
            initializeDropdowns();
        })
        .catch(error => console.error('Error fetching accounts:', error));
});

// Function to add a new row for an account
function addAccountRow(account) {
    // Check if the row already exists to prevent duplicates
    if (document.querySelector(`tr[data-id="${account.id}"]`)) {
        return; // Exit if the row already exists
    }

    const newRow = document.createElement('tr');
    newRow.setAttribute('data-id', account.id);
    newRow.innerHTML = `
        <td>${account.AccountCode}</td>
        <td>${account.AccountTypeDesc}</td>
        <td class="text-center align-middle">
            <div class="dropdown d-inline-block">
                <button 
                    class="btn btn-secondary dropdown-toggle btn-sm d-flex align-items-center justify-content-between"
                    type="button"
                    id="dropdownMenuButton${account.id}" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                    style="border-radius: 8px; font-weight: 500; font-size: 0.875rem; padding: 0.5rem 1rem; position: relative; z-index: 1050;">
                    <span>MENU</span>
                    <i class="bi bi-caret-down-fill ms-1" style="vertical-align: middle;"></i>
                </button>
                <ul 
                    class="dropdown-menu"
                    aria-labelledby="dropdownMenuButton${account.id}"
                    style="border: none; border-radius: 8px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); font-size: 0.875rem; min-width: 200px; padding: 0.75rem 0; z-index: 1060;">
                    <li>
                        <button
                            class="dropdown-item text-warning"
                            type="button"
                            onclick="openEditModal('${account.id}', '${account.AccountCode}', '${account.AccountTypeDesc}')"
                            style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;">
                            <i class="bi bi-pencil-square me-2"></i>Edit
                        </button>
                    </li>
                    <li>
                        <button
                            class="dropdown-item text-danger"
                            type="button"
                            onclick="deleteAccount(this)"
                            style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;">
                            <i class="bi bi-trash-fill me-2"></i>Delete
                        </button>
                    </li>
                </ul>
            </div>
        </td>
    `;
    tableBody.appendChild(newRow); // Add the new row to the table
}

// Function to initialize all Bootstrap dropdowns
function initializeDropdowns() {
    console.log("Reinitializing Bootstrap dropdowns...");
    const dropdownElements = document.querySelectorAll('[data-bs-toggle="dropdown"]');
    dropdownElements.forEach(dropdown => {
        new bootstrap.Dropdown(dropdown); // Initialize each dropdown
    });
}

// ADD NEW ACCOUNT with validation
addAccountForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent page refresh
    console.log("Form submission event triggered for adding a new account");

    const accountCode = document.getElementById('AccountCode').value.trim();
    const accountTypeDesc = document.getElementById('AccountTypeDesc').value.trim();

    // Form validation
    if (accountCode === '' || accountTypeDesc === '') {
        alert('Both fields are required.');
        return;
    }

    const newAccount = { AccountCode: accountCode, AccountTypeDesc: accountTypeDesc };
    console.log("Data to be submitted:", newAccount);

    fetch('/listofacc/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(newAccount),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add account: ' + response.statusText);
            }
            return response.json();
        })
        .then(createdAccount => {
            console.log("Account successfully added:", createdAccount);

            // Add the new row using the reusable function
            addAccountRow(createdAccount);

            // Reinitialize dropdowns after adding the new row
            initializeDropdowns();

            // Reset the form and close the modal
            addAccountForm.reset();
            bootstrap.Modal.getInstance(document.getElementById('addAccountModal')).hide();

            // Show success alert
            Swal.fire({
                title: 'Success!',
                text: 'Account has been successfully added.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        })
        .catch(error => {
            console.error('Failed to add account:', error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to add the account. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
});


// Function to open the Edit Account modal with account details populated
function openEditModal(id, code, description) {
    document.getElementById('EditAccountId').value = id;
    document.getElementById('EditAccountCode').value = code;
    document.getElementById('EditAccountTypeDesc').value = description;
    const editModal = new bootstrap.Modal(document.getElementById('editAccountModal'));
    editModal.show();
}

// UPDATE with validation
editAccountForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const accountId = document.getElementById('EditAccountId').value;
    const accountCode = document.getElementById('EditAccountCode').value.trim();
    const accountTypeDesc = document.getElementById('EditAccountTypeDesc').value.trim();

    if (accountCode === '' || accountTypeDesc === '') {
        alert('Both fields are required.');
        return;
    }

    const updatedAccount = { AccountCode: accountCode, AccountTypeDesc: accountTypeDesc };

    fetch(`/listofacc-change/${accountId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(updatedAccount),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update account: ' + response.statusText);
            }
            return response.json();
        })
        .then(updatedData => {
            console.log("Account successfully updated:", updatedData);
            const row = document.querySelector(`tr[data-id="${accountId}"]`);
            if (row) {
                row.cells[0].textContent = updatedData.AccountCode;
                row.cells[1].textContent = updatedData.AccountTypeDesc;
            }
            editAccountForm.reset();
            bootstrap.Modal.getInstance(document.getElementById('editAccountModal')).hide();
        })
        .catch(error => console.error('Failed to update account:', error));
});

// DELETE
function deleteAccount(button) {
    const row = button.closest('tr');
    const accountId = row.dataset.id;

    fetch(`/listofacc-change/${accountId}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrfToken,
        },
    })
        .then(response => {
            if (response.status === 204) {
                console.log("Account successfully deleted.");
                row.remove();
            } else {
                console.error('Failed to delete account:', response.statusText);
            }
        })
        .catch(error => console.error('Error deleting account:', error));
}
