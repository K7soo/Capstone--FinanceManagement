// Get references to elements
const addAccountBtn = document.querySelector('.add-account-btn');
const modal = document.getElementById('addAccountModal');
const closeModalBtn = document.querySelector('.close-btn');
const addAccountForm = document.getElementById('addAccountForm');
const tableBody = document.querySelector('.table-acc tbody');

// Function to load accounts dynamically on page load
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch('/crudacc/', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest' // Indicate this is an AJAX request
            }
        });

        if (response.ok) {
            const accounts = await response.json();

            // Populate the table with existing accounts
            accounts.forEach(account => {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td>${account.AccountName}</td>
                    <td>${account.AccountTypeDesc}</td>
                    <td>
                        <button class="btn-view" onclick="viewAccount('${account.AccountName}', '${account.AccountTypeDesc}')">View</button>
                        <button class="btn-edit" onclick="editAccount('${account.AccountName}', '${account.AccountTypeDesc}', this)">Edit</button>
                        <button class="btn-delete" onclick="deleteAccount(this)">Delete</button>
                    </td>
                `;
                tableBody.appendChild(newRow);
            });
        } else {
            console.error('Failed to load accounts:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching accounts:', error);
    }
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
addAccountForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page

    // Retrieve values from form inputs
    const accountName = document.querySelector('input[name="AccountName"]').value;
    const accountTypeDesc = document.querySelector('input[name="AccountTypeDesc"]').value || "No Description";

    // Prepare the data to be sent to the server
    const newAccount = {
        AccountName: accountName,
        AccountTypeDesc: accountTypeDesc
    };

    // Send the data to the server using fetch
    const response = await fetch('/crudacc/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAccount),
    });

    if (response.ok) {
        const createdAccount = await response.json();
        
        // Add the new account to the table in the UI
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${createdAccount.AccountName}</td>
            <td>${createdAccount.AccountTypeDesc}</td>
            <td>
                <button class="btn-view" onclick="viewAccount('${createdAccount.AccountName}', '${createdAccount.AccountTypeDesc}')">View</button>
                <button class="btn-edit" onclick="editAccount('${createdAccount.AccountName}', '${createdAccount.AccountTypeDesc}', this)">Edit</button>
                <button class="btn-delete" onclick="deleteAccount(this)">Delete</button>
            </td>
        `;
        tableBody.appendChild(newRow);

        // Clear the form inputs and close the modal
        addAccountForm.reset();
        modal.style.display = 'none';
    } else {
        console.error('Failed to add account:', response.statusText);
    }
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
        addAccountForm.onsubmit = addNewAccount;
    };
}

// Function to handle the "Delete" button click
function deleteAccount(button) {
    // Remove the row from the table
    const row = button.closest('tr');
    row.remove();
}

// Set default form submission back to adding a new account
function addNewAccount(event) {
    event.preventDefault();
    addAccountForm.dispatchEvent(new Event('submit'));
}

// Initial setup to bind form submission for adding new accounts
addAccountForm.onsubmit = addNewAccount;
