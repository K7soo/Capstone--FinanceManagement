document.addEventListener("DOMContentLoaded", () => {
    const body = document.querySelector("body");
    const modeToggle = body.querySelector(".mode-toggle");
    const sidebar = body.querySelector("nav");
    const sidebarToggle = body.querySelector(".sidebar-toggle");
    const mainContent = document.querySelector(".main-content");

    // Restore mode and sidebar state from localStorage
    if (localStorage.getItem("mode") === "dark") {
        body.classList.add("dark");
    }

    if (localStorage.getItem("status") === "close") {
        sidebar.classList.add("close");
        mainContent.style.marginLeft = "90px"; // Initial margin for collapsed state
    } else {
        mainContent.style.marginLeft = "260px"; // Default margin for expanded state
    }

    // Toggle dark mode
    modeToggle.addEventListener("click", () => {
        body.classList.toggle("dark");
        localStorage.setItem("mode", body.classList.contains("dark") ? "dark" : "light");
    });

    // Toggle sidebar
    sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("close");

        if (sidebar.classList.contains("close")) {
            localStorage.setItem("status", "close");
            mainContent.style.marginLeft = "90px";
        } else {
            localStorage.setItem("status", "open");
            mainContent.style.marginLeft = "260px";
        }
    });

    // Dropdown Toggle Functionality
    document.querySelectorAll(".dropdown-toggle").forEach(toggle => {
        toggle.addEventListener("click", (e) => {
            e.preventDefault();
            const parent = toggle.parentElement;
            const submenu = parent.querySelector(".submenu");
            const arrow = toggle.querySelector(".dropdown-arrow");

            // Close other dropdowns
            document.querySelectorAll(".dropdown").forEach(item => {
                if (item !== parent) {
                    item.classList.remove("active");
                    const otherSubmenu = item.querySelector(".submenu");
                    const otherArrow = item.querySelector(".dropdown-arrow");
                    if (otherSubmenu) otherSubmenu.style.display = "none";
                    if (otherArrow) otherArrow.style.transform = "rotate(0deg)";
                }
            });

            // Toggle current dropdown
            parent.classList.toggle("active");
            submenu.style.display = submenu.style.display === "block" ? "none" : "block";
            arrow.style.transform = parent.classList.contains("active") ? "rotate(180deg)" : "rotate(0deg)";
        });
    });

    // Profile Dropdown Toggle
    const profileSection = document.querySelector(".profile-section");
    const profileDropdown = document.querySelector(".profile-dropdown");

    if (profileSection && profileDropdown) {
        profileSection.addEventListener("click", (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (!profileSection.contains(e.target)) {
                profileDropdown.classList.remove("show");
            }
        });
    }

    // Breadcrumb and Dynamic Page Content Update
    const sidebarLinks = document.querySelectorAll(".sidebar-link");
    const breadcrumbList = document.getElementById("breadcrumb-list");
    const pageContent = document.getElementById("page-content");

    function updateBreadcrumbs(pageName) {
        breadcrumbList.innerHTML = `
            <li><a href="#" data-page="Home" class="breadcrumb-link">Home</a></li>
            <li> &gt; </li>
            <li>${pageName}</li>
        `;
    }

    sidebarLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const pageName = link.getAttribute("data-page");
            updateBreadcrumbs(pageName);
            pageContent.innerHTML = `<h2>${pageName}</h2><p>Welcome to the ${pageName} page.</p>`;
        });
    });

    // Optional: Tab Switching
    const tabs = document.querySelectorAll(".top .breadcrumbs a");
    const sections = document.querySelectorAll(".main-content > div");

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            sections.forEach(section => (section.style.display = "none"));
            if (sections[index]) sections[index].style.display = "block";
        });
    });

    sections.forEach((section, index) => {
        section.style.display = index === 0 ? "block" : "none";
    });
});
