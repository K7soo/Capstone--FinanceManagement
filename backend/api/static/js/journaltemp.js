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
const addTemplateBtn = document.querySelector('.add-template-btn');
const addTemplateModal = document.getElementById('addTemplateModal');
const editTemplateModal = document.getElementById('editTemplateModal');
const closeModalBtns = document.querySelectorAll('.close-btn');
const cancelModalBtns = document.querySelectorAll('.modal-cancel-btn');
const addTemplateForm = document.getElementById('addTemplateForm');
const editTemplateForm = document.getElementById('editTemplateForm');
const templateTableBody = document.querySelector('.template-table tbody');

// Global variable to store the list of journal templates
window.loadJournalTemplates = [];

console.log("JavaScript loaded successfully");

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
addTemplateBtn.addEventListener('click', () => {
    console.log("Add Template button clicked, opening modal.");
    addTemplateModal.style.display = 'block';
});

// Handle Add Template form submission
addTemplateForm.addEventListener('submit', event => {
    event.preventDefault();
    const templateCode = document.querySelector('input[name="TRTemplateCode"]').value;
    const transactionType = document.querySelector('select[name="TransactionType_FK"]').value;

    if (!templateCode || !transactionType) {
        alert("Please fill in all fields.");
        return;
    }

    const newTemplate = { TRTemplateCode: templateCode, TransactionType_FK: transactionType };

    fetch('/journaltemplate/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken },
        body: JSON.stringify(newTemplate),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add template');
        }
        return response.json();
    })
    .then(createdTemplate => {
        console.log("Template added successfully:", createdTemplate);
        addRowToTable(createdTemplate);
        addTemplateForm.reset();
        addTemplateModal.style.display = 'none';
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
        // Populate the modal fields with the selected template's data
        document.getElementById('EditTemplateId').value = template.id;
        document.getElementById('EditTemplateCode').value = template.TRTemplateCode;
        document.getElementById('EditTransactionType').value = template.TransactionType_FK;

        // Display the edit modal
        editTemplateModal.style.display = 'block';
    })
    .catch(error => console.error('Error fetching template details:', error));
}

// Handle Edit Template form submission
editTemplateForm.addEventListener('submit', event => {
    event.preventDefault();
    const templateId = document.getElementById('EditTemplateId').value;
    const updatedTemplate = {
        TRTemplateCode: document.getElementById('EditTemplateCode').value,
        TransactionType_FK: document.getElementById('EditTransactionType').value,
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
        loadJournalTemplates(); // Refresh the table
        editTemplateModal.style.display = 'none';
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
        addTemplateModal.style.display = 'none';
        editTemplateModal.style.display = 'none';
    });
});

window.addEventListener('click', event => {
    if (event.target === addTemplateModal) {
        addTemplateModal.style.display = 'none';
    }
    if (event.target === editTemplateModal) {
        editTemplateModal.style.display = 'none';
    }
});

// Initialize the page
loadJournalTemplates();
