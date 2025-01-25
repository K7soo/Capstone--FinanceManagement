document.addEventListener("DOMContentLoaded", () => {
    const body = document.querySelector("body");
    const modeToggle = body.querySelector(".mode-toggle");
    const sidebar = body.querySelector('.sidebar-nav');
    const sidebarToggle = body.querySelector(".sidebar-toggle");
    const mainContent = document.querySelector(".main-content");

    // Restore mode and sidebar state from localStorage
    if (localStorage.getItem("mode") === "dark") {
        body.classList.add("dark");
    }

    if (localStorage.getItem("status") === "close") {
        sidebar.classList.add("close");
        mainContent.style.marginLeft = "90px"; // Initial margin for collapsed state
        mainContent.style.width = "calc(100% - 90px)";
    } else {
        mainContent.style.marginLeft = "260px"; // Default margin for expanded state
        mainContent.style.width = "calc(100% - 260px)";
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
            mainContent.style.marginLeft = "90px";
            mainContent.style.width = "calc(100% - 90px)";
            localStorage.setItem("status", "close");
        } else {
            mainContent.style.marginLeft = "260px";
            mainContent.style.width = "calc(100% - 260px)";
            localStorage.setItem("status", "open");
        }
    });

    // Dropdown Toggle Functionality with Independent and Persistent State
    document.querySelectorAll(".dropdown-toggle").forEach(toggle => {
        const parent = toggle.parentElement;
        const submenu = parent.querySelector(".submenu");
        const dropdownId = parent.getAttribute("data-dropdown-id");

        // Restore dropdown state on page load
        if (localStorage.getItem(`dropdown-${dropdownId}`) === "open") {
            parent.classList.add("active");
            if (submenu) submenu.style.display = "block";
        }

        toggle.addEventListener("click", (e) => {
            e.preventDefault();

            // Toggle the current dropdown
            const isOpen = parent.classList.toggle("active");
            submenu.style.display = isOpen ? "block" : "none";

            // Save state in localStorage
            localStorage.setItem(`dropdown-${dropdownId}`, isOpen ? "open" : "closed");
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

    const logout = document.getElementsByClassName("logout-mode mt-auto");
    document.addEventListener("click", ()=>{
    });
});
