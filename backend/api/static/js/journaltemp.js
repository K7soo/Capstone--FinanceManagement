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
const editTemplateModal = document.getElementById('editTemplateModal');
const closeModalBtns = document.querySelectorAll('.close'); 
const addTemplateForm = document.getElementById('addTemplateForm');
const editTemplateForm = document.getElementById('editTemplateForm');
const templateTableBody = document.getElementById('journalTemplateTable');

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
            <button class="btn-view" onclick="viewTemplate('${template.id}')">VIEW</button>
            <button class="btn-edit" onclick="openEditTemplateModal('${template.id}')">EDIT</button>
            <button class="btn-delete" onclick="deleteTemplate(this)">DELETE</button>
        </td>
    `;
    templateTableBody.appendChild(newRow);
}

// Show the Add Template modal
function openAddTemplateModal() {
    console.log("Add Template button clicked, opening modal.");
    addTemplateModal.style.display = 'block';
    loadTransactionTypes(); // Load transaction types when the modal is opened
}
window.openAddTemplateModal = openAddTemplateModal;

// Close Add Template modal
function closeAddTemplateModal() {
    addTemplateModal.style.display = 'none';
}
window.closeAddTemplateModal = closeAddTemplateModal;

// Close Edit Template modal
function closeEditTemplateModal() {
    editTemplateModal.style.display = 'none';
}
window.closeEditTemplateModal = closeEditTemplateModal;

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

    console.log("Submitting template:", newTemplate);

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
        console.log("Template added successfully:", createdTemplate);
        addRowToTable(createdTemplate);
        addTemplateForm.reset();
        closeAddTemplateModal();
    })
    .catch(error => console.error('Error adding template:', error));
});

// Handle Edit Template modal opening
function openEditTemplateModal(templateId) {
    console.log("Opening edit modal for template:", templateId);

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
        document.getElementById('EditTemplateId').value = template.id;
        document.getElementById('EditTemplateCode').value = template.TRTemplateCode;
        document.getElementById('EditTransactionType').value = template.TransactionType_FK;

        editTemplateModal.style.display = 'block';
    })
    .catch(error => console.error('Error fetching template details:', error));
}
window.openEditTemplateModal = openEditTemplateModal;

// Handle Edit Template form submission
editTemplateForm.addEventListener('submit', event => {
    event.preventDefault();
    const templateId = document.getElementById('EditTemplateId').value;
    const updatedTemplate = {
        TRTemplateCode: document.getElementById('EditTemplateCode').value,
        TransactionType_FK: parseInt(document.getElementById('EditTransactionType').value),
    };

    fetch(`/journaltemplate/${templateId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify(updatedTemplate),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update template');
        }
        return response.json();
    })
    .then(updatedData => {
        console.log("Template updated successfully:", updatedData);
        loadJournalTemplates(); 
        closeEditTemplateModal();
    })
    .catch(error => console.error('Error updating template:', error));
});

// Handle Template Deletion
function deleteTemplate(button) {
    const row = button.closest('tr');
    const templateId = row.dataset.id;

    fetch(`/journaltemplate/${templateId}/`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': csrfToken },
    })
    .then(response => {
        if (response.ok) {
            row.remove();
            console.log("Template deleted successfully.");
        } else {
            throw new Error('Failed to delete template');
        }
    })
    .catch(error => console.error('Error deleting template:', error));
}

// View template details in an alert
function viewTemplate(templateId) {
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
        alert(`Template Code: ${template.TRTemplateCode}\nTransaction Type: ${template.TransactionType_FK}`);
    })
    .catch(error => console.error('Error fetching template details:', error));
}

// Close modals on clicking the close button or outside modal
closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        closeAddTemplateModal();
        closeEditTemplateModal();
    });
});

window.addEventListener('click', event => {
    if (event.target === addTemplateModal) {
        closeAddTemplateModal();
    }
    if (event.target === editTemplateModal) {
        closeEditTemplateModal();
    }
});

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
    loadJournalTemplates();
});
