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
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

// Handle form submission
addAccountForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page

    // Get the values from the form inputs
    const accountCode = document.getElementById('accountCode').value;
    const accountDesc = document.getElementById('accountDesc').value;
    const natureFlag = document.getElementById('natureFlag').value;
    const accountType = document.getElementById('accountType').value;

    // Create a new row and cells for the table
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${accountCode}</td>
        <td>${accountDesc}</td>
        <td>${natureFlag}</td>
        <td>${accountType}</td>
        <td><button class="view-btn" onclick="viewAccount('${accountCode}', '${accountDesc}', '${natureFlag}', '${accountType}')">View</button></td>
    `;

    // Append the new row to the table body
    tableBody.appendChild(newRow);

    // Clear the form inputs
    addAccountForm.reset();

    // Close the modal
    modal.style.display = 'none';
});

// Function to handle the "View" button click
function viewAccount(code, desc, natureFlag, accountType) {
    alert(`Account Code: ${code}\nDescription: ${desc}\nNature Flag: ${natureFlag}\nAccount Type: ${accountType}`);
}
