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


// =========================================================
// SHOW RECEPTION DASHBOARD
// =========================================================

export function showDashboard(session) {

    const loginScreen =
        document.getElementById("loginScreen");

    loginScreen.classList.add("reception-mode");
