// JavaScript code to handle adding new accounts to the table

// Get references to elements
const addAccountBtn = document.querySelector('.add-account-btn');
const modal = document.getElementById('addAccountModal');
const closeModalBtn = document.querySelector('.close-btn');
const addAccountForm = document.getElementById('addAccountForm');
const tableBody = document.querySelector('table tbody');

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

// Handle form submission
addAccountForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page

    const AccountName = document.getElementById('AccountName').value;
    const AccountTypeDesc = document.getElementById('AccountTypeDesc').value;

    // Create a new row and cells for the table
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${AccountName}</td>
        <td>${AccountTypeDesc}</td>
        <td>
            <button class="btn-edit" onclick="editAccount('${AccountName}', '${AccountTypeDesc}', this)">Edit</button>
            <button class="btn-view" onclick="viewAccount('${AccountName}', '${AccountTypeDesc}')">View</button>
            <button class="btn-delete" onclick="deleteAccount(this)">Delete</button>
        </td>
    `;

    // Append the new row to the table body
    tableBody.appendChild(newRow);

    // Clear the form inputs
    addAccountForm.reset();

    // Close the modal
    modal.style.display = 'none';
});

// Function to handle the "View" button click
function viewAccount(accountName, accountTypeDesc) {
    alert(`Account Name: ${accountName}\nDescription: ${accountTypeDesc}`);
}

// Function to handle the "Edit" button click
function editAccount(accountName, accountTypeDesc, button) {
    // Populate the modal with the selected account details for editing
    document.getElementById('AccountName').value = accountName;
    document.getElementById('AccountTypeDesc').value = accountTypeDesc;

    // Show the modal for editing
    modal.style.display = 'block';

    // Update the form submission to handle the edit
    addAccountForm.onsubmit = function (event) {
        event.preventDefault(); // Prevent default form submission

        // Update the row with the new values
        const row = button.closest('tr');
        row.innerHTML = `
            <td>${document.getElementById('AccountName').value}</td>
            <td>${document.getElementById('AccountTypeDesc').value}</td>
            <td>
                <button class="btn-edit" onclick="editAccount(
                '${document.getElementById('AccountName').value}', 
                '${document.getElementById('AccountTypeDesc').value}', 
                this)">Edit</button>
                <button class="btn-view" onclick="viewAccount(
                '${document.getElementById('AccountName').value}', 
                '${document.getElementById('AccountTypeDesc').value}'
                )">View</button>
                <button class="btn-delete" onclick="deleteAccount(this)">Delete</button>
            </td>
        `;

        // Clear the form inputs
        addAccountForm.reset();

        // Close the modal
        modal.style.display = 'none';
    };
}

// Function to handle the "Delete" button click
function deleteAccount(button) {
    // Remove the row from the table
    const row = button.closest('tr');
    row.remove();
}
