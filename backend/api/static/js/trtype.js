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
const addTransactionTypeBtn = document.getElementById("openTransactionTypeModalButton");
const addTransactionTypeModal = document.getElementById("addTransactionTypeModal");
const cancelTransactionTypeModalBtn = document.getElementById("cancelTransactionTypeButton");
const addTransactionTypeForm = document.getElementById("addTransactionTypeForm");
const transactionTableBody = document.querySelector(".transaction-table tbody");
const editTransactionTypeModal = document.getElementById("editTransactionTypeModal");
const editTransactionTypeForm = document.getElementById("editTransactionTypeForm");

console.log("JavaScript loaded successfully");

// Load and display the transaction types from the database
function loadTransactionTypes() {
    console.log("Page loaded, fetching transaction types...");
    fetch("/transactiontype/?t=" + new Date().getTime(), {
        method: "GET",
        headers: {
            "X-Requested-With": "XMLHttpRequest",
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to load transaction types: ${response.statusText}`);
        }
        return response.json();
    })
    .then(transactionTypes => {
        console.log("Fetched transaction types:", transactionTypes);
        transactionTableBody.innerHTML = ""; // Clear the table body
        transactionTypes.forEach(transactionType => addRowToTransactionTable(transactionType));
    })
    .catch(error => console.error("Error fetching transaction types:", error));
}

// Show the Add Transaction Type modal
addTransactionTypeBtn.addEventListener("click", () => {
    console.log("Opening the Add Transaction Type modal.");
    addTransactionTypeModal.style.display = "block";
});

// Close the modal when the cancel button is clicked
cancelTransactionTypeModalBtn.addEventListener("click", () => {
    console.log("Closing the Add Transaction Type modal.");
    addTransactionTypeModal.style.display = "none";
});

// Close the modal when clicking outside of it
window.addEventListener("click", (event) => {
    if (event.target === addTransactionTypeModal) {
        addTransactionTypeModal.style.display = "none";
    }
    if (event.target === editTransactionTypeModal) {
        editTransactionTypeModal.style.display = "none";
    }
});

// Handle Add Transaction Type form submission
addTransactionTypeForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent page refresh
    console.log("Form submission event triggered for adding a new transaction type");

    const transactionTypeName = document.querySelector('input[name="TransactionTypeName"]');
    const transactionCode = document.querySelector('input[name="TransactionCode"]');
    const TransactionTypeDesc = document.querySelector('input[name="TransactionTypeDesc"]');

    if (!transactionTypeName || !transactionCode || !TransactionTypeDesc) {
        console.error("One or more form fields are missing.");
        alert("Please make sure all fields are present in the form.");
        return;
    }

    const transactionTypeNameValue = transactionTypeName.value;
    const transactionCodeValue = transactionCode.value;
    const TransactionTypeDescValue = TransactionTypeDesc.value;

    if (!transactionTypeNameValue || !transactionCodeValue || !TransactionTypeDescValue) {
        alert("Please fill in all fields before submitting.");
        return;
    }

    const newTransactionType = { TransactionTypeName: transactionTypeNameValue, TransactionCode: transactionCodeValue, TransactionTypeDesc: TransactionTypeDescValue };
    console.log("Data to be submitted:", newTransactionType);

    fetch("/transactiontype/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify(newTransactionType),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to add transaction type: " + response.statusText);
        }
        return response.json();
    })
    .then(createdTransactionType => {
        console.log("Transaction Type successfully added:", createdTransactionType);
        addRowToTransactionTable(createdTransactionType);
        addTransactionTypeForm.reset();
        addTransactionTypeModal.style.display = "none";
    })
    .catch(error => {
        console.error("Error adding transaction type:", error);
        alert("Error adding transaction type: " + error.message);
    });
});

// Function to add a new row to the transaction table
function addRowToTransactionTable(transactionType) {
    console.log("Adding row for transaction type:", transactionType);
    const newRow = document.createElement("tr");
    newRow.setAttribute("data-id", transactionType.id);
    newRow.innerHTML = `
        <td>${transactionType.TransactionCode}</td>
        <td>${transactionType.TransactionTypeName}</td>
        <td>${transactionType.TransactionTypeDesc}</td>
        <td>
            <button class="btn-edit" onclick="openEditModal('${transactionType.id}', '${transactionType.TransactionCode}', '${transactionType.TransactionTypeName}', '${transactionType.TransactionTypeDesc}')">EDIT</button>
            <button class="btn-delete" onclick="deleteTransactionType(this)">DELETE</button>
        </td>
    `;
    transactionTableBody.appendChild(newRow);
}

// Handle Transaction Type Deletion
function deleteTransactionType(button) {
    const row = button.closest('tr');
    const transactionId = row.dataset.id.trim();

    fetch(`/transactiontype/${transactionId}`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': csrfToken,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to delete transaction type: ${response.statusText}`);
        }
        row.remove();
        console.log("Transaction Type deleted successfully.");
    })
    .catch(error => {
        console.error('Error deleting transaction type:', error);
        alert('Error deleting transaction type: ' + error.message);
    });
}

// Handle Edit Transaction Type modal opening
function openEditModal(id, code, name, description) {
    console.log("Opening edit modal for transaction type:", { id, code, name, description });

    // Populate the modal fields with the selected transaction type's data
    document.getElementById('EditTransactionId').value = id;
    document.getElementById('EditTransactionCode').value = code;
    document.getElementById('EditTransactionTypeName').value = name;
    document.getElementById('EditTransactionDescription').value = description;

    // Display the edit modal
    editTransactionTypeModal.style.display = 'block';
}

// Handle Edit Transaction Type form submission
editTransactionTypeForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent page refresh
    console.log("Form submission event triggered for editing a transaction type");

    const transactionId = document.getElementById('EditTransactionId').value.trim();
    const transactionCode = document.getElementById('EditTransactionCode').value;
    const transactionTypeName = document.getElementById('EditTransactionTypeName').value;
    const transactionTypeDesc = document.getElementById('EditTransactionDescription').value;

    if (!transactionId || !transactionCode || !transactionTypeName || !transactionTypeDesc) {
        alert("Please fill in all fields before submitting.");
        return;
    }

    const updatedTransactionType = {
        TransactionCode: transactionCode,
        TransactionTypeName: transactionTypeName,
        TransactionTypeDesc: transactionTypeDesc
    };

    console.log("Data to be submitted for update:", updatedTransactionType);

    fetch(`/transactiontype/${transactionId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify(updatedTransactionType),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to update transaction type: " + response.statusText);
        }
        return response.json();
    })
    .then(updatedTransaction => {
        console.log("Transaction Type successfully updated:", updatedTransaction);
        loadTransactionTypes();
        editTransactionTypeModal.style.display = "none";
    })
    .catch(error => {
        console.error("Error updating transaction type:", error);
        alert("Error updating transaction type: " + error.message);
    });
});

// Load transaction types when the page loads
document.addEventListener("DOMContentLoaded", () => {
    loadTransactionTypes();
});
