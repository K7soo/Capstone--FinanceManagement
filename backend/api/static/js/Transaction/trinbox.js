document.addEventListener("DOMContentLoaded", () => {
    // Fetch payment records from the backend
    function fetchPaymentRecords() {
        fetch("/get-payments/", {
            headers: {
                "X-Requested-With": "XMLHttpRequest", // Ensure the request is identified as AJAX
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch payment records");
                }
                return response.json(); // Parse response as JSON
            })
            .then((data) => {
                console.log("Payment Records:", data); // Debugging: Check received data
                populateTable(data); // Call your table-populating logic
            })
            .catch((error) => console.error("Error fetching payment records:", error));
    }

    // Dynamically populate the table
    function populateTable(records) {
        const tableBody = document.getElementById("payment-records");
        records.forEach((record) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${record.transaction_id}</td>
                <td>${record.PaymentDate}</td>
                <td>${record.Description}</td>
                <td>${record.Amount}</td>
                <td>${record.PaymentMethod}</td>
                <td>
                    <button class="btn btn-warning">Create JEV</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Fetch and populate the table on page load
    fetchPaymentRecords();
});
