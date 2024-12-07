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
window.transactionTypeMap = {}; // Map for TransactionType IDs to names
window.accountMap = {}; // Map for Account IDs to descriptions

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

            // Add to global transactionTypeMap
            window.transactionTypeMap[type.id] = type.TransactionTypeName;
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
        accounts.forEach(account => {
            window.accountMap[account.id] = account.AccountDesc; // Add to global accountMap
        });
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

function loadTransactionTypeMap() {
    return fetch('/get-transaction-types/', {
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
        transactionTypes.forEach(type => {
            transactionTypeMap[type.id] = type.TransactionTypeName; // Map ID to TransactionTypeName
        });
        console.log("TransactionType map loaded:", transactionTypeMap);
    })
    .catch(error => console.error('Error fetching transaction types:', error));
}

// Add a row to the journal template table
function addRowToTable(template) {
    // Retrieve the transaction type name from the map
    const transactionTypeName = transactionTypeMap[template.TransactionType_FK] || 'Unknown';

    const newRow = document.createElement('tr');
    newRow.setAttribute('data-id', template.id);
    newRow.innerHTML = `
        <td>${template.TRTemplateCode}</td>
        <td>${transactionTypeName}</td>
        <td>
            <button class="btn-view" onclick="viewTemplate(${template.id})">VIEW</button>
            <button class="btn-edit" onclick="editTemplate(${template.id})">EDIT</button>
            <button class="btn-delete" onclick="deleteTemplate(${template.id})">DELETE</button>
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
                Template_FK: createdTemplate.id,
                Account_FK: accountCode,
                Debit: debitChecked ? 1 : 0,
                Credit: creditChecked ? 1 : 0
            };

            console.log("Submitting template body:", newTemplateDetail);

            fetch('/journaltemplatedetails/', {
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
                ${window.chartOfAccounts.map(account => `
                    <option value="${account.id}">${account.AccountDesc}</option>
                `).join('')}
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

function viewTemplate(templateId) {
    console.log("Viewing template:", templateId);
    fetch(`/journaltemplate/${templateId}/`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch template details');
        }
        return response.json();
    })
    .then(template => {
        console.log("Fetched template details:", template);

        // Display template details in a modal or a dedicated view
        alert(`
            Template Code: ${template.TRTemplateCode}
            Transaction Type: ${transactionTypeMap[template.TransactionType_FK] || 'Unknown'}
        `);
    })
    .catch(error => console.error('Error viewing template:', error));
}

// Function to edit a template
function editTemplate(templateId) {
    console.log("Editing template:", templateId);

    fetch(`/journaltemplate/${templateId}/`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch template for editing');
        }
        return response.json();
    })
    .then(template => {
        console.log("Fetched template for editing:", template);

        // Populate the edit modal with the template details
        document.getElementById('templateCode').value = template.TRTemplateCode;
        document.getElementById('transactionType').value = template.TransactionType_FK;

        // Open the edit modal
        openAddTemplateModal();
    })
    .catch(error => console.error('Error fetching template for editing:', error));
}

// Function to delete a template
function deleteTemplate(templateId) {
    console.log("Deleting template:", templateId);

    if (!confirm('Are you sure you want to delete this template?')) {
        return;
    }

    fetch(`/journaltemplate/${templateId}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete template');
        }

        console.log("Template deleted successfully:", templateId);

        // Remove the deleted template's row from the table
        const rowToDelete = document.querySelector(`tr[data-id='${templateId}']`);
        if (rowToDelete) {
            rowToDelete.remove();
        }
    })
    .catch(error => console.error('Error deleting template:', error));
}

// Expose the functions globally to make them accessible from the HTML
window.viewTemplate = viewTemplate;
window.editTemplate = editTemplate;
window.deleteTemplate = deleteTemplate;

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

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadJournalTemplates();
    console.log("Page fully loaded, journal templates fetched.");
});
