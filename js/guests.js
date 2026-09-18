import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

/* =========================================================
   MIRIMA ADMIN — GUEST MANAGEMENT MODULE
   =========================================================

   This module manages:
   - Cottage information
   - Active guests
   - Check-in information
   - Check-out information

   TEMPORARY:
   Data is stored in localStorage.

   LATER:
   This will be replaced with Firebase Firestore.
*/


// =========================================================
// COTTAGES
// =========================================================

const cottages = [
    {
        id: "cottage-1",
        number: 1
    },

    {
        id: "cottage-2",
        number: 2
    },

    {
        id: "cottage-3",
        number: 3
    },

    {
        id: "cottage-4",
        number: 4
    },

    {
        id: "cottage-5",
        number: 5
    },

    {
        id: "cottage-6",
        number: 6
    },

    {
        id: "cottage-7",
        number: 7
    },

    {
        id: "cottage-8",
        number: 8
    },

    {
        id: "cottage-9",
        number: 9
    },

    {
        id: "cottage-10",
        number: 10
    },

    {
        id: "cottage-11",
        number: 11
    },

    {
        id: "cottage-12",
        number: 12
    }
];

// =========================================================
// STORAGE KEY
// =========================================================

const STORAGE_KEY =
    "mirimaActiveGuests";


// =========================================================
// GET ALL COTTAGES
// =========================================================

export function getCottages() {

    return cottages;

}


// =========================================================
// GET ACTIVE GUESTS
// =========================================================

export async function getActiveGuests() {
    try {
        const snapshot = await getDocs(
            collection(db, "guests")
        );

        return snapshot.docs.map(function (doc) {
            return {
                id: doc.id,
                ...doc.data()
            };
        });

    } catch (error) {
        console.error(
            "Unable to read guest data:",
            error
        );

        return [];
    }
}

// =========================================================
// ADD GUEST
// =========================================================

export async function addGuest(guestDetails) {

    const guests =
        getActiveGuests();


    // Check whether cottage is already occupied

    const cottageOccupied =
        guests.some(
            function (guest) {

                return guest.cottageId ===
                    guestDetails.cottageId;

            }
        );


    if (cottageOccupied) {

        return {
            success: false,
            message:
                "This cottage already has an active guest."
        };

    }


    // Create guest record

    const guest = {

        id:
            "guest-" +
            Date.now(),

        name:
            guestDetails.name.trim(),

        phone:
            guestDetails.phone.trim(),

        cottageId:
            guestDetails.cottageId,

        checkInDate:
            guestDetails.checkInDate,

        checkInTime:
            guestDetails.checkInTime,

        checkoutDate:
            guestDetails.checkoutDate,

        checkoutTime:
            guestDetails.checkoutTime,

        notes:
            guestDetails.notes.trim(),

        createdAt:
            new Date().toISOString()

    };


   const guestRef = await addDoc(
    collection(db, "guests"),
    guest
);

guest.id = guestRef.id;


    return {
        success: true,
        guest: guest
    };

}


// =========================================================
// GET GUEST FOR COTTAGE
// =========================================================

export async function getGuestForCottage(
    cottageId
) {

    const guests =
        getActiveGuests();

    return guests.find(
        function (guest) {

            return guest.cottageId ===
                cottageId;

        }
    ) || null;

}


// =========================================================
// REMOVE ACTIVE GUEST
// =========================================================

export async function removeGuest(
    guestId
) {

   await deleteDoc(
    doc(db, "guests", guestId)
);


    return {
        success: true
    };

}


// =========================================================
// GET NUMBER OF CURRENT GUESTS
// =========================================================

export function getActiveGuestCount() {

    return getActiveGuests().length;

}
