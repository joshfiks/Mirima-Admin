/* =========================================================
   MIRIMA ADMIN — AUTHENTICATION MODULE
   =========================================================

   For now, this module handles the FRONTEND login experience.

   This is only a temporary/demo authentication system.

   Later we will replace the demo authentication with:
   Firebase Authentication
   +
   Firestore security rules
*/


// =========================================================
// DEMO STAFF ACCOUNTS
// =========================================================

const demoStaff = {

    security: {
        name: "Security Staff",
        password: "security123"
    },

    kitchen: {
        name: "Kitchen Staff",
        password: "kitchen123"
    },

    reception: {
        name: "Reception Staff",
        password: "reception123"
    },

    housekeeping: {
        name: "Housekeeping Staff",
        password: "housekeeping123"
    },

    spa: {
        name: "Spa Staff",
        password: "spa123"
    },

    management: {
        name: "Management Staff",
        password: "management123"
    }

};


// =========================================================
// LOGIN FUNCTION
// =========================================================

export function loginUser(role, name, password) {

    const staff = demoStaff[role];


    // -----------------------------------------------------
    // Check whether the selected role exists
    // -----------------------------------------------------

    if (!staff) {

        return {
            success: false,
            message: "Please select a valid role."
        };

    }


    // -----------------------------------------------------
    // Check the password
    // -----------------------------------------------------

    if (password !== staff.password) {

        return {
            success: false,
            message: "Incorrect password."
        };

    }


    // -----------------------------------------------------
    // Create the temporary login session
    // -----------------------------------------------------

    const session = {

        role: role,

        name: name.trim() || staff.name,

        loginTime: new Date().toISOString()

    };


    // Save the session in the browser

    sessionStorage.setItem(
        "mirimaSession",
        JSON.stringify(session)
    );


    // -----------------------------------------------------
    // Login successful
    // -----------------------------------------------------

    return {

        success: true,

        session: session

    };

}


// =========================================================
// LOGOUT
// =========================================================

export function logoutUser() {

    sessionStorage.removeItem("mirimaSession");

}


// =========================================================
// GET CURRENT SESSION
// =========================================================

export function getCurrentSession() {

    const savedSession =
        sessionStorage.getItem("mirimaSession");


    if (!savedSession) {

        return null;

    }


    try {

        return JSON.parse(savedSession);

    } catch (error) {

        console.error(
            "Unable to read Mirima session:",
            error
        );

        sessionStorage.removeItem("mirimaSession");

        return null;

    }

}
