/* =========================================================
   MIRIMA ADMIN — RECEPTION DASHBOARD
   =========================================================

   This module controls the Reception workspace.

   Reception is responsible for:
   - Current guest records
   - Cottage occupancy
   - Guest requests
   - Live chat
   - Billing and receipts
   - Emergency alerts

   Firebase will be connected later.
*/
import {
    getCurrentSession
} from "./auth.js";

import {
    getCottages,
    getActiveGuests,
    addGuest,
    removeGuest
} from "./guests.js";

import {
    getCottageBill,
    getBillTotal,
    addBillItem,
    startNewCottageBill,
    addPayment,
    getPayments,
    getCottagePayments
} from "./billing.js";
import {
    db
} from "./firebase.js";
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    setDoc,
    doc,
    updateDoc,
    deleteDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    listenToDepartmentConversations,
    listenToConversationMessages,
    sendChatMessage,
    getLatestConversationMessage,
    hideReceptionMessageForMe,
    getReceptionHiddenMessageIds
} from "./chat.js";

// =========================================================
// HOUSEKEEPING DASHBOARD
// =========================================================

function renderHousekeepingDashboard(session) {

    const loginScreen =
        document.getElementById("loginScreen");

   loginScreen.className =
        "login-screen housekeeping-mode";

    loginScreen.innerHTML = `

        <div class="housekeeping-app">

            <!-- MOBILE HEADER -->

            <header class="housekeeping-mobile-header">

                <button
                    id="housekeepingMobileMenuButton"
                    class="housekeeping-mobile-menu-button"
                >
                    ☰
                </button>

                <div class="housekeeping-mobile-brand">

                    <strong>
                        Mirima
                    </strong>

                    <span>
                        Housekeeping
                    </span>

                </div>

                <button
                    id="housekeepingMobileNotificationButton"
                    class="housekeeping-mobile-notification-button"
                >
                    🔔
                </button>

            </header>


            <!-- SIDEBAR -->

            <aside
                id="housekeepingSidebar"
                class="housekeeping-sidebar"
            >

                <div class="housekeeping-brand">

                    <div class="housekeeping-brand-mark">
                        M
                    </div>

                    <div>

                        <h1>
                            Mirima
                        </h1>

                        <span>
                            Housekeeping
                        </span>

                    </div>

                </div>


                <!-- STAFF -->

                <div class="housekeeping-staff">

                    <div class="housekeeping-avatar">

                        ${getInitials(session.name)}

                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(session.name)}
                        </strong>

                        <span>
                            Housekeeping
                        </span>

                    </div>

                </div>


                <!-- NAVIGATION -->

                <nav class="housekeeping-navigation">

                    <button
                        class="housekeeping-nav-item active"
                        data-housekeeping-section="overview"
                    >
                        <span>⌂</span>
                        Overview
                    </button>


                    <button
                        class="housekeeping-nav-item"
                        data-housekeeping-section="requests"
                    >
                        <span>☷</span>
                        Guest Requests

                        <b
                            id="housekeepingRequestCount"
                            class="housekeeping-nav-count"
                        >
                            0
                        </b>

                    </button>


                    <button
                        class="housekeeping-nav-item"
                        data-housekeeping-section="chat"
                    >
                        <span>✉</span>
                        Live Chat

                        <b
                            id="housekeepingChatCount"
                            class="housekeeping-nav-count"
                        >
                            0
                        </b>

                    </button>


                    <button
                        class="housekeeping-nav-item"
                        data-housekeeping-section="announcements"
                    >
                        <span>♢</span>
                        Announcements
                    </button>


                    <button
                        class="housekeeping-nav-item"
                        data-housekeeping-section="history"
                    >
                        <span>↺</span>
                        History
                    </button>

                </nav>


                <!-- SIDEBAR BOTTOM -->

                <div class="housekeeping-sidebar-bottom">

                    <div class="housekeeping-connection-status">

                        <span></span>

                        System Online

                    </div>

                    <button
                        id="housekeepingLogout"
                        class="housekeeping-logout"
                    >
                        Logout
                    </button>

                </div>

            </aside>


            <!-- SIDEBAR OVERLAY -->

            <div
                id="housekeepingSidebarOverlay"
                class="housekeeping-sidebar-overlay"
            ></div>


            <!-- MAIN CONTENT -->

            <main class="housekeeping-main">

                <header class="housekeeping-header">

                    <div>

                        <p class="housekeeping-eyebrow">
                            MIRIMA ADMIN / HOUSEKEEPING
                        </p>

                        <h2 id="housekeepingPageTitle">
                            Housekeeping Overview
                        </h2>

                    </div>


                    <div class="housekeeping-header-actions">

                        <button
                            id="housekeepingNotificationButton"
                            class="housekeeping-header-icon-button"
                        >
                            🔔

                            <span
                                id="housekeepingHeaderNotificationCount"
                                class="housekeeping-header-notification-count"
                            >
                                0
                            </span>

                        </button>


                        <div class="housekeeping-header-staff">

                            ${escapeHTML(session.name)}

                        </div>

                    </div>

                </header>


                <!-- DYNAMIC CONTENT -->

                <section
                    id="housekeepingContent"
                    class="housekeeping-content"
                >

                 <div class="housekeeping-welcome">

    <div>

        <p class="housekeeping-eyebrow">
            OPERATIONS OVERVIEW
        </p>

        <h3>
            Good to see you.
        </h3>

        <p>
            Monitor housekeeping requests, guest communication
            and announcements from one workspace.
        </p>

    </div>

</div>


<!-- OVERVIEW STATISTICS -->

<div class="housekeeping-stat-grid">

    <article class="housekeeping-stat-card">

        <div class="housekeeping-stat-icon">
            🧹
        </div>

        <div>

            <span>
                Guest Requests
            </span>

            <strong id="housekeepingOverviewRequestCount">
                0
            </strong>

            <small>
                Awaiting attention
            </small>

        </div>

    </article>

    <article class="housekeeping-stat-card">

        <div class="housekeeping-stat-icon">
            🔄
        </div>

        <div>
            <span>
                In Progress
            </span>

            <strong>
                0
            </strong>

            <small>
                Currently being handled
            </small>
        </div>

    </article>


    <article class="housekeeping-stat-card">

        <div class="housekeeping-stat-icon">
            💬
        </div>

        <div>
            <span>
                Live Chats
            </span>

            <strong>
                0
            </strong>

            <small>
                Active conversations
            </small>
        </div>

    </article>


    <article class="housekeeping-stat-card">

        <div class="housekeeping-stat-icon">
            📢
        </div>

        <div>
            <span>
                Announcements
            </span>

            <strong>
                0
            </strong>

            <small>
                Published notices
            </small>
        </div>

    </article>

</div>


<!-- RECENT HOUSEKEEPING REQUESTS -->

<div class="housekeeping-panel">

    <div class="housekeeping-panel-heading">

        <div>

            <p class="housekeeping-eyebrow">
                GUEST SERVICES
            </p>

            <h4>
                Recent Housekeeping Requests
            </h4>

        </div>

        <button
            class="housekeeping-text-action"
            data-housekeeping-section="requests"
        >
            View requests
        </button>

    </div>


    <div
        id="housekeepingRecentRequests"
        class="housekeeping-empty-state"
    >

        <div class="housekeeping-empty-icon">
            🧹
        </div>

        <h4>
            No housekeeping requests
        </h4>

        <p>
            New guest housekeeping requests will appear here.
        </p>

    </div>

</div>

                </section>

            </main>

        </div>
    `;

    updateHousekeepingRequestCount();
   
    setupHousekeepingNavigation(session);

    setupHousekeepingMobileMenu();

    setupAdminRequestNotifications();

   document
    .getElementById("housekeepingLogout")
    .addEventListener("click", function () {

    sessionStorage.removeItem(
    "mirimaSession"
);

        location.reload();

    });
}

function setupHousekeepingNavigation(session) {

    const buttons =
        document.querySelectorAll(
            ".housekeeping-nav-item"
        );

    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const section =
                    button.dataset.housekeepingSection;

                buttons.forEach(function (item) {

                    item.classList.toggle(
                        "active",
                        item === button
                    );

                });

                const title =
                    document.getElementById(
                        "housekeepingPageTitle"
                    );

                if (section === "overview") {

                    title.textContent =
                        "Housekeeping Overview";

                }

                if (section === "requests") {

    title.textContent =
        "Guest Requests";

    const content =
        document.getElementById(
            "housekeepingContent"
        );

    content.innerHTML = `
        <div class="housekeeping-panel">

            <div class="housekeeping-panel-heading">

                <div>

                    <p class="housekeeping-eyebrow">
                        GUEST SERVICES
                    </p>

                    <h4>
                        Housekeeping Requests
                    </h4>

                </div>

            </div>


            <div
    id="housekeepingRequestCategories"
    class="housekeeping-request-grid"
>

    <article class="housekeeping-request-card">
        <div class="housekeeping-request-icon">🛏️</div>
        <div>
            <strong>Make Up Room</strong>
            <span>Room refresh and bed making</span>
        </div>
    </article>

    <article class="housekeeping-request-card">
        <div class="housekeeping-request-icon">🧺</div>
        <div>
            <strong>Fresh Towels</strong>
            <span>Request fresh towels</span>
        </div>
    </article>

    <article class="housekeeping-request-card">
        <div class="housekeeping-request-icon">🧼</div>
        <div>
            <strong>Toiletries</strong>
            <span>Guest toiletries and supplies</span>
        </div>
    </article>

    <article class="housekeeping-request-card">
        <div class="housekeeping-request-icon">🧻</div>
        <div>
            <strong>Toilet Paper</strong>
            <span>Request additional toilet paper</span>
        </div>
    </article>

    <article class="housekeeping-request-card">
        <div class="housekeeping-request-icon">🛁</div>
        <div>
            <strong>Bathroom Cleaning</strong>
            <span>Request bathroom cleaning</span>
        </div>
    </article>

    <article class="housekeeping-request-card">
        <div class="housekeeping-request-icon">🧹</div>
        <div>
            <strong>Full Room Cleaning</strong>
            <span>Request a full room cleaning</span>
        </div>
    </article>

    <article class="housekeeping-request-card">
        <div class="housekeeping-request-icon">🌹</div>
        <div>
            <strong>Romantic Room Setup</strong>
            <span>Prepare the room for a special occasion</span>
        </div>
    </article>

    <article class="housekeeping-request-card">
        <div class="housekeeping-request-icon">🍼</div>
        <div>
            <strong>Baby Cot Request</strong>
            <span>Request a baby cot</span>
        </div>
    </article>

    <article class="housekeeping-request-card">
        <div class="housekeeping-request-icon">🧺</div>
        <div>
            <strong>Laundry Collection</strong>
            <span>Request laundry collection</span>
        </div>
    </article>

    <article class="housekeeping-request-card">
        <div class="housekeeping-request-icon">🧳</div>
        <div>
            <strong>Extra Blanket</strong>
            <span>Request an additional blanket</span>
        </div>
    </article>

</div>

        </div>
    `;

}

                if (section === "chat") {

                    title.textContent =
                        "Live Chat";

                }

                if (section === "announcements") {

                    title.textContent =
                        "Announcements";

                }

                if (section === "history") {

                    title.textContent =
                        "Housekeeping History";

                }

            }
        );

    });

}

// =========================================================
// SECURITY DASHBOARD
// =========================================================

function renderSecurityDashboard(session) {

    const loginScreen =
        document.getElementById("loginScreen");

    loginScreen.className =
        "login-screen security-mode";

    loginScreen.innerHTML = `

        <div class="security-app">

    <!-- MOBILE HEADER -->

    <header class="security-mobile-header">

        <button
            id="securityMobileMenuButton"
            class="security-mobile-menu-button"
        >
            ☰
        </button>

        <div class="security-mobile-brand">

            <strong>
                Mirima
            </strong>

            <span>
                Security
            </span>

        </div>

        <button
            id="securityMobileNotificationButton"
            class="security-mobile-notification-button"
        >
            🔔
        </button>

    </header>


    <!-- SIDEBAR -->

    <aside
        id="securitySidebar"
        class="security-sidebar"
    >

        <div class="security-brand">

            <div class="security-brand-mark">
                M
            </div>

            <div>

                <h1>
                    Mirima
                </h1>

                <span>
                    Security
                </span>

            </div>

        </div>


        <!-- STAFF -->

        <div class="security-staff">

            <div class="security-avatar">

                ${getInitials(session.name)}

            </div>

            <div>

                <strong>
                    ${escapeHTML(session.name)}
                </strong>

                <span>
                    Security
                </span>

            </div>

        </div>


        <!-- NAVIGATION -->

        <nav class="security-navigation">

            <button
                class="security-nav-item active"
                data-security-section="overview"
            >
                <span>⌂</span>
                Overview
            </button>


            <button
                class="security-nav-item"
                data-security-section="requests"
            >
                <span>☷</span>
                Guest Requests

                <b
                    id="securityRequestCount"
                    class="security-nav-count"
                >
                    0
                </b>

            </button>


            <button
                class="security-nav-item"
                data-security-section="chat"
            >
                <span>✉</span>
                Live Chat

                <b
                    id="securityChatCount"
                    class="security-nav-count"
                >
                    0
                </b>

            </button>


            <button
                class="security-nav-item"
                data-security-section="announcements"
            >
                <span>♢</span>
                Announcements
            </button>


            <button
                class="security-nav-item"
                data-security-section="history"
            >
                <span>↺</span>
                History
            </button>

        </nav>


        <!-- SIDEBAR BOTTOM -->

        <div class="security-sidebar-bottom">

            <div class="security-connection-status">

                <span></span>

                System Online

            </div>

            <button
                id="securityLogout"
                class="security-logout"
            >
                Logout
            </button>

        </div>

    </aside>


    <!-- SIDEBAR OVERLAY -->

    <div
        id="securitySidebarOverlay"
        class="security-sidebar-overlay"
    ></div>


    <!-- MAIN CONTENT -->

    <main class="security-main">

        <header class="security-header">

            <div>

                <p class="security-eyebrow">
                    MIRIMA ADMIN / SECURITY
                </p>

                <h2 id="securityPageTitle">
                    Security Overview
                </h2>

            </div>


            <div class="security-header-actions">

                <button
                    id="securityNotificationButton"
                    class="security-header-icon-button"
                >
                    🔔

                    <span
                        id="securityHeaderNotificationCount"
                        class="security-header-notification-count"
                    >
                        0
                    </span>

                </button>


                <div class="security-header-staff">

                    ${escapeHTML(session.name)}

                </div>

            </div>

        </header>


        <!-- DYNAMIC CONTENT -->

        <section
    id="securityContent"
    class="security-content"
>

    <div class="security-welcome">

        <div>

            <p class="security-eyebrow">
                SECURITY OPERATIONS
            </p>

            <h3>
                Security Overview
            </h3>

            <p>
                Monitor guest security requests, incidents,
                communication and important security activity
                from one workspace.
            </p>

        </div>

    </div>


    <div class="security-stat-grid">

        <div class="security-stat-card">

            <span class="security-stat-label">
                Active Requests
            </span>

            <strong id="securityActiveRequests">
                0
            </strong>

            <small>
                Requiring attention
            </small>

        </div>


        <div class="security-stat-card">

            <span class="security-stat-label">
                Open Incidents
            </span>

            <strong id="securityOpenIncidents">
                0
            </strong>

            <small>
                Currently reported
            </small>

        </div>


        <div class="security-stat-card">

            <span class="security-stat-label">
                Unread Messages
            </span>

            <strong id="securityUnreadMessages">
                0
            </strong>

            <small>
                From staff
            </small>

        </div>


        <div class="security-stat-card">

            <span class="security-stat-label">
                Alerts
            </span>

            <strong id="securityAlerts">
                0
            </strong>

            <small>
                Security notifications
            </small>

        </div>

    </div>


    <div class="security-panel">

        <div class="security-panel-header">

            <div>

                <p class="security-eyebrow">
                    SECURITY OPERATIONS
                </p>

                <h3>
                    Recent Security Requests
                </h3>

            </div>

            <button
                class="security-panel-action"
                data-security-section="requests"
            >
                View All
            </button>

        </div>


        <div class="security-empty-state">

            <div class="security-empty-icon">
                🛡️
            </div>

            <h4>
                No security requests
            </h4>

            <p>
                New security-related guest requests
                will appear here.
            </p>

        </div>

    </div>

</section>

    </main>

</div>

 `;

    const securityLogout =
        document.getElementById("securityLogout");

    if (securityLogout) {
        securityLogout.onclick = function () {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );

            if (!confirmed) {
                return;
            }

            sessionStorage.removeItem(
                "mirimaSession"
            );

            window.location.reload();
        };
    }
   setupSecurityMobileMenu();
}
function setupSecurityMobileMenu() {

    const menuButton =
        document.getElementById(
            "securityMobileMenuButton"
        );

    const sidebar =
        document.getElementById(
            "securitySidebar"
        );

    const overlay =
        document.getElementById(
            "securitySidebarOverlay"
        );

    if (!menuButton || !sidebar || !overlay) {
        return;
    }

    menuButton.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "mobile-open"
            );

            overlay.classList.toggle(
                "visible"
            );

        }
    );

    overlay.addEventListener(
        "click",
        function () {

            sidebar.classList.remove(
                "mobile-open"
            );

            overlay.classList.remove(
                "visible"
            );

        }
    );

}

// =========================================================
// MANAGEMENT DASHBOARD
// =========================================================

function renderManagementDashboard(session) {

    const loginScreen =
        document.getElementById("loginScreen");

    loginScreen.className =
        "login-screen management-mode";

    loginScreen.innerHTML = `

        <div class="management-app">

    <!-- MOBILE HEADER -->

    <header class="management-mobile-header">

        <button
            id="managementMobileMenuButton"
            class="management-mobile-menu-button"
        >
            ☰
        </button>

        <div class="management-mobile-brand">

            <strong>
                Mirima
            </strong>

            <span>
                Management
            </span>

        </div>

        <button
            id="managementMobileNotificationButton"
            class="management-mobile-notification-button"
        >
            🔔
        </button>

    </header>


    <!-- SIDEBAR -->

    <aside
        id="managementSidebar"
        class="management-sidebar"
    >

        <div class="management-brand">

            <div class="management-brand-mark">
                M
            </div>

            <div>

                <h1>
                    Mirima
                </h1>

                <span>
                    Management
                </span>

            </div>

        </div>


        <!-- STAFF -->

        <div class="management-staff">

            <div class="management-avatar">

                ${getInitials(session.name)}

            </div>

            <div>

                <strong>
                    ${escapeHTML(session.name)}
                </strong>

                <span>
                    Management
                </span>

            </div>

        </div>


        <!-- NAVIGATION -->

        <nav class="management-navigation">

            <button
                class="management-nav-item active"
                data-management-section="overview"
            >
                <span>⌂</span>
                Overview
            </button>


            <button
                class="management-nav-item"
                data-management-section="operations"
            >
                <span>▦</span>
                Operations
            </button>


            <button
                class="management-nav-item"
                data-management-section="guests"
            >
                <span>♙</span>
                Guests
            </button>


            <button
                class="management-nav-item"
                data-management-section="billing"
            >
                <span>▤</span>
                Billing
            </button>


            <button
                class="management-nav-item"
                data-management-section="reports"
            >
                <span>▥</span>
                Reports
            </button>


            <button
                class="management-nav-item"
                data-management-section="announcements"
            >
                <span>♢</span>
                Announcements
            </button>

        </nav>


        <!-- SIDEBAR BOTTOM -->

        <div class="management-sidebar-bottom">

            <div class="management-connection-status">

                <span></span>

                System Online

            </div>

            <button
                id="managementLogout"
                class="management-logout"
            >
                Logout
            </button>

        </div>

    </aside>


    <!-- SIDEBAR OVERLAY -->

    <div
        id="managementSidebarOverlay"
        class="management-sidebar-overlay"
    ></div>


    <!-- MAIN CONTENT -->

    <main class="management-main">

        <header class="management-header">

            <div>

                <p class="management-eyebrow">
                    MIRIMA ADMIN / MANAGEMENT
                </p>

                <h2 id="managementPageTitle">
                    Management Overview
                </h2>

            </div>


            <div class="management-header-actions">

                <button
                    id="managementNotificationButton"
                    class="management-header-icon-button"
                >
                    🔔

                    <span
                        id="managementHeaderNotificationCount"
                        class="management-header-notification-count"
                    >
                        0
                    </span>

                </button>


                <div class="management-header-staff">

                    ${escapeHTML(session.name)}

                </div>

            </div>

        </header>


        <!-- DYNAMIC CONTENT -->

        <section
    id="managementContent"
    class="management-content"
>

    <div class="management-welcome">

        <div>
            <p class="management-eyebrow">
                PROPERTY PERFORMANCE
            </p>

            <h3>
                Good evening, ${escapeHTML(session.name)}
            </h3>

            <p>
                Monitor the lodge's operations, guests,
                revenue and departmental activity from one place.
            </p>
        </div>

        <div class="management-date-card">
            <span>Today</span>
            <strong>Management Center</strong>
        </div>

    </div>


    <div class="management-stat-grid">

        <div class="management-stat-card">
            <span>Occupancy</span>
            <strong>0%</strong>
            <small>Currently occupied</small>
        </div>

        <div class="management-stat-card">
            <span>Active Guests</span>
            <strong>0</strong>
            <small>Currently staying</small>
        </div>

        <div class="management-stat-card">
            <span>Today's Revenue</span>
            <strong>UGX 0</strong>
            <small>Payments received today</small>
        </div>

        <div class="management-stat-card">
            <span>Pending Requests</span>
            <strong>0</strong>
            <small>Requiring attention</small>
        </div>

    </div>


    <div class="management-dashboard-grid">

        <div class="management-panel">

            <div class="management-panel-header">

                <div>
                    <p class="management-eyebrow">
                        OPERATIONS
                    </p>

                    <h3>
                        Department Status
                    </h3>
                </div>

            </div>

            <div class="management-department-list">

                <div class="management-department-item">
                    <span class="management-status-dot"></span>
                    <div>
                        <strong>Reception</strong>
                        <small>Front desk operations</small>
                    </div>
                    <b>Online</b>
                </div>

                <div class="management-department-item">
                    <span class="management-status-dot"></span>
                    <div>
                        <strong>Housekeeping</strong>
                        <small>Rooms and cottage services</small>
                    </div>
                    <b>Online</b>
                </div>

                <div class="management-department-item">
                    <span class="management-status-dot"></span>
                    <div>
                        <strong>Kitchen</strong>
                        <small>Food and guest orders</small>
                    </div>
                    <b>Online</b>
                </div>

                <div class="management-department-item">
                    <span class="management-status-dot"></span>
                    <div>
                        <strong>Spa</strong>
                        <small>Wellness and treatments</small>
                    </div>
                    <b>Online</b>
                </div>

                <div class="management-department-item">
                    <span class="management-status-dot"></span>
                    <div>
                        <strong>Security</strong>
                        <small>Safety and incidents</small>
                    </div>
                    <b>Online</b>
                </div>

            </div>

        </div>


        <div class="management-panel">

            <div class="management-panel-header">

                <div>
                    <p class="management-eyebrow">
                        ACTIVITY
                    </p>

                    <h3>
                        Recent Activity
                    </h3>
                </div>

            </div>

            <div class="management-empty-state">

                <div class="management-empty-icon">
                    ◷
                </div>

                <h4>
                    No recent activity
                </h4>

                <p>
                    Guest activity, payments and departmental
                    updates will appear here.
                </p>

            </div>

        </div>

    </div>


    <div class="management-panel">

        <div class="management-panel-header">

            <div>
                <p class="management-eyebrow">
                    GUEST MOVEMENT
                </p>

                <h3>
                    Today's Check-ins & Check-outs
                </h3>
            </div>

        </div>

        <div class="management-empty-state">

            <div class="management-empty-icon">
                ◫
            </div>

            <h4>
                No scheduled activity
            </h4>

            <p>
                Today's guest arrivals and departures
                will appear here.
            </p>

        </div>

    </div>

</section>

    </main>

</div>

    `;
    const managementLogout =
        document.getElementById("managementLogout");

    if (managementLogout) {
        managementLogout.onclick = function () {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );

            if (!confirmed) {
                return;
            }

            sessionStorage.removeItem(
                "mirimaSession"
            );

            window.location.reload();
        };
    }

    const managementNavItems =
        document.querySelectorAll(
            ".management-nav-item"
        );

    managementNavItems.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const section =
                    button.dataset.managementSection;

                managementNavItems.forEach(
                    function (item) {
                        item.classList.toggle(
                            "active",
                            item === button
                        );
                    }
                );

                const title =
                    document.getElementById(
                        "managementPageTitle"
                    );

                if (section === "overview") {
                    title.textContent =
                        "Management Overview";
                }

                if (section === "operations") {
                    title.textContent =
                        "Operations";
                }

                if (section === "guests") {
                    title.textContent =
                        "Guests";
                }

                if (section === "billing") {
                    title.textContent =
                        "Billing";
                }

                if (section === "reports") {
                    title.textContent =
                        "Reports";
                }

                if (section === "announcements") {
                    title.textContent =
                        "Announcements";
                }

            }
        );

    });

   setupManagementMobileMenu();
   
}

function setupManagementMobileMenu() {

    const menuButton =
        document.getElementById(
            "managementMobileMenuButton"
        );

    const sidebar =
        document.getElementById(
            "managementSidebar"
        );

    const overlay =
        document.getElementById(
            "managementSidebarOverlay"
        );

    if (!menuButton || !sidebar || !overlay) {
        return;
    }

    menuButton.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "mobile-open"
            );

            overlay.classList.toggle(
                "visible"
            );

        }
    );

    overlay.addEventListener(
        "click",
        function () {

            sidebar.classList.remove(
                "mobile-open"
            );

            overlay.classList.remove(
                "visible"
            );

        }
    );

    document.addEventListener(
        "click",
        function (event) {

            if (
                sidebar.classList.contains("mobile-open") &&
                !sidebar.contains(event.target) &&
                event.target !== menuButton
            ) {
                sidebar.classList.remove("mobile-open");
                overlay.classList.remove("visible");
            }

        }
    );
   
}

// =========================================================
// SHOW RECEPTION DASHBOARD
// =========================================================

export function showDashboard(session) {

    if (session.role === "security") {

        renderSecurityDashboard(session);

        return;
    }

    if (session.role === "housekeeping") {

        renderHousekeepingDashboard(session);

        return;
    }

    if (session.role === "kitchen") {

        renderKitchenDashboard(session);

        return;
    }

    if (session.role === "spa") {

        renderSpaDashboard(session);

        return;
    }

       if (session.role === "management") {

        renderManagementDashboard(session);

        return;
    }
   
    const loginScreen =
        document.getElementById("loginScreen");

   loginScreen.className =
       "login-screen housekeeping-mode";
   
    loginScreen.innerHTML = `

        <div class="reception-app">

            <!-- =========================================
                 MOBILE HEADER
                 ========================================= -->

            <header class="mobile-header">

                <button
                    id="mobileMenuButton"
                    class="mobile-menu-button"
                    aria-label="Open menu"
                >
                    ☰
                </button>


                <div class="mobile-brand">

                    <strong>
                        Mirima
                    </strong>

                    <span>
                        Reception
                    </span>

                </div>


                <button
                    id="mobileNotificationButton"
                    class="mobile-notification-button"
                    aria-label="Notifications"
                >
                    🔔
                </button>

            </header>


            <!-- =========================================
                 SIDEBAR
                 ========================================= -->

            <aside
                id="receptionSidebar"
                class="reception-sidebar"
            >

                <div class="reception-brand">

                    <div class="reception-brand-mark">
                        M
                    </div>

                    <div>

                        <h1>
                            Mirima
                        </h1>

                        <span>
                            Reception
                        </span>

                    </div>

                </div>


                <!-- Staff -->

                <div class="reception-staff">

                    <div class="reception-avatar">

                        ${getInitials(session.name)}

                    </div>


                    <div>

                        <strong>
                            ${escapeHTML(session.name)}
                        </strong>

                        <span>
                            Reception
                        </span>

                    </div>

                </div>


                <!-- Navigation -->

                <nav class="reception-navigation">

                    <button
                        class="reception-nav-item active"
                        data-section="overview"
                    >
                        <span>⌂</span>
                        Overview
                    </button>


                    <button
                        class="reception-nav-item"
                        data-section="guests"
                    >
                        <span>♙</span>
                        Current Guests
                    </button>


                    <button
                        class="reception-nav-item"
                        data-section="requests"
                    >
                        <span>☷</span>
                        Guest Requests

                        <b
                            id="requestCount"
                            class="nav-count"
                        >
                            0
                        </b>

                    </button>


                    <button
                        class="reception-nav-item"
                        data-section="chat"
                    >
                        <span>✉</span>
                        Live Chat

                        <b
                            id="chatCount"
                            class="nav-count"
                        >
                            0
                        </b>

                    </button>


                    <button
                        class="reception-nav-item"
                        data-section="billing"
                    >
                        <span>▣</span>
                        Billing & Receipts
                    </button>


                 <button
                class="reception-nav-item"
                data-section="feedback"
           >
                 <span>★</span>
                 Feedback
                </button>


                    <button
                        class="reception-nav-item emergency-nav"
                        data-section="emergency"
                    >
                        <span>!</span>
                        Emergency Alerts

                        <b
                            id="emergencyCount"
                            class="nav-count emergency-count"
                        >
                            0
                        </b>

                    </button>

                </nav>


                <!-- Sidebar bottom -->

                <div class="reception-sidebar-bottom">

                    <div class="connection-status">

                        <span></span>

                        System Online

                    </div>


                    <button
                        id="receptionLogout"
                        class="reception-logout"
                    >
                        Logout
                    </button>

                </div>

            </aside>


            <!-- =========================================
                 SIDEBAR OVERLAY
                 ========================================= -->

            <div
                id="sidebarOverlay"
                class="sidebar-overlay"
            ></div>


            <!-- =========================================
                 MAIN CONTENT
                 ========================================= -->

            <main class="reception-main">

                <!-- Desktop header -->

                <header class="reception-header">

                    <div>

                        <p class="reception-eyebrow">
                            MIRIMA ADMIN / RECEPTION
                        </p>

                        <h2 id="receptionPageTitle">
                            Reception Overview
                        </h2>

                    </div>


                    <div class="reception-header-actions">

                        <button
                            id="notificationButton"
                            class="header-icon-button"
                            aria-label="Notifications"
                        >
                            🔔

                            <span
                                id="headerNotificationCount"
                                class="header-notification-count"
                            >
                                0
                            </span>

                        </button>


                        <div class="header-staff">

                            <span>
                                ${escapeHTML(session.name)}
                            </span>

                        </div>

                    </div>

                </header>


                <!-- Dynamic page -->

                <section
                    id="receptionContent"
                    class="reception-content"
                ></section>

            </main>

        </div>

    `;


    // Render overview

    renderReceptionSection(
        "overview",
        session
    );
   
updateOverviewCurrentGuests();
updateOverviewGuestRequests();
updateOverviewRecentRequests();
updateOverviewLiveChats();
updateOverviewEmergencyAlerts();
updateOverviewCurrentGuestsPanel();
updateEmergencyCount();
// archiveOldHistoricalPayments();
// Setup navigation
// Setup navigation

    setupReceptionNavigation(session);

     updateRequestCount();

    // Setup mobile menu

    setupMobileMenu();

    setupAdminRequestNotifications("reception");

    console.log("ADMIN NOTIFICATION SETUP RUNNING");

    // Setup logout

    setupReceptionLogout();

}

async function updateHousekeepingRequestCount() {

    const requests =
        await getRequestsFromFirestore();

    const housekeepingRequests =
        requests.filter(function (request) {

            return (
                request.service || ""
            ).includes("Housekeeping");

        });

    const count =
        housekeepingRequests.length;

    const sidebarCount =
        document.getElementById(
            "housekeepingRequestCount"
        );

    if (sidebarCount) {
        sidebarCount.textContent = count;
    }

    const overviewCount =
        document.getElementById(
            "housekeepingOverviewRequestCount"
        );

    if (overviewCount) {
        overviewCount.textContent = count;
    }
     
}
// =========================================================
// RECEPTION OVERVIEW
// =========================================================

function getOverviewContent() {

    return `

        <div class="reception-welcome">

            <div>

                <p class="content-eyebrow">
                    OPERATIONS OVERVIEW
                </p>

                <h3>
                    Good to see you.
                </h3>

                <p>
                    Manage guests, cottages, requests,
                    communication and reception services
                    from one workspace.
                </p>

            </div>


            <button
                class="primary-action"
                data-section="guests"
            >
                + Manage Guests
            </button>

        </div>


        <!-- Statistics -->

        <div class="reception-stat-grid">

            <article class="reception-stat-card">

                <div class="stat-icon">
                    ♙
                </div>

                <div>

                    <span>
                        Current Guests
                    </span>

                    <strong id="overviewCurrentGuestsCount">
                      0
                    </strong>

                    <small>
                        Active stays
                    </small>

                </div>

            </article>


            <article class="reception-stat-card">

                <div class="stat-icon">
                    ☷
                </div>

                <div>

                    <span>
                        Guest Requests
                    </span>

                   <strong id="overviewGuestRequestsCount">
                      0
                   </strong>

                    <small>
                        Awaiting attention
                    </small>

                </div>

            </article>


            <article class="reception-stat-card">

                <div class="stat-icon">
                    ✉
                </div>

                <div>

                    <span>
                        Live Chats
                    </span>

                    <strong id="overviewLiveChatsCount">
                     0
                    </strong>

                    <small>
                        Active conversations
                    </small>

                </div>

            </article>


            <article class="reception-stat-card emergency-stat">

                <div class="stat-icon">
                    !
                </div>

                <div>

                    <span>
                        Emergency Alerts
                    </span>

                   <strong id="overviewEmergencyAlertsCount">
                     0
                   </strong>

                    <small>
                        Requires attention
                    </small>

                </div>

            </article>

        </div>


        <!-- Current cottage activity -->

        <div class="reception-panel">

            <div class="panel-heading">

                <div>

                    <p class="content-eyebrow">
                        COTTAGE ACTIVITY
                    </p>

                    <h4>
                        Current Guests
                    </h4>

                </div>


                <button
                    class="text-action"
                    data-section="guests"
                >
                    View all
                </button>

            </div>


           <div
            id="overviewCurrentGuests"
              class="empty-reception-state"
             >
                <div class="empty-state-icon">
                    ♙
                </div>

                <h4>
                    No active guests
                </h4>

                <p>
                    Guest information entered by Reception
                    will appear here.
                </p>


                <button
                    class="secondary-action"
                    data-section="guests"
                >
                    Add Guest
                </button>

            </div>

        </div>


        <!-- Requests -->

        <div class="reception-panel">

            <div class="panel-heading">

                <div>

                    <p class="content-eyebrow">
                        GUEST SERVICES
                    </p>

                    <h4>
                        Recent Requests
                    </h4>

                </div>


                <button
                    class="text-action"
                    data-section="requests"
                >
                    View requests
                </button>

            </div>


           <div
          id="overviewRecentRequests"
          class="request-preview"
         >

                <div class="preview-row">

                    <div class="preview-icon">
                        ✈
                    </div>

                    <div class="preview-info">

                        <strong>
                            Airport Transfer
                        </strong>

                        <span>
                            No pending requests
                        </span>

                    </div>

                    <span class="preview-status">
                        0
                    </span>

                </div>


                <div class="preview-row">

                    <div class="preview-icon">
                        🧳
                    </div>

                    <div class="preview-info">

                        <strong>
                            Luggage Assistance
                        </strong>

                        <span>
                            No pending requests
                        </span>

                    </div>

                    <span class="preview-status">
                        0
                    </span>

                </div>


                <div class="preview-row">

                    <div class="preview-icon">
                        📅
                    </div>

                    <div class="preview-info">

                        <strong>
                            Stay Extensions
                        </strong>

                        <span>
                            No pending requests
                        </span>

                    </div>

                    <span class="preview-status">
                        0
                    </span>

                </div>

            </div>

        </div>

    `;

      const spaLogout =
    document.getElementById("spaLogout");

if (spaLogout) {
    spaLogout.addEventListener(
        "click",
        function () {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );

            if (!confirmed) {
                return;
            }

            sessionStorage.removeItem(
                "mirimaSession"
            );

            window.location.reload();
        }
    );
}


    const spaNavItems =
        document.querySelectorAll(
            ".spa-nav-item"
        );

    spaNavItems.forEach(function (item) {

        item.addEventListener(
            "click",
            function () {

                spaNavItems.forEach(function (nav) {
                    nav.classList.remove("active");
                });

                item.classList.add("active");

                const section =
                    item.dataset.section;

                const pageTitle =
                    document.getElementById(
                        "spaPageTitle"
                    );

                if (pageTitle) {

                    const titles = {
                        overview: "Spa Overview",
                        requests: "Guest Requests",
                        chat: "Live Chat",
                        announcements: "Announcements",
                        history: "History"
                    };

                    pageTitle.textContent =
                        titles[section] || "Spa Overview";
                }

            }
        );

    });
   
}

function setupSpaMobileMenu() {

    const menuButton =
        document.getElementById(
            "spaMobileMenuButton"
        );

    const sidebar =
        document.getElementById(
            "spaSidebar"
        );

       if (!menuButton || !sidebar) {
        return;
    }

   menuButton.addEventListener(
    "click",
    function () {

        sidebar.classList.toggle(
            "mobile-open"
        );

    }
);

   document.addEventListener(
    "click",
    function (event) {

        if (
            sidebar.classList.contains("mobile-open") &&
            !sidebar.contains(event.target) &&
            event.target !== menuButton
        ) {
            sidebar.classList.remove("mobile-open");
        }

    }
);

}

// =========================================================
// SECTION RENDERING
// =========================================================

async function renderReceptionSection(section, session) {
   
    const content =
        document.getElementById(
            "receptionContent"
        );


    const title =
        document.getElementById(
            "receptionPageTitle"
        );


    if (!content) {

        return;

    }


    switch (section) {

        case "overview":

            title.textContent =
                "Reception Overview";

            content.innerHTML =
                getOverviewContent();

            break;


       case "guests":

    title.textContent =
        "Current Guests";

    content.innerHTML =
        await getGuestsContent();

    break;

        case "requests":
                   
            title.textContent =
                "Guest Requests";

          getRequestsContent().then(async function (html) {
           content.innerHTML = html;
           setupRequestStatusButtons();
           setupRequestCategoryButtons(
           await getRequestsFromFirestore()
          );
             
         });

            break;
          
      case "feedback":
     content.innerHTML = await getFeedbackContent();
     break;

          
       case "chat":
    title.textContent = "Live Chat";
    content.innerHTML = getChatContent();

    setupReceptionLiveChat();

    break;

                case "billing":

            title.textContent =
                "Billing & Receipts";

            content.innerHTML =
                await getBillingContent();

            setupReceiptButtons();
            setupBillingViewButtons();
            setupBillingCategoryButtons();

            break;


        case "emergency":

    title.textContent =
        "Emergency Alerts";

    content.innerHTML =
        await getEmergencyContent();

    break;

    }

setupSectionButtons(session);
setupCheckoutButtons();
setupBillingButtons();
setupGuestModal();
}

// =========================================================
// UPDATE OVERVIEW CURRENT GUESTS
// =========================================================

async function updateOverviewCurrentGuests() {
   const guests = (await getActiveGuests()).filter(function (guest) {
    return guest.name && guest.name.trim() !== "";
});
    const countElement = document.getElementById(
        "overviewCurrentGuestsCount"
    );

    if (countElement) {
        countElement.textContent = guests.length;
    }
}

async function updateOverviewGuestRequests() {
    const requests = await getRequestsFromFirestore();

    const receptionRequests = requests.filter(function (request) {
        const service = request.service || "";

return (
    service.includes("Airport Transfer") ||
    service.includes("Luggage Assistance") ||
    service.includes("Extend Your Stay") ||
    service.includes("Maintenance Request") ||
    service.includes("Emergency Assistance") ||
    service.includes("Billing Help") ||
    service.includes("Currency Exchange") ||
    service.includes("Other Assistance") ||
    service.includes("Late Checkout") ||
    service.includes("Make Payment") ||
    service.includes("Payment at Reception") ||
    service.includes("Mobile Money Payment") ||
    service.includes("Chimpanzee Trekking") ||
    service.includes("Wildlife Viewing") ||
    service.includes("Evening Campfire") ||
    service.includes("Forest Nature Walk") ||
    service.includes("Crater Lake Tour") ||
    service.includes("Photography Tour") ||
    service.includes("Restaurant Reservation") ||
    service.includes("Bar Menu") ||
    service.includes("Room Dining") ||
    service.includes("Restaurant Menu") ||
    service.includes("Receipt")
);
    });

    const countElement = document.getElementById(
        "overviewGuestRequestsCount"
    );

    if (countElement) {
        countElement.textContent = receptionRequests.length;
    }
}


async function updateOverviewRecentRequests() {
    const requests = await getRequestsFromFirestore();

    const receptionRequests = requests.filter(function (request) {
        const service = request.service || "";

        return (
            service.includes("Airport Transfer") ||
            service.includes("Luggage Assistance") ||
            service.includes("Extend Your Stay") ||
            service.includes("Maintenance Request") ||
            service.includes("Emergency Assistance") ||
            service.includes("Billing Help") ||
            service.includes("Currency Exchange") ||
            service.includes("Other Assistance")
        );
    });

    const container = document.getElementById(
        "overviewRecentRequests"
    );

    if (!container) return;

    if (receptionRequests.length === 0) {
        container.innerHTML = `
            <div class="preview-row">
                <div class="preview-info">
                    <strong>No recent requests</strong>
                    <span>Reception requests will appear here.</span>
                </div>

                <span class="preview-status">0</span>
            </div>
        `;

        return;
    }

    container.innerHTML = receptionRequests
        .slice(0, 3)
        .map(function (request) {
            return `
                <div class="preview-row">

                    <div class="preview-info">
                        <strong>
                            ${request.service}
                        </strong>

                        <span>
                            ${request.guestName || "Guest"}
                        </span>
                    </div>

                    <span class="preview-status">
                        ${request.status || "Received"}
                    </span>

                </div>
            `;
        })
        .join("");
}

async function updateOverviewLiveChats() {
    const countElement = document.getElementById(
        "overviewLiveChatsCount"
    );

    if (countElement) {
        countElement.textContent = 0;
    }
}

async function updateOverviewEmergencyAlerts() {
    const countElement = document.getElementById(
        "overviewEmergencyAlertsCount"
    );

    if (countElement) {
        countElement.textContent = 0;
    }
}

async function updateOverviewCurrentGuestsPanel() {
   
    const guests = (await getActiveGuests()).filter(function (guest) {
    return guest.name && guest.name.trim() !== "";
});

    const container = document.getElementById(
        "overviewCurrentGuests"
    );

    if (!container) return;

    if (guests.length === 0) {
        container.innerHTML = `
            <div class="empty-state-icon">
                ♙
            </div>

            <h4>
                No active guests
            </h4>

            <p>
                Guest information entered by Reception
                will appear here.
            </p>

            <button
                class="secondary-action"
                data-section="guests"
            >
                Add Guest
            </button>
        `;

        return;
    }

    container.innerHTML = guests.map(function (guest) {
    return `
        <div class="overview-guest-row">

            <div>
                <strong>
                    ${guest.name}
                </strong>

                <span>
                    Cottage ${guest.cottageId.replace("cottage-", "")}
                </span>
            </div>

            <small>
                Checkout: ${guest.checkoutDate || "Not set"}
            </small>

        </div>
    `;
}).join("");

}

async function updateEmergencyCount() {

    const countElement =
        document.getElementById("emergencyCount");

    if (!countElement) {
        return;
    }

    const requests =
        await getRequestsFromFirestore();

    const emergencyCount =
        requests.filter(function (request) {

            return (
                request.service || ""
            ).includes("Emergency Assistance");

        }).length;

    countElement.textContent =
        emergencyCount;
}

// =========================================================
// PAYMENT RECEIPT
// =========================================================

async function openPaymentReceipt(paymentId) {

    const payments = await getPayments();

    const payment =
        payments.find(function (item) {
            return item.id === paymentId;
        });

    if (!payment) {
        alert("Payment record not found.");
        return;
    }

    const content =
        document.getElementById("receptionContent");

    if (!content) {
        return;
    }

    content.innerHTML = `
        <div class="billing-details-page">

            <button
                class="billing-back-button"
                id="receiptBackButton"
            >
                ← Back to Receipts
            </button>

            <div class="billing-details-header">

                <div>
                    <p class="content-eyebrow">
                        PAYMENT RECEIPT
                    </p>

                    <h3>
                        Receipt
                    </h3>
                </div>

            </div>

            <div class="billing-details-card">

                <div class="billing-receipt-card">

                    <p>
                        <strong>
                            MIRIMA KIBALE LODGE
                        </strong>
                    </p>

                   <p>
                   <span>Receipt ID:</span>
                    <strong>
                      ${escapeHTML(payment.id)}
                   </strong>
                   </p>

                    <p>
                      <span>Cottage:</span>
                      <strong>
                         ${escapeHTML(String(payment.cottageId))}
                      </strong>
                     </p>

                    <p>
                        Amount Paid:
                        <strong>
                            UGX ${Number(payment.amount).toLocaleString()}
                        </strong>
                    </p>

                    <p>
                     <span>Payment Method:</span>
                      <strong>
                         ${escapeHTML(payment.paymentMethod)}
                      </strong>
                    </p>

   ${
    payment.paymentMethod === "Mobile Money"
        ? `
            <p>
                <span>Account Name:</span>
                <strong>
                    ${escapeHTML(payment.mobileMoneyName || "—")}
                </strong>
            </p>

            <p>
                <span>Phone Number:</span>
                <strong>
                    ${escapeHTML(payment.mobileMoneyPhone || "—")}
                </strong>
            </p>

            <p>
                <span>Transaction ID:</span>
                <strong>
                    ${escapeHTML(payment.transactionId || "—")}
                </strong>
            </p>
        `
        : ""
}

                  <p>
                   <span>Date:</span>
                 <strong>
                   ${new Date(payment.createdAt).toLocaleDateString()}
                 </strong>
                   </p>
                   
                   <p>
                  <span>Status:</span>
                  <strong>
                    ${escapeHTML(payment.status)}
                  </strong>
                    </p>

                </div>

            </div>

        </div>
    `;

    const backButton =
        document.getElementById("receiptBackButton");

    if (backButton) {

        backButton.addEventListener(
            "click",
            async function () {

                const billingContent =
                    await getBillingContent();

                content.innerHTML =
                    billingContent;

                 setupReceiptButtons();
                setupBillingViewButtons();

            }
        );

    }

}

function setupReceiptButtons() {

    document
        .querySelectorAll(".billing-receipt-card")
        .forEach(function (card) {

            card.addEventListener(
                "click",
                function () {

                    if (
                        card.dataset.historicalReceiptId
                    ) {

                        openHistoricalReceipt(
                            card.dataset.historicalReceiptId
                        );

                        return;
                    }

                    openPaymentReceipt(
                        card.dataset.paymentId
                    );

                }
            );

        });

}

function openBillingReceipts() {

    const content =
        document.getElementById(
            "receptionContent"
        );

    if (!content) {
        return;
    }

    getPayments().then(function (payments) {

        content.innerHTML = `
    <div class="billing-page">

        <button
            class="billing-back-button"
            id="billingBackButton"
            type="button"
        >
            ← Back to Billing
        </button>

        <div class="billing-intro">

                    <p class="content-eyebrow">
                        PAYMENTS
                    </p>

                    <h3>
                        Receipts
                    </h3>

                    <p>
                        ${payments.length}
                        payment${payments.length === 1 ? "" : "s"}
                        recorded.
                    </p>

                    ${
                        payments.length
                            ? payments.map(function (payment) {

                                return `
                                    <div
                                        class="billing-receipt-card"
                                        data-payment-id="${payment.id}"
                                    >

                                        <strong>
                                            UGX ${Number(
                                                payment.amount
                                            ).toLocaleString()}
                                        </strong>

                                        <span>
                                            ${escapeHTML(
                                                payment.paymentMethod
                                            )}
                                        </span>

                                    </div>
                                `;

                            }).join("")
                            : `
                                <p>
                                    No receipts available.
                                </p>
                            `
                    }

                </div>

            </div>
        `;

        setupReceiptButtons();

       const billingBackButton =
    document.getElementById(
        "billingBackButton"
    );

if (billingBackButton) {

    billingBackButton.addEventListener(
        "click",
        function () {

            renderReceptionSection(
                "billing",
                getCurrentSession()
            );

        }
    );

}

    });

}

function setupHistoricalReceiptSearch() {

    const searchInput =
        document.getElementById(
            "historicalReceiptSearch"
        );

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener(
        "input",
        function () {

            const search =
                searchInput.value
                    .trim()
                    .toLowerCase();

            document
                .querySelectorAll(
                    '[data-historical-receipt-id]'
                )
                .forEach(function (card) {

                    const text =
                        card.textContent
                            .toLowerCase();

                    card.style.display =
                        text.includes(search)
                            ? ""
                            : "none";

                });

        }
    );

}


function openBillingHistory() {

    const content =
        document.getElementById(
            "receptionContent"
        );

    if (!content) {
        return;
    }

    const historicalReceipts =
        JSON.parse(
            localStorage.getItem(
                "mirimaHistoricalReceipts"
            ) || "[]"
        );

   content.innerHTML = `
    <div class="billing-page">

        <button
            class="billing-back-button"
            id="billingHistoryBackButton"
            type="button"
        >
            ← Back to Billing
        </button>

        <div class="billing-intro">

                <p class="content-eyebrow">
                    HISTORY
                </p>

                <h3>
                    Historical Receipts
                </h3>

                <div class="billing-search-wrapper">

                    <span class="billing-search-icon">
                        ⌕
                    </span>

                    <input
                        type="text"
                        id="historicalReceiptSearch"
                        class="billing-search-input"
                        placeholder="Search guest name or cottage..."
                    >

                </div>

                <p>
                    Receipts are stored for 2 months.
                    Older records are automatically deleted.
                    Download receipts you need to keep.
                </p>

                ${
                    historicalReceipts.length
                        ? historicalReceipts
                            .sort(function (a, b) {
                                return new Date(
                                    b.checkoutDate || b.archivedAt
                                ) - new Date(
                                    a.checkoutDate || a.archivedAt
                                );
                            })
                            .map(function (receipt) {

                                return `
                                    <div
                                        class="billing-receipt-card"
                                        data-historical-receipt-id="${receipt.guestId}"
                                    >

                                        <strong>
                                            ${escapeHTML(
                                                receipt.guestName
                                            )}
                                        </strong>

                                        <span>
                                            Cottage ${escapeHTML(
                                                String(
                                                    receipt.cottageId
                                                )
                                            )}
                                        </span>

                                        <span>
                                            Checkout:
                                            ${escapeHTML(
                                                receipt.checkoutDate || "—"
                                            )}
                                        </span>

                                    </div>
                                `;

                            }).join("")
                        : `
                            <p>
                                No historical receipts.
                            </p>
                        `
                }

            </div>

        </div>
    `;

    setupReceiptButtons();
    setupHistoricalReceiptSearch();

   const billingHistoryBackButton =
    document.getElementById(
        "billingHistoryBackButton"
    );

if (billingHistoryBackButton) {

    billingHistoryBackButton.addEventListener(
        "click",
        function () {

            renderReceptionSection(
                "billing",
                getCurrentSession()
            );

        }
    );

}

}

async function openHistoricalReceipt(guestId) {

    const historicalReceipts =
        JSON.parse(
            localStorage.getItem(
                "mirimaHistoricalReceipts"
            ) || "[]"
        );

    const receipt =
        historicalReceipts.find(
            function (item) {
                return item.guestId === guestId;
            }
        );

    if (!receipt) {
        alert("Historical receipt not found.");
        return;
    }

    const content =
        document.getElementById(
            "receptionContent"
        );

    if (!content) {
        return;
    }

    content.innerHTML = `
        <div class="billing-details-page">

            <button
                class="billing-back-button"
                id="historicalReceiptBackButton"
            >
                ← Back to Receipts
            </button>

            <div class="billing-details-header">

                <div>

                    <p class="content-eyebrow">
                        HISTORICAL RECEIPT
                    </p>

                    <h3>
                        ${escapeHTML(receipt.guestName)}
                    </h3>
                    <button
                    class="billing-view-button"
                    id="downloadHistoricalReceiptButton"
                    >
                    Download Receipt
                  </button>

                </div>

            </div>

            <div class="billing-details-card">

                <div class="billing-receipt-card">

                    <p>
                        <strong>
                            MIRIMA KIBALE LODGE
                        </strong>
                    </p>

                    <p>
                        <span>Guest:</span>
                        <strong>
                            ${escapeHTML(receipt.guestName)}
                        </strong>
                    </p>

                    <p>
                        <span>Cottage:</span>
                        <strong>
                            ${escapeHTML(
                                String(receipt.cottageId)
                            )}
                        </strong>
                    </p>

                    <p>
                        <span>Total Bill:</span>
                        <strong>
                            UGX ${Number(
                                receipt.totalBill || 0
                            ).toLocaleString()}
                        </strong>
                    </p>

                    <p>
                        <span>Check-in:</span>
                        <strong>
                            ${escapeHTML(
                                receipt.checkInDate || "—"
                            )}
                        </strong>
                    </p>

                    <p>
                        <span>Checkout:</span>
                        <strong>
                            ${escapeHTML(
                                receipt.checkoutDate || "—"
                            )}
                        </strong>
                    </p>

                </div>

            </div>

        </div>
    `;

    const backButton =
        document.getElementById(
            "historicalReceiptBackButton"
        );

    if (backButton) {

        backButton.addEventListener(
            "click",
            async function () {
           
                const billingContent =
                    await getBillingContent();

                content.innerHTML =
                    billingContent;

                setupReceiptButtons();
                setupHistoricalReceiptSearch();
                setupBillingViewButtons();

            }
        );

    }

   const downloadButton =
    document.getElementById(
        "downloadHistoricalReceiptButton"
    );

if (downloadButton) {

    downloadButton.addEventListener(
        "click",
        function () {

            const receiptText = `
MIRIMA KIBALE LODGE
HISTORICAL RECEIPT

Guest: ${receipt.guestName}
Cottage: ${receipt.cottageId}

Total Bill: UGX ${Number(
    receipt.totalBill || 0
).toLocaleString()}

Check-in: ${receipt.checkInDate || "—"}
Checkout: ${receipt.checkoutDate || "—"}

Archived: ${new Date(
    receipt.archivedAt
).toLocaleDateString()}
            `.trim();

            const blob =
                new Blob(
                    [receiptText],
                    { type: "text/plain" }
                );

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                `Mirima-Receipt-${receipt.guestName}.txt`;

            link.click();

            URL.revokeObjectURL(url);

        }
    );

}

}

function setupBillingViewButtons() {

    document
        .querySelectorAll(".billing-view-button")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    openCottageBill(
                        button.dataset.billingCottage
                    );

                }
            );

        });

}

function setupBillingCategoryButtons() {

    const receiptsButton =
        document.getElementById(
            "billingReceiptsButton"
        );

    const historyButton =
        document.getElementById(
            "billingHistoryButton"
        );


    if (receiptsButton) {

        receiptsButton.addEventListener(
            "click",
            function () {

                openBillingReceipts();

            }
        );

    }


    if (historyButton) {

        historyButton.addEventListener(
            "click",
            function () {

                openBillingHistory();

            }
        );

    }

}
// =========================================================
// BILL DETAILS
// =========================================================

async function openCottageBill(cottageId) {

    const bill = getCottageBill(cottageId);

    const activeGuests =
    await getActiveGuests();

const guest =
    activeGuests.find(function (item) {
        return item.cottageId === cottageId;
    });

   const payments =
    await getCottagePayments(
        cottageId,
        guest.id
    );
   console.log("Cottage payments:", payments);

   const totalPaid =
    payments.reduce(function (total, payment) {
        return total + Number(payment.amount || 0);
    }, 0);
   
   const total =
    getBillTotal(cottageId);

   const balanceDue =
    Math.max(0, total - totalPaid);

   console.log("Billing calculation:", {
    total: total,
    totalPaid: totalPaid,
    balanceDue: balanceDue
});   
   const cottage =
    getCottages().find(function (item) {
        return item.id === cottageId;
    });

     const content =
    document.getElementById("receptionContent");

if (!content) {
    return;
}

content.innerHTML = `
    <div class="billing-details-page">

        <button
            class="billing-back-button"
            id="billingBackButton"
        >
            ← Back to Billing
        </button>

        <div class="billing-details-header">

            <div>
                <p class="content-eyebrow">
                    GUEST ACCOUNT
                </p>

                <h3>
                    Cottage ${cottage.number}
                </h3>
            </div>

        </div>

      <div class="billing-details-card">

    <div class="billing-card-header">

        <div>
            <h4>
                Current Bill
            </h4>

            <p>
                Add and manage charges for this guest.
            </p>
        </div>

        <button
            class="billing-add-charge-button"
            id="billingAddChargeButton"
        >
            + Add Charge
        </button>

<button
    class="billing-add-charge-button"
    id="billingRecordPaymentButton"
>
    + Record Payment
</button>

    </div>

  <div class="billing-items">

    ${
        bill.items.length > 0
            ? bill.items.map(function (item) {

                return `
                    <div class="billing-item">

                        <div>
                            <strong>
                                ${escapeHTML(item.description)}
                            </strong>

                            <span>
                                UGX ${Number(item.amount).toLocaleString()}
                            </span>
                        </div>

                    </div>
                `;

            }).join("")
            : `
                <p>
                    No charges have been added yet.
                </p>
            `
    }

</div>

<div class="billing-total-row">

    <span>TOTAL</span>

    <strong>
        UGX ${total.toLocaleString()}
    </strong>

</div>

<div class="billing-total-row">

    <span>BALANCE DUE</span>

    <strong>
        UGX ${balanceDue.toLocaleString()}
    </strong>

</div>

</div>

    </div>
`;
   
const backButton =
    document.getElementById("billingBackButton");

if (backButton) {

    backButton.addEventListener(
        "click",
        function () {

            renderReceptionSection(
                "billing",
                getCurrentSession()
            );

        }
    );

}

   const existingAddChargeModal =
    document.getElementById("addChargeModal");

if (existingAddChargeModal) {
    existingAddChargeModal.remove();
}

const addChargeModal =
    document.createElement("div");

addChargeModal.id = "addChargeModal";
addChargeModal.className = "add-charge-modal";

addChargeModal.innerHTML = `
    <div class="add-charge-modal-box">
        <h3>Add Charge</h3>

        <p>
            Enter the charge details for this guest.
        </p>

        <input
            type="text"
            id="addChargeDescription"
            placeholder="Charge description"
        >

        <input
            type="number"
            id="addChargeAmount"
            placeholder="Amount in UGX"
            min="1"
        >

        <div>
            <button id="cancelAddCharge">
                Cancel
            </button>

            <button id="confirmAddCharge">
                Add Charge
            </button>
        </div>
    </div>
`;

document.body.appendChild(addChargeModal);

addChargeModal.style.display = "none";
   
const addChargeButton =
    document.getElementById("billingAddChargeButton");

if (addChargeButton) {

    addChargeButton.addEventListener(
        "click",
        function () {

            addChargeModal.style.display = "flex";

            document
                .getElementById("addChargeDescription")
                .focus();

        }
    );

}

const cancelAddCharge =
    document.getElementById("cancelAddCharge");

if (cancelAddCharge) {

    cancelAddCharge.addEventListener(
        "click",
        function () {

            addChargeModal.style.display = "none";

        }
    );

}

const confirmAddCharge =
    document.getElementById("confirmAddCharge");

if (confirmAddCharge) {

    confirmAddCharge.addEventListener(
        "click",
        async function () {

            const chargeDescription =
                document
                    .getElementById("addChargeDescription")
                    .value
                    .trim();

            const chargeAmount =
                document
                    .getElementById("addChargeAmount")
                    .value
                    .trim();

           if (
    !chargeDescription ||
    !chargeAmount ||
    Number(chargeAmount) <= 0
) {

    const existingChargeWarning =
        document.getElementById(
            "addChargeWarning"
        );

    if (existingChargeWarning) {
        existingChargeWarning.remove();
    }

    const addChargeWarning =
        document.createElement("div");

    addChargeWarning.id =
        "addChargeWarning";

    addChargeWarning.className =
        "add-charge-warning";

    addChargeWarning.innerHTML = `
        <div class="add-charge-warning-box">

            <div class="add-charge-warning-icon">
                !
            </div>

            <h3>
                Invalid Charge
            </h3>

            <p>
                Please enter a valid charge
                description and amount.
            </p>

            <button
                type="button"
                id="closeAddChargeWarning"
            >
                Enter Details
            </button>

        </div>
    `;

    document.body.appendChild(
        addChargeWarning
    );

    document
        .getElementById(
            "closeAddChargeWarning"
        )
        .addEventListener(
            "click",
            function () {

                addChargeWarning.remove();

                document
                    .getElementById(
                        "addChargeDescription"
                    )
                    .focus();
            }
        );

    return;
}

            const newCharge =
                await addBillItem(
                    cottageId,
                    chargeDescription,
                    Number(chargeAmount)
                );

            console.log(
                "Charge added:",
                newCharge
            );

            addChargeModal.style.display = "none";

            openCottageBill(cottageId);

        }
    );

}

const existingRecordPaymentModal =
    document.getElementById("recordPaymentModal");

if (existingRecordPaymentModal) {
    existingRecordPaymentModal.remove();
}

const recordPaymentModal =
    document.createElement("div");

recordPaymentModal.id = "recordPaymentModal";
recordPaymentModal.className = "record-payment-modal";

recordPaymentModal.innerHTML = `
    <div class="record-payment-modal-box">

        <h3>Record Payment</h3>

        <p>
            Enter the payment details for this guest.
        </p>

        <input
            type="number"
            id="recordPaymentAmount"
            placeholder="Payment amount in UGX"
            min="1"
        >

        <select id="recordPaymentMethod">
            <option value="">Select payment method</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Card">Card</option>
            <option value="Pay at Reception">Pay at Reception</option>
        </select>

        <div id="mobileMoneyFields">

            <input
                type="text"
                id="recordMobileMoneyName"
                placeholder="Name registered on Mobile Money"
            >

            <input
                type="text"
                id="recordMobileMoneyPhone"
                placeholder="Phone number: 256XXXXXXXXX"
            >

            <input
                type="text"
                id="recordTransactionId"
                placeholder="Transaction ID"
            >

        </div>

        <div class="record-payment-modal-actions">

            <button id="cancelRecordPayment">
                Cancel
            </button>

            <button id="confirmRecordPayment">
                Record Payment
            </button>

        </div>

    </div>
`;

document.body.appendChild(recordPaymentModal);

recordPaymentModal.style.display = "none";

   const recordPaymentMethod =
    document.getElementById("recordPaymentMethod");

const mobileMoneyFields =
    document.getElementById("mobileMoneyFields");

if (recordPaymentMethod && mobileMoneyFields) {

    mobileMoneyFields.style.display = "none";

    recordPaymentMethod.addEventListener(
        "change",
        function () {

            if (
                recordPaymentMethod.value === "Mobile Money"
            ) {

                mobileMoneyFields.style.display = "block";

            } else {

                mobileMoneyFields.style.display = "none";

            }

        }
    );

}
   
const recordPaymentButton =
    document.getElementById("billingRecordPaymentButton");

if (recordPaymentButton) {

    recordPaymentButton.addEventListener(
        "click",
        function () {

            recordPaymentModal.style.display = "flex";

            document
                .getElementById("recordPaymentAmount")
                .focus();

        }
    );

}

  const confirmRecordPayment =
    document.getElementById("confirmRecordPayment");

if (confirmRecordPayment) {

    confirmRecordPayment.addEventListener(
        "click",
        async function () {

            const paymentAmount =
                document
                    .getElementById("recordPaymentAmount")
                    .value
                    .trim();

           if (
    !paymentAmount ||
    !/^\d+$/.test(paymentAmount) ||
    Number(paymentAmount) <= 0
) {

    const existingPaymentAmountWarning =
        document.getElementById(
            "paymentAmountWarning"
        );

    if (existingPaymentAmountWarning) {
        existingPaymentAmountWarning.remove();
    }

    const paymentAmountWarning =
        document.createElement("div");

    paymentAmountWarning.id =
        "paymentAmountWarning";

    paymentAmountWarning.className =
        "payment-amount-warning";

    paymentAmountWarning.innerHTML = `
        <div class="payment-amount-warning-box">

            <div class="payment-amount-warning-icon">
                !
            </div>

            <h3>
                Invalid Payment Amount
            </h3>

            <p>
                Please enter a valid payment amount
                using numbers only.
            </p>

            <button
                type="button"
                id="closePaymentAmountWarning"
            >
                Enter Amount
            </button>

        </div>
    `;

    document.body.appendChild(
        paymentAmountWarning
    );

    document
        .getElementById(
            "closePaymentAmountWarning"
        )
        .addEventListener(
            "click",
            function () {

                paymentAmountWarning.remove();

                document
                    .getElementById(
                        "recordPaymentAmount"
                    )
                    .focus();
            }
        );

    return;
}

           if (Number(paymentAmount) > balanceDue) {

    const existingPaymentWarning =
        document.getElementById(
            "paymentBalanceWarning"
        );

    if (existingPaymentWarning) {
        existingPaymentWarning.remove();
    }

    const paymentBalanceWarning =
        document.createElement("div");

    paymentBalanceWarning.id =
        "paymentBalanceWarning";

    paymentBalanceWarning.className =
        "payment-balance-warning";

    paymentBalanceWarning.innerHTML = `
        <div class="payment-balance-warning-box">

            <div class="payment-balance-warning-icon">
                !
            </div>

            <h3>
                Payment Exceeds Balance
            </h3>

            <p>
                The payment entered is greater
                than the outstanding balance.
            </p>

            <div class="payment-balance-warning-details">

                <div>
                    <span>Balance Due</span>
                    <strong>
                        UGX ${balanceDue.toLocaleString()}
                    </strong>
                </div>

                <div>
                    <span>Payment Entered</span>
                    <strong>
                        UGX ${Number(paymentAmount).toLocaleString()}
                    </strong>
                </div>

            </div>

            <button
                type="button"
                id="closePaymentBalanceWarning"
            >
                Check Amount
            </button>

        </div>
    `;

    document.body.appendChild(
        paymentBalanceWarning
    );

    document
        .getElementById(
            "closePaymentBalanceWarning"
        )
        .addEventListener(
            "click",
            function () {
                paymentBalanceWarning.remove();

                document
                    .getElementById(
                        "recordPaymentAmount"
                    )
                    .focus();
            }
        );

    return;
}

            const paymentMethod =
                document
                    .getElementById("recordPaymentMethod")
                    .value;

           if (!paymentMethod) {

    const existingPaymentMethodWarning =
        document.getElementById(
            "paymentMethodWarning"
        );

    if (existingPaymentMethodWarning) {
        existingPaymentMethodWarning.remove();
    }

    const paymentMethodWarning =
        document.createElement("div");

    paymentMethodWarning.id =
        "paymentMethodWarning";

    paymentMethodWarning.className =
        "payment-method-warning";

    paymentMethodWarning.innerHTML = `
        <div class="payment-method-warning-box">

            <div class="payment-method-warning-icon">
                !
            </div>

            <h3>
                Payment Method Required
            </h3>

            <p>
                Please select a payment method
                before recording the payment.
            </p>

            <button
                type="button"
                id="closePaymentMethodWarning"
            >
                Select Method
            </button>

        </div>
    `;

    document.body.appendChild(
        paymentMethodWarning
    );

    document
        .getElementById(
            "closePaymentMethodWarning"
        )
        .addEventListener(
            "click",
            function () {

                paymentMethodWarning.remove();

                document
                    .getElementById(
                        "recordPaymentMethod"
                    )
                    .focus();
            }
        );

    return;
}

            let mobileMoneyName = "";
            let mobileMoneyPhone = "";
            let transactionId = "";

            if (paymentMethod === "Mobile Money") {

                mobileMoneyName =
                    document
                        .getElementById("recordMobileMoneyName")
                        .value
                        .trim();

                mobileMoneyPhone =
                    document
                        .getElementById("recordMobileMoneyPhone")
                        .value
                        .trim();

                transactionId =
                    document
                        .getElementById("recordTransactionId")
                        .value
                        .trim();

                if (!mobileMoneyName) {

                    const existingMobileMoneyNameWarning =
    document.getElementById(
        "mobileMoneyNameWarning"
    );

if (existingMobileMoneyNameWarning) {
    existingMobileMoneyNameWarning.remove();
}

const mobileMoneyNameWarning =
    document.createElement("div");

mobileMoneyNameWarning.id =
    "mobileMoneyNameWarning";

mobileMoneyNameWarning.className =
    "add-charge-warning";

mobileMoneyNameWarning.innerHTML = `
    <div class="add-charge-warning-box">

        <div class="add-charge-warning-icon">
            !
        </div>

        <h3>
            Mobile Money Name Required
        </h3>

        <p>
            Please enter the name registered
            on the Mobile Money account.
        </p>

        <button
            type="button"
            id="closeMobileMoneyNameWarning"
        >
            Enter Name
        </button>

    </div>
`;

  document.body.appendChild(mobileMoneyNameWarning); 
                   
 document
    .getElementById("closeMobileMoneyNameWarning")
    .addEventListener("click", function () {
        mobileMoneyNameWarning.remove();
    });
                   
    return;
      }

       if (!/^256\d{9}$/.test(mobileMoneyPhone)) {

                    const existingMobileMoneyPhoneWarning =
    document.getElementById(
        "mobileMoneyPhoneWarning"
    );

if (existingMobileMoneyPhoneWarning) {
    existingMobileMoneyPhoneWarning.remove();
}

const mobileMoneyPhoneWarning =
    document.createElement("div");

mobileMoneyPhoneWarning.id =
    "mobileMoneyPhoneWarning";

mobileMoneyPhoneWarning.className =
    "add-charge-warning";

mobileMoneyPhoneWarning.innerHTML = `
    <div class="add-charge-warning-box">

        <div class="add-charge-warning-icon">
            !
        </div>

        <h3>
            Invalid Phone Number
        </h3>

        <p>
            Please use the format:
            <strong>256XXXXXXXXX</strong>
        </p>

        <button
            type="button"
            id="closeMobileMoneyPhoneWarning"
        >
            Enter Number
        </button>

    </div>
`;

document.body.appendChild(
    mobileMoneyPhoneWarning
);

document
    .getElementById("closeMobileMoneyPhoneWarning")
    .addEventListener("click", function () {
        mobileMoneyPhoneWarning.remove();
    });

                    return;
                }

    if (!/^[A-Za-z0-9]{12}$/.test(transactionId)) {

const existingTransactionIdWarning =
    document.getElementById(
        "transactionIdWarning"
    );

if (existingTransactionIdWarning) {
    existingTransactionIdWarning.remove();
}

const transactionIdWarning =
    document.createElement("div");

transactionIdWarning.id =
    "transactionIdWarning";

transactionIdWarning.className =
    "add-charge-warning";

transactionIdWarning.innerHTML = `
    <div class="add-charge-warning-box">

        <div class="add-charge-warning-icon">
            !
        </div>

        <h3>
            Invalid Transaction ID
        </h3>

        <p>
            The Transaction ID must contain
            exactly 12 characters.
        </p>

        <button
            type="button"
            id="closeTransactionIdWarning"
        >
            Enter ID
        </button>

    </div>
`;

document.body.appendChild(
    transactionIdWarning
);

document
    .getElementById("closeTransactionIdWarning")
    .addEventListener("click", function () {
        transactionIdWarning.remove();
    });

                    return;
                }
            }

            console.log("Saving payment:", {
                cottageId: cottageId,
                amount: Number(paymentAmount),
                paymentMethod: paymentMethod
            });

            const paymentResult =
                await addPayment({
                    cottageId: cottageId,
                    guestId: guest ? guest.id : "",
                    guestName: guest ? guest.name : "",
                    amount: parseInt(paymentAmount.trim(), 10),
                    paymentMethod: paymentMethod,
                    mobileMoneyName: mobileMoneyName,
                    mobileMoneyPhone: mobileMoneyPhone,
                    transactionId: transactionId,
                    status: "Verified"
                });

            if (!paymentResult.success) {

                const existingPaymentFailedWarning =
    document.getElementById(
        "paymentFailedWarning"
    );

if (existingPaymentFailedWarning) {
    existingPaymentFailedWarning.remove();
}

const paymentFailedWarning =
    document.createElement("div");

paymentFailedWarning.id =
    "paymentFailedWarning";

paymentFailedWarning.className =
    "add-charge-warning";

paymentFailedWarning.innerHTML = `
    <div class="add-charge-warning-box">

        <div class="add-charge-warning-icon">
            !
        </div>

        <h3>
            Payment Failed
        </h3>

        <p>
            The payment could not be recorded.
            Please try again.
        </p>

        <button
            type="button"
            id="closePaymentFailedWarning"
        >
            Try Again
        </button>

    </div>
`;

document.body.appendChild(
    paymentFailedWarning
);

document
    .getElementById("closePaymentFailedWarning")
    .addEventListener("click", function () {
        paymentFailedWarning.remove();
    });
                return;
            }

            const existingPaymentSuccess =
    document.getElementById(
        "paymentSuccess"
    );

if (existingPaymentSuccess) {
    existingPaymentSuccess.remove();
}

const paymentSuccess =
    document.createElement("div");

paymentSuccess.id =
    "paymentSuccess";

paymentSuccess.className =
    "add-charge-warning";

paymentSuccess.innerHTML = `
    <div class="add-charge-warning-box">

        <div class="add-charge-warning-icon">
            ✓
        </div>

        <h3>
            Payment Recorded
        </h3>

        <p>
            Payment recorded successfully.
        </p>

        <button
            type="button"
            id="closePaymentSuccess"
        >
            Continue
        </button>

    </div>
`;

document.body.appendChild(
    paymentSuccess
);

document
    .getElementById("closePaymentSuccess")
    .addEventListener("click", function () {
        paymentSuccess.remove();
        openCottageBill(cottageId);
    });
       

        }
    );

}

const cancelRecordPayment =
    document.getElementById("cancelRecordPayment");

if (cancelRecordPayment) {

    cancelRecordPayment.addEventListener(
        "click",
        function () {

            recordPaymentModal.style.display = "none";

        }
    );

}

}
// =========================================================
// CURRENT GUESTS
// =========================================================

async function getGuestsContent() {

    const cottages = getCottages();

   const activeGuests = await getActiveGuests();
   const cottagePayments = {};

   for (const guest of activeGuests) {
    cottagePayments[guest.cottageId] =
        await getCottagePayments(
    guest.cottageId,
    guest.id
);
}

   const guestPaidTotals = {};

for (const guest of activeGuests) {

    guestPaidTotals[guest.id] =
        cottagePayments[guest.cottageId].reduce(
            function (total, payment) {
                return total + Number(payment.amount || 0);
            },
            0
        );
}
   const cottageBalances = {};

for (const guest of activeGuests) {
    const totalBill = getBillTotal(guest.cottageId);
   const totalPaid = guestPaidTotals[guest.id] || 0;

    cottageBalances[guest.cottageId] =
        Math.max(0, totalBill - totalPaid);
}
    return `
        <section class="page-section">

            <div class="section-heading">

                <div>
                    <h2>Current Guests</h2>

                    <p>
                        Manage guests currently staying at Mirima Kibale Lodge.
                    </p>
                </div>
                
            </div>


            <div class="cottage-grid">

                ${cottages.map(function (cottage) {

                    const guest =
                        activeGuests.find(
                            function (guest) {

                                return guest.cottageId ===
                                    cottage.id;

                            }
                        );

                   return createCottageCard(
                   cottage,
                   guest,
                   cottageBalances[cottage.id] || 0
                 );

                }).join("")}

            </div>

        </section>
 


      
        <div
            id="guestModal"
            class="guest-modal"
            aria-hidden="true"
        >

            <div class="guest-modal-overlay"></div>


            <div class="guest-modal-card">

                <div class="guest-modal-header">

                    <div>

                        <p class="content-eyebrow">
                            GUEST CHECK-IN
                        </p>

                        <h4>
                            Add Guest
                        </h4>

                    </div>


                    <button
                        type="button"
                        id="closeGuestModal"
                        class="guest-modal-close"
                        aria-label="Close"
                    >
                        ×
                    </button>

                </div>


                <form
                    id="guestForm"
                    class="guest-form"
                >

                    <div class="guest-form-grid">

                        <div class="guest-form-group">

                            <label for="guestName">
                                Guest Name
                            </label>

                            <input
                                type="text"
                                id="guestName"
                                required
                                placeholder="Enter guest name"
                            >

                        </div>


                        <div class="guest-form-group">

                            <label for="guestPhone">
                                Phone Number
                            </label>

                            <input
                                type="tel"
                                id="guestPhone"
                                placeholder="Enter phone number"
                            >

                        </div>


                        <div class="guest-form-group">

                            <label for="guestCottage">
                                Cottage
                            </label>

                            <select
                                id="guestCottage"
                                required
                            >

                                <option
                                    value=""
                                    disabled
                                    selected
                                >
                                    Select cottage
                                </option>

                                ${cottages.map(
                                    function (cottage) {

                                        const occupied =
                                        activeGuests.some(
                                                function (guest) {

                                                    return guest.cottageId ===
                                                        cottage.id;

                                                }
                                            );

                                        return `
                                            <option
                                                value="${cottage.id}"
                                                ${occupied ? "disabled" : ""}
                                            >
                                                Cottage ${cottage.number}
                                                ${occupied ? " — Occupied" : ""}
                                            </option>
                                        `;

                                    }
                                ).join("")}

                            </select>

                        </div>


                        <div class="guest-form-group">

                            <label for="checkInDate">
                                Check-in Date
                            </label>

                            <input
                                type="date"
                                id="checkInDate"
                                required
                            >

                        </div>


                        <div class="guest-form-group">

                            <label for="checkInTime">
                                Check-in Time
                            </label>

                            <input
                                type="time"
                                id="checkInTime"
                                required
                            >

                        </div>


                        <div class="guest-form-group">

                            <label for="checkoutDate">
                                Checkout Date
                            </label>

                            <input
                                type="date"
                                id="checkoutDate"
                                required
                            >

                        </div>


                        <div class="guest-form-group">

                            <label for="checkoutTime">
                                Checkout Time
                            </label>

                            <input
                                type="time"
                                id="checkoutTime"
                                required
                            >

                        </div>


                        <div class="guest-form-group full-width">

                            <label for="guestNotes">
                                Guest Notes
                            </label>

                            <textarea
                                id="guestNotes"
                                rows="3"
                                placeholder="Optional guest details or notes"
                            ></textarea>

                        </div>

                    </div>


                    <div
                        id="guestFormError"
                        class="guest-form-error"
                        role="alert"
                    ></div>


                    <div class="guest-form-actions">

                        <button
                            type="button"
                            id="cancelGuestButton"
                            class="secondary-action"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            class="primary-action"
                        >
                            Save Guest
                        </button>

                    </div>

                </form>

            </div>

        </div>

    `;

}

window.openGuestModal = function () {
   
    const modal =
        document.getElementById("guestModal");

    if (!modal) {

        return;

    }

    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

}

function setupGuestModal() {

    const modal =
        document.getElementById("guestModal");

    const closeButton =
        document.getElementById(
            "closeGuestModal"
        );

    const cancelButton =
        document.getElementById(
            "cancelGuestButton"
        );


    if (!modal) {

        return;

    }


    function closeModal() {

        modal.classList.remove("open");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeModal
        );

    }
    const guestForm =
        document.getElementById(
            "guestForm"
        );

       if (guestForm) {

        guestForm.addEventListener(
            "submit",
            async function (event) {

             event.preventDefault();

            const guestDetails = {

    name:
        document.getElementById(
            "guestName"
        ).value,

    phone:
        document.getElementById(
            "guestPhone"
        ).value,

    cottageId:
        document.getElementById(
            "guestCottage"
        ).value,

    checkInDate:
        document.getElementById(
            "checkInDate"
        ).value,

    checkInTime:
        document.getElementById(
            "checkInTime"
        ).value,

    checkoutDate:
        document.getElementById(
            "checkoutDate"
        ).value,

    checkoutTime:
        document.getElementById(
            "checkoutTime"
        ).value,

    notes:
        document.getElementById(
            "guestNotes"
        ).value

};

const result =
    await addGuest(guestDetails);
               
console.log(
    result
);
if (result.success) {

    closeModal();

await renderReceptionSection(
    "guests",
    getCurrentSession()
);
}
            }
        );

    }
}

// =========================================================
// COTTAGE CARD
// =========================================================

function formatDate(dateString) {

    if (!dateString) {
        return "Not set";
    }

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}

function createCottageCard(cottage, guest, balanceDue)
{

    if (!guest) {

        return `

            <article class="cottage-card">

                <div class="cottage-card-header">

                    <div>

                        <span class="cottage-label">
                            COTTAGE
                        </span>

                        <h4>
                            ${cottage.number}
                        </h4>

                    </div>


                    <span class="occupancy-badge available">
                        Available
                    </span>

                </div>


                <div class="cottage-empty">

                    <div class="cottage-icon">
                        ⌂
                    </div>

                    <p>
                        No active guest
                    </p>

                </div>


                <button
    class="cottage-action"
    onclick="openGuestModal('${cottage.id}')"
     >
         Add Guest
           </button>

            </article>

        `;

    }


    return `

        <article class="cottage-card occupied-cottage">

            <div class="cottage-card-header">

                <div>

                    <span class="cottage-label">
                        COTTAGE
                    </span>

                    <h4>
                        ${cottage.number}
                    </h4>

                </div>


                <span class="occupancy-badge occupied">
                    Occupied
                </span>

            </div>


            <div class="active-guest-card">

                <div class="guest-avatar">
                    ${getInitials(guest.name)}
                </div>


                <div class="active-guest-info">

                    <strong>
                        ${escapeHTML(guest.name)}
                    </strong>

                    <span>
                        ${escapeHTML(
                            guest.phone ||
                            "No phone number"
                        )}
                    </span>

                </div>

            </div>

${guest.notes
    ? `
        <div class="guest-notes">
            <span>GUEST NOTES</span>
            <p>${escapeHTML(guest.notes)}</p>
        </div>
    `
    : ""
}
             <div class="stay-details">

                <div>

                    <span>
                        CHECK-IN
                    </span>

                    <strong>
                        ${formatDate(
                            guest.checkInDate
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        CHECKOUT
                    </span>

                    <strong>
                        ${formatDate(
                            guest.checkoutDate
                        )}
                    </strong>

                </div>

            </div>


            <div class="cottage-bill-summary">

    <span>
        CURRENT BILL
    </span>

    <strong>
        UGX ${getBillTotal(cottage.id).toLocaleString()}
    </strong>

    <small>
        Balance Due: UGX ${balanceDue.toLocaleString()}
    </small>

</div>

            <button
    class="cottage-action checkout-action"
    data-checkout-guest="${guest.id}"
    data-cottage-id="${cottage.id}"
>
    Check Out Guest
      </button>

        </article>

    `;

}

// =========================================================
// REQUESTS
// =========================================================

async function getRequestsFromFirestore() {
    const snapshot = await getDocs(
        collection(db, "requests")
    );

   return snapshot.docs
    .map(function (doc) {
        return {
            id: doc.id,
            ...doc.data()
        };
    })
    .filter(function (request) {
        return (
            request.status !== "Completed" &&
            request.status !== "Cancelled"
        );
    })
    .sort(function (a, b) {
        return b.createdAt?.toMillis() - a.createdAt?.toMillis();
    });
}

function setupAdminRequestNotifications(department) {

   const notificationCount =
    document.getElementById(
       department === "reception"
    ? "headerNotificationCount"
    : "housekeepingHeaderNotificationCount"
    );

const mobileNotificationButton =
    document.getElementById(
        "housekeepingMobileNotificationButton"
    );
   
    if (!notificationCount) {
        return;
    }

   console.log("STARTING ADMIN NOTIFICATION LISTENER");
   
    onSnapshot(
        collection(db, "requests"),
        function (snapshot) {

           console.log("ADMIN NOTIFICATIONS:", snapshot.size);

            let unreadCount = 0;

            const readRequests =
                JSON.parse(
                    localStorage.getItem(
                        "mirimaReadRequests"
                    ) || "[]"
                );

            snapshot.forEach(function (doc) {

                const request =
                    doc.data();

               if (
                     (
          department === "reception"
       ? (
        (request.service || "").includes("Airport Transfer") ||
        (request.service || "").includes("Luggage Assistance") ||
        (request.service || "").includes("Extend") ||
        (request.service || "").includes("Maintenance Request") ||
        (request.service || "").includes("Emergency Assistance") ||
        (request.service || "").includes("Other Assistance") ||
        (request.service || "").includes("Billing Help") ||
        (request.service || "").includes("Exchange") ||
        (request.service || "").includes("Late Checkout") ||
        (request.service || "").includes("Make Payment") ||
        (request.service || "").includes("Payment at Reception") ||
        (request.service || "").includes("Mobile Money Payment") ||
        (request.service || "").includes("Receipt") ||
        (request.service || "").includes("Chimpanzee Trekking") ||
        (request.service || "").includes("Wildlife Viewing") ||
        (request.service || "").includes("Crater Lake Tour") ||
        (request.service || "").includes("Forest Nature Walk") ||
        (request.service || "").includes("Evening Campfire") ||
        (request.service || "").includes("Photography Tour") ||
        (request.service || "").includes("Reserve a Table") ||
        (request.service || "").includes("Bar Menu") ||
        (request.service || "").includes("Room Dining") ||
        (request.service || "").includes("Restaurant Menu")
    )
    : (request.service || "").includes("Housekeeping") ) &&
                      request.status !== "Completed" &&
                       request.status !== "Cancelled" &&
                      !readRequests.includes(doc.id)
                 ) {
                      unreadCount++;
                  }

            });

            notificationCount.textContent =
                unreadCount;

            notificationCount.style.display =
                unreadCount > 0
                    ? "inline-flex"
                    : "none";
        }
    );
}

async function updateRequestStatus(requestId, newStatus) {

    const requestRef =
        doc(db, "requests", requestId);

    const requestSnapshot =
        await getDoc(requestRef);

    if (!requestSnapshot.exists()) {
        return;
    }

    const request =
        requestSnapshot.data();
   

console.log("Request being updated:", request);
console.log(
    "Extension check:",
    newStatus === "Approved",
    request.service,
    request.service?.includes("Extend Stay")
);
    await updateDoc(
        requestRef,
        {
            status: newStatus
        }
    );

 if (
    newStatus === "Approved" &&
    request.service?.includes("Extend Stay")
) {
    const cottageId =
        getExtensionCottageId(request);

    console.log("Extension cottage:", cottageId);

    const checkoutMatch =
        request.details?.match(/New checkout:\s*(\d{4}-\d{2}-\d{2})/);

    const newCheckoutDate =
        checkoutMatch ? checkoutMatch[1] : null;

    console.log("New checkout date:", newCheckoutDate);

    const guestsSnapshot =
        await getDocs(collection(db, "guests"));

    const guestDoc =
        guestsSnapshot.docs.find(
            doc => doc.data().cottageId === cottageId
        );

    console.log("Guest found:", guestDoc?.data());

    if (guestDoc) {
    console.log("Guest document ID:", guestDoc.id);

       await updateDoc(
    doc(db, "guests", guestDoc.id),
    {
        checkoutDate: newCheckoutDate
    }
);

console.log(
    "Guest checkout date updated:",
    newCheckoutDate
);
       
}
}
}
async function updateRequestCount() {
    const requests = await getRequestsFromFirestore();

    const receptionRequests =
        requests.filter(function (request) {

            const service =
                request.service || "";

            return (
    service.includes("Airport Transfer") ||
    service.includes("Luggage Assistance") ||
    service.includes("Extend Your Stay") ||
    service.includes("Maintenance Request") ||
    service.includes("Emergency Assistance") ||
    service.includes("Billing Help") ||
    service.includes("Currency Exchange") ||
    service.includes("Other Assistance") ||
    service.includes("Late Checkout") ||
    service.includes("Make Payment") ||
    service.includes("Payment at Reception") ||
    service.includes("Mobile Money Payment") ||
    service.includes("Chimpanzee Trekking") ||
    service.includes("Wildlife Viewing") ||
    service.includes("Evening Campfire") ||
    service.includes("Forest Nature Walk") ||
    service.includes("Crater Lake Tour") ||
    service.includes("Photography Tour") ||
    service.includes("Restaurant Reservation") ||
    service.includes("Bar Menu") ||
    service.includes("Room Dining") ||
    service.includes("Restaurant Menu") ||
    service.includes("Receipt")
);
        });

    const requestCount =
        document.getElementById("requestCount");

    if (requestCount) {
        requestCount.textContent =
            receptionRequests.length;
    }
}

async function getFeedbackFromFirestore() {
    const snapshot = await getDocs(
        collection(db, "feedback")
    );

    return snapshot.docs
        .map(function (doc) {
            return {
                id: doc.id,
                ...doc.data()
            };
        })
        .sort(function (a, b) {
            return b.createdAt?.toMillis() - a.createdAt?.toMillis();
        });
}


async function getRequestsContent() {

   const requests = await getRequestsFromFirestore();

   console.log("Reception requests:", requests);
   
    return `

        <div class="page-introduction">

            <div>

                <p class="content-eyebrow">
                    GUEST SERVICES
                </p>

                <h3>
                    Guest Requests
                </h3>

                <p>
                    Requests received from Mirima Connect
                    and requiring Reception attention.
                </p>

            </div>

        </div>

<button
    class="back-to-request-categories"
    style="display: none;"
>
    ← Back to Categories
</button>
      <div
    class="guest-requests-list"
    style="display: none;"
>
    ${
        requests.length
            ? requests.map(function (request) {
                return createGuestRequestCard(request);
            }).join("")
            : `
                <p>No guest requests yet.</p>
            `
    }
</div>
    
        <div class="request-category-grid">

           ${createRequestCategory(
            "✈",
            "Airport Transfer",
            "Arrange guest airport transportation.",

              requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        request.service.includes("Airport Transfer") &&
        !readRequests.includes(request.id)
    );

}).length
          )}


         ${createRequestCategory(
    "🧳",
    "Luggage Assistance",
    "Assist guests with luggage.",
   requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        request.service.includes("Luggage Assistance") &&
        !readRequests.includes(request.id)
    );

}).length
)}

${createRequestCategory(
    "📅",
    "Extend Your Stay",
    "Review and manage stay extensions.",
    requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        request.service.includes("Extend") &&
        !readRequests.includes(request.id)
    );

}).length
)}

${createRequestCategory(
    "🔧",
    "Maintenance Request",
    "Receive and coordinate maintenance issues.",
   requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        request.service.includes("Maintenance Request") &&
        !readRequests.includes(request.id)
    );

}).length
)}

${createRequestCategory(
    "🚨",
    "Emergency Assistance",
    "Handle urgent guest assistance.",
   requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        request.service.includes("Emergency Assistance") &&
        !readRequests.includes(request.id)
    );

}).length
)}

${createRequestCategory(
    "💬",
    "Speak to Reception",
    "Open the live guest conversation.",
    requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        request.service.includes("Other Assistance") &&
        !readRequests.includes(request.id)
    );

}).length
)}
          ${createRequestCategory(
    "💳",
    "Billing Help",
    "Assist guests with billing questions and payment issues.",
   requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        request.service.includes("Billing Help") &&
        !readRequests.includes(request.id)
    );

}).length
)}

${createRequestCategory(
    "💱",
    "Exchange",
    "Handle guest currency exchange requests.",
    requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        request.service.includes("Exchange") &&
        !readRequests.includes(request.id)
    );

}).length
)}

${createRequestCategory(
    "🌙",
    "Late Checkout",
    "Review guest requests for late checkout.",
    requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        request.service.includes("Late Checkout") &&
        !readRequests.includes(request.id)
    );

}).length
)}

${createRequestCategory(
    "💰",
    "Make Payment",
    "Review and assist with guest payment requests.",
   requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        (
            request.service.includes("Make Payment") ||
            request.service.includes("Payment at Reception") ||
            request.service.includes("Mobile Money Payment")
        ) &&
        !readRequests.includes(request.id)
    );

}).length
)}

${createRequestCategory(
    "🧾",
    "Receipt",
    "Review guest requests for receipts.",
   requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        request.service.includes("Receipt") &&
        !readRequests.includes(request.id)
    );

}).length
)}

${createRequestCategory(
    "🐒",
    "Chimpanzee Trekking",
    "Review guest requests for chimpanzee trekking.",
    requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        request.service.includes("Chimpanzee Trekking") &&
        !readRequests.includes(request.id)
    );

}).length
)}

${createRequestCategory(
    "🦓",
    "Wildlife Viewing",
    "Review guest requests for wildlife viewing.",
   requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        request.service.includes("Wildlife Viewing") &&
        !readRequests.includes(request.id)
    );

}).length
)}

${createRequestCategory(
    "🌋",
    "Crater Lake Tour",
    "Review guest requests for crater lake tours.",
    requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        request.service.includes("Crater Lake Tour") &&
        !readRequests.includes(request.id)
    );

}).length
)}

${createRequestCategory(
    "🌳",
    "Forest Nature Walk",
    "Review guest requests for forest nature walks.",
    requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        request.service.includes("Forest Nature Walk") &&
        !readRequests.includes(request.id)
    );

}).length
)}

${createRequestCategory(
    "🔥",
    "Evening Campfire",
    "Review guest requests for evening campfires.",
    requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        request.service.includes("Evening Campfire") &&
        !readRequests.includes(request.id)
    );

}).length
)}

${createRequestCategory(
    "📸",
    "Photography Tour",
    "Review guest requests for photography tours.",
   requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        request.service.includes("Photography Tour") &&
        !readRequests.includes(request.id)
    );

}).length
)}

${createRequestCategory(
    "🍽️",
    "Restaurant & Bar",
    "Manage guest restaurant and bar requests.",
   requests.filter(function (request) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    return (
        (
            request.service.includes("Reserve a Table") ||
            request.service.includes("Bar Menu") ||
            request.service.includes("Room Dining") ||
            request.service.includes("Restaurant Menu")
        ) &&
        !readRequests.includes(request.id)
    );

}).length
)}
        </div>

    `;

}


async function getFeedbackContent() {
    const feedback = await getFeedbackFromFirestore();

    return `
        <div class="page-introduction">
            <h2>Guest Feedback</h2>
            <p>Review feedback submitted by guests.</p>
        </div>

        <div class="guest-feedback-list">
            ${
                feedback.length
                    ? feedback.map(function (item) {
                        return `
                            <article class="guest-feedback-card">

                                <div class="guest-feedback-header">
                                    <strong>
                                        ${item.feedbackType || "Feedback"}
                                    </strong>
                                </div>

                                <div class="guest-feedback-details">

                                    <p>
                                        Guest:
                                        ${item.guestName || "Guest"}
                                    </p>

                                    <p>
                                        ${item.message || "No message provided."}
                                    </p>

                                    <p>
                                        Submitted:
                                        ${
                                            item.createdAt
                                                ? item.createdAt.toDate().toLocaleString()
                                                : "Time unavailable"
                                        }
                                    </p>

                                </div>

                            </article>
                        `;
                    }).join("")
                    : `
                        <p>No guest feedback yet.</p>
                    `
            }
        </div>
    `;
}


// =========================================================
// GUEST REQUEST CARD
// =========================================================

function createGuestRequestCard(request) {

    return `
        <article class="guest-request-card">

            <div class="guest-request-header">

               <div class="request-title">
    <span class="request-title-icon">◆</span>
    <strong data-request-service="${request.service}">
        ${request.service}
    </strong>
</div>

              <button
    class="request-status"
    data-request-id="${request.id}"
    title="Click to change request status"
>
    ${request.status || "Pending"}
</button>

<div
    class="request-status-menu"
    data-request-id="${request.id}"
    style="display: none;"
>
<button data-status="Pending">Pending</button>
<button data-status="Received">Received</button>
<button data-status="Approved">Approved</button>
<button data-status="In Progress">In Progress</button>
<button data-status="Completed">Completed</button>
<button data-status="Cancelled">Cancelled</button>
</div>

            </div>

            <div class="guest-request-details">

                <div class="request-info-row">
                <span class="request-info-label">Guest</span>
               <strong class="request-info-value">
               ${request.guestName || "Guest"}
             </strong>
            </div>

          <div class="request-info-block">
    <span class="request-info-label">Request</span>
    <div class="request-details-value">
        ${request.details?.trim() || "No additional details"}
    </div>
</div>

<div class="request-info-row request-time-row">
    <span class="request-info-label">Requested at</span>
    <span class="request-time-value">
        ${
            request.createdAt
                ? request.createdAt.toDate().toLocaleString()
                : "Time unavailable"
        }
    </span>
</div>
            </div>

        </article>
    `;
}

// =========================================================
// REQUEST CATEGORY
// =========================================================

function createRequestCategory(
    icon,
    title,
    description,
    count = 0
) {

    return `

      <article
    class="request-category-card"
    data-request-category="${title}"
>

            <div class="request-category-icon">
                ${icon}
            </div>

            <div>

                <h4>
                    ${title}
                </h4>

                <p>
                    ${description}
                </p>

            </div>

           ${
    count > 0
        ? `
            <span class="request-category-count">
                ${count}
            </span>
          `
        : ""
}

        </article>

    `;

}


// =========================================================
// LIVE CHAT
// =========================================================
function getChatContent() {

    return `

        <div class="page-introduction">

            <div>

                <p class="content-eyebrow">
                    GUEST COMMUNICATION
                </p>

                <h3>
                    Live Chat
                </h3>

                <p>
                    Speak directly with guests currently
                    staying at the lodge.
                </p>

            </div>

        </div>


        <div class="live-chat-layout">

            <div class="live-chat-conversations">

                <div class="live-chat-panel-title">
                    <h4>
                        Conversations
                    </h4>

                    <span
                        id="liveChatConversationCount"
                        class="live-chat-count"
                    >
                        0
                    </span>
                </div>

                <div
                    id="liveChatConversationList"
                    class="live-chat-conversation-list"
                >

                    <div class="chat-empty-state">

                        <div class="chat-empty-icon">
                            ✉
                        </div>

                        <h4>
                            No active conversations
                        </h4>

                        <p>
                            When a guest starts a conversation,
                            it will appear here.
                        </p>

                    </div>

                </div>

            </div>


            <div
                id="liveChatWindow"
                class="live-chat-window"
            >

                <div class="live-chat-window-empty">

                    <div class="chat-empty-icon">
                        💬
                    </div>

                    <h4>
                        Select a conversation
                    </h4>

                    <p>
                        Choose a guest conversation from
                        the list to start chatting.
                    </p>

                </div>

            </div>

        </div>

    `;

}

// =========================================================
// BILLING
// =========================================================

async function getBillingContent() {

   const storageKey =
    "mirimaHistoricalReceipts";

const existing =
    JSON.parse(
        localStorage.getItem(storageKey) || "[]"
    );

const twoMonthsAgo =
    Date.now() -
    (60 * 24 * 60 * 60 * 1000);

const recentReceipts =
    existing.filter(function (item) {

        return new Date(item.archivedAt).getTime()
            >= twoMonthsAgo;

    });

localStorage.setItem(
    storageKey,
    JSON.stringify(recentReceipts)
);

    const cottages = getCottages();
   
    const activeGuests = await getActiveGuests();

   const payments = await getPayments();

   const historicalReceipts =
    JSON.parse(
        localStorage.getItem(
            "mirimaHistoricalReceipts"
        ) || "[]"
    );

   console.log("Billing payments:", payments);

    return `
        <div class="billing-page">

            <div class="billing-intro">

                <p class="content-eyebrow">
                    GUEST ACCOUNTS
                </p>

                <h3>
                    Billing & Receipts
                </h3>

                <p>
                    View and manage the current bill
                    for each occupied cottage.
                </p>

            </div>


            <div class="billing-cottage-grid">

                ${cottages.map(function (cottage) {

                    const guest = activeGuests.find(
                        function (item) {
                            return item.cottageId === cottage.id;
                        }
                    );

                    const total =
                        getBillTotal(cottage.id);


                    return `

                        <article class="billing-cottage-card">

                            <div class="billing-cottage-header">

                                <div>

                                    <span class="billing-label">
                                        COTTAGE
                                    </span>

                                    <h4>
                                    Cottage ${cottage.number}
                                   </h4>

                                </div>


                                <span class="billing-status">

                                    ${guest
                                        ? "Occupied"
                                        : "Available"}

                                </span>

                            </div>


                            ${
                                guest
                                    ? `

                                        <div class="billing-guest">

                                            <span class="billing-label">
                                                GUEST
                                            </span>

                                            <strong>
                                                ${escapeHTML(guest.name)}
                                            </strong>

                                        </div>


                                        <div class="billing-total">

                                            <span>
                                                CURRENT BILL
                                            </span>

                                            <strong>
                                                UGX ${total.toLocaleString()}
                                            </strong>

                                        </div>


                                        <button
                                            class="billing-view-button"
                                            data-billing-cottage="${cottage.id}"
                                        >
                                            View Bill
                                        </button>

                                    `

                                    : `

                                        <div class="billing-empty">

                                            No active guest

                                        </div>

                                    `
                            }

                        </article>

                    `;

                }).join("")}

                       </div>

                       <div class="billing-category-buttons">

                <button
                    class="billing-category-button"
                    id="billingReceiptsButton"
                    type="button"
                >
                    <div class="billing-category-icon">
                        🧾
                    </div>

                    <div class="billing-category-text">
                        <strong>Receipts</strong>

                        <span>
                            View recorded payments and receipts
                        </span>
                    </div>

                    <span class="billing-category-arrow">
                        →
                    </span>
                </button>


                <button
                    class="billing-category-button"
                    id="billingHistoryButton"
                    type="button"
                >
                    <div class="billing-category-icon">
                        🕘
                    </div>

                    <div class="billing-category-text">
                        <strong>History</strong>

                        <span>
                            View historical guest receipts
                        </span>
                    </div>

                    <span class="billing-category-arrow">
                        →
                    </span>
                </button>

            </div>
           
        </div>
    `;             
   
   }
// =========================================================
// HISTORICAL RECEIPTS
// =========================================================

function saveHistoricalReceipt(receipt) {

    const storageKey =
        "mirimaHistoricalReceipts";

    const existing =
        JSON.parse(
            localStorage.getItem(storageKey) || "[]"
        );

    const twoMonthsAgo =
        Date.now() -
        (60 * 24 * 60 * 60 * 1000);

    const recentReceipts =
        existing.filter(function (item) {

            return new Date(item.archivedAt).getTime()
                >= twoMonthsAgo;

        });

    recentReceipts.push(receipt);

    localStorage.setItem(
        storageKey,
        JSON.stringify(recentReceipts)
    );
}

async function archiveOldHistoricalPayments() {

    const historicalReceipts =
        JSON.parse(
            localStorage.getItem(
                "mirimaHistoricalReceipts"
            ) || "[]"
        );

    for (const receipt of historicalReceipts) {

        const payments =
            receipt.payments || [];

        for (const payment of payments) {

            if (!payment.id) {
                continue;
            }

            try {

                await updateDoc(
                    doc(db, "payments", payment.id),
                    {
                        archived: true,
                        archivedAt:
                            payment.archivedAt ||
                            receipt.archivedAt ||
                            new Date().toISOString()
                    }
                );

            } catch (error) {

                console.error(
                    "Failed to archive old payment:",
                    payment.id,
                    error
                );

            }

        }

    }

}

// =========================================================
// EMERGENCY
// =========================================================

async function getEmergencyContent() {

    const requests =
        await getRequestsFromFirestore();

    const emergencyRequests =
        requests.filter(function (request) {

            return (
                request.service || ""
            ).includes("Emergency Assistance");

        });

    return `

        <div class="page-introduction">

            <div>

                <p class="content-eyebrow emergency-eyebrow">
                    PRIORITY RESPONSE
                </p>

                <h3>
                    Emergency Alerts
                </h3>

                <p>
                    Emergency assistance requiring Reception
                    attention will appear here.
                </p>

            </div>

        </div>

        ${
            emergencyRequests.length
                ? `
                    <div class="guest-requests-list emergency-requests-list">
                        ${emergencyRequests
                            .map(function (request) {
                                return createGuestRequestCard(request);
                            })
                            .join("")}
                    </div>
                `
                : `
                    <div class="emergency-empty-state">

                        <div class="emergency-large-icon">
                            !
                        </div>

                        <h4>
                            No active emergencies
                        </h4>

                        <p>
                            Security emergencies will appear here
                            and will also be sent to the Security team.
                        </p>

                    </div>
                `
        }

    `;

}


// =========================================================
// NAVIGATION
// =========================================================

function setupReceptionNavigation(session) {

    const navigationItems =
        document.querySelectorAll(
            ".reception-nav-item"
        );


    navigationItems.forEach(function (item) {

        item.addEventListener(
            "click",
            function () {

                navigationItems.forEach(
                    function (navItem) {

                        navItem.classList.remove(
                            "active"
                        );

                    }
                );


                item.classList.add("active");


                renderReceptionSection(
                    item.dataset.section,
                    session
                );
if (item.dataset.section === "overview") {
    updateOverviewCurrentGuests();
    updateOverviewGuestRequests();
    updateOverviewRecentRequests();
    updateOverviewLiveChats();
    updateOverviewEmergencyAlerts();
    updateOverviewCurrentGuestsPanel();
}

                closeMobileMenu();

            }
        );

    });

}


// =========================================================
// BUTTONS INSIDE SECTIONS
// =========================================================

function setupCheckoutButtons() {

    document
        .querySelectorAll(".checkout-action")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                async function () {

                    const guestId =
                        button.dataset.checkoutGuest;
                   const activeGuests =
             await getActiveGuests();

           const guest =
    activeGuests.find(function (item) {
        return item.id === guestId;
    });

if (!guest) {
    alert("Guest record not found.");
    return;
}

const guestPayments =
    await getCottagePayments(
        guest.cottageId,
        guest.id
    );

const historicalReceipt = {

    guestId: guest.id,

    guestName: guest.name,

    cottageId: guest.cottageId,

   totalBill: getBillTotal(guest.cottageId),

    checkInDate: guest.checkInDate,

    checkoutDate: guest.checkoutDate,

    payments: guestPayments,

    archivedAt: new Date().toISOString()

};
    saveHistoricalReceipt(historicalReceipt);

      for (const payment of guestPayments) {
    await updateDoc(
        doc(db, "payments", payment.id),
        {
            archived: true,
            archivedAt: new Date().toISOString()
        }
    );
}             
  const result =
        await removeGuest(guestId);

      console.log(result);

  if (result.success) {

 await startNewCottageBill(
    guest.cottageId
);

  renderReceptionSection(
  "guests",
    getCurrentSession()
 );

 }

   }
);

 });

}
function setupSectionButtons(session) {

    const sectionButtons =
        document.querySelectorAll(
            "[data-section]"
        );


    sectionButtons.forEach(function (button) {

        if (
            button.classList.contains(
                "reception-nav-item"
            )
        ) {

            return;

        }


        button.addEventListener(
            "click",
            function () {

                const section =
                    button.dataset.section;
               
               
                document
                    .querySelectorAll(
                        ".reception-nav-item"
                    )
                    .forEach(
                        function (item) {

                            item.classList.toggle(
                                "active",
                                item.dataset.section ===
                                section
                            );

                        }
                    );


                renderReceptionSection(
                    section,
                    session
                );
               setupGuestModal();
            }
        );

    });

}

function setupRequestCategoryButtons(requests) {

    const categoryCards =
        document.querySelectorAll(
            ".request-category-card"
        );

    categoryCards.forEach(function (card) {

        card.addEventListener(
            "click",
            function () {

                const category =
                    card.dataset.requestCategory;

                const normalizedCategory =
                    category.trim();

                const categoryGrid =
                    document.querySelector(
                        ".request-category-grid"
                    );

                const requestsList =
                    document.querySelector(
                        ".guest-requests-list"
                    );

                const backButton =
                    document.querySelector(
                        ".back-to-request-categories"
                    );

                // RESTAURANT & BAR
                if (
                    normalizedCategory ===
                    "Restaurant & Bar"
                ) {

                    const restaurantSubCategories = [
                       "Restaurant Reservation",
                        "Bar Menu",
                        "Room Dining",
                        "Restaurant Menu"
                    ];

                    if (categoryGrid) {

                        categoryGrid.innerHTML =
                            restaurantSubCategories
                                .map(function (subCategory) {

                                    const count =
                                        requests.filter(
                                            function (request) {

                                                return request.service.includes(
                                                    subCategory
                                                );

                                            }
                                        ).length;

                                    return createRequestCategory(
                                        "🍽️",
                                        subCategory,
                                        "View guest requests.",
                                        count
                                    );

                                })
                                .join("");

                    }

                    setupRequestCategoryButtons(
                        requests
                    );

                    return;
                }

                // SHOW REQUESTS FOR SELECTED CATEGORY

                if (requestsList) {
                    requestsList.style.display =
                        "block";
                }

                if (backButton) {
                    backButton.style.display =
                        "inline-flex";
                }

                if (categoryGrid) {
                    categoryGrid.style.display =
                        "none";
                }

                const allRequests =
                    document.querySelectorAll(
                        ".guest-request-card"
                    );

                let visibleRequests = 0;

                allRequests.forEach(
                    function (requestCard) {

                        requestCard.style.display =
                            "none";

                        const service =
                         requestCard
                            .querySelector(
                              "[data-request-service]"
                            )
                        ?.getAttribute("data-request-service")
                        ?.trim();
                       console.log("REQUEST CARD SERVICE:", service);

                       console.log(
                        "Category:",
                        normalizedCategory,
                     "| Service:",
                    service
                    );

                       if (
    normalizedCategory === "Extend Your Stay"
        ? service.includes("Extend")
        : normalizedCategory === "Speak to Reception"
            ? service.includes("Other Assistance")
            : normalizedCategory === "Make Payment"
                ? (
                    service.includes("Make Payment") ||
                    service.includes("Payment at Reception") ||
                    service.includes("Mobile Money Payment")
                )
                : service.includes(normalizedCategory)
) {

                            requestCard.style.display =
                                "block";

                            visibleRequests++;

                        }

                    }
                );

                let noRequestsMessage =
                    document.querySelector(
                        ".no-category-requests"
                    );

                if (!noRequestsMessage) {

                    noRequestsMessage =
                        document.createElement("p");

                    noRequestsMessage.className =
                        "no-category-requests";

                    if (requestsList) {
                        requestsList.appendChild(
                            noRequestsMessage
                        );
                    }

                }

                noRequestsMessage.textContent =
                    "No requests yet.";

                noRequestsMessage.style.display =
                    visibleRequests === 0
                        ? "block"
                        : "none";

            }
        );

    });

    // BACK TO CATEGORIES

    const backButton =
        document.querySelector(
            ".back-to-request-categories"
        );

    if (backButton) {

        backButton.addEventListener(
            "click",
            async function () {

                const categoryGrid =
                    document.querySelector(
                        ".request-category-grid"
                    );

                const requestsList =
                    document.querySelector(
                        ".guest-requests-list"
                    );

                if (categoryGrid) {

                    categoryGrid.style.display =
                        "grid";

                }

                if (requestsList) {

                    requestsList.style.display =
                        "none";

                }

                backButton.style.display =
                    "none";

            }
        );

    }

}

function setupRequestStatusButtons() {

    const statusButtons =
        document.querySelectorAll(
            ".request-status"
        );

    statusButtons.forEach(function (button) {

        button.addEventListener(
            "click",

           async function () {

    const requestId =
        button.dataset.requestId;

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    if (!readRequests.includes(requestId)) {

        readRequests.push(requestId);

        localStorage.setItem(
            "mirimaReadRequests",
            JSON.stringify(readRequests)
        );

    }

    console.log(
        "Status button clicked:",
        requestId
    );
           /*     
         const newStatus = prompt(
         "Choose status:\n1. Received\n2. In Progress\n3. Completed\n4. Cancelled",
          button.textContent.trim()
          );
              */ 
                const statusMenu =
    document.querySelector(
        `.request-status-menu[data-request-id="${requestId}"]`
    );

if (!statusMenu) {
    console.log(
        "Status menu not found:",
        requestId
    );
    return;
}

statusMenu.style.display =
    statusMenu.style.display === "none"
        ? "flex"
        : "none";  

       const statusOptions =
    statusMenu.querySelectorAll(
        "[data-status]"
    );

statusOptions.forEach(function (option) {

    option.addEventListener(
        "click",
        async function () {

            const newStatus =
                option.dataset.status;

           const statusButtons =
    statusMenu.querySelectorAll(
        "[data-status]"
    );

statusButtons.forEach(function (statusButton) {

    statusButton.textContent =
        statusButton.dataset.status;

});

option.textContent =
    "✓ " + newStatus;

           await updateRequestStatus(
    requestId,
    newStatus
);

button.textContent =
    newStatus;

statusMenu.style.display =
    "none";

if (
    newStatus === "Completed" ||
    newStatus === "Cancelled"
) {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    const updatedReadRequests =
        readRequests.filter(function (id) {
            return id !== requestId;
        });

    localStorage.setItem(
        "mirimaReadRequests",
        JSON.stringify(updatedReadRequests)
    );

    const requestCard =
        button.closest(".guest-request-card");

    if (requestCard) {
        requestCard.remove();
    }

   updateRequestCategoryBadges();
}
        }
    );

});
               
            }
        );

    });
}

function updateRequestCategoryBadges() {

    const readRequests =
        JSON.parse(
            localStorage.getItem(
                "mirimaReadRequests"
            ) || "[]"
        );

    document
        .querySelectorAll(".request-category-card")
        .forEach(function (categoryCard) {

            const category =
                categoryCard.dataset.requestCategory;

            const requests =
                document.querySelectorAll(
                    ".guest-request-card"
                );

            let unreadCount = 0;

            requests.forEach(function (requestCard) {

                const service =
                    requestCard
                        .querySelector(
                            "[data-request-service]"
                        )
                        ?.textContent
                        .trim();

                const requestId =
                    requestCard
                        .querySelector(
                            ".request-status"
                        )
                        ?.dataset.requestId;

                let matchesCategory = false;

if (category === "Restaurant & Bar") {
    matchesCategory =
        service.includes("Reserve a Table") ||
        service.includes("Bar Menu") ||
        service.includes("Room Dining") ||
        service.includes("Restaurant Menu");

} else if (category === "Make Payment") {
    matchesCategory =
        service.includes("Make Payment") ||
        service.includes("Payment at Reception") ||
        service.includes("Mobile Money Payment");

} else if (category === "Extend Your Stay") {
    matchesCategory = service.includes("Extend");

} else if (category === "Speak to Reception") {
    matchesCategory = service.includes("Other Assistance");

} else {
    matchesCategory = service.includes(category);
}

if (
    requestId &&
    service &&
    !readRequests.includes(requestId) &&
    matchesCategory
) {
    unreadCount++;
}

            });

            const existingBadge =
                categoryCard.querySelector(
                    ".request-category-count"
                );

           if (unreadCount > 0) {

    if (existingBadge) {
        existingBadge.textContent =
            unreadCount;
    } else {
        categoryCard.insertAdjacentHTML(
            "beforeend",
            `
                <span class="request-category-count">
                    ${unreadCount}
                </span>
            `
        );
    }

} else if (existingBadge) {

    existingBadge.remove();

}

        });

}

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.closest(".request-status") &&
            !event.target.closest(".request-status-menu")
        ) {
            document
                .querySelectorAll(".request-status-menu")
                .forEach(function (menu) {
                    menu.style.display = "none";
                });
        }

    }
);

// =========================================================
// BILLING BUTTONS
// =========================================================

function setupBillingButtons() {

    document
        .querySelectorAll(".billing-view-button")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const cottageId =
                        button.dataset.billingCottage;

                    openCottageBill(cottageId);

                }
            );

        });

}

// =========================================================
// MOBILE MENU
// =========================================================

function setupMobileMenu() {

    const menuButton =
        document.getElementById(
            "mobileMenuButton"
        );


    const sidebar =
        document.getElementById(
            "receptionSidebar"
        );


    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (!menuButton || !sidebar) {

        return;

    }


    menuButton.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "mobile-open"
            );


            overlay.classList.toggle(
                "visible"
            );

        }
    );


    overlay.addEventListener(
        "click",
        closeMobileMenu
    );

}


function closeMobileMenu() {

    const sidebar =
        document.getElementById(
            "receptionSidebar"
        );


    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "mobile-open"
        );

    }


    if (overlay) {

        overlay.classList.remove(
            "visible"
        );

    }

}

function setupHousekeepingMobileMenu() {

    const menuButton =
        document.getElementById(
            "housekeepingMobileMenuButton"
        );

    const sidebar =
        document.getElementById(
            "housekeepingSidebar"
        );

    const overlay =
        document.getElementById(
            "housekeepingSidebarOverlay"
        );

    if (!menuButton || !sidebar || !overlay) {
        return;
    }

    menuButton.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "mobile-open"
            );

            overlay.classList.toggle(
                "visible"
            );

        }
    );

    overlay.addEventListener(
        "click",
        function () {

            sidebar.classList.remove(
                "mobile-open"
            );

            overlay.classList.remove(
                "visible"
            );

        }
    );
   
}

// =========================================================
// LOGOUT
// =========================================================

function setupReceptionLogout() {

    const logoutButton =
        document.getElementById(
            "receptionLogout"
        );


    if (!logoutButton) {

        return;

    }


    logoutButton.addEventListener(
        "click",
        function () {

            sessionStorage.removeItem(
                "mirimaSession"
            );


            window.location.reload();

        }
    );

}


// =========================================================
// INITIALS
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


// =========================================================
// BASIC HTML SAFETY
// =========================================================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
// ==========================================
// GET COTTAGE ID FROM EXTENSION REQUEST
// ==========================================

function getExtensionCottageId(request) {

    if (!request.details) {
        return null;
    }

    const match =
        request.details.match(/Cottage:\s*(cottage-\d+)/i);

    if (!match) {
        return null;
    }

    return match[1];
}
// =========================================================
// KITCHEN DASHBOARD
// =========================================================

function renderKitchenDashboard(session) {

    const loginScreen =
        document.getElementById("loginScreen");

    loginScreen.className =
        "login-screen kitchen-mode";

    loginScreen.innerHTML = `

        <div class="kitchen-app">

            <!-- MOBILE HEADER -->

            <header class="kitchen-mobile-header">

                <button
                    id="kitchenMobileMenuButton"
                    class="kitchen-mobile-menu-button"
                    aria-label="Open menu"
                >
                    ☰
                </button>

                <div class="kitchen-mobile-brand">

                    <strong>
                        Mirima
                    </strong>

                    <span>
                        Kitchen
                    </span>

                </div>

                <button
                    id="kitchenMobileNotificationButton"
                    class="kitchen-mobile-notification-button"
                    aria-label="Notifications"
                >
                    🔔
                </button>

            </header>


            <!-- SIDEBAR -->

            <aside
                id="kitchenSidebar"
                class="kitchen-sidebar"
            >

                <div class="kitchen-brand">

                    <div class="kitchen-brand-mark">
                        M
                    </div>

                    <div>

                        <h1>
                            Mirima
                        </h1>

                        <span>
                            Kitchen
                        </span>

                    </div>

                </div>


                <!-- STAFF -->

                <div class="kitchen-staff">

                    <div class="kitchen-avatar">
                        ${getInitials(session.name)}
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(session.name)}
                        </strong>

                        <span>
                            Kitchen
                        </span>

                    </div>

                </div>


                <!-- NAVIGATION -->

                <nav class="kitchen-navigation">

                    <button
                        class="kitchen-nav-item active"
                        data-section="overview"
                    >
                        <span>⌂</span>
                        Overview
                    </button>


                    <button
                        class="kitchen-nav-item"
                        data-section="requests"
                    >
                        <span>☷</span>
                        Guest Requests

                        <b
                            id="kitchenRequestCount"
                            class="kitchen-nav-count"
                        >
                            0
                        </b>

                    </button>


                    <button
                        class="kitchen-nav-item"
                        data-section="chat"
                    >
                        <span>✉</span>
                        Live Chat

                        <b
                            id="kitchenChatCount"
                            class="kitchen-nav-count"
                        >
                            0
                        </b>

                    </button>


                    <button
                        class="kitchen-nav-item"
                        data-section="announcements"
                    >
                        <span>📢</span>
                        Announcements
                    </button>


                    <button
                        class="kitchen-nav-item"
                        data-section="history"
                    >
                        <span>◷</span>
                        History
                    </button>

                </nav>


                <!-- SIDEBAR BOTTOM -->

                <div class="kitchen-sidebar-bottom">

                    <div class="kitchen-connection-status">

                        <span></span>

                        System Online

                    </div>


                    <button
                        id="kitchenLogout"
                        class="kitchen-logout"
                    >
                        Logout
                    </button>

                </div>

            </aside>


            <!-- MAIN -->

            <main class="kitchen-main">

                <header class="kitchen-header">

                    <div>

                        <p class="kitchen-eyebrow">
                            MIRIMA ADMIN / KITCHEN
                        </p>

                        <h2 id="kitchenPageTitle">
                            Kitchen Overview
                        </h2>

                    </div>


                    <div class="kitchen-header-actions">

                        <button
                            id="kitchenNotificationButton"
                            class="kitchen-header-icon-button"
                            aria-label="Notifications"
                        >
                            🔔

                            <span
                                id="kitchenHeaderNotificationCount"
                                class="kitchen-header-notification-count"
                            >
                                0
                            </span>

                        </button>


                        <div class="kitchen-header-staff">

                            <span>
                                ${escapeHTML(session.name)}
                            </span>

                        </div>

                    </div>

                </header>


                <!-- DYNAMIC CONTENT -->

                <section
    id="kitchenContent"
    class="kitchen-content"
>

    <div class="kitchen-welcome">

        <div>

            <p class="kitchen-eyebrow">
                KITCHEN OPERATIONS
            </p>

            <h3>
                Good to see you.
            </h3>

            <p>
                Manage guest dining requests, communicate with guests
                and stay updated with kitchen operations from one workspace.
            </p>

        </div>

    </div>


    <div class="kitchen-stat-grid">

        <article class="kitchen-stat-card">

            <div class="kitchen-stat-icon">
                🍽️
            </div>

            <div>

                <span>
                    Guest Requests
                </span>

                <strong>
                    0
                </strong>

                <small>
                    Awaiting attention
                </small>

            </div>

        </article>


        <article class="kitchen-stat-card">

            <div class="kitchen-stat-icon">
                🔄
            </div>

            <div>

                <span>
                    In Progress
                </span>

                <strong>
                    0
                </strong>

                <small>
                    Currently being handled
                </small>

            </div>

        </article>


        <article class="kitchen-stat-card">

            <div class="kitchen-stat-icon">
                💬
            </div>

            <div>

                <span>
                    Live Chats
                </span>

                <strong>
                    0
                </strong>

                <small>
                    Active conversations
                </small>

            </div>

        </article>


        <article class="kitchen-stat-card">

            <div class="kitchen-stat-icon">
                📢
            </div>

            <div>

                <span>
                    Announcements
                </span>

                <strong>
                    0
                </strong>

                <small>
                    Published notices
                </small>

            </div>

        </article>

    </div>


    <div class="kitchen-panel">

        <div class="kitchen-panel-heading">

            <div>

                <p class="kitchen-eyebrow">
                    GUEST SERVICES
                </p>

                <h4>
                    Recent Kitchen Requests
                </h4>

            </div>

            <button
                class="kitchen-text-action"
            >
                View requests
            </button>

        </div>


        <div class="kitchen-empty-state">

            <div class="kitchen-empty-icon">
                🍽️
            </div>

            <h4>
                No kitchen requests
            </h4>

            <p>
                New guest dining requests will appear here.
            </p>

        </div>

    </div>

</section>

            </main>

        </div>
    `;


    const kitchenLogout =
        document.getElementById(
            "kitchenLogout"
        );

    if (kitchenLogout) {

        kitchenLogout.addEventListener(
            "click",
            function () {

                sessionStorage.removeItem(
                    "mirimaSession"
                );

                window.location.reload();

            }
        );

    }
setupKitchenMobileMenu();
   
}

function setupKitchenMobileMenu() {

    const menuButton =
        document.getElementById(
            "kitchenMobileMenuButton"
        );

    const sidebar =
        document.getElementById(
            "kitchenSidebar"
        );

       if (!menuButton || !sidebar) {
        return;
    }

    menuButton.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "mobile-open"
            );

        }
    );

}
// =========================================================
// SPA DASHBOARD
// =========================================================

function renderSpaDashboard(session) {

    const loginScreen =
        document.getElementById("loginScreen");

    loginScreen.className =
        "login-screen spa-mode";

    loginScreen.innerHTML = `

        <div class="spa-app">

            <!-- MOBILE HEADER -->

            <header class="spa-mobile-header">

                <button
                    id="spaMobileMenuButton"
                    class="spa-mobile-menu-button"
                    aria-label="Open menu"
                >
                    ☰
                </button>

                <div class="spa-mobile-brand">

                    <strong>
                        Mirima
                    </strong>

                    <span>
                        Spa
                    </span>

                </div>

                <button
                    id="spaMobileNotificationButton"
                    class="spa-mobile-notification-button"
                    aria-label="Notifications"
                >
                    🔔
                </button>

            </header>


            <!-- SIDEBAR -->

            <aside
                id="spaSidebar"
                class="spa-sidebar"
            >

                <div class="spa-brand">

                    <div class="spa-brand-mark">
                        M
                    </div>

                    <div>

                        <h1>
                            Mirima
                        </h1>

                        <span>
                            Spa
                        </span>

                    </div>

                </div>


                <!-- STAFF -->

                <div class="spa-staff">

                    <div class="spa-avatar">
                        ${getInitials(session.name)}
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(session.name)}
                        </strong>

                        <span>
                            Spa
                        </span>

                    </div>

                </div>


                <!-- NAVIGATION -->

                <nav class="spa-navigation">

                    <button
                        class="spa-nav-item active"
                        data-section="overview"
                    >
                        <span>⌂</span>
                        Overview
                    </button>


                    <button
                        class="spa-nav-item"
                        data-section="requests"
                    >
                        <span>☷</span>
                        Guest Requests

                        <b
                            id="spaRequestCount"
                            class="spa-nav-count"
                        >
                            0
                        </b>

                    </button>


                    <button
                        class="spa-nav-item"
                        data-section="chat"
                    >
                        <span>✉</span>
                        Live Chat

                        <b
                            id="spaChatCount"
                            class="spa-nav-count"
                        >
                            0
                        </b>

                    </button>


                    <button
                        class="spa-nav-item"
                        data-section="announcements"
                    >
                        <span>📢</span>
                        Announcements
                    </button>


                    <button
                        class="spa-nav-item"
                        data-section="history"
                    >
                        <span>◷</span>
                        History
                    </button>

                </nav>


                <!-- SIDEBAR BOTTOM -->

                <div class="spa-sidebar-bottom">

                    <div class="spa-connection-status">

                        <span></span>

                        System Online

                    </div>


                    <button
                        id="spaLogout"
                        class="spa-logout"
                    >
                        Logout
                    </button>

                </div>

            </aside>


            <!-- MAIN -->

            <main class="spa-main">

                <header class="spa-header">

                    <div>

                        <p class="spa-eyebrow">
                            MIRIMA ADMIN / SPA
                        </p>

                        <h2 id="spaPageTitle">
                            Spa Overview
                        </h2>

                    </div>


                    <div class="spa-header-actions">

                        <button
                            id="spaNotificationButton"
                            class="spa-header-icon-button"
                            aria-label="Notifications"
                        >
                            🔔

                            <span
                                id="spaHeaderNotificationCount"
                                class="spa-header-notification-count"
                            >
                                0
                            </span>

                        </button>


                        <div class="spa-header-staff">

                            <span>
                                ${escapeHTML(session.name)}
                            </span>

                        </div>

                    </div>

                </header>


                <!-- DYNAMIC CONTENT -->

               <section
    id="spaContent"
    class="spa-content"
>

    <div class="spa-welcome">

        <div>

            <p class="spa-eyebrow">
                SPA OPERATIONS
            </p>

            <h3>
                Good to see you.
            </h3>

            <p>
                Manage guest spa requests, communicate with guests
                and stay updated with spa operations from one workspace.
            </p>

        </div>

    </div>


    <div class="spa-stat-grid">

        <article class="spa-stat-card">

            <div class="spa-stat-icon">
                💆
            </div>

            <div>

                <span>
                    Guest Requests
                </span>

                <strong>
                    0
                </strong>

                <small>
                    Awaiting attention
                </small>

            </div>

        </article>


        <article class="spa-stat-card">

            <div class="spa-stat-icon">
                🔄
            </div>

            <div>

                <span>
                    In Progress
                </span>

                <strong>
                    0
                </strong>

                <small>
                    Currently being handled
                </small>

            </div>

        </article>


        <article class="spa-stat-card">

            <div class="spa-stat-icon">
                💬
            </div>

            <div>

                <span>
                    Live Chats
                </span>

                <strong>
                    0
                </strong>

                <small>
                    Active conversations
                </small>

            </div>

        </article>


        <article class="spa-stat-card">

            <div class="spa-stat-icon">
                📢
            </div>

            <div>

                <span>
                    Announcements
                </span>

                <strong>
                    0
                </strong>

                <small>
                    Published notices
                </small>

            </div>

        </article>

    </div>


    <div class="spa-panel">

        <div class="spa-panel-heading">

            <div>

                <p class="spa-eyebrow">
                    GUEST SERVICES
                </p>

                <h4>
                    Recent Spa Requests
                </h4>

            </div>

            <button
                class="spa-text-action"
            >
                View requests
            </button>

        </div>


        <div class="spa-empty-state">

            <div class="spa-empty-icon">
                💆
            </div>

            <h4>
                No spa requests
            </h4>

            <p>
                New guest spa requests will appear here.
            </p>

        </div>

    </div>

</section>

            </main>

        </div>

    `;

    const spaLogout =
        document.getElementById("spaLogout");

    if (spaLogout) {
        spaLogout.onclick = function () {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );

            if (!confirmed) {
                return;
            }

            sessionStorage.removeItem(
                "mirimaSession"
            );

            window.location.reload();
        };
    }
   setupSpaMobileMenu();
}
 
// =========================================================
// RECEPTION LIVE CHAT — LOAD CONVERSATIONS
// =========================================================

function setupReceptionLiveChat() {

    const conversationList =
        document.getElementById(
            "liveChatConversationList"
        );

    const conversationCount =
        document.getElementById(
            "liveChatConversationCount"
        );

    if (!conversationList) {
        return;
    }

    listenToDepartmentConversations(
        "Reception",
        function (conversations) {

            if (conversationCount) {
                conversationCount.textContent =
                    conversations.length;
            }

            if (conversations.length === 0) {
                conversationList.innerHTML = `
                    <div class="chat-empty-state">
                        <div class="chat-empty-icon">✉</div>
                        <h4>No active conversations</h4>
                        <p>
                            When a guest starts a conversation,
                            it will appear here.
                        </p>
                    </div>
                `;

                return;
            }
        

conversationList.innerHTML =
    conversations.map(function (conversation) {

        return `
            <button
                type="button"
                class="live-chat-conversation-item"
                data-conversation-id="${conversation.id}"
            >
                <div class="live-chat-guest-avatar" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle
                            cx="12"
                            cy="8"
                            r="4"
                            stroke="currentColor"
                            stroke-width="1.7"
                        />
                        <path
                            d="M4 21c0-4.2 3.2-7 8-7s8 2.8 8 7"
                            stroke="currentColor"
                            stroke-width="1.7"
                            stroke-linecap="round"
                        />
                    </svg>
                </div>

                <div class="live-chat-guest-details">
                    <div class="live-chat-conversation-heading">
                        <strong class="live-chat-guest-name">
                            ${conversation.guestName || "Guest"}
                        </strong>

                        <span
                            class="unread-message-indicator"
                            data-conversation-id="${conversation.id}"
                            style="display:none;"
                        >
                            New
                        </span>
                    </div>

                    <span class="live-chat-cottage">
                        ${(conversation.cottageId || "Cottage —")
                            .replace(/^cottage-/i, "Cottage ")}
                    </span>

                    <span
                        class="latest-message-preview"
                        data-conversation-id="${conversation.id}"
                    >
                        Loading latest message...
                    </span>
                </div>
            </button>
        `;

    }).join("");

           
conversationList
    .querySelectorAll(".latest-message-preview")
    .forEach(async function (preview) {

        const conversationId =
            preview.dataset.conversationId;

        const conversation =
            conversations.find(function (item) {
                return item.id === conversationId;
            });

        const unreadIndicator =
            conversationList.querySelector(
                '.unread-message-indicator[data-conversation-id="' +
                conversationId +
                '"]'
            );

        try {
            const latestMessage =
                await getLatestConversationMessage(
                    conversationId
                );

            if (!latestMessage) {
                preview.textContent = "No messages yet";

                if (unreadIndicator) {
                    unreadIndicator.style.display = "none";
                }

                return;
            }

            const sender =
                latestMessage.senderName ||
                (latestMessage.sender === "guest"
                    ? "Guest"
                    : "Reception");

            preview.textContent =
                sender + ": " +
                (latestMessage.message || "Attachment");

            const lastReadAt =
                conversation &&
                conversation.receptionLastReadAt;

            const messageTime =
                latestMessage.createdAt &&
                typeof latestMessage.createdAt.toMillis === "function"
                    ? latestMessage.createdAt.toMillis()
                    : null;

            const readTime =
                lastReadAt &&
                typeof lastReadAt.toMillis === "function"
                    ? lastReadAt.toMillis()
                    : lastReadAt instanceof Date
                        ? lastReadAt.getTime()
                        : null;

            const isUnread =
                latestMessage.sender === "guest" &&
                messageTime !== null &&
                (readTime === null || messageTime > readTime);
           
           
            if (unreadIndicator) {
                unreadIndicator.style.display =
                    isUnread ? "inline-block" : "none";
            }

        } catch (error) {
            console.error(
                "Latest message preview error:",
                error
            );

            preview.textContent =
                "Latest message unavailable";

            if (unreadIndicator) {
                unreadIndicator.style.display = "none";
            }
        }
    });
           
conversationList
    .querySelectorAll(".live-chat-conversation-item")
    .forEach(function (button) {

        button.addEventListener("click", function () {

            const conversationId =
                button.dataset.conversationId;

            const selectedConversation =
                conversations.find(function (conversation) {
                    return conversation.id === conversationId;
                });

            if (!selectedConversation) {
                return;
            }

            openReceptionChatConversation(
                selectedConversation
            );

        });

    });
        },
        function (error) {
            console.error(
                "Reception chat loading error:",
                error
            );

            conversationList.innerHTML = `
                <div class="chat-empty-state">
                    <h4>Unable to load conversations</h4>
                    <p>
                        Please check the connection and permissions.
                    </p>
                </div>
            `;
        }
    );
}
 
// =========================================================
// RECEPTION LIVE CHAT — OPEN CONVERSATION
// =========================================================

let activeReceptionMessageListener = null;

let activeReceptionConversationId = null;

let receptionMessageContextMenu = null;

function createReceptionMessageContextMenu() {
    if (receptionMessageContextMenu) {
        return receptionMessageContextMenu;
    }

    receptionMessageContextMenu = document.createElement("div");
    receptionMessageContextMenu.id = "receptionMessageContextMenu";
    receptionMessageContextMenu.className =
        "reception-message-context-menu";

    receptionMessageContextMenu.hidden = true;

    receptionMessageContextMenu.innerHTML = `
        <button type="button" data-action="edit">Edit</button>
        <button type="button" data-action="copy">Copy</button>
        <button type="button" data-action="download" hidden>Download</button>
        <button type="button" data-action="delete-for-me">Delete for me</button>
        <button type="button" data-action="delete-for-everyone">Delete for everyone</button>
    `;

    document.body.appendChild(receptionMessageContextMenu);

    return receptionMessageContextMenu;
}


function showReceptionMessageContextMenu(messageElement, item, x, y) {
    const menu = createReceptionMessageContextMenu();

    // Remember which message the user selected.
    menu.currentMessageElement = messageElement;
    menu.currentMessageItem = item;

    const isReceptionMessage = item.sender === "reception";

   
 // Show Edit only for Reception's own text-only messages.
menu.querySelector('[data-action="edit"]').hidden =
    !isReceptionMessage ||
    Boolean(item.attachmentUrl) ||
    !item.message ||
    !item.message.trim();


    // Show Download only when the message has an attachment URL.
    menu.querySelector('[data-action="download"]').hidden =
        !item.attachmentUrl;

    // Delete for everyone is only offered for the receptionist's messages.
    menu.querySelector('[data-action="delete-for-everyone"]').hidden =
        !isReceptionMessage;

    menu.hidden = false;

    // Position the menu within the visible browser window.
    const margin = 8;
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;

    menu.style.left =
        Math.max(
            margin,
            Math.min(x, window.innerWidth - menuWidth - margin)
        ) + "px";

    menu.style.top =
        Math.max(
            margin,
            Math.min(y, window.innerHeight - menuHeight - margin)
        ) + "px";
}

function hideReceptionMessageContextMenu() {
    if (receptionMessageContextMenu) {
        receptionMessageContextMenu.hidden = true;
    }
}


document.addEventListener("click", function (event) {
    if (
        receptionMessageContextMenu &&
        !receptionMessageContextMenu.hidden &&
        !receptionMessageContextMenu.contains(event.target)
    ) {
        hideReceptionMessageContextMenu();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        hideReceptionMessageContextMenu();
    }
});


const receptionContextMenuActions =
    document.createElement("div");

document.addEventListener("click", async function (event) {
    const button = event.target.closest(
        "#receptionMessageContextMenu [data-action]"
    );

    if (!button) {
        return;
    }

    const menu = receptionMessageContextMenu;

    if (!menu || !menu.currentMessageItem) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    const action = button.dataset.action;
    const item = menu.currentMessageItem;
    const conversationId = activeReceptionConversationId;

    hideReceptionMessageContextMenu();

    try {
        if (action === "copy") {
            const textToCopy = item.message || "";

            if (textToCopy) {
                await navigator.clipboard.writeText(textToCopy);
                alert("Message copied.");
            } else {
                alert("There is no text to copy.");
            }

            return;
        }

        if (action === "download") {
            if (!item.attachmentUrl) {
                alert("This message has no attachment to download.");
                return;
            }

            
const response = await fetch(item.attachmentUrl);

if (!response.ok) {
    throw new Error("Could not fetch the attachment.");
}

const blob = await response.blob();
const blobUrl = URL.createObjectURL(blob);

const link = document.createElement("a");
link.href = blobUrl;
link.download = item.attachmentName || "attachment";
document.body.appendChild(link);
link.click();
link.remove();

setTimeout(function () {
    URL.revokeObjectURL(blobUrl);
}, 1000);

return;

        }

      
if (action === "edit") {
    if (item.sender !== "reception") {
        alert("You can only edit your own messages.");
        return;
    }

    // Check when the message was sent.
    let sentAt = null;

    if (item.createdAt) {
        sentAt = item.createdAt.toDate
            ? item.createdAt.toDate()
            : new Date(item.createdAt);
    }

    if (!sentAt || Number.isNaN(sentAt.getTime())) {
        alert("The message timestamp is unavailable.");
        return;
    }

    // Allow editing only within two minutes of sending.
    if (Date.now() - sentAt.getTime() > 2 * 60 * 1000) {
        alert(
            "You can only edit a message within two minutes of sending it."
        );
        return;
    }

    if (item.attachmentUrl) {
        alert(
            "Editing attachments is not enabled here. " +
            "This option is for text messages."
        );
        return;
    }

    const newMessage = prompt(
        "Edit your message:",
        item.message || ""
    );

    if (newMessage === null) {
        return;
    }

    if (!newMessage.trim()) {
        alert("A message cannot be empty.");
        return;
    }

    await updateDoc(
        doc(
            db,
            "chatConversations",
            conversationId,
            "messages",
            item.id
        ),
        {
            message: newMessage.trim(),
            editedAt: new Date()
        }
    );

    alert("Message updated.");
    return;
}

        if (action === "delete-for-me") {
            const confirmed = confirm(
                "Hide this message from your Reception chat? " +
                "The guest will still see it."
            );

            if (!confirmed) {
                return;
            }

            await hideReceptionMessageForMe(
                conversationId,
                item.id
            );

            if (menu.currentMessageElement) {
                menu.currentMessageElement.remove();
            }

            return;
        }

        if (action === "delete-for-everyone") {
            if (item.sender !== "reception") {
                alert("You can only delete your own messages for everyone.");
                return;
            }

            let sentAt = null;

            if (item.createdAt) {
                sentAt = item.createdAt.toDate
                    ? item.createdAt.toDate()
                    : new Date(item.createdAt);
            }

            if (!sentAt || Number.isNaN(sentAt.getTime())) {
                alert("The message timestamp is unavailable.");
                return;
            }

            if (Date.now() - sentAt.getTime() > 60 * 1000) {
                alert(
                    "You can only delete a message for everyone " +
                    "within one minute of sending it."
                );
                return;
            }

            const confirmed = confirm(
                "Delete this message for both Reception and the guest? " +
                "This cannot be undone."
            );

            if (!confirmed) {
                return;
            }

            await deleteDoc(
             doc(
                   db,
        "chatConversations",
        conversation.id,
        "messages",
        id
    )
);

            return;
        }
    } catch (error) {
        console.error("Reception message action failed:", error);
        alert("The action failed. Please check the console and try again.");
    }
});


function openReceptionChatConversation(conversation) {

   activeReceptionConversationId = conversation.id;
       const chatLayout =
        document.querySelector(".live-chat-layout");

    if (chatLayout) {
        chatLayout.classList.add("chat-conversation-open");
    }

    const chatWindow =
        document.getElementById("liveChatWindow");

    if (!chatWindow) {
        return;
    }

    if (activeReceptionMessageListener) {
        activeReceptionMessageListener();
        activeReceptionMessageListener = null;
    }

// Mark this conversation as read by Reception.
const unreadIndicator =
    document.querySelector(
        '.unread-message-indicator[data-conversation-id="' +
        conversation.id +
        '"]'
    );

if (unreadIndicator) {
    unreadIndicator.style.display = "none";
}

updateDoc(
    doc(db, "chatConversations", conversation.id),
    {
        receptionLastReadAt: new Date()
    }
).catch(function (error) {
    console.error(
        "Could not update Reception read status:",
        error
    );
});
   
   
    chatWindow.innerHTML = `
        <div class="wa-chat">

            <div class="wa-chat-header">
                <button
                    type="button"
                    class="wa-back-button"
                    aria-label="Back to conversations"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M15 18l-6-6 6-6"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"/>
                    </svg>
                </button>

                
<button
    type="button"
    class="wa-avatar wa-profile-avatar"
    id="waProfileAvatar"
    aria-label="View guest profile photo"
    title="View guest profile photo"
>
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="4"
            fill="none" stroke="currentColor"
            stroke-width="1.8"/>
        <path d="M4 21c0-4.2 3.2-7 8-7s8 2.8 8 7"
            fill="none" stroke="currentColor"
            stroke-width="1.8" stroke-linecap="round"/>
    </svg>
</button>


                <div class="wa-chat-contact">
                    <h4>${conversation.guestName || "Guest"}</h4>
                    <p>Cottage ${
                        (conversation.cottageId || "—")
                            .replace(/^cottage-/i, "")
                    }</p>
                </div>

                <div class="wa-header-actions">

                    <button
                        type="button"
                        class="wa-icon-button"
                        id="waCameraButton"
                        aria-label="Camera"
                        title="Camera"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 7h3l2-2h6l2 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"
                                fill="none" stroke="currentColor"
                                stroke-width="1.8" stroke-linejoin="round"/>
                            <circle cx="12" cy="13" r="4"
                                fill="none" stroke="currentColor"
                                stroke-width="1.8"/>
                        </svg>
                    </button>

                    <div class="wa-menu-wrap">
                        <button
                            type="button"
                            class="wa-icon-button"
                            id="waMenuButton"
                            aria-label="More options"
                            aria-expanded="false"
                            title="More options"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="5" r="1.7" fill="currentColor"/>
                                <circle cx="12" cy="12" r="1.7" fill="currentColor"/>
                                <circle cx="12" cy="19" r="1.7" fill="currentColor"/>
                            </svg>
                        </button>

                        
<div class="wa-menu" id="waChatMenu" hidden>
    <button type="button" data-wa-action="contact">
        Contact details
    </button>

    <button type="button" data-wa-action="search">
        Search messages
    </button>

    <button type="button" data-wa-action="select-messages">
        Select messages
    </button>

    <button type="button" data-wa-action="select-all">
        Select all
    </button>

    <button type="button" data-wa-action="delete-selected">
        Delete selected
    </button>

    <button type="button" data-wa-action="cancel-selection">
        Cancel selection
    </button>

    <button type="button" data-wa-action="settings">
        Settings
    </button>

    <button type="button" data-wa-action="clear">
        Clear chat view
    </button>
</div>



<div class="wa-search-panel" id="waSearchPanel" hidden>
    <div class="wa-search-input-wrap">
        <svg
            class="wa-search-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
        </svg>

        <input
            type="search"
            id="waSearchInput"
            placeholder="Search messages..."
            autocomplete="off"
            aria-label="Search conversation messages"
        >
    </div>

    <span id="waSearchCount" aria-live="polite"></span>

    <button
        type="button"
        id="waSearchClose"
        aria-label="Close message search"
        title="Close search"
    >
        &times;
    </button>
</div>


<!-- Reception chat Settings panel -->
<div class="wa-settings-panel" id="waSettingsPanel" hidden>
    <div class="wa-settings-header">
        <h3>Chat settings</h3>

        <button
            type="button"
            id="waSettingsClose"
            aria-label="Close settings"
            title="Close settings"
        >
            &times;
        </button>
    </div>

    <div class="wa-settings-content">

        <section class="wa-settings-section">
            <h4>Sound</h4>

            <label class="wa-setting-row">
                <span>
                    <strong>Message sounds</strong>
                    <small>Play a sound for incoming messages</small>
                </span>

                <input
                    type="checkbox"
                    id="waSettingSounds"
                    checked
                >
            </label>
        </section>

        <section class="wa-settings-section">
            <h4>Appearance</h4>

            <label class="wa-setting-field" for="waSettingTheme">
                Chat theme
            </label>
            <select id="waSettingTheme">
                <option value="system">System default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>

            <label class="wa-setting-field" for="waSettingBackground">
                Chat background
            </label>
<select id="waSettingBackground">
    <option value="default">Mirima Default</option>
    <option value="wallpaper1">Wallpaper 1</option>
    <option value="wallpaper2">Wallpaper 2</option>
    <option value="wallpaper3">Wallpaper 3</option>
    <option value="wallpaper4">Wallpaper 4</option>
    <option value="wallpaper5">Wallpaper 5</option>
    <option value="wallpaper6">Wallpaper 6</option>
    <option value="wallpaper7">Wallpaper 7</option>
    <option value="wallpaper8">Wallpaper 8</option>
    <option value="wallpaper9">Wallpaper 9</option>
    <option value="wallpaper10">Wallpaper 10</option>
    <option value="wallpaper11">Wallpaper 11</option>
    <option value="wallpaper12">Wallpaper 12</option>
</select>
            <label class="wa-setting-field" for="waSettingTextSize">
                Text size
            </label>
            <select id="waSettingTextSize">
                <option value="small">Small</option>
                <option value="medium" selected>Medium</option>
                <option value="large">Large</option>
            </select>
        </section>

        <section class="wa-settings-section">
            <h4>Data usage</h4>

            <label class="wa-setting-row">
                <span>
                    <strong>Data saver</strong>
                    <small>Reduce automatic media loading</small>
                </span>

                <input
                    type="checkbox"
                    id="waSettingDataSaver"
                >
            </label>
        </section>

        <section class="wa-settings-section">
            <h4>Message selection</h4>
            <p>
                Use the three-dot menu to select messages,
                select all, or cancel selection.
            </p>
        </section>

        <section class="wa-settings-section">
            <button
                type="button"
                id="waSettingsReset"
                class="wa-settings-reset"
            >
                Reset settings
            </button>
        </section>

    </div>
</div>
<!-- End Reception chat Settings panel -->



                    </div>

                </div>
            </div>

            <div
                id="liveChatMessages"
                class="wa-chat-messages"
                aria-live="polite"
            >
                <p>Loading messages...</p>
            </div>

            <form id="liveChatReplyForm" class="wa-chat-composer">

                <button
                    type="button"
                    class="wa-composer-icon"
                    id="waAttachButton"
                    aria-label="Attach file"
                    title="Attach file"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m8 12.5 7.2-7.2a4 4 0 0 1 5.7 5.7l-9.1 9.1a6 6 0 0 1-8.5-8.5l9-9"
                            fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round"/>
                    </svg>
                </button>

                <input
                 type="file"
                id="waAttachmentInput"
                accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.odt,.ods,.odp"
                  hidden
                 >

                <input
                    id="liveChatReplyInput"
                    class="wa-chat-input"
                    type="text"
                    placeholder="Type a message"
                    autocomplete="off"
                    
                >

                <button
                    type="button"
                    class="wa-composer-icon"
                    id="waVoiceButton"
                    aria-label="Record voice note"
                    title="Record voice note"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="9" y="2" width="6" height="13" rx="3"
                            fill="none" stroke="currentColor"
                            stroke-width="1.8"/>
                        <path d="M5 11a7 7 0 0 0 14 0M12 18v4m-4 0h8"
                            fill="none" stroke="currentColor"
                            stroke-width="1.8" stroke-linecap="round"/>
                    </svg>
                </button>


                <!-- Pending attachment preview -->
                <div
                    id="waAttachmentPreview"
                    class="wa-attachment-preview"
                    hidden
                >
                    <div
                        id="waAttachmentPreviewContent"
                        class="wa-attachment-preview-content"
                    ></div>

                    <button
                        type="button"
                        id="waCancelAttachment"
                        class="wa-cancel-attachment"
                        aria-label="Cancel attachment"
                        title="Remove attachment"
                    >
                        &times;
                    </button>
                </div>

                <button
                    type="submit"
                    class="wa-send-button"
                    aria-label="Send message"
                    title="Send message"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22 2 11 13"
                            fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round"/>
                        <path d="m22 2-7 20-4-9-9-4Z"
                            fill="currentColor" stroke="currentColor"
                            stroke-width="1.5" stroke-linejoin="round"/>
                    </svg>
                </button>

            </form>
        </div>
    `;


    // Handle clicks on the guest profile avatar
    const profileAvatar =
        chatWindow.querySelector("#waProfileAvatar");

    if (profileAvatar) {
        profileAvatar.addEventListener("click", function () {
            console.log("Guest avatar clicked!");

            let preview =
                document.getElementById("waProfilePhotoPreview");

            if (!preview) {
                preview = document.createElement("div");
                preview.id = "waProfilePhotoPreview";
                preview.className = "wa-profile-photo-preview";

                preview.innerHTML = `
                    <div class="wa-profile-photo-preview-content"
                         role="dialog"
                         aria-modal="true"
                         aria-label="Guest profile photo">
                        <button type="button"
                                class="wa-profile-photo-close"
                                aria-label="Close photo preview">&times;</button>
                        <div class="wa-profile-photo-placeholder">
                            Guest profile photo is not available yet.
                        </div>
                    </div>
                `;

    
               
                document.body.appendChild(preview);

                preview.addEventListener("click", function (event) {
                    if (
                        event.target === preview ||
                        event.target.closest(".wa-profile-photo-close")
                    ) {
                        preview.remove();
                    }
                });
            }
        });
    }

const waMenuButton = chatWindow.querySelector("#waMenuButton");
const waChatMenu = chatWindow.querySelector("#waChatMenu");

if (waMenuButton && waChatMenu) {
    // Use a fresh button to avoid previously attached click handlers.
    const freshButton = waMenuButton.cloneNode(true);
    waMenuButton.replaceWith(freshButton);

    freshButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        waChatMenu.hidden = !waChatMenu.hidden;

        freshButton.setAttribute(
            "aria-expanded",
            String(!waChatMenu.hidden)
        );

        console.log(
            "Menu state:",
            waChatMenu.hidden ? "closed" : "open"
        );
    });

    // Close the menu when clicking outside it.
    if (!document._waChatMenuOutsideHandler) {
        document._waChatMenuOutsideHandler = function (event) {
            const currentButton = document.querySelector("#waMenuButton");
            const currentMenu = document.querySelector("#waChatMenu");

            if (!currentButton || !currentMenu || currentMenu.hidden) {
                return;
            }

            if (
                !currentMenu.contains(event.target) &&
                !currentButton.contains(event.target)
            ) {
                currentMenu.hidden = true;
                currentButton.setAttribute("aria-expanded", "false");
            }
        };

        document.addEventListener(
            "click",
            document._waChatMenuOutsideHandler
        );
    }
}

   
    // Reception chat: search messages
    const waSearchPanel = chatWindow.querySelector("#waSearchPanel");
    const waSearchInput = chatWindow.querySelector("#waSearchInput");
    const waSearchCount = chatWindow.querySelector("#waSearchCount");
    const waSearchClose = chatWindow.querySelector("#waSearchClose");
    const waChatMenuForSearch = chatWindow.querySelector("#waChatMenu");

    

function runReceptionMessageSearch() {
    if (!waSearchInput || !messagesContainer) {
        return;
    }

    const term = waSearchInput.value.trim().toLowerCase();

    const messageElements = messagesContainer.querySelectorAll(
        ".wa-message-guest, .wa-message-reception"
    );

    let matches = 0;
    let firstMatch = null;

    messageElements.forEach(function (element) {
        const text = element.textContent.toLowerCase();
        const isMatch = term !== "" && text.includes(term);

        // Highlight matching messages.
        element.style.outline = isMatch
            ? "2px solid #25a56a"
            : "";

        element.style.outlineOffset = isMatch
            ? "2px"
            : "";

        if (isMatch) {
            matches++;

            if (!firstMatch) {
                firstMatch = element;
            }
        }
    });

    // Update the number of search matches.
    if (waSearchCount) {
        if (term !== "") {
            waSearchCount.textContent =
                matches + (matches === 1 ? " match" : " matches");
        } else {
            waSearchCount.textContent = "";
        }
    }

    // Scroll to the first matching message.
    if (firstMatch) {
        firstMatch.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
}


    if (
        waSearchPanel &&
        waSearchInput &&
        waSearchClose &&
        waChatMenuForSearch
    ) {
        // Open search from the existing More options menu.
        waChatMenuForSearch
            .querySelector('[data-wa-action="search"]')
            ?.addEventListener("click", function () {
                waChatMenuForSearch.hidden = true;

                const menuButton =
                    chatWindow.querySelector("#waMenuButton");

                if (menuButton) {
                    menuButton.setAttribute("aria-expanded", "false");
                }

                waSearchPanel.hidden = false;
                waSearchInput.value = "";
                runReceptionMessageSearch();
                waSearchInput.focus();
            });

        // Search as the user types.
        waSearchInput.addEventListener(
            "input",
            runReceptionMessageSearch
        );

        // Close search and remove all highlights.
        waSearchClose.addEventListener("click", function () {
            waSearchPanel.hidden = true;
            waSearchInput.value = "";
            runReceptionMessageSearch();
        });
    }

    
    // Reception chat: message selection controls
    const waSelectionMenu = chatWindow.querySelector("#waChatMenu");

    if (waSelectionMenu) {
        waSelectionMenu
            .querySelector('[data-wa-action="select-messages"]')
            ?.addEventListener("click", function () {
                receptionSelectionMode = true;
                selectedReceptionMessageIds.clear();

                messagesContainer
                    .querySelectorAll(".wa-message-selected")
                    .forEach(function (element) {
                        element.classList.remove("wa-message-selected");
                    });

                waSelectionMenu.hidden = true;

                const menuButton = chatWindow.querySelector("#waMenuButton");
                if (menuButton) {
                    menuButton.setAttribute("aria-expanded", "false");
                }

                console.log("Reception message selection enabled.");
            });

        // Clear the visible chat view without deleting saved messages.
       // Clear the visible Reception chat view.
waSelectionMenu
    .querySelector('[data-wa-action="clear"]')
    ?.addEventListener("click", function () {
        const confirmed = confirm(
            "Clear the messages from this chat view? " +
            "Saved messages will not be deleted."
        );

        if (!confirmed) {
            return;
        }

        // Remember that this conversation's view was cleared.
        sessionStorage.setItem(
            "mirimaClearedReceptionView_" + conversation.id,
            "true"
        );

        messagesContainer.replaceChildren();

        receptionSelectionMode = false;
        selectedReceptionMessageIds.clear();

        waSelectionMenu.hidden = true;

        const menuButton =
            chatWindow.querySelector("#waMenuButton");

        if (menuButton) {
            menuButton.setAttribute("aria-expanded", "false");
        }

        console.log("Reception chat view cleared.");
    });

        // Select all messages currently displayed.
        waSelectionMenu
            .querySelector('[data-wa-action="select-all"]')
            ?.addEventListener("click", function () {
                receptionSelectionMode = true;
                selectedReceptionMessageIds.clear();

                const messageElements =
                    messagesContainer.querySelectorAll(
                        ".wa-message-guest, .wa-message-reception"
                    );

                messageElements.forEach(function (element) {
                    const messageId = element.dataset.messageId;

                    if (!messageId) {
                        return;
                    }

                    selectedReceptionMessageIds.add(messageId);
                    element.classList.add("wa-message-selected");
                });

                waSelectionMenu.hidden = true;

                const menuButton =
                    chatWindow.querySelector("#waMenuButton");

                if (menuButton) {
                    menuButton.setAttribute("aria-expanded", "false");
                }

                console.log(
                    "Selected Reception messages:",
                    selectedReceptionMessageIds.size
                );
            });


       
        // Delete selected Reception messages.
        waSelectionMenu
            .querySelector('[data-wa-action="delete-selected"]')
            ?.addEventListener("click", async function () {
                if (selectedReceptionMessageIds.size === 0) {
                    alert("Please select at least one message first.");
                    return;
                }

                const selectedIds = Array.from(
                    selectedReceptionMessageIds
                );

                // Find the selected messages in the currently rendered list.
                const messageElements = Array.from(
                    messagesContainer.querySelectorAll(
                        ".wa-message-guest, .wa-message-reception"
                    )
                );

                const selectedItems = selectedIds.map(function (id) {
                    const element = messageElements.find(function (el) {
                        return el.dataset.messageId === id;
                    });

                    return element
                        ? {
                            id: id,
                            sender: element.classList.contains(
                                "wa-message-reception"
                            ) ? "reception" : "guest"
                        }
                        : null;
                });

                if (selectedItems.some(function (item) {
                    return !item || item.sender !== "reception";
                })) {
                    alert(
                        "Delete selected can only delete Reception messages. " +
                        "Please select only your own messages."
                    );
                    return;
                }

                // Check each selected message against the existing one-minute limit.
                const now = Date.now();
                const eligibleIds = [];

                for (const id of selectedIds) {
                    const messageElement = messageElements.find(
                        function (el) {
                            return el.dataset.messageId === id;
                        }
                    );

                    if (!messageElement) continue;

                    // Timestamp metadata must be attached to the element
                    // before bulk deletion can validate eligibility.
                    const sentAtValue = messageElement.dataset.createdAt;

                    if (!sentAtValue) {
                        alert(
                            "A selected message has no timestamp available. " +
                            "No messages were deleted."
                        );
                        return;
                    }

                    const sentAt = new Date(sentAtValue);

                    if (
                        Number.isNaN(sentAt.getTime()) ||
                        now - sentAt.getTime() > 60 * 1000
                    ) {
                        alert(
                            "One or more selected messages are older than " +
                            "one minute. No messages were deleted."
                        );
                        return;
                    }

                    eligibleIds.push(id);
                }

                const confirmed = confirm(
                    "Delete " + eligibleIds.length +
                    " selected message(s) for both Reception and the guest? " +
                    "This cannot be undone."
                );

                if (!confirmed) return;

                try {
                    
                  for (const id of eligibleIds) {
                        await deleteDoc(
                           doc(
                          db,
                      "chatConversations",
                     conversation.id,
                     "messages",
                     id
                      )
                  );
                }
                    receptionSelectionMode = false;
                    selectedReceptionMessageIds.clear();

                    messagesContainer
                        .querySelectorAll(".wa-message-selected")
                        .forEach(function (element) {
                            element.classList.remove("wa-message-selected");
                        });

                    waSelectionMenu.hidden = true;

                    const menuButton =
                        chatWindow.querySelector("#waMenuButton");

                    if (menuButton) {
                        menuButton.setAttribute("aria-expanded", "false");
                    }

                    alert("Selected messages deleted.");
                } catch (error) {
                    console.error(
                        "Failed to delete selected messages:",
                        error
                    );

                    alert(
                        "Some messages may not have been deleted. " +
                        "Please check the conversation and try again."
                    );
                }
            });

       
   
        waSelectionMenu
            .querySelector('[data-wa-action="cancel-selection"]')
            ?.addEventListener("click", function () {
                receptionSelectionMode = false;
                selectedReceptionMessageIds.clear();

                messagesContainer
                    .querySelectorAll(".wa-message-selected")
                    .forEach(function (element) {
                        element.classList.remove("wa-message-selected");
                    });

                waSelectionMenu.hidden = true;

                const menuButton = chatWindow.querySelector("#waMenuButton");
                if (menuButton) {
                    menuButton.setAttribute("aria-expanded", "false");
                }

                console.log("Reception message selection cancelled.");
            });
    }


   
    // Reception chat: Settings panel
    const waSettingsPanel =
        chatWindow.querySelector("#waSettingsPanel");

    const waSettingsClose =
        chatWindow.querySelector("#waSettingsClose");

    const waSettingsMenuButton =
        chatWindow.querySelector(
            '#waChatMenu [data-wa-action="settings"]'
        );

    if (
        waSettingsPanel &&
        waSettingsClose &&
        waSettingsMenuButton
    ) {
        // Open Settings from the three-dot menu.
        waSettingsMenuButton.addEventListener("click", function () {
            waSelectionMenu.hidden = true;

            const menuButton =
                chatWindow.querySelector("#waMenuButton");

            if (menuButton) {
                menuButton.setAttribute("aria-expanded", "false");
            }

            waSettingsPanel.hidden = false;
        });

        // Close Settings.
        waSettingsClose.addEventListener("click", function () {
            waSettingsPanel.hidden = true;
        });
    }


    // Reception chat: load and apply saved settings
    const waSettingSounds =
        chatWindow.querySelector("#waSettingSounds");

    const waSettingTheme =
        chatWindow.querySelector("#waSettingTheme");

    const waSettingBackground =
        chatWindow.querySelector("#waSettingBackground");

    const waSettingTextSize =
        chatWindow.querySelector("#waSettingTextSize");

    const waSettingDataSaver =
        chatWindow.querySelector("#waSettingDataSaver");

    const waSettingsReset =
        chatWindow.querySelector("#waSettingsReset");

    const receptionSettingsKey =
        "mirimaReceptionChatSettings";

    const receptionDefaultSettings = {
        sounds: true,
        theme: "system",
        background: "default",
        textSize: "medium",
        dataSaver: false
    };

    let receptionSettings = {
        ...receptionDefaultSettings
    };

    try {
        const savedSettings =
            localStorage.getItem(receptionSettingsKey);

        if (savedSettings) {
            receptionSettings = {
                ...receptionDefaultSettings,
                ...JSON.parse(savedSettings)
            };
        }
    } catch (error) {
        console.warn(
            "Could not load Reception chat settings:",
            error
        );
    }

    function saveReceptionSettings() {
        try {
            localStorage.setItem(
                receptionSettingsKey,
                JSON.stringify(receptionSettings)
            );
        } catch (error) {
            console.warn(
                "Could not save Reception chat settings:",
                error
            );
        }
    }


function applyReceptionSettings() {
    if (waSettingSounds) {
        waSettingSounds.checked = receptionSettings.sounds;
    }

    if (waSettingTheme) {
        waSettingTheme.value = receptionSettings.theme;
    }

    if (waSettingBackground) {
        waSettingBackground.value = receptionSettings.background;
    }

    if (waSettingTextSize) {
        waSettingTextSize.value = receptionSettings.textSize;
    }

    if (waSettingDataSaver) {
        waSettingDataSaver.checked = receptionSettings.dataSaver;
    }

    const selectedTheme = receptionSettings.theme || "system";

if (selectedTheme === "system") {
    const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;

    chatWindow.dataset.waTheme = prefersDark ? "dark" : "light";
} else {
    chatWindow.dataset.waTheme = selectedTheme;
}

    const settingsMessagesContainer =
        chatWindow.querySelector("#liveChatMessages");

    if (settingsMessagesContainer) {
    const wallpapers = {
    default: "/Mirima-Admin/images/chat-wallpaper.png",
    wallpaper1: "/Mirima-Admin/images/chat-wallpaper1.png",
    wallpaper2: "/Mirima-Admin/images/chat-wallpaper2.png",
    wallpaper3: "/Mirima-Admin/images/chat-wallpaper3.png",
    wallpaper4: "/Mirima-Admin/images/chat-wallpaper4.png",
    wallpaper5: "/Mirima-Admin/images/chat-wallpaper5.png",
    wallpaper6: "/Mirima-Admin/images/chat-wallpaper6.png",
    wallpaper7: "/Mirima-Admin/images/chat-wallpaper7.png",
    wallpaper8: "/Mirima-Admin/images/chat-wallpaper8.png",
    wallpaper9: "/Mirima-Admin/images/chat-wallpaper9.png",
    wallpaper10: "/Mirima-Admin/images/chat-wallpaper10.png",
    wallpaper11: "/Mirima-Admin/images/chat-wallpaper11.png",
    wallpaper12: "/Mirima-Admin/images/chat-wallpaper12.png"
};

        const wallpaper =
            wallpapers[receptionSettings.background] ||
            wallpapers.default;

        settingsMessagesContainer.style.setProperty(
            "background-color",
            "#06110f",
            "important"
        );

        settingsMessagesContainer.style.setProperty(
            "background-image",
            `linear-gradient(
                rgba(3,10,8,.78),
                rgba(3,10,8,.78)
            ), url("${wallpaper}")`,
            "important"
        );

        settingsMessagesContainer.style.setProperty(
            "background-repeat",
            "repeat"
        );

        settingsMessagesContainer.style.setProperty(
            "background-size",
            "auto, 400px auto"
        );

        settingsMessagesContainer.style.setProperty(
            "background-position",
            "center top"
        );

        const textSizes = {
            small: "13px",
            medium: "15px",
            large: "17px"
        };

        settingsMessagesContainer
            .querySelectorAll(
                ".wa-message-guest, .wa-message-reception"
            )
            .forEach(function (element) {
                element.style.fontSize =
                    textSizes[receptionSettings.textSize] ||
                    textSizes.medium;
            });
    }
}
    function updateReceptionSetting(name, value) {
        receptionSettings[name] = value;
        saveReceptionSettings();
        applyReceptionSettings();
    }

    if (waSettingSounds) {
        waSettingSounds.addEventListener("change", function () {
            updateReceptionSetting(
                "sounds",
                waSettingSounds.checked
            );
        });
    }

    if (waSettingTheme) {
        waSettingTheme.addEventListener("change", function () {
            updateReceptionSetting(
                "theme",
                waSettingTheme.value
            );
        });
    }

    if (waSettingBackground) {
        waSettingBackground.addEventListener("change", function () {
            updateReceptionSetting(
                "background",
                waSettingBackground.value
            );
        });
    }

    if (waSettingTextSize) {
        waSettingTextSize.addEventListener("change", function () {
            updateReceptionSetting(
                "textSize",
                waSettingTextSize.value
            );
        });
    }

    if (waSettingDataSaver) {
        waSettingDataSaver.addEventListener("change", function () {
            updateReceptionSetting(
                "dataSaver",
                waSettingDataSaver.checked
            );
        });
    }

    if (waSettingsReset) {
        waSettingsReset.addEventListener("click", function () {
            const confirmed = confirm(
                "Reset Reception chat settings to their defaults? " +
                "Your messages will not be deleted."
            );

            if (!confirmed) {
                return;
            }

            receptionSettings = {
                ...receptionDefaultSettings
            };

            saveReceptionSettings();
            applyReceptionSettings();
        });
    }

    applyReceptionSettings();


   
    // Connect the paperclip button to the file picker
    const attachButton =
        chatWindow.querySelector("#waAttachButton");

    const attachmentInput =
        chatWindow.querySelector("#waAttachmentInput");

    const attachmentPreview =
        chatWindow.querySelector("#waAttachmentPreview");

    const previewContent =
        chatWindow.querySelector("#waAttachmentPreviewContent");

    const cancelAttachmentButton =
        chatWindow.querySelector("#waCancelAttachment");

    let pendingAttachmentPreviewUrl = null;

    function clearAttachmentPreview() {
        if (pendingAttachmentPreviewUrl) {
            URL.revokeObjectURL(pendingAttachmentPreviewUrl);
            pendingAttachmentPreviewUrl = null;
        }

        if (previewContent) {
            previewContent.replaceChildren();
        }

        if (attachmentPreview) {
            attachmentPreview.hidden = true;
        }

        if (attachmentInput) {
            attachmentInput.value = "";
        }
    }

    if (attachButton && attachmentInput) {
        attachButton.addEventListener("click", function () {
            attachmentInput.click();
        });
    }

    // Preview the selected file before sending
    if (attachmentInput) {
        attachmentInput.addEventListener("change", function () {
            const file = attachmentInput.files[0];

            if (!file || !attachmentPreview || !previewContent) {
                return;
            }

            clearAttachmentPreview();

            // Restore the selected file after clearing the preview UI.
            attachmentInput.files = (() => {
                const transfer = new DataTransfer();
                transfer.items.add(file);
                return transfer.files;
            })();

            const fileInfo = document.createElement("div");
            fileInfo.className = "wa-pending-file-info";

            const fileName = document.createElement("div");
            fileName.className = "wa-pending-file-name";
            fileName.textContent = file.name;

            const fileSize = document.createElement("div");
            fileSize.className = "wa-pending-file-size";
            fileSize.textContent =
                (file.size / (1024 * 1024)).toFixed(2) + " MB";

            fileInfo.append(fileName, fileSize);

            const fileType = file.type || "";

            if (fileType.startsWith("image/")) {
                const image = document.createElement("img");
                pendingAttachmentPreviewUrl =
                    URL.createObjectURL(file);
                image.src = pendingAttachmentPreviewUrl;
                image.alt = file.name;
                image.className = "wa-pending-image";
                previewContent.appendChild(image);

            } else if (fileType.startsWith("audio/")) {
                const audio = document.createElement("audio");
                pendingAttachmentPreviewUrl =
                    URL.createObjectURL(file);
                audio.src = pendingAttachmentPreviewUrl;
                audio.controls = true;
                audio.preload = "metadata";
                audio.className = "wa-pending-audio";
                previewContent.appendChild(audio);

            } else if (fileType.startsWith("video/")) {
                const video = document.createElement("video");
                pendingAttachmentPreviewUrl =
                    URL.createObjectURL(file);
                video.src = pendingAttachmentPreviewUrl;
                video.controls = true;
                video.preload = "metadata";
                video.playsInline = true;
                video.className = "wa-pending-video";
                previewContent.appendChild(video);

            } else {
                const fileIcon = document.createElement("div");
                fileIcon.className = "wa-pending-document-icon";
                fileIcon.textContent =
                    fileType === "application/pdf" ||
                    file.name.toLowerCase().endsWith(".pdf")
                        ? "📕 PDF"
                        : "📎 Document";

                previewContent.appendChild(fileIcon);
            }

            previewContent.appendChild(fileInfo);
            attachmentPreview.hidden = false;

            console.log("Reception attachment ready to send:", {
                name: file.name,
                type: file.type,
                size: file.size
            });
        });
    }

    // Cancel the selected attachment
    if (cancelAttachmentButton) {
        cancelAttachmentButton.addEventListener("click", function () {
            clearAttachmentPreview();
        });
    }

   
    // Reception voice-note recording
    const voiceButton =
        chatWindow.querySelector("#waVoiceButton");
   
   if (voiceButton) {
    voiceButton.title = "Tap to record voice note";
}

    let voiceRecorder = null;
    let voiceChunks = [];
    let recordedVoiceFile = null;

    if (voiceButton) {
        voiceButton.addEventListener("click", async function () {
            // Stop recording when the microphone is clicked again.
            if (
                voiceRecorder &&
                voiceRecorder.state === "recording"
            ) {
                voiceRecorder.stop();
                return;
            }

            if (!navigator.mediaDevices?.getUserMedia ||
                typeof MediaRecorder === "undefined") {
                alert(
                    "Voice recording is not supported by this browser."
                );
                return;
            }

            try {
                const stream =
                    await navigator.mediaDevices.getUserMedia({
                        audio: true
                    });

                voiceChunks = [];
                recordedVoiceFile = null;

                voiceRecorder = new MediaRecorder(stream);

                voiceRecorder.addEventListener(
                    "dataavailable",
                    function (event) {
                        if (event.data.size > 0) {
                            voiceChunks.push(event.data);
                        }
                    }
                );

                voiceRecorder.addEventListener(
                    "stop",
                    function () {
                        const audioBlob = new Blob(
                            voiceChunks,
                            {
                                type: voiceRecorder.mimeType ||
                                    "audio/webm"
                            }
                        );

                        recordedVoiceFile = new File(
                            [audioBlob],
                            "voice-note.webm",
                            {
                                type: audioBlob.type
                            }
                        );

                        stream.getTracks().forEach(
                            track => track.stop()
                        );

                       
                   voiceButton.classList.remove("wa-recording");

                  voiceButton.title = "Voice note ready — click Send";
                voiceButton.setAttribute(
                "aria-label",
                 "Voice note ready — click Send"
               );


                        alert(
                            "Voice note recorded. Click Send to send it."
                        );
                    }
                );

                voiceRecorder.start();

           voiceButton.title = "Tap to stop recording";
            voiceButton.setAttribute(
             "aria-label",
             "Tap to stop recording"
          );
          voiceButton.classList.add("wa-recording");
               

            } catch (error) {
                console.error(
                    "Reception voice recording failed:",
                    error
                );

                alert(
                    "Could not access the microphone. Please allow microphone access and try again."
                );
            }
        });
    }

    const messagesContainer =
        document.getElementById("liveChatMessages");

   
let receptionSelectionMode = false;
const selectedReceptionMessageIds = new Set();


       // Return to the conversation list
    const backButton =
        chatWindow.querySelector(".wa-back-button");

    if (backButton) {
        backButton.addEventListener("click", function () {
            const chatLayout =
                document.querySelector(".live-chat-layout");

           if (chatLayout) {
    chatLayout.classList.remove(
        "chat-conversation-open"
    );
}

if (activeReceptionMessageListener) {
    activeReceptionMessageListener();
    activeReceptionMessageListener = null;
}

chatWindow.innerHTML = `
    <div class="live-chat-window-empty">
        <div class="chat-empty-icon">💬</div>
        <h4>Select a conversation</h4>
        <p>
            Choose a guest conversation from
            the list to start chatting.
        </p>
    </div>
`;
        });
    }
   
   activeReceptionMessageListener =
    listenToConversationMessages(
        conversation.id,
        async function (messages) {

            if (!messagesContainer) {
                return;
            }

            let hiddenMessageIds;

            try {
                hiddenMessageIds =
                    await getReceptionHiddenMessageIds(
                        conversation.id
                    );
            } catch (error) {
                console.error(
                    "Could not load hidden Reception messages:",
                    error
                );
                return;
            }

            messages = messages.filter(function (item) {
                return !hiddenMessageIds.has(item.id);
            });

           // Keep the cleared view empty when old messages are reloaded.
const clearedViewKey =
    "mirimaClearedReceptionView_" + conversation.id;

if (sessionStorage.getItem(clearedViewKey) === "true") {
    messagesContainer.replaceChildren();
    return;
}

            console.log("RECEPTION CHAT MESSAGES:", messages);
            console.log("RECEPTION CHAT MESSAGE COUNT:", messages.length);

                if (!messagesContainer) {
                    return;
                }

                if (messages.length === 0) {
                    messagesContainer.innerHTML =
                        "<p>No messages in this conversation yet.</p>";
                    return;
                }

            
messagesContainer.innerHTML = "";

let previousMessageDate = "";

messages.forEach(function (item) {

    const messageElement =
        document.createElement("div");
   // Store the Firestore message ID for selection.
messageElement.dataset.messageId = item.id;

    messageElement.classList.add(
        item.sender === "guest"
            ? "wa-message-guest"
            : "wa-message-reception"
    );

    messageElement.style.marginBottom = "12px";
    messageElement.style.padding = "10px";
    messageElement.style.borderRadius = "8px";

   // Select or deselect a message when selection mode is active.
messageElement.addEventListener("click", function (event) {
    if (!receptionSelectionMode) {
        return;
    }

    // Don't select a message when interacting with a link or control.
    if (event.target.closest("button, a, input, video, audio")) {
        return;
    }

    event.stopPropagation();

    const messageId = messageElement.dataset.messageId;

    if (!messageId) {
        return;
    }

    if (selectedReceptionMessageIds.has(messageId)) {
        selectedReceptionMessageIds.delete(messageId);
        messageElement.classList.remove("wa-message-selected");
    } else {
        selectedReceptionMessageIds.add(messageId);
        messageElement.classList.add("wa-message-selected");
    }

    const selectedCount = selectedReceptionMessageIds.size;
    console.log("Selected Reception messages:", selectedCount);
});

   
    // Open the message menu with right-click on desktop.
    messageElement.addEventListener("contextmenu", function (event) {
        event.preventDefault();

        showReceptionMessageContextMenu(
            messageElement,
            item,
            event.clientX,
            event.clientY
        );
    });

    // Open the message menu with a long-press on touchscreens.
    let receptionLongPressTimer = null;
    let receptionTouchStartX = 0;
    let receptionTouchStartY = 0;

    messageElement.addEventListener("touchstart", function (event) {
        if (event.touches.length !== 1) {
            return;
        }

        const touch = event.touches[0];

        receptionTouchStartX = touch.clientX;
        receptionTouchStartY = touch.clientY;

        receptionLongPressTimer = setTimeout(function () {
            showReceptionMessageContextMenu(
                messageElement,
                item,
                receptionTouchStartX,
                receptionTouchStartY
            );

            receptionLongPressTimer = null;
        }, 600);
    }, { passive: true });

    messageElement.addEventListener("touchmove", function (event) {
        if (!receptionLongPressTimer) {
            return;
        }

        const touch = event.touches[0];

        if (
            !touch ||
            Math.abs(touch.clientX - receptionTouchStartX) > 10 ||
            Math.abs(touch.clientY - receptionTouchStartY) > 10
        ) {
            clearTimeout(receptionLongPressTimer);
            receptionLongPressTimer = null;
        }
    }, { passive: true });

    messageElement.addEventListener("touchend", function () {
        if (receptionLongPressTimer) {
            clearTimeout(receptionLongPressTimer);
            receptionLongPressTimer = null;
        }
    });

    messageElement.addEventListener("touchcancel", function () {
        if (receptionLongPressTimer) {
            clearTimeout(receptionLongPressTimer);
            receptionLongPressTimer = null;
        }
    });


    let sentDate = null;

    if (item.createdAt) {
        sentDate = item.createdAt.toDate
            ? item.createdAt.toDate()
            : new Date(item.createdAt);
    }

   if (sentDate && !isNaN(sentDate.getTime())) {
    messageElement.dataset.createdAt = sentDate.toISOString();
}

    // Add a date separator when the message day changes.
    if (sentDate && !isNaN(sentDate.getTime())) {

        const messageDateKey = [
            sentDate.getFullYear(),
            String(sentDate.getMonth() + 1).padStart(2, "0"),
            String(sentDate.getDate()).padStart(2, "0")
        ].join("-");

        if (messageDateKey !== previousMessageDate) {

            const dateSeparator =
                document.createElement("div");

            dateSeparator.className = "wa-date-separator";

            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);

            function getDateKey(date) {
                return [
                    date.getFullYear(),
                    String(date.getMonth() + 1).padStart(2, "0"),
                    String(date.getDate()).padStart(2, "0")
                ].join("-");
            }

            if (messageDateKey === getDateKey(today)) {
                dateSeparator.textContent = "Today";
            } else if (
                messageDateKey === getDateKey(yesterday)
            ) {
                dateSeparator.textContent = "Yesterday";
            } else {
                dateSeparator.textContent =
                    sentDate.toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    });
            }

            messagesContainer.appendChild(dateSeparator);
            previousMessageDate = messageDateKey;
        }
    }
  


if (
    item.attachmentUrl &&
    item.attachmentType &&
    item.attachmentType.startsWith("audio/")
) {
    const isVoiceNote =
        item.attachmentName === "voice-note.webm";

    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.src = item.attachmentUrl;

    if (isVoiceNote) {
        // COMPACT VOICE NOTE PLAYER
        const voiceNote = document.createElement("div");
        voiceNote.className = "wa-voice-note";

        const playButton = document.createElement("button");
        playButton.type = "button";
        playButton.className = "wa-voice-play";
        playButton.setAttribute("aria-label", "Play voice note");

        const playIcon = `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" fill="currentColor"/>
            </svg>
        `;

        const pauseIcon = `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 5h4v14H7zM14 5h4v14h-4z"
                    fill="currentColor"/>
            </svg>
        `;

        playButton.innerHTML = playIcon;

        const waveform = document.createElement("div");
        waveform.className = "wa-voice-waveform";

        const barHeights = [
            9, 15, 22, 13, 27, 18, 11, 24, 31,
            17, 12, 26, 20, 34, 15, 23, 11, 29,
            18, 25, 13, 32, 21, 14, 27, 17, 10,
            24, 19, 30, 13, 22, 16, 28, 11, 20
        ];

        barHeights.forEach(function (height) {
            const bar = document.createElement("span");
            bar.className = "wa-voice-bar";
            bar.style.height = height + "px";
            waveform.appendChild(bar);
        });

        const time = document.createElement("div");
        time.className = "wa-voice-time";

        const elapsed = document.createElement("span");
        elapsed.textContent = "0:00";

        const duration = document.createElement("span");
        duration.textContent = "--:--";

        time.append(elapsed, duration);
        voiceNote.append(audio, playButton, waveform, time);

        const bars = Array.from(
            waveform.querySelectorAll(".wa-voice-bar")
        );

        function formatTime(seconds) {
            if (!Number.isFinite(seconds) || seconds < 0) {
                return "0:00";
            }

            return Math.floor(seconds / 60) + ":" +
                String(Math.floor(seconds % 60)).padStart(2, "0");
        }

        function updateProgress() {
            const total = audio.duration;
            const progress = Number.isFinite(total) && total > 0
                ? Math.min(1, audio.currentTime / total)
                : 0;

            elapsed.textContent = formatTime(audio.currentTime);

            bars.forEach(function (bar, index) {
                bar.classList.toggle(
                    "played",
                    index < progress * bars.length
                );
            });
        }

        audio.addEventListener("loadedmetadata", function () {
            duration.textContent = formatTime(audio.duration);
            updateProgress();
        });

        audio.addEventListener("timeupdate", updateProgress);

        audio.addEventListener("play", function () {
            playButton.innerHTML = pauseIcon;
            playButton.setAttribute("aria-label", "Pause voice note");
        });

        audio.addEventListener("pause", function () {
            playButton.innerHTML = playIcon;
            playButton.setAttribute("aria-label", "Play voice note");
        });

        audio.addEventListener("ended", function () {
            audio.currentTime = 0;
            updateProgress();
        });

        playButton.addEventListener("click", function () {
            if (audio.paused) {
                audio.play().catch(function (error) {
                    console.error("Voice note playback failed:", error);
                });
            } else {
                audio.pause();
            }
        });

        waveform.addEventListener("click", function (event) {
            if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
                return;
            }

            const rect = waveform.getBoundingClientRect();
            const fraction = Math.max(
                0,
                Math.min(1, (event.clientX - rect.left) / rect.width)
            );

            audio.currentTime = fraction * audio.duration;
            updateProgress();
        });

        messageElement.appendChild(voiceNote);

    } else {
        // MUSIC PLAYER
        const musicPlayer = document.createElement("div");
        musicPlayer.className = "wa-music-player";

        const musicTop = document.createElement("div");
        musicTop.className = "wa-music-top";

        const musicIcon = document.createElement("div");
        musicIcon.className = "wa-music-icon";
        musicIcon.innerHTML = `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 18V5l12-2v13"
                    fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round"/>
                <circle cx="6" cy="18" r="3" fill="currentColor"/>
                <circle cx="18" cy="16" r="3" fill="currentColor"/>
            </svg>
        `;

        const musicInfo = document.createElement("div");
        musicInfo.className = "wa-music-info";

        const fileName = document.createElement("div");
        fileName.className = "wa-music-filename";
        fileName.textContent = item.attachmentName || "Audio file";
        fileName.title = fileName.textContent;

        const musicLabel = document.createElement("div");
        musicLabel.className = "wa-music-label";
        musicLabel.textContent = "Audio";

        musicInfo.append(fileName, musicLabel);

        const playButton = document.createElement("button");
        playButton.type = "button";
        playButton.className = "wa-music-play";
        playButton.setAttribute("aria-label", "Play audio");
        playButton.innerHTML = `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" fill="currentColor"/>
            </svg>
        `;

        musicTop.append(musicIcon, musicInfo, playButton);

        const progressTrack = document.createElement("input");
        progressTrack.type = "range";
        progressTrack.className = "wa-music-progress";
        progressTrack.min = "0";
        progressTrack.max = "1000";
        progressTrack.value = "0";
        progressTrack.setAttribute("aria-label", "Seek through audio");

        const musicTime = document.createElement("div");
        musicTime.className = "wa-music-time";

        const currentTime = document.createElement("span");
        currentTime.textContent = "0:00";

        const totalTime = document.createElement("span");
        totalTime.textContent = "--:--";

        musicTime.append(currentTime, totalTime);

        musicPlayer.append(audio, musicTop, progressTrack, musicTime);

        function formatMusicTime(seconds) {
            if (!Number.isFinite(seconds) || seconds < 0) {
                return "0:00";
            }

            return Math.floor(seconds / 60) + ":" +
                String(Math.floor(seconds % 60)).padStart(2, "0");
        }

        function updateMusicProgress() {
            const total = audio.duration;
            const progress = Number.isFinite(total) && total > 0
                ? audio.currentTime / total
                : 0;

            currentTime.textContent = formatMusicTime(audio.currentTime);
            progressTrack.value = String(Math.round(progress * 1000));
            progressTrack.style.setProperty(
                "--music-progress",
                (progress * 100) + "%"
            );
        }

        audio.addEventListener("loadedmetadata", function () {
            totalTime.textContent = formatMusicTime(audio.duration);
            updateMusicProgress();
        });

        audio.addEventListener("timeupdate", updateMusicProgress);

        audio.addEventListener("play", function () {
            playButton.innerHTML = `
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 5h4v14H7zM14 5h4v14h-4z"
                        fill="currentColor"/>
                </svg>
            `;
            playButton.setAttribute("aria-label", "Pause audio");
        });

        audio.addEventListener("pause", function () {
            playButton.innerHTML = `
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                </svg>
            `;
            playButton.setAttribute("aria-label", "Play audio");
        });

        audio.addEventListener("ended", function () {
            audio.currentTime = 0;
            updateMusicProgress();
        });

        playButton.addEventListener("click", function () {
            if (audio.paused) {
                audio.play().catch(function (error) {
                    console.error("Music playback failed:", error);
                });
            } else {
                audio.pause();
            }
        });

        progressTrack.addEventListener("input", function () {
            if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
                return;
            }

            audio.currentTime =
                (Number(progressTrack.value) / 1000) * audio.duration;

            updateMusicProgress();
        });

        messageElement.appendChild(musicPlayer);
    }


} else if (
    item.attachmentUrl &&
    item.attachmentType &&
    item.attachmentType.startsWith("video/")
) {
    // VIDEO ATTACHMENT WITH CUSTOM CONTROLS
    const videoContainer = document.createElement("div");
    videoContainer.className = "wa-video-attachment";

   const video = document.createElement("video");
   video.className = "wa-video-player";
   video.src = item.attachmentUrl;
   video.controls = false;
   video.preload = "metadata";
   video.tabIndex = -1;
   video.style.pointerEvents = "none";
   video.playsInline = true;

   video.setAttribute(
    "aria-label",
    item.attachmentName || "Guest video"
);
    const controls = document.createElement("div");
    controls.className = "wa-video-controls";

    const playButton = document.createElement("button");
    playButton.type = "button";
    playButton.className = "wa-video-play";
    playButton.textContent = "▶";
    playButton.setAttribute("aria-label", "Play video");

    const timeDisplay = document.createElement("span");
    timeDisplay.className = "wa-video-time";
    timeDisplay.textContent = "0:00 / 0:00";

    const progress = document.createElement("input");
    progress.type = "range";
    progress.className = "wa-video-progress";
    progress.min = "0";
    progress.max = "1000";
    progress.value = "0";
    progress.setAttribute("aria-label", "Video progress");

    const volume = document.createElement("input");
    volume.type = "range";
    volume.className = "wa-video-volume";
    volume.min = "0";
    volume.max = "1";
    volume.step = "0.1";
    volume.value = "1";
    volume.setAttribute("aria-label", "Video volume");

    function formatVideoTime(seconds) {
        if (!Number.isFinite(seconds)) return "0:00";

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return minutes + ":" + String(remainingSeconds).padStart(2, "0");
    }

    function updateVideoControls() {
        const duration = video.duration || 0;
        const currentTime = video.currentTime || 0;

        timeDisplay.textContent =
            formatVideoTime(currentTime) + " / " +
            formatVideoTime(duration);

        progress.value = duration
            ? String(Math.round((currentTime / duration) * 1000))
            : "0";

        playButton.textContent = video.paused ? "▶" : "❚❚";
        playButton.setAttribute(
            "aria-label",
            video.paused ? "Play video" : "Pause video"
        );
    }

   playButton.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();

    // Open the larger video preview instead of playing
    // the video inside the message bubble.
    video.dispatchEvent(new Event("click"));
});
    video.addEventListener("loadedmetadata", updateVideoControls);
    video.addEventListener("timeupdate", updateVideoControls);
    video.addEventListener("play", updateVideoControls);
    video.addEventListener("pause", updateVideoControls);
    video.addEventListener("ended", updateVideoControls);

    progress.addEventListener("input", function () {
        if (Number.isFinite(video.duration) && video.duration > 0) {
            video.currentTime =
                (Number(progress.value) / 1000) * video.duration;
        }
    });

    volume.addEventListener("input", function () {
        video.volume = Number(volume.value);
        video.muted = video.volume === 0;
    });

    controls.append(playButton, timeDisplay, progress, volume);
    videoContainer.append(video, controls);

    // Open a larger preview when the video itself is clicked.
    video.addEventListener("click", function () {
        let overlay = document.getElementById("waVideoPreviewOverlay");

        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "waVideoPreviewOverlay";
            overlay.className = "wa-video-preview-overlay";

            const previewPanel = document.createElement("div");
            previewPanel.className = "wa-video-preview-panel";

            const closeButton = document.createElement("button");
            closeButton.type = "button";
            closeButton.className = "wa-video-preview-close";
            closeButton.textContent = "✕";
            closeButton.setAttribute("aria-label", "Close video preview");

            const previewContainer = document.createElement("div");
            previewContainer.className = "wa-video-preview-content";

            closeButton.addEventListener("click", function () {
                const previewVideo = previewContainer.querySelector("video");

                if (previewVideo) previewVideo.pause();

                overlay.style.display = "none";
                previewContainer.replaceChildren();
            });

            overlay.addEventListener("click", function (event) {
                if (event.target === overlay) {
                    closeButton.click();
                }
            });

            previewPanel.append(closeButton, previewContainer);
            overlay.appendChild(previewPanel);
            document.body.appendChild(overlay);

            document.addEventListener("keydown", function (event) {
                if (event.key === "Escape" && overlay.style.display === "flex") {
                    closeButton.click();
                }
            });
        }

        const previewContainer =
            overlay.querySelector(".wa-video-preview-content");

        previewContainer.replaceChildren();

        const previewVideo = document.createElement("video");
        previewVideo.className = "wa-video-preview-player";
        previewVideo.src = item.attachmentUrl;
        previewVideo.controls = false;
        previewVideo.preload = "metadata";
        previewVideo.playsInline = true;
        previewVideo.volume = video.volume;
        previewVideo.muted = video.muted;
        previewVideo.currentTime = video.currentTime || 0;

        // Build custom controls for the larger preview too.
        const previewControls = controls.cloneNode(true);
        const previewPlay = previewControls.querySelector(".wa-video-play");
        const previewTime = previewControls.querySelector(".wa-video-time");
        const previewProgress =
            previewControls.querySelector(".wa-video-progress");
        const previewVolume =
            previewControls.querySelector(".wa-video-volume");

        previewVolume.value = String(previewVideo.volume);

        function updatePreviewControls() {
            const duration = previewVideo.duration || 0;

            previewTime.textContent =
                formatVideoTime(previewVideo.currentTime) + " / " +
                formatVideoTime(duration);

            previewProgress.value = duration
                ? String(Math.round(
                    (previewVideo.currentTime / duration) * 1000
                ))
                : "0";

            previewPlay.textContent = previewVideo.paused ? "▶" : "❚❚";
            previewPlay.setAttribute(
                "aria-label",
                previewVideo.paused ? "Play video" : "Pause video"
            );
        }

        previewPlay.addEventListener("click", function () {
            if (previewVideo.paused) {
                previewVideo.play().catch(function (error) {
                    console.error("Preview playback failed:", error);
                });
            } else {
                previewVideo.pause();
            }
        });

        previewProgress.addEventListener("input", function () {
            if (previewVideo.duration > 0) {
                previewVideo.currentTime =
                    (Number(previewProgress.value) / 1000) *
                    previewVideo.duration;
            }
        });

        previewVolume.addEventListener("input", function () {
            previewVideo.volume = Number(previewVolume.value);
            previewVideo.muted = previewVideo.volume === 0;
        });

        previewVideo.addEventListener("loadedmetadata", updatePreviewControls);
        previewVideo.addEventListener("timeupdate", updatePreviewControls);
        previewVideo.addEventListener("play", updatePreviewControls);
        previewVideo.addEventListener("pause", updatePreviewControls);
        previewVideo.addEventListener("ended", updatePreviewControls);

        previewContainer.append(previewVideo, previewControls);
        overlay.style.display = "flex";

        previewVideo.play().catch(function () {
            // If autoplay is blocked, the user can press Play.
        });
    });

    if (item.attachmentName) {
        const videoName = document.createElement("div");
        videoName.className = "wa-video-filename";
        videoName.textContent = item.attachmentName;
        videoContainer.appendChild(videoName);
    }

    messageElement.appendChild(videoContainer);


} else if (
    item.attachmentUrl &&
    item.attachmentType &&
    item.attachmentType.startsWith("image/")
) {
    // IMAGE ATTACHMENT WITH LARGE PREVIEW
    const image = document.createElement("img");
    image.className = "wa-image-attachment";
    image.src = item.attachmentUrl;
    image.alt = item.attachmentName || "Guest image";
    image.loading = "lazy";
    image.style.cursor = "zoom-in";

    image.addEventListener("click", function () {
        // Create the preview overlay.
        const overlay = document.createElement("div");
        overlay.className = "wa-image-preview-overlay";

        const panel = document.createElement("div");
        panel.className = "wa-image-preview-panel";

        const toolbar = document.createElement("div");
        toolbar.className = "wa-image-preview-toolbar";

        const zoomOutButton = document.createElement("button");
        zoomOutButton.type = "button";
        zoomOutButton.textContent = "−";
        zoomOutButton.title = "Zoom out";
        zoomOutButton.setAttribute("aria-label", "Zoom out");

        const zoomLabel = document.createElement("span");
        zoomLabel.className = "wa-image-zoom-label";
        zoomLabel.textContent = "100%";

        const zoomInButton = document.createElement("button");
        zoomInButton.type = "button";
        zoomInButton.textContent = "+";
        zoomInButton.title = "Zoom in";
        zoomInButton.setAttribute("aria-label", "Zoom in");

        const rotateLeftButton = document.createElement("button");
        rotateLeftButton.type = "button";
        rotateLeftButton.textContent = "↶";
        rotateLeftButton.title = "Rotate left";
        rotateLeftButton.setAttribute("aria-label", "Rotate left");

        const rotateRightButton = document.createElement("button");
        rotateRightButton.type = "button";
        rotateRightButton.textContent = "↷";
        rotateRightButton.title = "Rotate right";
        rotateRightButton.setAttribute("aria-label", "Rotate right");

        const resetButton = document.createElement("button");
        resetButton.type = "button";
        resetButton.textContent = "⟲";
        resetButton.title = "Reset view";
        resetButton.setAttribute("aria-label", "Reset zoom and rotation");

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.textContent = "✕";
        closeButton.title = "Close preview";
        closeButton.setAttribute("aria-label", "Close image preview");
        closeButton.className = "wa-image-preview-close";

        toolbar.append(
            zoomOutButton,
            zoomLabel,
            zoomInButton,
            rotateLeftButton,
            rotateRightButton,
            resetButton,
            closeButton
        );

        const viewport = document.createElement("div");
        viewport.className = "wa-image-preview-viewport";

        const previewImage = document.createElement("img");
        previewImage.className = "wa-image-preview-full";
        previewImage.src = item.attachmentUrl;
        previewImage.alt = item.attachmentName || "Image preview";

        viewport.appendChild(previewImage);
        panel.append(toolbar, viewport);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        let zoom = 1;
        let rotation = 0;

        function updateImageView() {
            previewImage.style.transform =
                "scale(" + zoom + ") rotate(" + rotation + "deg)";
            zoomLabel.textContent = Math.round(zoom * 100) + "%";
            zoomOutButton.disabled = zoom <= 0.25;
            zoomInButton.disabled = zoom >= 4;
        }

        zoomInButton.addEventListener("click", function () {
            zoom = Math.min(4, zoom + 0.25);
            updateImageView();
        });

        zoomOutButton.addEventListener("click", function () {
            zoom = Math.max(0.25, zoom - 0.25);
            updateImageView();
        });

        rotateLeftButton.addEventListener("click", function () {
            rotation -= 90;
            updateImageView();
        });

        rotateRightButton.addEventListener("click", function () {
            rotation += 90;
            updateImageView();
        });

        resetButton.addEventListener("click", function () {
            zoom = 1;
            rotation = 0;
            viewport.scrollTop = 0;
            viewport.scrollLeft = 0;
            updateImageView();
        });

        // Zoom using the mouse wheel on desktop.
        viewport.addEventListener("wheel", function (event) {
            event.preventDefault();

            zoom = event.deltaY < 0
                ? Math.min(4, zoom + 0.15)
                : Math.max(0.25, zoom - 0.15);

            updateImageView();
        }, { passive: false });

        function closePreview() {
            document.removeEventListener("keydown", handleEscape);
            overlay.remove();
        }

        function handleEscape(event) {
            if (event.key === "Escape") {
                closePreview();
            }
        }

        closeButton.addEventListener("click", closePreview);

        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) {
                closePreview();
            }
        });

        document.addEventListener("keydown", handleEscape);

        updateImageView();
    });

    messageElement.appendChild(image);

} else if (
    item.attachmentUrl &&
    item.attachmentType &&
    item.attachmentType.startsWith("audio/")
) {
    // AUDIO OR SONG ATTACHMENT
    const audio = document.createElement("audio");
    audio.className = "wa-audio-attachment";
    audio.controls = true;
    audio.preload = "metadata";
    audio.src = item.attachmentUrl;

    audio.setAttribute(
        "aria-label",
        item.attachmentName || "Audio attachment"
    );

    messageElement.appendChild(audio);

    const audioName = document.createElement("a");
    audioName.className = "wa-file-attachment";
    audioName.href = item.attachmentUrl;
    audioName.target = "_blank";
    audioName.rel = "noopener noreferrer";
    audioName.textContent =
        item.attachmentName || "Open audio file";

    messageElement.appendChild(audioName);

} else if (
    item.attachmentUrl &&
    item.attachmentType &&
    item.attachmentType.startsWith("video/")
) {
    // VIDEO ATTACHMENT
    const video = document.createElement("video");
    video.className = "wa-video-attachment";
    video.controls = true;
    video.preload = "metadata";
    video.src = item.attachmentUrl;
    video.playsInline = true;
    video.style.maxWidth = "100%";

    messageElement.appendChild(video);

    const videoName = document.createElement("a");
    videoName.className = "wa-file-attachment";
    videoName.href = item.attachmentUrl;
    videoName.target = "_blank";
    videoName.rel = "noopener noreferrer";
    videoName.textContent =
        item.attachmentName || "Open video";

    messageElement.appendChild(videoName);

} else if (item.attachmentUrl) {
    // PDF OR OTHER DOCUMENT ATTACHMENT
    const fileLink = document.createElement("a");
    fileLink.className = "wa-file-attachment";
    fileLink.href = item.attachmentUrl;
    fileLink.target = "_blank";
    fileLink.rel = "noopener noreferrer";
    fileLink.textContent =
        "📎 " + (item.attachmentName || "Open attachment");

    messageElement.appendChild(fileLink);

} else {
    // ORDINARY TEXT MESSAGE
    const textElement = document.createElement("span");
    textElement.className = "wa-message-text";
    textElement.textContent =
        item.message || "[Message text unavailable]";

    messageElement.appendChild(textElement);
}

    // Display the message's sent time.
    const timeElement =
        document.createElement("span");

    if (sentDate && !isNaN(sentDate.getTime())) {
        timeElement.textContent =
            sentDate.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit"
            });
    } else {
        timeElement.textContent = "";
    }

    timeElement.className = "wa-message-time";
    messageElement.appendChild(timeElement);

    
 // Add message-status ticks to Reception messages only.
if (item.sender === "reception") {
    const ticksElement = document.createElement("span");
    ticksElement.className = "wa-message-ticks";
    ticksElement.textContent = "✓✓";

    if (item.guestReadAt) {
        // Blue ticks: the guest has read the message.
        ticksElement.style.color = "#53bdeb";
        ticksElement.setAttribute("aria-label", "Read by guest");
    } else if (item.guestDeliveredAt) {
        // Grey ticks: the message reached the guest website.
        ticksElement.style.color = "#aeb8b3";
        ticksElement.setAttribute("aria-label", "Delivered to guest");
    } else {
        // No confirmed delivery yet.
        ticksElement.style.color = "#aeb8b3";
        ticksElement.setAttribute("aria-label", "Sent");
    }

    messageElement.appendChild(ticksElement);
}


    messagesContainer.appendChild(messageElement);

});

messagesContainer.scrollTop =
messagesContainer.scrollHeight;
    

            },
            function (error) {
                console.error(
                    "Reception message loading error:",
                    error
                );

                messagesContainer.innerHTML =
                    "<p>Unable to load messages. Check the console.</p>";
            }
        );


const replyForm =
    document.getElementById("liveChatReplyForm");

const replyInput =
    document.getElementById("liveChatReplyInput");


replyForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const reply = replyInput.value.trim();
   const file =
    recordedVoiceFile ||
    attachmentInput?.files?.[0] ||
    null;

    // Allow text-only, attachment-only, or combined messages.
    if (!reply && !file) {
        return;
    }

    const sendButton =
        replyForm.querySelector('button[type="submit"]');

    if (sendButton) {
        sendButton.disabled = true;
    }

    try {
        let attachment = null;

        // Upload the selected file to Cloudinary first.
        if (file) {
            const uploadData = new FormData();

            uploadData.append("file", file);
            uploadData.append(
                "upload_preset",
                "mirima_chat_uploads"
            );

            const response = await fetch(
                "https://api.cloudinary.com/v1_1/cqsnkbge/auto/upload",
                {
                    method: "POST",
                    body: uploadData
                }
            );

            const uploadResult = await response.json();

            if (!response.ok || !uploadResult.secure_url) {
                console.error(
                    "Cloudinary upload failed:",
                    uploadResult
                );

                throw new Error("Attachment upload failed.");
            }

            attachment = {
                attachmentUrl: uploadResult.secure_url,
                attachmentName: file.name,
                attachmentType:
                    file.type || "application/octet-stream",
                attachmentSize: file.size
            };
        }

        // Save the message using the existing chat function.
        await sendChatMessage(
            conversation.id,
            "reception",
            reply,
            attachment
        );

        // Clear the composer only after a successful send.
        replyInput.value = "";

if (attachmentInput) {
    attachmentInput.value = "";
}

recordedVoiceFile = null;

if (voiceButton) {
    voiceButton.title = "Record voice note";
    voiceButton.setAttribute(
        "aria-label",
        "Record voice note"
    );
}
       
    } catch (error) {
        console.error(
            "Reception message or attachment failed:",
            error
        );

        alert(
            "Message or attachment could not be sent. Please try again."
        );

    } finally {
        if (sendButton) {
            sendButton.disabled = false;
        }
    }
});
   
 }
