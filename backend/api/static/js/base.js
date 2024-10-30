// Function to toggle sidebar and adjust menubar and main content layout
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const menubar = document.getElementById("menubar");
    const mainContent = document.getElementById("main-content");

    sidebar.classList.toggle("collapsed");

    if (sidebar.classList.contains("collapsed")) {
        menubar.style.left = "60px";  // Adjust menubar position for collapsed sidebar
        menubar.style.width = "calc(100% - 60px)";  // Adjust width to fill remaining space
        mainContent.style.marginLeft = "60px";  // Shift main content to match collapsed sidebar
    } else {
        menubar.style.left = "250px";  // Position menubar for expanded sidebar
        menubar.style.width = "calc(100% - 250px)";  // Adjust width for expanded sidebar
        mainContent.style.marginLeft = "250px";  // Shift main content for expanded sidebar
    }
}

// Attach the toggleSidebar function to the button in the sidebar
document.addEventListener("DOMContentLoaded", function () {
    const toggleButton = document.querySelector(".menu-btn");  // Assumes the toggle button has .menu-btn class
    if (toggleButton) {
        toggleButton.addEventListener("click", toggleSidebar);
    }
});
