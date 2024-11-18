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
const editAccountModal = document.getElementById('editChartModal');
const closeModalBtn = document.querySelector('.close-btn');
const cancelModalBtns = document.querySelectorAll('.modal-cancel-btn');
const addChartForm = document.getElementById('addChartForm');
const editChartForm = document.getElementById('addChartForm');
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
            throw new Error('Failed to load charts of accounts: ' + response.statusText);
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
addChartBtn.addEventListener('click', () => {
    console.log("Add Account button clicked, opening add modal.");
    addChartModal.style.display = 'block';
});

// Hide modal when 'X' button is clicked
closeModalBtn.addEventListener('click', () => {
    addChartModal.style.display = 'none';
});

// GET ACCOUNTS FROM LIST OF ACCS
function loadAccountTypes() {
    fetch('/get-account-types/', {  // Replace with actual path to fetch account types
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load account types');
        }
        return response.json();
    })
    .then(data => {
        // Clear existing options
        accountTypeDropdown.innerHTML = '<option value="">Select Account Type</option>';

        // Populate dropdown with fetched data
        data.forEach(accountType => {
            const option = document.createElement('option');
            option.value = accountType.id;  // Assuming `id` is the identifier
            option.textContent = accountType.AccountName;  // Replace `AccountName` with the correct field name
            accountTypeDropdown.appendChild(option);
        });
    })
    .catch(error => console.error('Error loading account types:', error));
}


// Close the modal when clicking outside of the modal content
window.addEventListener('click', (event) => {
    if (event.target === addChartModal) {
        addChartModal.style.display = 'none';
    }
});

// Handle form submission for adding a new account
addChartForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page

    
});



// Function to view account details
function viewAccount(AccountCode, AccountDesc, NatureFlag, AccountType) {
    alert(`Account Code: ${AccountCode}\nDescription: ${AccountDesc}\nNature Flag: ${NatureFlag ? 'Debit' : 'Credit'}\nAccount Type: ${AccountType}`);
}

// Function to edit an account
function editAccount(id, AccountCode, AccountDesc, NatureFlag, AccountType, button) {
    
}

// Function to delete an account
function deleteAccount(id, button) {
    
}
