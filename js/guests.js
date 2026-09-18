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

export function getActiveGuests() {

    const savedGuests =
        localStorage.getItem(STORAGE_KEY);

    if (!savedGuests) {
        return [];
    }

    try {

        return JSON.parse(savedGuests);

    } catch (error) {

        console.error(
            "Unable to read guest data:",
            error
        );

        return [];

    }

}


// =========================================================
// SAVE ACTIVE GUESTS
// =========================================================

function saveActiveGuests(guests) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(guests)
    );

}


// =========================================================
// ADD GUEST
// =========================================================

export function addGuest(guestDetails) {

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


    guests.push(guest);

    saveActiveGuests(guests);


    return {
        success: true,
        guest: guest
    };

}


// =========================================================
// GET GUEST FOR COTTAGE
// =========================================================

export function getGuestForCottage(
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

export function removeGuest(
    guestId
) {

    const guests =
        getActiveGuests();

    const updatedGuests =
        guests.filter(
            function (guest) {

                return guest.id !== guestId;

            }
        );


    saveActiveGuests(updatedGuests);


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
