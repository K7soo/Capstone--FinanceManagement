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
