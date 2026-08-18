import { api, unwrap } from "@/lib/api";

/**
 * /api/dashboard — nine read-only aggregates, all admin-only.
 *
 * Everything here is computed by the API (Mongo aggregations over orders,
 * products, users and payments); the panel does no arithmetic of its own on
 * top of it. Cancelled orders are excluded from revenue on the server, so a
 * number shown here already follows that rule.
 *
 * Each function returns the `data` half of the envelope and falls back to an
 * empty shape rather than null, so a screen never has to guard every read.
 */

/** KPI cards: `{ totals, orderStatus, last30Days, meta }`. */
export async function getSummary(options) {
  return unwrap(await api.get("/dashboard/summary", options), {
    totals: {},
    orderStatus: {},
    last30Days: {},
    meta: {},
  });
}

/** The ranges the API buckets by; anything else falls back to 30d server-side. */
export const SALES_RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
];

/** Revenue/orders/units per bucket: `{ range, granularity, totals, series }`. */
export async function getSalesAnalytics({ range, ...options } = {}) {
  return unwrap(
    await api.get("/dashboard/sales", { ...options, query: { range } }),
    { totals: {}, series: [] },
  );
}

/** `{ orderStatus: [{status,count,amount}], paymentStatus: [...] }`. */
export async function getOrderStatusBreakdown(options) {
  return unwrap(await api.get("/dashboard/orders/status", options), {
    orderStatus: [],
    paymentStatus: [],
  });
}

export async function getRecentOrders({ limit, ...options } = {}) {
  return unwrap(
    await api.get("/dashboard/orders/recent", { ...options, query: { limit } }),
    [],
  );
}

export async function getTopProducts({ limit, range, ...options } = {}) {
  return unwrap(
    await api.get("/dashboard/products/top", {
      ...options,
      query: { limit, range },
    }),
    [],
  );
}

/** `{ threshold, count, products }` — note the products are nested. */
export async function getLowStockProducts({ threshold, limit, ...options } = {}) {
  return unwrap(
    await api.get("/dashboard/products/low-stock", {
      ...options,
      query: { threshold, limit },
    }),
    { threshold: 0, count: 0, products: [] },
  );
}

export async function getCategoryPerformance(options) {
  return unwrap(await api.get("/dashboard/categories/performance", options), []);
}

export async function getTopCustomers({ limit, ...options } = {}) {
  return unwrap(
    await api.get("/dashboard/customers/top", { ...options, query: { limit } }),
    [],
  );
}

/** `{ payments: [{status,count,amount}], orderPaymentMethods: [...] }`. */
export async function getPaymentSummary(options) {
  return unwrap(await api.get("/dashboard/payments/summary", options), {
    payments: [],
    orderPaymentMethods: [],
  });
}

/** Stock severity, as returned by the low-stock route. */
export const SEVERITY_TONE = {
  OUT_OF_STOCK: "bad",
  LOW_STOCK: "warn",
  OK: "good",
};

export const SEVERITY_LABEL = {
  OUT_OF_STOCK: "Out of stock",
  LOW_STOCK: "Low",
  OK: "In stock",
};
