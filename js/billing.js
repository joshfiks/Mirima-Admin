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


export {
    getBillingData,
    saveBillingData,
    getCottageBill
};
