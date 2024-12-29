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
            const newRow = document.createElement('tr');
            newRow.setAttribute('data-id', account.id);
            newRow.innerHTML = `
                <td>${account.AccountCode}</td>
                <td>${account.AccountTypeDesc}</td>
                <td class="text-center">
                    <button class="btn btn-warning btn-sm" onclick="openEditModal('${account.id}', '${account.AccountCode}', '${account.AccountTypeDesc}')">EDIT</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteAccount(this)">DELETE</button>
                </td>
            `;
            tableBody.appendChild(newRow);
        });
    })
    .catch(error => console.error('Error fetching accounts:', error));
});

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
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-id', createdAccount.id);
        newRow.innerHTML = `
            <td>${createdAccount.AccountCode}</td>
            <td>${createdAccount.AccountTypeDesc}</td>
            <td class="text-center">
                <button class="btn btn-warning btn-sm" onclick="openEditModal('${createdAccount.id}', '${createdAccount.AccountCode}', '${createdAccount.AccountTypeDesc}')">EDIT</button>
                <button class="btn btn-danger btn-sm" onclick="deleteAccount(this)">DELETE</button>
            </td>
        `;
        tableBody.appendChild(newRow);
        addAccountForm.reset();
        bootstrap.Modal.getInstance(document.getElementById('addAccountModal')).hide();
    })
    .catch(error => console.error('Failed to add account:', error));
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
editAccountForm.addEventListener('submit', function(event) {
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
