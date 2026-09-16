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

function addBillItem(
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
