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

document.addEventListener("DOMContentLoaded", function () {
    const fileTree = document.getElementById("fileTree");
    const transactionTableBody = document.querySelector(".transaction-table tbody");

    // Sample data (can be replaced with real API data)
    const transactionData = {
        Reservations: [
            { code: "RES01", description: "Reservation Type 1" },
            { code: "RES02", description: "Reservation Type 2" },
        ],
        "Item Procurement": [
            { code: "PROC01", description: "Procurement Type 1" },
            { code: "PROC02", description: "Procurement Type 2" },
        ],
        "Order Transactions": [
            { code: "ORD01", description: "Order Type 1" },
            { code: "ORD02", description: "Order Type 2" },
        ],
    };

    // Add event listener to the file tree
    fileTree.addEventListener("click", function (event) {
        const clickedElement = event.target;

        // Check if the clicked element has a data-category attribute
        const category = clickedElement.getAttribute("data-category");
        if (category && transactionData[category]) {
            console.log(`Category selected: ${category}`);
            updateTransactionTable(transactionData[category]);
        } else {
            console.log("No valid category selected.");
        }
    });

    // Function to update the transaction table
    function updateTransactionTable(data) {
        // Clear existing rows
        transactionTableBody.innerHTML = "";

        // Populate the table with new data
        data.forEach((transaction) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${transaction.code}</td>
                <td>${transaction.description}</td>
                <td>
                    <button class="btn-edit">Edit</button>
                    <button class="btn-delete">Delete</button>
                </td>
            `;
            transactionTableBody.appendChild(row);
        });
    }
});
