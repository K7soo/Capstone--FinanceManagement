function toggleProfileDropdown() {
    const profileComponent = document.querySelector(".profile-component");
    profileComponent.classList.toggle("active");
}

// Close the dropdown when clicking outside
document.addEventListener("click", function (event) {
    const profileComponent = document.querySelector(".profile-component");
    if (!profileComponent.contains(event.target)) {
        profileComponent.classList.remove("active");
    }
});


function logout() {
    // Perform any necessary logout operations here (e.g., clearing session storage)
    console.log("Logging out..."); // For debugging
    window.location.href = "/admin_login/"; // Redirect to the login page
}

function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar"); // Sidebar element
    const mainContent = document.querySelector(".main-content"); // Main content area
    const menubar = document.querySelector(".menubar-wrapper"); // Menubar wrapper

    // Toggle the collapsed state of the sidebar
    sidebar.classList.toggle("collapsed");

    // Adjust styles dynamically based on the sidebar state
    if (sidebar.classList.contains("collapsed")) {
        // Sidebar is collapsed
        mainContent.style.marginLeft = "60px"; // Adjust content margin for collapsed sidebar
        menubar.classList.add("sidebar-collapsed"); // Apply collapsed state to menubar
        menubar.classList.remove("sidebar-expanded"); // Remove expanded state from menubar
        localStorage.setItem("sidebar-collapsed", "true"); // Save state
    } else {
        // Sidebar is expanded
        mainContent.style.marginLeft = "250px"; // Adjust content margin for expanded sidebar
        menubar.classList.add("sidebar-expanded"); // Apply expanded state to menubar
        menubar.classList.remove("sidebar-collapsed"); // Remove collapsed state from menubar
        localStorage.setItem("sidebar-collapsed", "false"); // Save state
    }
}

// Initialize sidebar state on page load
document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");
    const menubar = document.querySelector(".menubar-wrapper");

    // Check for any saved sidebar state (if applicable)
    const isCollapsed = localStorage.getItem("sidebar-collapsed");

    if (isCollapsed === "true") {
        sidebar.classList.add("collapsed");
        mainContent.style.marginLeft = "60px";
        menubar.classList.add("sidebar-collapsed");
        menubar.classList.remove("sidebar-expanded");
    } else {
        sidebar.classList.remove("collapsed");
        mainContent.style.marginLeft = "250px";
        menubar.classList.add("sidebar-expanded");
        menubar.classList.remove("sidebar-collapsed");
    }
});

