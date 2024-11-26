var dropdowns = document.getElementsByClassName("dropdown-btn");
for (let i = 0; i < dropdowns.length; i++) {
    dropdowns[i].addEventListener("click", function (event) {
        // Prevent the default behavior
        event.preventDefault();

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

        // Find the caret icon within the button and toggle the rotated class
        const caretIcon = this.querySelector(".fa-caret-down");
        if (caretIcon) {
            caretIcon.classList.toggle("rotated");
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

            // Ensure caret icon points up if dropdown is open
            const caretIcon = dropdowns[i].querySelector(".fa-caret-down");
            if (caretIcon) {
                caretIcon.classList.add("rotated");
            }
        } else {
            dropdownContent.style.display = "none";
            dropdowns[i].classList.remove("active");

            // Ensure caret icon points down if dropdown is closed
            const caretIcon = dropdowns[i].querySelector(".fa-caret-down");
            if (caretIcon) {
                caretIcon.classList.remove("rotated");
            }
        }
    }
});

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarWrapper = document.querySelector('.sidebar-wrapper');
    const mainContent = document.querySelector('.main-content');

    sidebar.classList.toggle('collapsed');
    sidebarWrapper.classList.toggle('collapsed'); // Collapse the wrapper as well if needed

    if (sidebar.classList.contains('collapsed')) {
        mainContent.style.marginLeft = '0'; // No margin when sidebar is collapsed
    } else {
        mainContent.style.marginLeft = '250px'; // Adjust for expanded sidebar width
    }
}

