// Image Slider JavaScript
let currentImageIndex = 0;
const images = document.querySelectorAll('.image-slider img');
const totalImages = images.length;

if (totalImages > 0) {
    setInterval(() => {
        images[currentImageIndex].classList.add('hidden');
        currentImageIndex = (currentImageIndex + 1) % totalImages;
        images[currentImageIndex].classList.remove('hidden');
    }, 3000); // Change image every 3 seconds
}

function toggleVisibility(field_id) {
    var field = document.getElementById(field_id);
    if (field) {
        field.type = (field.type === "password") ? "text" : "password";
    } else {
        console.error('Field not found:', field_id);
    }
}

function changeStatus(employeeId, status) {
    // Add your logic for changing account status here
    console.log("Change status of employee ${employeeId} to ${status}");
}

function sendEmail(employeeId, emailType) {
    // Add your logic for sending emails here
    console.log("Send ${emailType} email to employee ${employeeId}");
}



function showPasswordSection() {
    var securityQuestions = document.getElementById('security-questions');
    var passwordSection = document.getElementById('password-section');
    if (securityQuestions && passwordSection) {
        securityQuestions.style.display = 'none';
        passwordSection.style.display = 'block';
    } else {
        console.error('Sections not found');
    }
}

function togglePassword() {
    var passwordField = document.getElementById("password");
    if (passwordField) {
        var type = passwordField.getAttribute("type") === "password" ? "text" : "password";
        passwordField.setAttribute("type", type);
    } else {
        console.error('Password field not found');
    }
}
