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
    doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// =========================================================
// HOUSEKEEPING DASHBOARD
// =========================================================

function renderHousekeepingDashboard(session) {

    const loginScreen =
        document.getElementById("loginScreen");

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

}

// =========================================================
// SHOW RECEPTION DASHBOARD
// =========================================================

export function showDashboard(session) {

       if (session.role === "housekeeping") {

        renderHousekeepingDashboard(session);

        return;
    }

    const loginScreen =
        document.getElementById("loginScreen");


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
// Setup navigation

    setupReceptionNavigation(session);

     updateRequestCount();

    // Setup mobile menu

    setupMobileMenu();


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

            title.textContent =
                "Live Chat";

            content.innerHTML =
                getChatContent();

            break;


        case "billing":

            title.textContent =
                "Billing & Receipts";

            content.innerHTML =
              await getBillingContent();
          
       setupReceiptButtons();
       setupBillingViewButtons();

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

                    openPaymentReceipt(
                        card.dataset.paymentId
                    );

                }
            );

        });

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
// =========================================================
// BILL DETAILS
// =========================================================

async function openCottageBill(cottageId) {

    const bill = getCottageBill(cottageId);

   const payments = await getCottagePayments(cottageId);
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

   const activeGuests =
    await getActiveGuests();

const guest =
    activeGuests.find(function (item) {
        return item.cottageId === cottageId;
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
const addChargeButton =
    document.getElementById("billingAddChargeButton");

if (addChargeButton) {

    addChargeButton.addEventListener(
        "click",
     async function () {
        
            const chargeDescription =
                prompt("Enter charge description:");

            const chargeAmount =
                prompt("Enter charge amount in UGX:");

            if (
                chargeDescription &&
                chargeAmount &&
                Number(chargeAmount) > 0
            ) {

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

                openCottageBill(cottageId);

                alert("Charge added successfully.");
            }
        }
    );

}

const recordPaymentButton =
    document.getElementById("billingRecordPaymentButton");

if (recordPaymentButton) {

    recordPaymentButton.addEventListener(
        "click",
        async function () {

            const paymentAmount =
    prompt("Enter payment amount in UGX:");

        if (
    !paymentAmount ||
    !/^\d+$/.test(paymentAmount.trim()) ||
    Number(paymentAmount) <= 0
) {
    alert(
        "Invalid payment amount.\n\n" +
        "Please enter numbers only."
    );

    return;
}

if (Number(paymentAmount) > balanceDue) {

    alert(
        "Payment amount is greater than the outstanding balance.\n\n" +
        "Balance Due: UGX " +
        balanceDue.toLocaleString() +
        "\nPayment Entered: UGX " +
        Number(paymentAmount).toLocaleString() +
        "\n\nPlease check the amount and try again."
    );

    return;
}
           
       const paymentMethod =
    prompt(
        "Enter payment method:\n\nMobile Money\nCard\nPay at Reception"
    );

           if (
    paymentMethod !== "Mobile Money" &&
    paymentMethod !== "Card" &&
    paymentMethod !== "Pay at Reception"
) {
    return;
}

           let mobileMoneyName = "";
let mobileMoneyPhone = "";
let transactionId = "";

if (paymentMethod === "Mobile Money") {

    mobileMoneyName =
        prompt("Enter the name registered on the Mobile Money account:");

    if (!mobileMoneyName || !mobileMoneyName.trim()) {

        alert(
            "Invalid account name.\n\n" +
            "Please enter the name registered on the Mobile Money account."
        );

        return;
    }

    mobileMoneyPhone =
        prompt(
            "Enter the phone number used for payment:\n\n" +
            "Format: 256XXXXXXXXX"
        );

    if (
        !/^256\d{9}$/.test(
            mobileMoneyPhone.trim()
        )
    ) {

        alert(
            "Invalid phone number.\n\n" +
            "The number must start with 256 and contain exactly 12 digits.\n\n" +
            "Example: 256701234567"
        );

        return;
    }

    transactionId =
        prompt(
            "Enter the Mobile Money Transaction ID:\n\n" +
            "The Transaction ID must contain exactly 12 characters."
        );

   if (
    !transactionId ||
    !/^[A-Za-z0-9]{12}$/.test(
        transactionId.trim()
    )
) {

        alert(
            "Invalid Transaction ID.\n\n" +
            "The Transaction ID must contain exactly 12 characters."
        );

        return;
    }
}
           
console.log("Selected payment method:", paymentMethod);

           if (
    paymentMethod !== "Mobile Money" &&
    paymentMethod !== "Card" &&
    paymentMethod !== "Pay at Reception"
) {
    return;
}

           console.log("Saving payment:", {
    cottageId: cottageId,
    amount: Number(paymentAmount),
    paymentMethod: paymentMethod
});
          const paymentResult =
    await addPayment({
        cottageId: cottageId,
        guestName: guest ? guest.name : "",
        amount: parseInt(paymentAmount.trim(), 10),
        paymentMethod: paymentMethod,
        mobileMoneyName: mobileMoneyName,
        mobileMoneyPhone: mobileMoneyPhone,
        transactionId: transactionId,
        status: "Verified"
    });

if (!paymentResult.success) {
    alert("Failed to record payment.");
    return;
}

openCottageBill(cottageId);

alert("Payment recorded successfully.");

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
        await getCottagePayments(guest.cottageId);
}

   const cottagePaidTotals = {};

for (const cottageId in cottagePayments) {
    cottagePaidTotals[cottageId] =
        cottagePayments[cottageId].reduce(
            function (total, payment) {
                return total + Number(payment.amount || 0);
            },
            0
        );
}
   const cottageBalances = {};

for (const guest of activeGuests) {
    const totalBill = getBillTotal(guest.cottageId);
    const totalPaid = cottagePaidTotals[guest.cottageId] || 0;

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
            return request.service.includes("Airport Transfer");
            }).length
          )}


         ${createRequestCategory(
    "🧳",
    "Luggage Assistance",
    "Assist guests with luggage.",
    requests.filter(function (request) {
        return request.service.includes("Luggage Assistance");
    }).length
)}

${createRequestCategory(
    "📅",
    "Extend Your Stay",
    "Review and manage stay extensions.",
    requests.filter(function (request) {
        return request.service.includes("Extend");
    }).length
)}

${createRequestCategory(
    "🔧",
    "Maintenance Request",
    "Receive and coordinate maintenance issues.",
    requests.filter(function (request) {
        return request.service.includes("Maintenance Request");
    }).length
)}

${createRequestCategory(
    "🚨",
    "Emergency Assistance",
    "Handle urgent guest assistance.",
    requests.filter(function (request) {
        return request.service.includes("Emergency Assistance");
    }).length
)}

${createRequestCategory(
    "💬",
    "Speak to Reception",
    "Open the live guest conversation.",
    requests.filter(function (request) {
        return request.service.includes("Other Assistance");
    }).length
)}
          ${createRequestCategory(
    "💳",
    "Billing Help",
    "Assist guests with billing questions and payment issues.",
    requests.filter(function (request) {
        return request.service.includes("Billing Help");
    }).length
)}

${createRequestCategory(
    "💱",
    "Exchange",
    "Handle guest currency exchange requests.",
    requests.filter(function (request) {
        return request.service.includes("Exchange");
    }).length
)}

${createRequestCategory(
    "🌙",
    "Late Checkout",
    "Review guest requests for late checkout.",
    requests.filter(function (request) {
        return request.service.includes("Late Checkout");
    }).length
)}

${createRequestCategory(
    "💰",
    "Make Payment",
    "Review and assist with guest payment requests.",
    requests.filter(function (request) {
        return (
    request.service.includes("Make Payment") ||
    request.service.includes("Payment at Reception") ||
    request.service.includes("Mobile Money Payment")
);
    }).length
)}

${createRequestCategory(
    "🧾",
    "Receipt",
    "Review guest requests for receipts.",
    requests.filter(function (request) {
        return request.service.includes("Receipt");
    }).length
)}

${createRequestCategory(
    "🐒",
    "Chimpanzee Trekking",
    "Review guest requests for chimpanzee trekking.",
    requests.filter(function (request) {
        return request.service.includes("Chimpanzee Trekking");
    }).length
)}

${createRequestCategory(
    "🦓",
    "Wildlife Viewing",
    "Review guest requests for wildlife viewing.",
    requests.filter(function (request) {
        return request.service.includes("Wildlife Viewing");
    }).length
)}

${createRequestCategory(
    "🌋",
    "Crater Lake Tour",
    "Review guest requests for crater lake tours.",
    requests.filter(function (request) {
        return request.service.includes("Crater Lake Tour");
    }).length
)}

${createRequestCategory(
    "🌳",
    "Forest Nature Walk",
    "Review guest requests for forest nature walks.",
    requests.filter(function (request) {
        return request.service.includes("Forest Nature Walk");
    }).length
)}

${createRequestCategory(
    "🔥",
    "Evening Campfire",
    "Review guest requests for evening campfires.",
    requests.filter(function (request) {
        return request.service.includes("Evening Campfire");
    }).length
)}

${createRequestCategory(
    "📸",
    "Photography Tour",
    "Review guest requests for photography tours.",
    requests.filter(function (request) {
        return request.service.includes("Photography Tour");
    }).length
)}

${createRequestCategory(
    "🍽️",
    "Restaurant & Bar",
    "Manage guest restaurant and bar requests.",
    requests.filter(function (request) {
        return (
            request.service.includes("Reserve a Table") ||
            request.service.includes("Bar Menu") ||
            request.service.includes("Room Dining") ||
            request.service.includes("Restaurant Menu")
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

           <span class="request-category-count">
             ${count}
           </span>
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


        <div class="chat-empty-state">

            <div class="chat-empty-icon">
                ✉
            </div>

            <h4>
                No active conversations
            </h4>

            <p>
                When a guest selects "Speak to Reception"
                in Mirima Connect, their conversation will
                appear here.
            </p>

        </div>

    `;

}


// =========================================================
// BILLING
// =========================================================

async function getBillingContent() {

    const cottages = getCottages();
   
    const activeGuests = await getActiveGuests();

   const payments = await getPayments();

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

            <div class="billing-receipts-section">

                <div class="billing-intro">

                    <p class="content-eyebrow">
                        PAYMENTS
                    </p>

                    <h3>
                        Receipts
                    </h3>

                   <p>
                  ${payments.length} payment${payments.length === 1 ? "" : "s"} recorded.
                 </p>

${payments.map(function (payment) {

    return `
        <div
    class="billing-receipt-card"
    data-payment-id="${payment.id}"
    >

            <strong>
                UGX ${Number(payment.amount).toLocaleString()}
            </strong>

            <span>
                ${escapeHTML(payment.paymentMethod)}
            </span>

        </div>
    `;

}).join("")}


                </div>

            </div>

        </div>
    `;
   
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
        .querySelectorAll(
            ".checkout-action"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    async function () {

                        const guestId =
                            button.dataset.checkoutGuest;

                        const result =
                            await removeGuest(guestId);
                       
                        console.log(
                            result
                        );
                       
if (result.success) {

   startNewCottageBill(
    button.dataset.cottageId
);
    renderReceptionSection(
        "guests",
        getCurrentSession()
    );

}
                       
                    }
                );

            }
        );

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
        }
    );

});
               
            }
        );

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
