/* =========================================================
   MIRIMA ADMIN — APPLICATION ENTRY POINT
   =========================================================

   This file connects the different modules of Mirima Admin.

   Authentication is handled by auth.js.
*/


// =========================================================
// IMPORT AUTHENTICATION FUNCTIONS
// =========================================================

import {
    loginUser,
    getCurrentSession,
    logoutUser
} from "./auth.js";


// =========================================================
// DOM ELEMENTS
// =========================================================

const loginScreen =
    document.getElementById("loginScreen");

const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");

const loginButton =
    document.getElementById("loginButton");


// =========================================================
// APPLICATION START
// =========================================================

function startApplication() {

    console.log("Mirima Admin application started.");

    // Check whether a staff member is already logged in

    const session = getCurrentSession();


    if (session) {

        showLoggedInState(session);

    }

}


// =========================================================
// LOGIN FORM
// =========================================================

loginForm.addEventListener("submit", function (event) {

    // Stop the browser from refreshing the page

    event.preventDefault();


    // Clear previous error

    loginError.textContent = "";


    // Get values from the form

    const role =
        document.getElementById("role").value;

    const name =
        document.getElementById("staffName").value;

    const password =
        document.getElementById("password").value;


    // Disable button while processing

    loginButton.disabled = true;

    loginButton.textContent = "Signing in...";


    // Attempt login

    const result =
        loginUser(role, name, password);


    // Login failed

    if (!result.success) {

        loginError.textContent =
            result.message;

        loginButton.disabled = false;

        loginButton.textContent = "Login";

        return;

    }


    // Login successful

    showLoggedInState(result.session);

});


// =========================================================
// SHOW LOGGED-IN STATE
// =========================================================

function showLoggedInState(session) {

    console.log(
        "Logged in as:",
        session.name,
        "| Role:",
        session.role
    );


    /*
        The real dashboard will be added next.

        For now, we simply replace the login screen
        with a temporary message.
    */

    loginScreen.innerHTML = `

        <section style="
            text-align: center;
            padding: 40px;
        ">

            <h1>Welcome, ${session.name}</h1>

            <p style="margin-top: 10px;">
                Role: ${session.role}
            </p>

            <p style="
                margin-top: 20px;
                color: #999;
            ">
                Mirima Admin dashboard coming next...
            </p>

            <button
                id="logoutButton"
                style="
                    margin-top: 25px;
                    padding: 12px 25px;
                    cursor: pointer;
                "
            >
                Logout
            </button>

        </section>

    `;


    // Connect logout button

    const logoutButton =
        document.getElementById("logoutButton");


    logoutButton.addEventListener(
        "click",
        function () {

            logoutUser();

            window.location.reload();

        }
    );

}


// =========================================================
// START
// =========================================================

startApplication();
