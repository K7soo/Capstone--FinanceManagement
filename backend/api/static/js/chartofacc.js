// JavaScript code to handle adding new accounts to the table

// Get references to elements
const addAccountBtn = document.querySelector('.add-account-btn');
const modal = document.getElementById('addAccountModal');
const closeModalBtn = document.querySelector('.close-btn');
const addAccountForm = document.getElementById('addAccountForm');
const tableBody = document.querySelector('table tbody');

// Show modal when 'Add Account' button is clicked
addAccountBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

// Hide modal when 'X' button is clicked
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close the modal when clicking outside of the modal content
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

// Handle form submission
addAccountForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the form from refreshing the page

    // Get the values from the form inputs
    const AccountCode = document.getElementById('AccountCode').value;
    const AccountDesc = document.getElementById('AccountDesc').value;
    const NatureFlag = document.getElementById('NatureFlag').value;
    const AccountType = document.getElementById('AccountType').value;

    // Prepare data to be sent in the POST request
    const accountData = {
        AccountCode: AccountCode,
        AccountDesc: AccountDesc,
        NatureFlag: NatureFlag,
        AccountType: AccountType
    };

    // Send the POST request to the Django backend
    fetch('/chartofacc/', {  // Adjust the URL based on your Django setup
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(accountData)
    })
    .then(response => {
        // Log the entire response for debugging
        console.log("Raw Response:", response);
        return response.json(); // Parse JSON body from response
    })
    .then(data => {
        console.log("Parsed JSON Response:", data); // Log the JSON data for troubleshooting

        if (data.status === 'success') {
            // If the backend responds with success, add the account to the table
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${AccountCode}</td>
                <td>${AccountDesc}</td>
                <td>${NatureFlag}</td>
                <td>${AccountType}</td>
                <td><button class="view-btn" onclick="viewAccount(
                '${AccountCode}', 
                '${AccountDesc}', 
                '${NatureFlag}', 
                '${AccountType}')">View</button></td>`;
            tableBody.appendChild(newRow);

            // Clear the form inputs
            addAccountForm.reset();

            // Close the modal
            modal.style.display = 'none';
        } else { 
            // Log the error message received from the backend
            console.error('Error Response:', data);
            alert('Error adding account: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        // Log any network or parsing errors
        console.error('Network/Parsing Error:', error);
        alert('An error occurred while adding the account. Check the console for more details.');
    });
});

// Function to handle the "View" button click
function viewAccount(code, desc, natureFlag, accountType) {
    alert(`Account Code: ${code}\n
        Description: ${desc}\n
        Nature Flag: ${natureFlag}\n
        Account Type: ${accountType}`);
}
