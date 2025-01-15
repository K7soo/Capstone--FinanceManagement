// Function to get CSRF token from the browser's cookies
function getCsrfToken() {
    let csrfToken = null;
    if (document.cookie && document.cookie !== "") {
        document.cookie.split(";").forEach((cookie) => {
            const trimmedCookie = cookie.trim();
            if (trimmedCookie.startsWith("csrftoken=")) {
                csrfToken = trimmedCookie.split("=")[1];
            }
        });
    }
    return csrfToken;
}

// Define Constant Elements
const csrfToken = getCsrfToken();
const addTransactionTypeBtn = document.getElementById(
    "openTransactionTypeModalButton"
);
const addTransactionTypeModal = document.getElementById(
    "addTransactionTypeModal"
);
const cancelTransactionTypeModalBtn = document.getElementById(
    "cancelTransactionTypeButton"
);
const addTransactionTypeForm = document.getElementById(
    "addTransactionTypeForm"
);
const transactionTableBody = document.querySelector(".transaction-table tbody");
const editTransactionTypeModal = document.getElementById(
    "editTransactionTypeModal"
);
const editTransactionTypeForm = document.getElementById(
    "editTransactionTypeForm"
);

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
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `Failed to load transaction types: ${response.statusText}`
                );
            }
            return response.json();
        })
        .then((transactionTypes) => {
            console.log("Fetched transaction types:", transactionTypes);
            transactionTableBody.innerHTML = ""; // Clear the table body
            transactionTypes.forEach((transactionType) =>
                addRowToTransactionTable(transactionType)
            );
        })
        .catch((error) =>
            console.error("Error fetching transaction types:", error)
        );
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

// Function to add a new row to the transaction table
function addRowToTransactionTable(transactionType) {
    console.log("Adding row for transaction type:", transactionType);
    const newRow = document.createElement("tr");
    newRow.setAttribute("data-id", transactionType.id);
    newRow.innerHTML = `
        <td>${transactionType.TransactionCode}</td>
        <td>${transactionType.TransactionTypeName}</td>
        <td>${transactionType.TransactionTypeDesc}</td>
        <td class="text-center align-middle">
            <div class="dropdown d-inline-block">
                <button
                    class="btn btn-secondary dropdown-toggle btn-sm d-flex align-items-center justify-content-between"
                    type="button"
                    id="dropdownMenuButton${transactionType.id}"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style="border-radius: 8px; font-weight: 500; font-size: 0.875rem; padding: 0.5rem 1rem; position: relative; z-index: 1050;">
                    <span>MENU</span>
                    <i class="bi bi-caret-down-fill ms-1" style="vertical-align: middle;"></i>
                </button>
                <ul
                    class="dropdown-menu"
                    aria-labelledby="dropdownMenuButton${transactionType.id}"
                    style="border: none; border-radius: 8px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); font-size: 0.875rem; min-width: 200px; padding: 0.75rem 0; z-index: 1060;">
                    <li>
                        <button
                            class="dropdown-item text-warning"
                            type="button"
                            data-bs-toggle="modal"
                            data-bs-target="#editTransactionTypeModal"
                            onclick="openEditModal('${transactionType.id}', '${transactionType.TransactionCode}', '${transactionType.TransactionTypeName}', '${transactionType.TransactionTypeDesc}')"
                            style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;">
                            <i class="bi bi-pencil-square me-2"></i>Edit
                        </button>
                    </li>
                    <li>
                        <button
                            class="dropdown-item text-danger"
                            type="button"
                            onclick="deleteTransactionType(this)"
                            style="font-weight: 500; padding: 0.5rem 1rem; transition: transform 0.3s ease-in-out;">
                            <i class="bi bi-trash-fill me-2"></i>Delete
                        </button>
                    </li>
                </ul>
            </div>
        </td>
    `;
    transactionTableBody.appendChild(newRow);

    // Reinitialize the dropdown for the newly added element
    const dropdownToggle = document.querySelectorAll('[data-bs-toggle="dropdown"]');
    dropdownToggle.forEach((dropdown) => {
        new bootstrap.Dropdown(dropdown);
    });
}

// Handle Add Transaction Type form submission
addTransactionTypeForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent page refresh
    console.log(
        "Form submission event triggered for adding a new transaction type"
    );

    const transactionTypeName = document.querySelector(
        'input[name="TransactionTypeName"]'
    );
    const transactionCode = document.querySelector(
        'input[name="TransactionCode"]'
    );
    const TransactionTypeDesc = document.querySelector(
        'input[name="TransactionTypeDesc"]'
    );

    if (!transactionTypeName || !transactionCode || !TransactionTypeDesc) {
        console.error("One or more form fields are missing.");
        alert("Please make sure all fields are present in the form.");
        return;
    }

    const transactionTypeNameValue = transactionTypeName.value;
    const transactionCodeValue = transactionCode.value;
    const TransactionTypeDescValue = TransactionTypeDesc.value;

    if (
        !transactionTypeNameValue ||
        !transactionCodeValue ||
        !TransactionTypeDescValue
    ) {
        alert("Please fill in all fields before submitting.");
        return;
    }

    const newTransactionType = {
        TransactionTypeName: transactionTypeNameValue,
        TransactionCode: transactionCodeValue,
        TransactionTypeDesc: TransactionTypeDescValue,
    };
    console.log("Data to be submitted:", newTransactionType);

    fetch("/transactiontype/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify(newTransactionType),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    "Failed to add transaction type: " + response.statusText
                );
            }
            return response.json();
        })
        .then((createdTransactionType) => {
            console.log(
                "Transaction Type successfully added:",
                createdTransactionType
            );
            addRowToTransactionTable(createdTransactionType);
            addTransactionTypeForm.reset();

            // Hide the modal
            const bootstrapModal = bootstrap.Modal.getInstance(
                document.getElementById("addTransactionTypeModal")
            );
            if (bootstrapModal) {
                bootstrapModal.hide();
            } else {
                console.warn("Bootstrap modal instance not found.");
            }
        })
        .catch((error) => {
            console.error("Error adding transaction type:", error);
            alert("Error adding transaction type: " + error.message);
        });
});


// Handle Transaction Type Deletion
function deleteTransactionType(button) {
    const row = button.closest("tr");
    const transactionId = row.dataset.id.trim();

    fetch(`/transactiontype/${transactionId}`, {
        method: "DELETE",
        headers: {
            "X-CSRFToken": csrfToken,
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `Failed to delete transaction type: ${response.statusText}`
                );
            }
            row.remove();
            console.log("Transaction Type deleted successfully.");
        })
        .catch((error) => {
            console.error("Error deleting transaction type:", error);
            alert("Error deleting transaction type: " + error.message);
        });
}

// Handle Edit Transaction Type modal opening
function openEditModal(id, code, name, description) {
    console.log("Opening edit modal for transaction type:", {
        id,
        code,
        name,
        description,
    });

    // Populate the modal fields with the selected transaction type's data
    document.getElementById("EditTransactionId").value = id;
    document.getElementById("EditTransactionCode").value = code;
    document.getElementById("EditTransactionTypeName").value = name;
    document.getElementById("EditTransactionDescription").value = description;

    // Display the edit modal
    editTransactionTypeModal.style.display = "block";
}

// Handle Edit Transaction Type form submission
editTransactionTypeForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent page refresh
    console.log("Form submission event triggered for editing a transaction type");

    const transactionId = document
        .getElementById("EditTransactionId")
        .value.trim();
    const transactionCode = document.getElementById("EditTransactionCode").value;
    const transactionTypeName = document.getElementById(
        "EditTransactionTypeName"
    ).value;
    const transactionTypeDesc = document.getElementById(
        "EditTransactionDescription"
    ).value;

    if (
        !transactionId ||
        !transactionCode ||
        !transactionTypeName ||
        !transactionTypeDesc
    ) {
        alert("Please fill in all fields before submitting.");
        return;
    }

    const updatedTransactionType = {
        TransactionCode: transactionCode,
        TransactionTypeName: transactionTypeName,
        TransactionTypeDesc: transactionTypeDesc,
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
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    "Failed to update transaction type: " + response.statusText
                );
            }
            return response.json();
        })
        .then((updatedTransaction) => {
            console.log("Transaction Type successfully updated:", updatedTransaction);
            loadTransactionTypes();
            editTransactionTypeModal.style.display = "none";

            // Get the modal instance
            const bootstrapModal = bootstrap.Modal.getInstance(editTransactionTypeModal);

            // Check if the modal instance is valid
            if (bootstrapModal) {
                bootstrapModal.hide(); // Hide the modal using Bootstrap's built-in method
            } else {
                console.warn("Bootstrap modal instance not found. Forcing cleanup.");
                cleanupModal(); // If the modal instance isn't found, perform manual cleanup
            }
        })

        .catch((error) => {
            console.error("Error updating transaction type:", error);
            alert("Error updating transaction type: " + error.message);
        });
});

// Load transaction types when the page loads
document.addEventListener("DOMContentLoaded", () => {
    loadTransactionTypes();
});
