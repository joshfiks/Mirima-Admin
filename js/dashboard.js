/* =========================================================
   MIRIMA ADMIN — DASHBOARD MODULE
   =========================================================

   This module controls the main dashboard that staff see
   after successfully logging in.

   The dashboard will later become role-specific.
   For example:
   Reception → Reception operations
   Security → Security operations
   Kitchen → Kitchen operations
   etc.
*/


// =========================================================
// SHOW DASHBOARD
// =========================================================

export function showDashboard(session) {

    const loginScreen =
        document.getElementById("loginScreen");


    // -----------------------------------------------------
    // Create dashboard
    // -----------------------------------------------------

    loginScreen.innerHTML = `

        <div class="dashboard">

            <!-- =========================
                 SIDEBAR
                 ========================= -->

            <aside class="dashboard-sidebar">

                <div class="dashboard-brand">

                    <div class="dashboard-brand-mark">
                        M
                    </div>

                    <div>
                        <h1>Mirima</h1>
                        <span>Admin</span>
                    </div>

                </div>


                <!-- Staff information -->

                <div class="staff-profile">

                    <div class="staff-avatar">
                        ${getInitials(session.name)}
                    </div>

                    <div class="staff-details">

                        <strong>
                            ${session.name}
                        </strong>

                        <span>
                            ${formatRole(session.role)}
                        </span>

                    </div>

                </div>


                <!-- Navigation -->

                <nav class="dashboard-navigation">

                    <button
                        class="nav-item active"
                        data-section="overview"
                    >
                        <span>▣</span>
                        Overview
                    </button>


                    <button
                        class="nav-item"
                        data-section="requests"
                    >
                        <span>☷</span>
                        Requests
                    </button>


                    <button
                        class="nav-item"
                        data-section="notifications"
                    >
                        <span>◉</span>
                        Notifications
                    </button>


                    <button
                        class="nav-item"
                        data-section="communication"
                    >
                        <span>✉</span>
                        Communication
                    </button>

                </nav>


                <!-- Sidebar bottom -->

                <div class="sidebar-bottom">

                    <button
                        id="dashboardLogout"
                        class="logout-button"
                    >
                        Logout
                    </button>

                </div>

            </aside>


            <!-- =========================
                 MAIN CONTENT
                 ========================= -->

            <main class="dashboard-main">

                <!-- Header -->

                <header class="dashboard-header">

                    <div>

                        <p class="dashboard-label">
                            MIRIMA ADMIN
                        </p>

                        <h2>
                            Welcome, ${session.name}
                        </h2>

                    </div>


                    <div class="header-role">

                        ${formatRole(session.role)}

                    </div>

                </header>


                <!-- Content -->

                <section
                    id="dashboardContent"
                    class="dashboard-content"
                >

                    ${getOverviewContent(session)}

                </section>

            </main>

        </div>

    `;


    // -----------------------------------------------------
    // Connect navigation
    // -----------------------------------------------------

    setupNavigation();


    // -----------------------------------------------------
    // Connect logout
    // -----------------------------------------------------

    setupLogout();

}


// =========================================================
// OVERVIEW CONTENT
// =========================================================

function getOverviewContent(session) {

    return `

        <div class="overview-intro">

            <p class="section-label">
                OPERATIONS OVERVIEW
            </p>

            <h3>
                ${formatRole(session.role)} Dashboard
            </h3>

            <p>
                This is your Mirima operations workspace.
                Guest requests, notifications and department
                activities will appear here.
            </p>

        </div>


        <!-- Statistics -->

        <div class="dashboard-cards">

            <article class="dashboard-card">

                <span class="card-label">
                    Pending Requests
                </span>

                <strong>
                    0
                </strong>

                <small>
                    Awaiting attention
                </small>

            </article>


            <article class="dashboard-card">

                <span class="card-label">
                    Active Requests
                </span>

                <strong>
                    0
                </strong>

                <small>
                    Currently being handled
                </small>

            </article>


            <article class="dashboard-card">

                <span class="card-label">
                    Notifications
                </span>

                <strong>
                    0
                </strong>

                <small>
                    Unread notifications
                </small>

            </article>


            <article class="dashboard-card">

                <span class="card-label">
                    Staff Status
                </span>

                <strong>
                    Online
                </strong>

                <small>
                    Your session is active
                </small>

            </article>

        </div>


        <!-- Empty state -->

        <div class="dashboard-panel">

            <div class="panel-header">

                <div>

                    <p class="section-label">
                        REQUEST ACTIVITY
                    </p>

                    <h4>
                        Recent Requests
                    </h4>

                </div>

            </div>


            <div class="empty-state">

                <div class="empty-icon">
                    ✓
                </div>

                <h4>
                    No requests yet
                </h4>

                <p>
                    New guest requests will appear here
                    when the system is connected to Firebase.
                </p>

            </div>

        </div>

    `;

}


// =========================================================
// NAVIGATION
// =========================================================

function setupNavigation() {

    const navigationItems =
        document.querySelectorAll(".nav-item");


    navigationItems.forEach(function (item) {

        item.addEventListener("click", function () {

            navigationItems.forEach(function (navItem) {

                navItem.classList.remove("active");

            });


            item.classList.add("active");


            const section =
                item.dataset.section;


            showSection(section);

        });

    });

}


// =========================================================
// SECTION HANDLER
// =========================================================

function showSection(section) {

    const content =
        document.getElementById("dashboardContent");


    if (section === "overview") {

        content.innerHTML = `

            <div class="dashboard-panel">

                <p class="section-label">
                    OVERVIEW
                </p>

                <h3>
                    Operations Overview
                </h3>

                <p>
                    Your main Mirima operations dashboard.
                </p>

            </div>

        `;

    }


    if (section === "requests") {

        content.innerHTML = `

            <div class="dashboard-panel">

                <p class="section-label">
                    GUEST SERVICES
                </p>

                <h3>
                    Requests
                </h3>

                <p>
                    Guest requests will appear here.
                </p>

            </div>

        `;

    }


    if (section === "notifications") {

        content.innerHTML = `

            <div class="dashboard-panel">

                <p class="section-label">
                    SYSTEM
                </p>

                <h3>
                    Notifications
                </h3>

                <p>
                    System and guest-service notifications
                    will appear here.
                </p>

            </div>

        `;

    }


    if (section === "communication") {

        content.innerHTML = `

            <div class="dashboard-panel">

                <p class="section-label">
                    MANAGEMENT
                </p>

                <h3>
                    Communication
                </h3>

                <p>
                    Management communication will appear here.
                </p>

            </div>

        `;

    }

}


// =========================================================
// LOGOUT
// =========================================================

function setupLogout() {

    const logoutButton =
        document.getElementById("dashboardLogout");


    logoutButton.addEventListener("click", function () {

        sessionStorage.removeItem("mirimaSession");

        window.location.reload();

    });

}


// =========================================================
// FORMAT ROLE
// =========================================================

function formatRole(role) {

    if (!role) {

        return "Staff";

    }


    return role.charAt(0).toUpperCase()
        + role.slice(1);

}


// =========================================================
// GET STAFF INITIALS
// =========================================================

function getInitials(name) {

    if (!name) {

        return "M";

    }


    const words =
        name.trim().split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0].charAt(0)
        +
        words[words.length - 1].charAt(0)
    ).toUpperCase();

}
