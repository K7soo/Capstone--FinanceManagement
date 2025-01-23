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
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load transaction types: ${response.statusText}`);
            }
            return response.json();
        })
        .then((transactionTypes) => {
            console.log("Fetched transaction types:", transactionTypes);
            transactionTableBody.innerHTML = ""; // Clear the table body
            transactionTypes.forEach((transactionType) => addRowToTransactionTable(transactionType));
        })
        .catch((error) => console.error("Error fetching transaction types:", error));
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
                    style="border-radius: 8px; font-weight: 500; font-size: 0.875rem; padding: 0.5rem 1rem;">
                    <span>MENU</span>
                    <i class="bi bi-caret-down-fill ms-1" style="vertical-align: middle;"></i>
                </button>
                <ul
                    class="dropdown-menu"
                    aria-labelledby="dropdownMenuButton${transactionType.id}"
                    style="border: none; border-radius: 8px; box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); font-size: 0.875rem; min-width: 200px; padding: 0.75rem 0;">
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
    console.log("Form submission event triggered for adding a new transaction type");

    const transactionTypeName = document.querySelector('input[name="TransactionTypeName"]');
    const transactionCode = document.querySelector('input[name="TransactionCode"]');
    const transactionTypeDesc = document.querySelector('input[name="TransactionTypeDesc"]');

    // Validation
    if (!transactionTypeName.value || !transactionCode.value || !transactionTypeDesc.value) {
        Swal.fire({
            title: 'Validation Error!',
            text: 'Please fill in all fields before submitting.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return; // Exit if validation fails
    }

    const newTransactionType = {
        TransactionTypeName: transactionTypeName.value,
        TransactionCode: transactionCode.value,
        TransactionTypeDesc: transactionTypeDesc.value,
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
                throw new Error("Failed to add transaction type: " + response.statusText);
            }
            return response.json();
        })
        .then((createdTransactionType) => {
            console.log("Transaction Type successfully added:", createdTransactionType);
            addRowToTransactionTable(createdTransactionType);
            addTransactionTypeForm.reset();

            // Sweet Alert for success
            Swal.fire({
                title: 'Success!',
                text: 'Transaction type added successfully.',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500
            });

            // Hide the modal
            const bootstrapModal = bootstrap.Modal.getInstance(document.getElementById("addTransactionTypeModal"));
            if (bootstrapModal) {
                bootstrapModal.hide();
            } else {
                console.warn("Bootstrap modal instance not found.");
            }
        })
        .catch((error) => {
            console.error("Error adding transaction type:", error);
            Swal.fire({
                title: 'Error!',
                text: 'Failed to add transaction type. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
});


// Handle Transaction Type Deletion
function deleteTransactionType(button) {
    const row = button.closest("tr");
    const transactionId = row.dataset.id.trim();

    // Show confirmation alert before deleting
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to delete this transaction type? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        cancelButtonColor: '#d33',
    }).then((result) => {
        if (result.isConfirmed) {
            // Proceed with deletion
            fetch(`/transactiontype/${transactionId}`, {
                method: "DELETE",
                headers: {
                    "X-CSRFToken": csrfToken,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Failed to delete transaction type: ${response.statusText}`);
                    }
                    row.remove(); // Remove the row from the table
                    console.log("Transaction Type deleted successfully.");

                    // Show success alert
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Transaction type deleted successfully.',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1500
                    });
                })
                .catch((error) => {
                    console.error("Error deleting transaction type:", error);

                    // Show error alert
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to delete transaction type. Please try again.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                });
        }
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

    // Set original values in dataset attributes for comparison later
    editTransactionTypeForm.dataset.originalTransactionCode = code.trim();
    editTransactionTypeForm.dataset.originalTransactionTypeName = name.trim();
    editTransactionTypeForm.dataset.originalTransactionTypeDesc = description.trim();
    // Display the edit modal
    editTransactionTypeModal.style.display = "block";
        // Display the edit modal
        const bootstrapModal = new bootstrap.Modal(document.getElementById("editTransactionTypeModal"));
        bootstrapModal.show();
    }


/// Handle Edit Transaction Type form submission
editTransactionTypeForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent page refresh
    console.log("Form submission event triggered for editing a transaction type");

    // Retrieve current form values
    const transactionId = document.getElementById("EditTransactionId").value.trim();
    const transactionCode = document.getElementById("EditTransactionCode").value.trim();
    const transactionTypeName = document.getElementById("EditTransactionTypeName").value.trim();
    const transactionTypeDesc = document.getElementById("EditTransactionDescription").value.trim();

    // Retrieve original values from data attributes
    const originalCode = editTransactionTypeForm.dataset.originalTransactionCode;
    const originalName = editTransactionTypeForm.dataset.originalTransactionTypeName;
    const originalDesc = editTransactionTypeForm.dataset.originalTransactionTypeDesc;

    // Check for no changes
    if (
        transactionCode === originalCode &&
        transactionTypeName === originalName &&
        transactionTypeDesc === originalDesc
    ) {
        Swal.fire({
            title: 'No Changes Made',
            text: 'You have not made any changes to the transaction type.',
            icon: 'info',
            confirmButtonText: 'OK',
        });
        return; // Exit without submitting
    }

    // Validation
    if (!transactionId || !transactionCode || !transactionTypeName || !transactionTypeDesc) {
        Swal.fire({
            title: 'Validation Error!',
            text: 'Please fill in all fields before submitting.',
            icon: 'error',
            confirmButtonText: 'OK',
        });
        return; // Exit if validation fails
    }

    const updatedTransactionType = {
        TransactionCode: transactionCode,
        TransactionTypeName: transactionTypeName,
        TransactionTypeDesc: transactionTypeDesc,
    };

    console.log("Data to be submitted for update:", updatedTransactionType);

    // Show confirmation alert before proceeding
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to save changes to this transaction type?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, save it!',
        cancelButtonText: 'Cancel',
        cancelButtonColor: '#d33',
    }).then((result) => {
        if (result.isConfirmed) {
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
                        throw new Error("Failed to update transaction type: " + response.statusText);
                    }
                    return response.json();
                })
                .then((updatedTransaction) => {
                    console.log("Transaction Type successfully updated:", updatedTransaction);

                    // Reload transaction types in the table
                    loadTransactionTypes();

                    // Show success alert
                    Swal.fire({
                        title: 'Success!',
                        text: 'Transaction type updated successfully.',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1500
                    });

                    // Hide the modal
                    const bootstrapModal = bootstrap.Modal.getInstance(editTransactionTypeModal);
                    if (bootstrapModal) {
                        bootstrapModal.hide(); // Hide the modal using Bootstrap's built-in method
                    }
                })
                .catch((error) => {
                    console.error("Error updating transaction type:", error);

                    // Show error alert
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to update transaction type. Please try again.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                });
        }
    });
});

// Ensure backdrops are cleaned up when the modal is hidden
editTransactionTypeModal.addEventListener("hidden.bs.modal", () => {
    const backdrops = document.querySelectorAll(".modal-backdrop");
    backdrops.forEach((backdrop) => backdrop.remove());
    document.body.classList.remove("modal-open");
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("padding-right");
});

// Load transaction types when the page loads
document.addEventListener("DOMContentLoaded", () => {
    loadTransactionTypes();
});
