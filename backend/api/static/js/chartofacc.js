document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("addAccountModal");
    const addAccountBtn = document.getElementById("addAccountBtn");
    const closeModalBtn = document.getElementsByClassName("close")[0];
    const accountForm = document.getElementById("accountForm");
    const accountTableBody = document.getElementById("accountTableBody");

    // Open the modal
    addAccountBtn.onclick = function() {
        modal.style.display = "block";
    }

    // Close the modal
    closeModalBtn.onclick = function() {
        modal.style.display = "none";
    }

    // Close modal if clicking outside
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Add account to table
    accountForm.onsubmit = function(event) {
        event.preventDefault();

        const accountCode = document.getElementById("accountCode").value;
        const accountDesc = document.getElementById("accountDesc").value;
        const natureFlag = document.getElementById("natureFlag").value;
        const accountType = document.getElementById("accountType").value;

        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${accountCode}</td>
            <td>${accountDesc}</td>
            <td>${natureFlag}</td>
            <td>${accountType}</td>
            <td><button class="btn-view">View</button></td>
        `;
        accountTableBody.appendChild(newRow);

        // Clear form fields and close the modal
        accountForm.reset();
        modal.style.display = "none";
    }
});
