    // Function to get the JWT token from local storage
    function getToken() {
        return localStorage.getItem('jwtToken'); // Assuming the JWT is stored in local storage
    }

    // Function to handle form submission
    function handleFormSubmit(event) {
        event.preventDefault(); // Prevent default form submission

        const token = getToken();
        const email = document.getElementById('email').value;

        // Show loading modal
        document.getElementById('loadingModal').style.display = 'block';

        // Make a request to the server to send the password reset email
        fetch('/forgot_password/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include the JWT in the headers
            },
            body: JSON.stringify({ email: email })
        })
        .then(response => {
            if (response.ok) {
                // Show confirmation modal and hide loading modal
                document.getElementById('loadingModal').style.display = 'none';
                document.getElementById('confirmationModal').style.display = 'block';

                setTimeout(() => {
                    // Redirect to the admin login page after confirmation
                    window.location.href = '/api-auth/admin_login';
                }, 2000); // Wait for 2 seconds before redirect
            } else {
                return response.json().then(data => {
                    document.getElementById('loadingModal').style.display = 'none';
                    alert(data.error || "An error occurred. Please try again.");
                });
            }
        })
        .catch(error => {
            document.getElementById('loadingModal').style.display = 'none';
            console.error('Error:', error);
            alert("An unexpected error occurred. Please try again.");
        });
    }

    // Attach the event listener to the form
    document.addEventListener('DOMContentLoaded', function() {
        const form = document.querySelector('form');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
    });