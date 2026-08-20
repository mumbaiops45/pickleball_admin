import { api, notImplemented, unwrap } from "@/lib/api";


export async function createPayment(orderId) {
  return unwrap(await api.post("/payments", { orderId }));
}

export async function completePayment({ paymentId, transactionId }) {
  return unwrap(await api.post("/payments/complete", { paymentId, transactionId }));
}

export async function failPayment({ paymentId, failureReason }) {
  return unwrap(await api.post("/payments/failed", { paymentId, failureReason }));
}


export const PAYMENT_TONE = {
  PENDING: "warn",
  SUCCESS: "good",
  FAILED: "bad",
  REFUNDED: "neutral",
};

export function refundPayment() {
  return notImplemented(
    "Issuing a refund",
    "Refunds cannot be started from this panel yet. Raise it with your payment provider and the ledger will catch up.",
  );
}
