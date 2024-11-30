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
                <td>
                    <button class="btn-view" onclick="viewAccount('${account.AccountCode}', '${account.AccountTypeDesc}')">VIEW</button>
                    <button class="btn-edit" onclick="openEditModal('${account.id}', '${account.AccountCode}', '${account.AccountTypeDesc}')">EDIT</button>
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

// ADD NEW ACCOUNT with validation
addAccountForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent page refresh
    console.log("Form submission event triggered for adding a new account");

    const accountCode = document.querySelector('input[name="AccountCode"]').value.trim();
    const accountTypeDesc = document.querySelector('input[name="AccountTypeDesc"]').value.trim();

    // Form validation
    if (!accountCode) {
        alert('Account Code is required.');
        return;
    }

    if (!accountTypeDesc) {
        alert('Account Description is required.');
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
        newRow.innerHTML = `
            <td>${createdAccount.AccountCode}</td>
            <td>${createdAccount.AccountTypeDesc}</td>
            <td>
                <button class="btn-view" onclick="viewAccount('${createdAccount.AccountCode}', '${createdAccount.AccountTypeDesc}')">VIEW</button>
                <button class="btn-edit" onclick="openEditModal('${createdAccount.id}', '${createdAccount.AccountCode}', '${createdAccount.AccountTypeDesc}')">EDIT</button>
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
function openEditModal(id, code, description) {
    document.getElementById('EditAccountId').value = id;
    document.getElementById('EditAccountCode').value = code;
    document.getElementById('EditAccountTypeDesc').value = description;
    editAccountModal.style.display = 'block';
}

// UPDATE with validation
editAccountForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const accountId = document.getElementById('EditAccountId').value;
    const accountCode = document.getElementById('EditAccountCode').value.trim();
    const accountTypeDesc = document.getElementById('EditAccountTypeDesc').value.trim();

    // Form validation
    if (!accountCode) {
        alert('Account Code is required.');
        return;
    }

    if (!accountTypeDesc) {
        alert('Account Description is required.');
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
        editAccountModal.style.display = 'none';
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

// Function to handle the "View" button click
function viewAccount(accountCode, accountTypeDesc) {
    alert(`Account Code: ${accountCode}\nDescription: ${accountTypeDesc}`);
}
