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
                        <button
							class="btn btn-primary"
							style="
								background-color: #6f42c1;
								color: white;
								border: none;
								border-radius: 8px;
								font-weight: 500;
								padding: 0.5rem 1rem 0.5rem 0.5rem;
								transition: background-color 0.3s ease, color 0.3s ease;
							"
							onmouseover="this.style.backgroundColor='#5a3795';"
							onmouseout="this.style.backgroundColor='#6f42c1';"
							data-bs-toggle="modal"
							data-bs-target="#">
							CREATE JEV
						</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Fetch and populate the table on page load
    fetchPaymentRecords();
});
