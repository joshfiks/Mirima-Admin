import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// =========================================================
// MIRIMA BILLING
// =========================================================

// Temporary storage for billing data.
// We will move this to Firebase later.

const BILLING_STORAGE_KEY = "mirimaBilling";


function getBillingData() {

    const savedBilling =
        localStorage.getItem(
            BILLING_STORAGE_KEY
        );

    if (!savedBilling) {

        return {};

    }

    try {

        return JSON.parse(savedBilling);

    } catch (error) {

        console.error(
            "Unable to load billing data:",
            error
        );

        return {};

    }

}


function saveBillingData(billingData) {

    localStorage.setItem(
        BILLING_STORAGE_KEY,
        JSON.stringify(billingData)
    );

}


function getCottageBill(cottageId) {

    const billingData =
        getBillingData();

    if (!billingData[cottageId]) {

        billingData[cottageId] = {

            cottageId: cottageId,

            items: [],

            payments: []

        };

        saveBillingData(
            billingData
        );

    }

    return billingData[cottageId];

}

async function addBillItem(
    cottageId,
    description,
    amount
) {

    const billingData =
        getBillingData();

    if (!billingData[cottageId]) {

        billingData[cottageId] = {

            cottageId: cottageId,

            items: [],

            payments: []

        };

    }

    const billItem = {

        id:
            "bill-" +
            Date.now(),

        description:
            description,

        amount:
            Number(amount),

        createdAt:
            new Date().toISOString()

    };

    billingData[cottageId].items.push(
        billItem
    );

    saveBillingData(
        billingData
    );

    // Save the cottage bill to Firestore
    try {

        await setDoc(
            doc(db, "bills", cottageId),
            {
                cottageId: cottageId,
                items: billingData[cottageId].items,
                payments: billingData[cottageId].payments,
                updatedAt: new Date().toISOString()
            }
        );

        console.log(
            "Bill synced to Firestore:",
            cottageId
        );

    } catch (error) {

        console.error(
            "Failed to sync bill to Firestore:",
            error
        );

    }

    return billItem;

}

function getBillTotal(cottageId) {

    const bill =
        getCottageBill(cottageId);

    return bill.items.reduce(
        function (total, item) {

            return total + Number(item.amount);

        },
        0
    );

}


function startNewCottageBill(cottageId) {

    const billingData =
        getBillingData();

    billingData[cottageId] = {

        cottageId: cottageId,

        items: [],

        payments: []

    };

    saveBillingData(
        billingData
    );

}

export {
    getBillingData,
    saveBillingData,
    getCottageBill,
    addBillItem,
    getBillTotal,
    startNewCottageBill
};
export async function addPayment(paymentDetails) {

    try {

        const paymentRef = await addDoc(
            collection(db, "payments"),
            {
                cottageId: paymentDetails.cottageId,
                guestName: paymentDetails.guestName,
                amount: Number(paymentDetails.amount),
                paymentMethod: paymentDetails.paymentMethod,
                transactionId: paymentDetails.transactionId || "",
                mobileMoneyName: paymentDetails.mobileMoneyName || "",
                mobileMoneyPhone: paymentDetails.mobileMoneyPhone || "",
                status: paymentDetails.status || "Pending",
                createdAt: new Date().toISOString()
            }
        );

        return {
            success: true,
            paymentId: paymentRef.id
        };

    } catch (error) {

        console.error(
    "Payment error details:",
    error.code,
    error.message
    );

        console.error(
            "Failed to save payment:",
            error
        );

        return {
            success: false,
            error: error
        };

    }
}

export async function getPayments() {

    try {

        const snapshot = await getDocs(
            collection(db, "payments")
        );

        return snapshot.docs.map(function (doc) {

            return {
                id: doc.id,
                ...doc.data()
            };

        });

    } catch (error) {

        console.error(
            "Failed to read payments:",
            error
        );

        return [];

    }
}
export async function getCottagePayments(cottageId) {

    const payments = await getPayments();

   return payments.filter(function (payment) {
    return payment.cottageId === cottageId;
});
    
}
