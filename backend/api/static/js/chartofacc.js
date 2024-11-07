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
const modal = document.getElementById('addAccountModal');
const closeModalBtn = document.querySelector('.close-btn');
const addAccountForm = document.getElementById('addAccountForm');
const tableBody = document.querySelector('.table-acc tbody');

console.log("JavaScript loaded successfully"); // Check if JS file is loaded

// Load accounts dynamically on page load
document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded, fetching accounts...");
    fetch('/chartofacc/?t=' + new Date().getTime(), {
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
                <td>${account.AccountDesc}</td>
                <td>${account.NatureFlag ? 'Debit' : 'Credit'}</td>
                <td>${account.AccountType}</td>
                <td>
                    <button class="view-btn" onclick="viewAccount('${account.AccountCode}', '${account.AccountDesc}', '${account.NatureFlag}', '${account.AccountType}')">View</button>
                    <button class="edit-btn" onclick="editAccount('${account.id}', '${account.AccountCode}', '${account.AccountDesc}', '${account.NatureFlag}', '${account.AccountType}', this)">Edit</button>
                    <button class="delete-btn" onclick="deleteAccount('${account.id}', this)">Delete</button>
                </td>
            `;
            tableBody.appendChild(newRow);
        });
    })
    .catch(error => console.error('Error fetching accounts:', error));
});

// Show modal when 'Add Account' button is clicked
addAccountBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

// Hide modal when 'X' button is clicked
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close the modal when clicking outside of the modal content
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Handle form submission for adding a new account
addAccountForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page

    // Get the values from the form inputs
    const accountCode = document.getElementById('accountCode').value;
    const accountDesc = document.getElementById('accountDesc').value;
    const natureFlag = document.getElementById('natureFlag').checked;
    const accountType = document.getElementById('accountType').value;

    // Create a new account data object
    const newAccount = {
        AccountCode: accountCode,
        AccountDesc: accountDesc,
        NatureFlag: natureFlag,
        AccountType: accountType
    };

    fetch('/chartofacc/', {
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

        // Add the new account row to the table
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${createdAccount.AccountCode}</td>
            <td>${createdAccount.AccountDesc}</td>
            <td>${createdAccount.NatureFlag ? 'Debit' : 'Credit'}</td>
            <td>${createdAccount.AccountType}</td>
            <td>
                <button class="view-btn" onclick="viewAccount('${createdAccount.AccountCode}', '${createdAccount.AccountDesc}', '${createdAccount.NatureFlag}', '${createdAccount.AccountType}')">View</button>
                <button class="edit-btn" onclick="editAccount('${createdAccount.id}', '${createdAccount.AccountCode}', '${createdAccount.AccountDesc}', '${createdAccount.NatureFlag}', '${createdAccount.AccountType}', this)">Edit</button>
                <button class="delete-btn" onclick="deleteAccount('${createdAccount.id}', this)">Delete</button>
            </td>
        `;
        tableBody.appendChild(newRow);

        // Clear the form inputs and close the modal
        addAccountForm.reset();
        modal.style.display = 'none';
    })
    .catch(error => console.error('Error adding account:', error));
});

// Function to view account details
function viewAccount(accountCode, accountDesc, natureFlag, accountType) {
    alert(`Account Code: ${accountCode}\nDescription: ${accountDesc}\nNature Flag: ${natureFlag ? 'Debit' : 'Credit'}\nAccount Type: ${accountType}`);
}

// Function to edit an account
function editAccount(id, accountCode, accountDesc, natureFlag, accountType, button) {
    // Populate modal with existing data for editing
    document.getElementById('accountCode').value = accountCode;
    document.getElementById('accountDesc').value = accountDesc;
    document.getElementById('natureFlag').checked = natureFlag === 'true';
    document.getElementById('accountType').value = accountType;
    modal.style.display = 'block';

    addAccountForm.onsubmit = function(event) {
        event.preventDefault();

        // Updated account data
        const updatedAccount = {
            AccountCode: document.getElementById('accountCode').value,
            AccountDesc: document.getElementById('accountDesc').value,
            NatureFlag: document.getElementById('natureFlag').checked,
            AccountType: document.getElementById('accountType').value
        };

        fetch(`/chartofaccchange/${id}/`, {
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

            // Update the account row
            const row = button.closest('tr');
            row.innerHTML = `
                <td>${updatedData.AccountCode}</td>
                <td>${updatedData.AccountDesc}</td>
                <td>${updatedData.NatureFlag ? 'Debit' : 'Credit'}</td>
                <td>${updatedData.AccountType}</td>
                <td>
                    <button class="view-btn" onclick="viewAccount('${updatedData.AccountCode}', '${updatedData.AccountDesc}', '${updatedData.NatureFlag}', '${updatedData.AccountType}')">View</button>
                    <button class="edit-btn" onclick="editAccount('${updatedData.id}', '${updatedData.AccountCode}', '${updatedData.AccountDesc}', '${updatedData.NatureFlag}', '${updatedData.AccountType}', this)">Edit</button>
                    <button class="delete-btn" onclick="deleteAccount('${updatedData.id}', this)">Delete</button>
                </td>
            `;

            addAccountForm.reset();
            modal.style.display = 'none';
            addAccountForm.onsubmit = null;  // Reset to default behavior
        })
        .catch(error => console.error('Error updating account:', error));
    };
}

// Function to delete an account
function deleteAccount(id, button) {
    fetch(`/chartofaccchange/${id}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrfToken,
        },
    })
    .then(response => {
        if (response.status === 204) {
            console.log("Account successfully deleted.");
            button.closest('tr').remove();  // Remove the row from the table
        } else {
            console.error('Failed to delete account:', response.statusText);
        }
    })
    .catch(error => console.error('Error deleting account:', error));
}
