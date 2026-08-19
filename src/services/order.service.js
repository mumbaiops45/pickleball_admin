import { api, notImplemented, unwrap } from "@/lib/api";

/**
 * /api/orders — every route on the API is scoped to `req.user`, so these read
 * the *signed-in admin's* own orders, not the store's.
 *
 * Reading the store's orders happens elsewhere: `GET /api/reports/orders` is
 * admin-only and returns one row per order with the customer resolved, which
 * is what the orders screen lists (see `report.service.js`).
 *
 * Writing is the part with no endpoint. Moving an order through its statuses
 * is declared below so the screens and hooks stay wired; it rejects with a 501
 * that <DataState> renders as an explanation rather than a crash.
 */

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

/** Colour keys consumed by <Badge>; the values mirror the Mongoose enums. */
export const ORDER_STATUS_TONE = {
  PENDING: "warn",
  CONFIRMED: "info",
  PROCESSING: "info",
  SHIPPED: "info",
  DELIVERED: "good",
  CANCELLED: "bad",
};

/**
 * The lifecycle, in the sequence the API moves an order through it. The
 * Mongoose enum is an unordered set, and the aggregate that feeds the
 * dashboard returns whatever order Mongo groups in, so the one place that
 * draws the flow needs the sequence written down.
 */
export const ORDER_STATUS_FLOW = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

/** Statuses that end an order instead of advancing it. */
export const ORDER_STATUS_EXITS = ["CANCELLED"];

export const PAYMENT_STATUS_TONE = {
  PENDING: "warn",
  PAID: "good",
  FAILED: "bad",
  REFUNDED: "neutral",
};
