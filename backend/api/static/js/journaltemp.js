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

// Global variables
window.journalTemplates = [];
window.transactionTypeMap = {}; // Map for TransactionType IDs to names
window.accountMap = {}; // Map for Account IDs to descriptions
console.log("JavaScript loaded successfully");

// Load transaction types into a map
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
                transactionTypeMap[type.id] = type.TransactionTypeName;
            });
            console.log("TransactionType map loaded:", transactionTypeMap);
        })
        .catch(error => console.error('Error fetching transaction types:', error));
}

// Load chart of accounts into a map
function loadChartOfAccounts() {
    fetch('/get-chart-types/', {
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
            accounts.forEach(account => {
                window.accountMap[account.id] = account.AccountDesc;
            });
            window.chartOfAccounts = accounts;
            console.log("Chart of accounts loaded:", accounts);
        })
        .catch(error => console.error('Error fetching chart of accounts:', error));
}

// Load journal templates and display them in the table
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
            templateTableBody.innerHTML = ""; // Clear the table body
            templates.forEach(template => addRowToTable(template));
        })
        .catch(error => console.error('Error fetching journal templates:', error));
}

// Add a row to the journal template table
function addRowToTable(template) {
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

// View a journal template
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
            console.log("Template details:", template);
            // Handle displaying the template in the modal or elsewhere
        })
        .catch(error => console.error('Error viewing template:', error));
}
window.viewTemplate = viewTemplate;

// Edit a journal template
function editTemplate(templateId) {
    console.log("Editing template:", templateId);
    // Fetch the template details and populate the modal for editing
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
            console.log("Fetched template for editing:", template);
            // Populate the modal fields with template data
            addTemplateModal.style.display = 'block';
        })
        .catch(error => console.error('Error fetching template for editing:', error));
}
window.editTemplate = editTemplate;

// Delete a journal template
function deleteTemplate(templateId) {
    if (!confirm("Are you sure you want to delete this template?")) {
        return;
    }

    console.log("Deleting template:", templateId);
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
            console.log("Template deleted successfully");
            // Remove the row from the table
            document.querySelector(`tr[data-id="${templateId}"]`).remove();
        })
        .catch(error => console.error('Error deleting template:', error));
}
window.deleteTemplate = deleteTemplate;

// Add a row to the template modal
function addTemplateRow() {
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
        <td><button class="btn-remove" onclick="removeRow(this)">REMOVE</button></td>
    `;
    templateRowsContainer.appendChild(newRow);
}
window.addTemplateRow = addTemplateRow;

// Ensure only one of Debit or Credit can be checked
function toggleDebitCredit(checkbox, type) {
    const row = checkbox.closest('tr');
    if (type === 'debit') {
        row.querySelector('.credit-checkbox').checked = false;
    } else if (type === 'credit') {
        row.querySelector('.debit-checkbox').checked = false;
    }
}
window.toggleDebitCredit = toggleDebitCredit;

// Remove a row from the template modal
function removeRow(button) {
    const row = button.closest('tr');
    row.remove();
}
window.removeRow = removeRow;

// Initialize data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadTransactionTypeMap();
    loadJournalTemplates();
});
