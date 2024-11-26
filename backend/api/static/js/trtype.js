document.addEventListener("DOMContentLoaded", function () {
    // Modal elements
    const addTransactionTypeBtn = document.getElementById("openTransactionTypeModalButton");
    const addTransactionTypeModal = document.getElementById("addTransactionTypeModal");
    const addTransactionTypeForm = document.getElementById("addTransactionTypeForm");
    const cancelTransactionTypeModalBtn = document.getElementById("cancelTransactionTypeButton");

    // CSRF token
    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;

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
    });

    // Handle Add Transaction Type form submission
    addTransactionTypeForm.addEventListener("submit", (event) => {
        event.preventDefault();

        // Get form values
        const transactionTypeName = document.querySelector('input[name="TransactionTypeName"]').value;
        const transactionCode = document.querySelector('input[name="TransactionCode"]').value;
        const typeDescription = document.querySelector('input[name="TypeDescription"]').value;

        const newTransactionType = {
            TransactionTypeName: transactionTypeName,
            TransactionCode: transactionCode,
            TypeDescription: typeDescription,
        };

        // Submit the new transaction type via fetch API
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
                    throw new Error("Failed to add transaction type");
                }
                return response.json();
            })
            .then((createdTransactionType) => {
                console.log("Transaction Type added successfully:", createdTransactionType);

                // Add the new transaction type to the table
                addRowToTransactionTable(createdTransactionType);

                // Reset the form and close the modal
                addTransactionTypeForm.reset();
                addTransactionTypeModal.style.display = "none";
            })
            .catch((error) => console.error("Error adding transaction type:", error));
    });

    // Function to add a new row to the transaction table
    function addRowToTransactionTable(transactionType) {
        const transactionTable = document.querySelector(".transaction-table tbody");
        const newRow = document.createElement("tr");

        newRow.innerHTML = `
            <td>${transactionType.TransactionCode}</td>
            <td>${transactionType.TransactionTypeName}</td>
            <td>${transactionType.TypeDescription}</td>
            <td>
                <button class="btn-edit">Edit</button>
                <button class="btn-delete">Delete</button>
            </td>
        `;

        transactionTable.appendChild(newRow);
    }
});
