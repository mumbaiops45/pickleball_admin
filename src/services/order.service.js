import { api, notImplemented, unwrap } from "@/lib/api";



export async function listMyOrders(options) {
  return unwrap(await api.get("/orders", options), []);
}

export async function getOrder(id, options) {
  return unwrap(await api.get(`/orders/${id}`, options));
}

export async function cancelOrder(id, reason) {
  return unwrap(await api.patch(`/orders/${id}/cancel`, { reason }));
}

export function updateOrderStatus() {
  return notImplemented(
    "Changing an order's status",
    "Orders move through their statuses automatically for now. Cancelling an order does work, from the row menu.",
  );
}

export function updatePaymentStatus() {
  return notImplemented(
    "Changing an order's payment status",
    "Payment status is set by the checkout flow and cannot be edited by hand yet.",
  );
}

export const ORDER_STATUS_TONE = {
  PENDING: "warn",
  CONFIRMED: "info",
  PROCESSING: "info",
  SHIPPED: "info",
  DELIVERED: "good",
  CANCELLED: "bad",
};


export const ORDER_STATUS_FLOW = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export const ORDER_STATUS_EXITS = ["CANCELLED"];

export const PAYMENT_STATUS_TONE = {
  PENDING: "warn",
  PAID: "good",
  FAILED: "bad",
  REFUNDED: "neutral",
};
