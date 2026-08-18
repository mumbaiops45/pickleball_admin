import { api, notImplemented, unwrap } from "@/lib/api";

/**
 * /api/payments — checkout-side routes, all scoped to `req.user`.
 *
 * They exist so the panel can replay a payment against a test order.
 *
 * Reading the ledger is not on this router at all: `GET /api/reports/payments`
 * is admin-only and returns every payment with its order and user populated,
 * filtered and paged, which is what the payments screen uses (see
 * `report.service.js`). Issuing a refund has no endpoint anywhere yet.
 */

/** The method is taken from the order itself, so only the id is sent. */
export async function createPayment(orderId) {
  return unwrap(await api.post("/payments", { orderId }));
}

export async function completePayment({ paymentId, transactionId }) {
  return unwrap(await api.post("/payments/complete", { paymentId, transactionId }));
}

export async function failPayment({ paymentId, failureReason }) {
  return unwrap(await api.post("/payments/failed", { paymentId, failureReason }));
}

/**
 * The Payment model's own status enum, which is *not* the same as an order's
 * `paymentStatus` — SUCCESS here, PAID there.
 */
export const PAYMENT_TONE = {
  PENDING: "warn",
  SUCCESS: "good",
  FAILED: "bad",
  REFUNDED: "neutral",
};

export function refundPayment() {
  return notImplemented(
    "Issuing a refund",
    "Add POST /api/payments/:id/refund (admin only) setting status REFUNDED on both payment and order.",
  );
}
