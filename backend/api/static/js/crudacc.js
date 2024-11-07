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
const addAccountBtn = document.querySelector('.add-account-btn');
const addAccountModal = document.getElementById('addAccountModal');
const editAccountModal = document.getElementById('editAccountModal'); // New Edit modal
const closeModalBtns = document.querySelectorAll('.close-btn');
const cancelModalBtns = document.querySelectorAll('.modal-cancel-btn');
const addAccountForm = document.getElementById('addAccountForm');
const editAccountForm = document.getElementById('editAccountForm'); // New form for editing
const tableBody = document.querySelector('.table-acc tbody');

console.log("JavaScript loaded successfully"); // Check if JS file is loaded

// Load accounts dynamically on page load
document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded, fetching accounts...");
    fetch('/crudacc/?t=' + new Date().getTime(), {
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
            const newRow = document.createElement('tr');
            newRow.setAttribute('data-id', account.id);
            newRow.innerHTML = `
                <td>${account.AccountName}</td>
                <td>${account.AccountTypeDesc}</td>
                <td>
                    <button class="btn-view" onclick="viewAccount('${account.AccountName}', '${account.AccountTypeDesc}')">VIEW</button>
                    <button class="btn-edit" onclick="openEditModal('${account.id}', '${account.AccountName}', '${account.AccountTypeDesc}')">EDIT</button>
                    <button class="btn-delete" onclick="deleteAccount(this)">DELETE</button>
                </td>
            `;
            tableBody.appendChild(newRow);
        });
    })
    .catch(error => console.error('Error fetching accounts:', error));
});

// Show Add Account modal when 'Add Account' button is clicked
addAccountBtn.addEventListener('click', () => {
    console.log("Add Account button clicked, opening add modal.");
    addAccountModal.style.display = 'block';
});

// Close any modal when 'X' button or 'Cancel' button is clicked
closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        addAccountModal.style.display = 'none';
        editAccountModal.style.display = 'none';
    });
});

cancelModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        addAccountModal.style.display = 'none';
        editAccountModal.style.display = 'none';
    });
});

// Close the modal when clicking outside the modal content
window.addEventListener('click', (event) => {
    if (event.target === addAccountModal) {
        addAccountModal.style.display = 'none';
    }
    if (event.target === editAccountModal) {
        editAccountModal.style.display = 'none';
    }
});

// Handle form submission for adding a new account
addAccountForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent page refresh
    console.log("Form submission event triggered for adding a new account");

    const accountName = document.querySelector('input[name="AccountName"]').value;
    const accountTypeDesc = document.querySelector('input[name="AccountTypeDesc"]').value || "No Description";

    const newAccount = { AccountName: accountName, AccountTypeDesc: accountTypeDesc };
    console.log("Data to be submitted:", newAccount);

    fetch('/crudacc/', {
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
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${createdAccount.AccountName}</td>
            <td>${createdAccount.AccountTypeDesc}</td>
            <td>
                <button class="btn-view" onclick="viewAccount('${createdAccount.AccountName}', '${createdAccount.AccountTypeDesc}')">VIEW</button>
                <button class="btn-edit" onclick="openEditModal('${createdAccount.id}', '${createdAccount.AccountName}', '${createdAccount.AccountTypeDesc}')">EDIT</button>
                <button class="btn-delete" onclick="deleteAccount(this)">DELETE</button>
            </td>
        `;
        tableBody.appendChild(newRow);
        addAccountForm.reset();
        addAccountModal.style.display = 'none';
    })
    .catch(error => console.error('Failed to add account:', error));
});

// Function to open the Edit Account modal with account details populated
function openEditModal(id, name, description) {
    document.getElementById('EditAccountId').value = id;
    document.getElementById('EditAccountName').value = name;
    document.getElementById('EditAccountTypeDesc').value = description;
    editAccountModal.style.display = 'block';
}

// Handle edit form submission for updating an account
editAccountForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const accountId = document.getElementById('EditAccountId').value;
    const accountName = document.getElementById('EditAccountName').value;
    const accountTypeDesc = document.getElementById('EditAccountTypeDesc').value;

    const updatedAccount = { AccountName: accountName, AccountTypeDesc: accountTypeDesc };

    fetch(`/crudaccchange/${accountId}/`, {
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
            row.cells[0].textContent = updatedData.AccountName;
            row.cells[1].textContent = updatedData.AccountTypeDesc;
        }
        editAccountForm.reset();
        editAccountModal.style.display = 'none';
    })
    .catch(error => console.error('Failed to update account:', error));
});

// Function to handle the "Delete" button click
function deleteAccount(button) {
    const row = button.closest('tr');
    const accountId = row.dataset.id;

    fetch(`/crudaccchange/${accountId}/`, {
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

// Function to handle the "View" button click
function viewAccount(accountName, accountTypeDesc) {
    alert(`Account Name: ${accountName}\nDescription: ${accountTypeDesc}`);
}
