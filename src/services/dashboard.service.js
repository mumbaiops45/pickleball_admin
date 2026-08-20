import { api, unwrap } from "@/lib/api";


export async function getSummary(options) {
  return unwrap(await api.get("/dashboard/summary", options), {
    totals: {},
    orderStatus: {},
    last30Days: {},
    meta: {},
  });
}

export const SALES_RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
];

export async function getSalesAnalytics({ range, ...options } = {}) {
  return unwrap(
    await api.get("/dashboard/sales", { ...options, query: { range } }),
    { totals: {}, series: [] },
  );
}

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

export async function getPaymentSummary(options) {
  return unwrap(await api.get("/dashboard/payments/summary", options), {
    payments: [],
    orderPaymentMethods: [],
  });
}

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
