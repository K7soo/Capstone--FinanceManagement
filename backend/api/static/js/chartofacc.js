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
const editChartModal = document.getElementById('editChartModal');
const closeModalBtns = document.querySelectorAll('.close-btn');
const cancelModalBtns = document.querySelectorAll('.modal-cancel-btn');
const addChartForm = document.getElementById('addChartForm');
const editChartForm = document.getElementById('editChartForm');
const tableBody = document.querySelector('.table-acc tbody');
const accountTypeDropdown = document.querySelector("select[name='AccountType']");
const editAccountTypeDropdown = document.getElementById('EditAccountType');

// Global variable to store the mapping of AccountType_FK to AccountTypeDesc
let accountTypeMap = {};

console.log("JavaScript loaded successfully");

// Fetch and map AccountType IDs to AccountTypeDesc
function loadAccountTypeMap() {
    return fetch('/get-account-types/', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load account types');
        }
        return response.json();
    })
    .then(accountTypes => {
        accountTypes.forEach(type => {
            accountTypeMap[type.id] = type.AccountTypeDesc; // Map ID to AccountTypeDesc
        });
        populateAccountTypeDropdown(accountTypeDropdown, accountTypes);
        console.log("AccountType map loaded:", accountTypeMap);
    })
    .catch(error => console.error('Error fetching account types:', error));
}

// Populate dropdown for Account Types
function populateAccountTypeDropdown(dropdown, accountTypes) {
    dropdown.innerHTML = '<option value="">Select Account Type</option>';
    accountTypes.forEach(accountType => {
        const option = document.createElement('option');
        option.value = accountType.id;
        option.textContent = accountType.AccountTypeDesc; // Display AccountTypeDesc in the dropdown
        dropdown.appendChild(option);
    });
}

// Add a row to the table
function addRowToTable(account) {
    const accountTypeName = accountTypeMap[account.AccountType_FK] || 'Unknown';
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-id', account.id);
    newRow.innerHTML = `
        <td>${account.AccountCode}</td>
        <td>${account.AccountDesc}</td>
        <td>${accountTypeName}</td>
        <td>
            <button class="btn-edit" onclick="openEditModal('${account.id}', '${account.AccountCode}', '${account.AccountDesc}', '${account.AccountType_FK}')">EDIT</button>
            <button class="btn-delete" onclick="deleteAccount(this)">DELETE</button>
        </td>
    `;
    // make it add eventListener, fetch class find nearest table row
    tableBody.appendChild(newRow);
}

// Load and display the chart of accounts
function loadChartOfAccounts() {
    fetch('/chartofacc/?t=' + new Date().getTime(), {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load chart of accounts');
        }
        return response.json();
    })
    .then(accounts => {
        console.log("Fetched chart of accounts:", accounts);
        tableBody.innerHTML = ""; // Clear the table body
        accounts.forEach(account => {
            if (account && account.AccountType_FK && accountTypeMap[account.AccountType_FK]) {
                addRowToTable(account);
            } else {
                console.warn("Category has no accounts or is malformed:", account);
            }
        });
    })
    .catch(error => console.error('Error fetching chart of accounts:', error));
}

// Show the Add Account modal
addChartBtn.addEventListener('click', () => {
    console.log("Add Account button clicked, opening modal.");
    addChartModal.style.display = 'block';
    loadAccountTypeMap(); // Ensure dropdown is populated
});

// Handle Add Account form submission
addChartForm.addEventListener('submit', event => {
    event.preventDefault();
    const accountCode = document.querySelector('input[name="AccountCode"]').value;
    const accountDesc = document.querySelector('input[name="AccountDesc"]').value;
    const accountTypeFK = parseInt(accountTypeDropdown.value);

    if (!accountTypeFK) {
        alert("Please select a valid account type.");
        return;
    }

    const newAccount = { AccountCode: accountCode, AccountDesc: accountDesc, AccountType_FK: accountTypeFK };

    fetch('/chartofacc/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken },
        body: JSON.stringify(newAccount),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add account');
        }
        return response.json();
    })
    .then(createdAccount => {
        console.log("Account added successfully:", createdAccount);
        addRowToTable(createdAccount);
        addChartForm.reset();
        addChartModal.style.display = 'none';
    })
    .catch(error => console.error('Error adding account:', error));
});

// Handle Edit Account modal opening
function openEditModal(id, code, desc, typeFK) {
    console.log("Opening edit modal for account:", { id, code, desc, typeFK });

    // Populate the modal fields with the selected account's data
    document.getElementById('EditAccountId').value = id;
    document.getElementById('EditAccountCode').value = code;
    document.getElementById('EditAccountDesc').value = desc;

    // Populate the Account Type dropdown with options and select the current type
    loadAccountTypeMap().then(() => {
        editAccountTypeDropdown.innerHTML = ''; // Clear existing options

        Object.keys(accountTypeMap).forEach(accountTypeId => {
            const option = document.createElement('option');
            option.value = accountTypeId;
            option.textContent = accountTypeMap[accountTypeId];

            // Pre-select the current AccountType
            if (parseInt(accountTypeId) === parseInt(typeFK)) {
                option.selected = true;
            }

            editAccountTypeDropdown.appendChild(option);
        });
    });

    // Display the edit modal
    editChartModal.style.display = 'block';
}

// Handle Edit Account form submission
editChartForm.addEventListener('submit', event => {
    event.preventDefault();
    const accountId = document.getElementById('EditAccountId').value;
    const updatedAccount = {
        AccountCode: document.getElementById('EditAccountCode').value,
        AccountDesc: document.getElementById('EditAccountDesc').value,
        AccountType_FK: parseInt(editAccountTypeDropdown.value),
    };

    fetch(`/chartofacc/${accountId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify(updatedAccount),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update account');
        }
        return response.json();
    })
    .then(updatedData => {
        console.log("Account updated successfully:", updatedData);
        loadChartOfAccounts(); // Refresh the table
        editChartModal.style.display = 'none';
    })
    .catch(error => console.error('Error updating account:', error));
});

// Handle Account Deletion
function deleteAccount(button) {
    const row = button.closest('tr');
    const accountId = row.dataset.id;

    fetch(`/chartofacc/${accountId}/`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': csrfToken },
    })
    .then(response => {
        if (response.ok) {
            row.remove();
            console.log("Account deleted successfully.");
        } else {
            throw new Error('Failed to delete account');
        }
    })
    .catch(error => console.error('Error deleting account:', error));
}

// View account details in an alert
function viewAccount(accountCode, accountDesc, accountType) {
    alert(`Account Code: ${accountCode}\nDescription: ${accountDesc}\nAccount Type: ${accountType}`);
}

// Close modals on clicking the close button or outside modal
closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        addChartModal.style.display = 'none';
        editChartModal.style.display = 'none';
    });
});

window.addEventListener('click', event => {
    if (event.target === addChartModal) {
        addChartModal.style.display = 'none';
    }
    if (event.target === editChartModal) {
        editChartModal.style.display = 'none';
    }
});

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
    loadAccountTypeMap().then(loadChartOfAccounts);
});


// remove this if theres a bug
    document.addEventListener('DOMContentLoaded', function () {
        const fileTree = document.getElementById('fileTree');
        // Fetch and populate the file tree with account data
        function loadFileTree() {
            fetch('/get-account-types/', {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to load file tree data');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Fetched data:', data); // Inspect the API response
                const fileTree = document.getElementById('fileTree');
                fileTree.innerHTML = ''; // Clear existing tree content

                // Create the root node
                const rootNode = document.createElement('li');
                rootNode.innerHTML = `<span class="caret">List of Accounts</span>`;
                const rootNested = document.createElement('ul');
                rootNested.classList.add('nested');

                // Populate accounts grouped by AccountName
                data.forEach((category) => {
                    if (category.AccountName && Array.isArray(category.Accounts)) {
                        const categoryNode = document.createElement('li');
                        categoryNode.innerHTML = `<span class="caret">${category.AccountName}</span>`;
                        const categoryNested = document.createElement('ul');
                        categoryNested.classList.add('nested');

                        // Add accounts under each category
                        category.Accounts.forEach((account) => {
                            const accountNode = document.createElement('li');
                            accountNode.innerHTML = `<span>${account.AccountCode} - ${account.AccountDesc}</span>`;
                            accountNode.classList.add('account-item');
                            accountNode.dataset.accountId = account.id; // Optional: Use data attributes for future actions
                            categoryNested.appendChild(accountNode);
                        });

                        categoryNode.appendChild(categoryNested);
                        rootNested.appendChild(categoryNode);
                    } else {
                        console.warn('Category has no accounts or is malformed:', category);
                    }
                });

                rootNode.appendChild(rootNested);
                fileTree.appendChild(rootNode);

                // Add toggle functionality
                addToggleFunctionality();
            })
            .catch((error) => console.error('Error loading file tree:', error));
        }

        // Add toggle functionality to the file tree
        function addToggleFunctionality() {
            const toggler = document.getElementsByClassName('caret');
            for (let i = 0; i < toggler.length; i++) {
                toggler[i].addEventListener('click', function () {
                    const nestedList = this.parentElement.querySelector('.nested');
                    if (nestedList) {
                        nestedList.classList.toggle('active');
                        this.classList.toggle('caret-down');
                    }
                });
            }
        }

        // Optional: Add click event to handle account clicks
        function handleAccountClick(event) {
            const accountId = event.target.dataset.accountId;
            if (accountId) {
                console.log('Account clicked:', accountId);
                // You can use this to display details, load data, etc.
                alert(`Account Selected: ${accountId}`);
            }
        }

        // Call the function to load the file tree on page load
        loadFileTree();

        // Add a global event listener for account clicks
        const fileTreeContainer = document.getElementById('fileTree');
        if (fileTreeContainer) {
            fileTreeContainer.addEventListener('click', event => {
                if (event.target && event.target.classList.contains('account-item')) {
                    handleAccountClick(event);
                }
            });
        }
    });
