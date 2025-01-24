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
                return response.json();
            })
            .then((data) => {
                if (data.length === 0) {
                    console.log("No payment records found."); // Debugging
                    document.querySelector("#payment-records-table-body").innerHTML = `
                        <tr>
                            <td colspan="5" style="text-align: center;">No payment records available.</td>
                        </tr>
                    `;
                    return;
                }
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
