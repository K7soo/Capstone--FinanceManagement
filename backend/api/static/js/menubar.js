function toggleProfileDropdown() {
    const profileIcon = document.querySelector(".profile-icon");
    profileIcon.classList.toggle("active");
}

// Close the dropdown if clicked outside
document.addEventListener("click", function (event) {
    const profileIcon = document.querySelector(".profile-icon");
    if (!profileIcon.contains(event.target)) {
        profileIcon.classList.remove("active");
    }
});

function logout() {
    // Perform any necessary logout operations here (e.g., clearing session storage)
    console.log("Logging out..."); // For debugging
    window.location.href = "/admin_login/"; // Redirect to the login page
}