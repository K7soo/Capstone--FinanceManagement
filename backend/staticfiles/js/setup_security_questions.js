// Access JWT token from storage or context
const jwtToken = sessionStorage.getItem('jwtToken') || localStorage.getItem('jwtToken') || "{{ token }}";

// Toggle visibility for password fields
function toggleVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    field.type = field.type === "password" ? "text" : "password";
}

// Submit security answers and handle redirection
async function submitSecurityAnswers() {
    const formData = new FormData(document.getElementById('security-questions-form'));
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api-auth/setup_security_questions/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`,
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            console.log("Success:", result);
            if (result.url) {
                window.location.href = result.url;
            } else {
                console.error("No redirect URL provided in the response.");
            }
        } else {
            console.error("Error:", result);
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = result.error || "An error occurred. Please try again.";
            errorMessage.style.display = "block";
        }
    } catch (error) {
        console.error("Request failed:", error);
    }
}

// Attach form submission handler
document.getElementById('security-questions-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission
    submitSecurityAnswers();
});
