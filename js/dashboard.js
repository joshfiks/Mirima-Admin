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
    startNewCottageBill
} from "./billing.js";
import {
    db
} from "./firebase.js";
import {
    collection,
    getDocs,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
// =========================================================
// SHOW RECEPTION DASHBOARD
// =========================================================

export function showDashboard(session) {

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


    // Setup navigation

    setupReceptionNavigation(session);

     updateRequestCount();

    // Setup mobile menu

    setupMobileMenu();


    // Setup logout

    setupReceptionLogout();

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

                    <strong>
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

                    <strong>
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

                    <strong>
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

                    <strong>
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


            <div class="empty-reception-state">

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


            <div class="request-preview">

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
                getGuestsContent();

            break;


        case "requests":
                   
            title.textContent =
                "Guest Requests";

          getRequestsContent().then(function (html) {
           content.innerHTML = html;
           setupRequestStatusButtons();
           setupRequestCategoryButtons();
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
                getBillingContent();

            break;


        case "emergency":

            title.textContent =
                "Emergency Alerts";

            content.innerHTML =
                getEmergencyContent();

            break;

    }

setupSectionButtons(session);
setupCheckoutButtons();
setupBillingButtons();
setupGuestModal();
}

// =========================================================
// BILL DETAILS
// =========================================================

function openCottageBill(cottageId) {

    const bill = getCottageBill(cottageId);
   
   const total =
    getBillTotal(cottageId);
   
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
        function () {

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
        addBillItem(
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
   
}

// =========================================================
// CURRENT GUESTS
// =========================================================

function getGuestsContent() {

    const cottages = getCottages();

    const activeGuests = getActiveGuests();

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
                        guest
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
            function (event) {

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
    addGuest(guestDetails);

console.log(
    result
);
if (result.success) {

    closeModal();

    renderReceptionSection(
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

function createCottageCard(
    cottage,
    guest
) {

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
    await updateDoc(
        doc(db, "requests", requestId),
        {
            status: newStatus
        }
    );
}

async function updateRequestCount() {
    const requests = await getRequestsFromFirestore();

    const requestCount =
        document.getElementById("requestCount");

    if (requestCount) {
        requestCount.textContent = requests.length;
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
                "Arrange guest airport transportation."
            )}


            ${createRequestCategory(
                "🧳",
                "Luggage Assistance",
                "Assist guests with luggage."
            )}


            ${createRequestCategory(
                "📅",
                "Extend Your Stay",
                "Review and manage stay extensions."
            )}


            ${createRequestCategory(
                "🔧",
                "Maintenance Request",
                "Receive and coordinate maintenance issues."
            )}


            ${createRequestCategory(
                "🚨",
                "Emergency Assistance",
                "Handle urgent guest assistance."
            )}


            ${createRequestCategory(
                "💬",
                "Speak to Reception",
                "Open the live guest conversation."
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
    "Handle guest currency exchange requests."
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

               <strong data-request-service="${request.service}">
                 ${request.service}
               </strong>

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
    <button data-status="Received">Received</button>
    <button data-status="In Progress">In Progress</button>
    <button data-status="Completed">Completed</button>
    <button data-status="Cancelled">Cancelled</button>
</div>

            </div>

            <div class="guest-request-details">

                <p>
                    Guest:  ${request.guestName || "Guest"}
                </p>

              <p>
               Request: ${request.details || "No additional details"}
             </p>

            <p>
    Requested at:
    ${
       request.createdAt
            ? request.createdAt.toDate().toLocaleString()
            : "Time unavailable"
    }
</p>
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

function getBillingContent() {

    const cottages = getCottages();
    const activeGuests = getActiveGuests();

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

        </div>
    `;
}

// =========================================================
// EMERGENCY
// =========================================================

function getEmergencyContent() {

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
                    function () {

                        const guestId =
                            button.dataset.checkoutGuest;

                        const result =
                            removeGuest(guestId);

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

function setupRequestCategoryButtons() {

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

                const requestsList =
               document.querySelector(
              ".guest-requests-list"
            );

               const categoryGrid =
    document.querySelector(
        ".request-category-grid"
    );

if (requestsList) {
    requestsList.style.display = "block";
}
               if (categoryGrid) {
    categoryGrid.style.display = "none";
}

const allRequests =
    document.querySelectorAll(
        ".guest-request-card"
    );

allRequests.forEach(function (requestCard) {

    requestCard.style.display = "none";

    const service =
        requestCard
            .querySelector("[data-request-service]")
            ?.textContent
            .trim();

   if (service.includes(normalizedCategory)) {
    requestCard.style.display = "block";
}
});
        
            }
        );

    });
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
