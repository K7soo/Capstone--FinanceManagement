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
const editChartModal = document.getElementById('editChartModal'); // New Edit modal
const closeModalBtns = document.querySelectorAll('.close-btn');
const cancelModalBtns = document.querySelectorAll('.modal-cancel-btn');
const addChartForm = document.getElementById('addChartForm');
const editChartForm = document.getElementById('editChartForm'); // New form for editing
const tableBody = document.querySelector('.table-acc tbody');
const accountTypeDropdown = document.querySelector("select[name='AccountType']");

console.log("JavaScript loaded successfully"); // Check if JS file is loaded

// LOADING CHART OF ACCOUNTS
document.addEventListener("DOMContentLoaded", () => {
    console.log("Page loaded, fetching chart of accounts...");
    fetch('/chartofacc/?t=' + new Date().getTime(), {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load chart of accounts: ' + response.statusText);
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
                <td>${account.AccountType.AccountName}</td> <!-- Use AccountType name -->
                <td>
                    <button class="btn-view" onclick="viewAccount('${account.AccountCode}', '${account.AccountDesc}', '${account.NatureFlag}', '${account.AccountType.AccountName}')">VIEW</button>
                    <button class="btn-edit" onclick="editAccount('${account.id}', '${account.AccountCode}', '${account.AccountDesc}', '${account.NatureFlag}', '${account.AccountType.id}')">EDIT</button>
                    <button class="btn-delete" onclick="deleteAccount('${account.id}', this)">DELETE</button>
                </td>
            `;
            tableBody.appendChild(newRow);
        });
    })
    .catch(error => console.error('Error fetching accounts:', error));
});

// Show Add Account modal when 'Add Account' button is clicked
addChartBtn.addEventListener('click', () => {
    console.log("Add Account button clicked, opening add modal.");
    addChartModal.style.display = 'block';
    loadAccountTypes();
});

// Close any modal when 'X' button or 'Cancel' button is clicked
closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        addChartModal.style.display = 'none';
        editChartModal.style.display = 'none';
    });
});

cancelModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        addChartModal.style.display = 'none';
        editChartModal.style.display = 'none';
    });
});

// Close the modal when clicking outside the modal content
window.addEventListener('click', (event) => {
    if (event.target === addChartModal) {
        addChartModal.style.display = 'none';
    }
    if (event.target === editChartModal) {
        editChartModal.style.display = 'none';
    }
});

// LOAD ACCOUNT TYPES FOR DROPDOWN
function loadAccountTypes() {
    fetch('/get-account-types/', { // Replace with the actual endpoint for account types
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load account types');
        }
        return response.json();
    })
    .then(accountTypes => {
        console.log("Fetched account types:", accountTypes);
        accountTypeDropdown.innerHTML = '<option value="">Select Account Type</option>'; // Clear existing options

        accountTypes.forEach(accountType => {
            const option = document.createElement('option');
            option.value = accountType.id; // Set the value as ID
            option.textContent = accountType.AccountName; // Display the name
            accountTypeDropdown.appendChild(option);
        });
    })
    .catch(error => console.error('Error fetching account types:', error));
}

// ADD NEW ACCOUNT
addChartForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent page refresh
    console.log("Form submission event triggered for adding a new account");

    const AccountCode = document.querySelector('input[name="AccountCode"]').value;
    const AccountDesc = document.querySelector('input[name="AccountDesc"]').value;
    const NatureFlag = document.querySelector('select[name="NatureFlag"]').value === "Debit";
    const AccountTypeDropdown = document.querySelector('select[name="AccountType"]');
    const AccountTypeId = AccountTypeDropdown.value; // Get the selected value (ID)
    const AccountTypeName = AccountTypeDropdown.options[AccountTypeDropdown.selectedIndex].text; // Get the displayed name

    // Validate that AccountTypeId is selected and valid
    if (!parseInt(AccountTypeId)) {
        alert("Please select a valid account type.");
        return;
    }

    const newAccount = {
        AccountCode: AccountCode,
        AccountDesc: AccountDesc,
        NatureFlag: NatureFlag, // Convert to boolean
        AccountType: parseInt(AccountTypeId) // Pass the ID (integer)
    };

    console.log("Data to be submitted:", newAccount);

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

        // Add the new account to the table
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${createdAccount.AccountCode}</td>
            <td>${createdAccount.AccountDesc}</td>
            <td>${createdAccount.NatureFlag ? 'Debit' : 'Credit'}</td>
            <td>${AccountTypeName}</td> <!-- Show the name of the account type -->
            <td>
                <button class="btn-view" onclick="viewAccount('${createdAccount.AccountCode}', '${createdAccount.AccountDesc}', '${createdAccount.NatureFlag}', '${AccountTypeName}')">VIEW</button>
                <button class="btn-edit" onclick="editAccount('${createdAccount.id}', '${createdAccount.AccountCode}', '${createdAccount.AccountDesc}', '${createdAccount.NatureFlag}', '${AccountTypeId}')">EDIT</button>
                <button class="btn-delete" onclick="deleteAccount('${createdAccount.id}', this)">DELETE</button>
            </td>
        `;
        tableBody.appendChild(newRow);

        addChartForm.reset();
        addChartModal.style.display = 'none';
    })
    .catch(error => console.error('Failed to add account:', error));
});

// EDIT ACCOUNT
function openEditModal(id, code, desc, flag, type) {
    document.getElementById('EditAccountId').value = id;
    document.getElementById('EditAccountCode').value = code;
    document.getElementById('EditAccountDesc').value = desc;
    document.getElementById('EditNatureFlag').value = flag;
    document.getElementById('EditAccountType').value = type;
    editChartModal.style.display = 'block';
}

editChartForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const accountId = document.getElementById('EditAccountId').value;

    const updatedData = {
        AccountCode: document.getElementById('EditAccountCode').value,
        AccountDesc: document.getElementById('EditAccountDesc').value,
        NatureFlag: document.getElementById('EditNatureFlag').value,
        AccountType: document.getElementById('EditAccountType').value,
    };

    fetch(`/chartofacc/${accountId}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(updatedData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update account');
        }
        return response.json();
    })
    .then(updatedAccount => {
        console.log("Account updated successfully:", updatedAccount);
        const row = document.querySelector(`tr[data-id="${accountId}"]`);
        row.innerHTML = `
            <td>${updatedAccount.AccountCode}</td>
            <td>${updatedAccount.AccountDesc}</td>
            <td>${updatedAccount.NatureFlag ? 'Debit' : 'Credit'}</td>
            <td>${updatedAccount.AccountType}</td>
            <td>
                <button class="btn-view" onclick="viewAccount('${updatedAccount.AccountCode}', '${updatedAccount.AccountDesc}', '${updatedAccount.NatureFlag}', '${updatedAccount.AccountType}')">VIEW</button>
                <button class="btn-edit" onclick="openEditModal('${updatedAccount.id}', '${updatedAccount.AccountCode}', '${updatedAccount.AccountDesc}', '${updatedAccount.NatureFlag}', '${updatedAccount.AccountType}')">EDIT</button>
                <button class="btn-delete" onclick="deleteAccount(this)">DELETE</button>
            </td>
        `;
        editChartForm.reset();
        editChartModal.style.display = 'none';
    })
    .catch(error => console.error('Error updating account:', error));
});

// DELETE ACCOUNT
function deleteAccount(button) {
    const row = button.closest('tr');
    const accountId = row.dataset.id;

    fetch(`/chartofacc/${accountId}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrfToken,
        },
    })
    .then(response => {
        if (response.ok) {
            console.log("Account deleted successfully.");
            row.remove();
        } else {
            console.error('Failed to delete account:', response.statusText);
        }
    })
    .catch(error => console.error('Error deleting account:', error));
}

// VIEW ACCOUNT
function viewAccount(code, desc, flag, type) {
    alert(`Account Code: ${code}\nDescription: ${desc}\nNature Flag: ${flag}\nAccount Type: ${type}`);
}
