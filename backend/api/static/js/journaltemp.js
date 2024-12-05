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
const addTemplateBtn = document.querySelector('.btn-add');
const addTemplateModal = document.getElementById('addTemplateModal');
const closeModalBtns = document.querySelectorAll('.close'); 
const addTemplateForm = document.getElementById('addTemplateForm');
const templateTableBody = document.getElementById('journalTemplateTable');
const templateRowsContainer = document.getElementById('templateRows');

// Global variable to store the list of journal templates
window.journalTemplates = [];

console.log("JavaScript loaded successfully");

function loadTransactionTypes() {
    fetch('/get-transaction-types/', { // Replace with your actual endpoint for fetching transaction types
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load transaction types');
        }
        return response.json();
    })
    .then(transactionTypes => {
        console.log("Fetched transaction types:", transactionTypes);
        const transactionTypeSelect = document.getElementById('transactionType');
        transactionTypeSelect.innerHTML = "<option value=''>Choose Transaction Type</option>"; // Add placeholder option

        transactionTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;  // Use ID as the value
            option.textContent = type.TransactionTypeName;  // Display name in the dropdown
            transactionTypeSelect.appendChild(option);
        });
    })
    .catch(error => console.error('Error fetching transaction types:', error));
}

function loadChartOfAccounts() {
    fetch('/get-chart-types/', { // Replace with your actual endpoint for fetching chart of accounts
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
        window.chartOfAccounts = accounts;
    })
    .catch(error => console.error('Error fetching chart of accounts:', error));
}

// Load and display the journal templates
function loadJournalTemplates() {
    fetch('/journaltemplate/?t=' + new Date().getTime(), {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load journal templates');
        }
        return response.json();
    })
    .then(templates => {
        console.log("Fetched journal templates:", templates);
        templateTableBody.innerHTML = ""; // Clear the table body
        templates.forEach(template => addRowToTable(template));
    })
    .catch(error => console.error('Error fetching journal templates:', error));
}

// Add a row to the journal template table
function addRowToTable(template) {
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-id', template.id);
    newRow.innerHTML = `
        <td>${template.TRTemplateCode}</td>
        <td>${template.TransactionType_FK}</td>
        <td>
            <button class="btn-add-row" onclick="addTemplateRow('${template.id}')">ADD ROW</button>
        </td>
    `;
    templateTableBody.appendChild(newRow);
}

// Show the Add Template modal
function openAddTemplateModal() {
    console.log("Add Template button clicked, opening modal.");
    addTemplateModal.style.display = 'block';
    loadTransactionTypes(); // Load transaction types when the modal is opened
    loadChartOfAccounts(); // Load chart of accounts when the modal is opened
    document.getElementById('modalRightSection').style.display = 'block'; // Show right-hand section by default
}
window.openAddTemplateModal = openAddTemplateModal;

// Close Add Template modal
function closeAddTemplateModal() {
    addTemplateModal.style.display = 'none';
}
window.closeAddTemplateModal = closeAddTemplateModal;

// Handle Add Template form submission
addTemplateForm.addEventListener('submit', event => {
    event.preventDefault();
    const templateCode = document.getElementById('templateCode').value;
    const transactionType = document.getElementById('transactionType').value;

    if (!templateCode || !transactionType) {
        alert("Please fill in all fields.");
        return;
    }

    const newTemplate = { TRTemplateCode: templateCode, TransactionType_FK: parseInt(transactionType) };

    console.log("Submitting template header:", newTemplate);

    // Create template header first
    fetch('/journaltemplate/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(newTemplate),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                console.error('Backend validation errors:', errorData);
                throw new Error('Failed to add template');
            });
        }
        return response.json();
    })
    .then(createdTemplate => {
        console.log("Template header added successfully:", createdTemplate);
        addRowToTable(createdTemplate);

        // After creating the template header, create the template body
        const templateRows = document.querySelectorAll('#templateRows tr');
        templateRows.forEach(row => {
            const accountCode = row.querySelector('.account-code').value;
            const debitChecked = row.querySelector('.debit-checkbox').checked;
            const creditChecked = row.querySelector('.credit-checkbox').checked;

            const newTemplateDetail = {
                TRTemplateHeaderId: createdTemplate.id,
                AccountCode: accountCode,
                Debit: debitChecked ? 1 : 0,
                Credit: creditChecked ? 1 : 0
            };

            console.log("Submitting template body:", newTemplateDetail);

            fetch('/journaltemplatedetail/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(newTemplateDetail),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add template detail');
                }
                return response.json();
            })
            .then(createdDetail => {
                console.log("Template detail added successfully:", createdDetail);
            })
            .catch(error => console.error('Error adding template detail:', error));
        });

        addTemplateForm.reset();
        closeAddTemplateModal();
    })
    .catch(error => console.error('Error adding template:', error));
});

// Add a row to the template (modal)
function addTemplateRow() {
    console.log("Adding row to template");
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <select class="account-code">
                <option value="">Select Account</option>
                ${window.chartOfAccounts.map(account => `<option value="${account.id}">${account.AccountDesc}</option>`).join('')}
            </select>
        </td>
        <td><input type="checkbox" class="debit-checkbox" onchange="toggleDebitCredit(this, 'debit')"></td>
        <td><input type="checkbox" class="credit-checkbox" onchange="toggleDebitCredit(this, 'credit')"></td>
        <td><button class="btn-remove" onclick="removeRow(this)"> REMOVE </button></td>
    `;
    templateRowsContainer.appendChild(newRow);
}
window.addTemplateRow = addTemplateRow;

// Ensure only one of Debit or Credit can be checked
function toggleDebitCredit(checkbox, type) {
    const row = checkbox.closest('tr');
    if (type === 'debit') {
        row.querySelector('.credit-checkbox').checked = !checkbox.checked;
    } else if (type === 'credit') {
        row.querySelector('.debit-checkbox').checked = !checkbox.checked;
    }
}

// Remove a row from the template (modal)
function removeRow(button) {
    const row = button.closest('tr');
    row.remove();
}
window.removeRow = removeRow;

// Close modals on clicking the close button or outside modal
closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        closeAddTemplateModal();
    });
});

window.addEventListener('click', event => {
    if (event.target === addTemplateModal) {
        closeAddTemplateModal();
    }
});

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
    loadJournalTemplates();
    loadChartOfAccounts(); // Load chart of accounts on page load
});
