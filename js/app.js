/* =========================================================
   MIRIMA ADMIN — APPLICATION ENTRY POINT
   =========================================================

   This file connects the main application modules.

   Authentication → auth.js
   Dashboard     → dashboard.js
*/
import { firebaseConfig } from "../firebase-config.js";

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =========================================================
// IMPORT MODULES
// =========================================================

import {
    loginUser,
    getCurrentSession
} from "./auth.js";


import {
    showDashboard
} from "./dashboard.js";


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
// LOGIN FORM
// =========================================================

loginForm.addEventListener("submit", function (event) {

    // Prevent the browser from refreshing

    event.preventDefault();


    // Clear previous error

    loginError.textContent = "";


    // Get form values

    const role =
        document.getElementById("role").value;

    const name =
        document.getElementById("staffName").value;

    const password =
        document.getElementById("password").value;


    // Disable button

    loginButton.disabled = true;

    loginButton.textContent = "Signing in...";


    // Attempt login

    const result =
        loginUser(
            role,
            name,
            password
        );


    // -----------------------------------------------------
    // LOGIN FAILED
    // -----------------------------------------------------

    if (!result.success) {

        loginError.textContent =
            result.message;

        loginButton.disabled = false;

        loginButton.textContent = "Login";

        return;

    }


    // -----------------------------------------------------
    // LOGIN SUCCESSFUL
    // -----------------------------------------------------

    showDashboard(result.session);

});


// =========================================================
// CHECK EXISTING SESSION
// =========================================================

function checkExistingSession() {

    const session =
        getCurrentSession();


    if (!session) {

        return;

    }


    // Staff already has a valid browser session

    showDashboard(session);

}


// =========================================================
// APPLICATION START
// =========================================================

function startApplication() {

    console.log(
        "Mirima Admin application started."
    );


    checkExistingSession();

}


// =========================================================
// START APPLICATION
// =========================================================

startApplication();
