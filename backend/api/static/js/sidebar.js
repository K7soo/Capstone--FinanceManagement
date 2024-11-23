// Toggle dropdown menu and save state
var dropdowns = document.getElementsByClassName("dropdown-btn");
for (let i = 0; i < dropdowns.length; i++) {
    dropdowns[i].addEventListener("click", function () {
        // Toggle active class
        this.classList.toggle("active");

        // Get the associated dropdown container
        var dropdownContent = this.nextElementSibling;

        // Toggle display and save state to localStorage
        if (dropdownContent.style.display === "block") {
            dropdownContent.style.display = "none";
            localStorage.setItem(`dropdown-${i}`, "closed");
        } else {
            dropdownContent.style.display = "block";
            localStorage.setItem(`dropdown-${i}`, "open");
        }
    });
}

// Restore dropdown states on page load
document.addEventListener("DOMContentLoaded", function () {
    for (let i = 0; i < dropdowns.length; i++) {
        var dropdownContent = dropdowns[i].nextElementSibling;

        // Check localStorage for saved state
        if (localStorage.getItem(`dropdown-${i}`) === "open") {
            dropdownContent.style.display = "block";
            dropdowns[i].classList.add("active");
        } else {
            dropdownContent.style.display = "none";
            dropdowns[i].classList.remove("active");
        }
    }
});


        // Toggle sidebar visibility
        function toggleSidebar() {
            const sidebar = document.querySelector('.sidebar');
            const mainContent = document.querySelector('.main-content');
            
            sidebar.classList.toggle('collapsed');
            
            console.log('Sidebar toggled:', sidebar.classList.contains('collapsed')); // Check if toggle is working
            
            // Adjust the main content margin-left based on sidebar state
            if (sidebar.classList.contains('collapsed')) {
                mainContent.style.marginLeft = '0px'; // Adjust this value to match the collapsed sidebar width
            } else {
                mainContent.style.marginLeft = '250px'; // Adjust this value to match the expanded sidebar width
            }
        }
        
        