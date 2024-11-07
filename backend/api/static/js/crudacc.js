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
const cancelModalBtn = document.querySelector('.modal-cancel-btn');
const addAccountForm = document.getElementById('addAccountForm');
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
                    <button class="btn-edit" onclick="editAccount('${account.AccountName}', '${account.AccountTypeDesc}', this)">EDIT</button>
                    <button class="btn-delete" onclick="deleteAccount(this)">DELETE</button>
                </td>
            `;
            tableBody.appendChild(newRow);
        });
    })
    .catch(error => console.error('Error fetching accounts:', error));
});

// Show modal when 'Add Account' button is clicked
addAccountBtn.addEventListener('click', () => {
    console.log("Add Account button clicked, opening modal.");
    modal.style.display = 'block';
});

// Hide modal when 'X' button is clicked
closeModalBtn.addEventListener('click', () => {
    console.log("Close modal button clicked, closing modal.");
    modal.style.display = 'none';
});

cancelModalBtn.addEventListener('click', () => {
    console.log("Close modal button clicked, closing modal.");
    modal.style.display = 'none';
});

// Close the modal when clicking outside of the modal content
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        console.log("Clicked outside modal, closing modal.");
        modal.style.display = 'none';
    }
});

// Handle form submission for adding a new account
addAccountForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent page refresh
    console.log("Form submission event triggered"); // Confirm form submit handler is firing

    // Retrieve values from form inputs
    const accountName = document.querySelector('input[name="AccountName"]').value;
    const accountTypeDesc = document.querySelector('input[name="AccountTypeDesc"]').value || "No Description";
    
    console.log("Account Name:", accountName); // Debug log for accountName
    console.log("Account Description:", accountTypeDesc); // Debug log for accountTypeDesc

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
        console.log("Account successfully added.");
        return response.json();
    })
    .then(createdAccount => {
        console.log("Response data from POST:", createdAccount);
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${createdAccount.AccountName}</td>
            <td>${createdAccount.AccountTypeDesc}</td>
            <td>
                <button class="btn-view" onclick="viewAccount('${createdAccount.AccountName}', '${createdAccount.AccountTypeDesc}')">VIEW</button>
                <button class="btn-edit" onclick="editAccount('${createdAccount.AccountName}', '${createdAccount.AccountTypeDesc}', this)">EDIT</button>
                <button class="btn-delete" onclick="deleteAccount(this)">DELETE</button>
            </td>
        `;
        tableBody.appendChild(newRow);

        // Clear the form inputs and close the modal
        addAccountForm.reset();
        modal.style.display = 'none';
    })
    .catch(error => console.error('Failed to add account:', error));
});

// Function to handle the "View" button click
function viewAccount(accountName, accountTypeDesc) {
    alert(`Account Name: ${accountName}\nDescription: ${accountTypeDesc}`);
}

// Function to handle the "Edit" button click
function editAccount(accountName, accountTypeDesc, button) {
    // Populate the modal with the selected account details for editing
    document.querySelector('input[name="AccountName"]').value = accountName;
    document.querySelector('input[name="AccountTypeDesc"]').value = accountTypeDesc;

    // Show the modal for editing
    modal.style.display = 'block';

    // Temporarily update the form submission to handle the edit
    addAccountForm.onsubmit = function (event) {
        event.preventDefault(); // Prevent default form submission

        // Retrieve updated values from the form
        const updatedAccountName = document.querySelector('input[name="AccountName"]').value;
        const updatedAccountTypeDesc = document.querySelector('input[name="AccountTypeDesc"]').value || "No Description";

        // Update the row with the new values
        const row = button.closest('tr');
        row.innerHTML = `
            <td>${updatedAccountName}</td>
            <td>${updatedAccountTypeDesc}</td>
            <td>
                <button class="btn-view" onclick="viewAccount('${updatedAccountName}', '${updatedAccountTypeDesc}')">View</button>
                <button class="btn-edit" onclick="editAccount('${updatedAccountName}', '${updatedAccountTypeDesc}', this)">Edit</button>
                <button class="btn-delete" onclick="deleteAccount(this)">Delete</button>
            </td>
        `;

        // Clear the form inputs and close the modal
        addAccountForm.reset();
        modal.style.display = 'none';

        // Restore the default form submission behavior
        addAccountForm.onsubmit = null;  // Reset to default submission behavior
    };
}

// Function to handle the "Delete" button click
function deleteAccount(button) {
    const row = button.closest('tr');
    const accountId = row.dataset.id; // Store the account ID in a data attribute in HTML

    fetch(`/crudaccchange/${accountId}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrfToken,
        },
    })
    .then(response => {
        if (response.status === 204) {
            console.log("Account successfully deleted.");
            row.remove(); // Remove the row from the table
        } else {
            console.error('Failed to delete account:', response.statusText);
        }
    })
    .catch(error => console.error('Error deleting account:', error));
}
