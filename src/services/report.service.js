import { api, requestBlob, unwrap } from "@/lib/api";

/**
 * /api/reports — six admin-only registers.
 *
 * Every report answers the same envelope: `{ range, totals, pagination, rows }`
 * (the inventory report swaps `range` for `filter`, since stock is a point in
 * time rather than a period). Passing `?format=csv` to the same URL returns the
 * identical rows as a file, which is what `downloadReport` uses.
 *
 * Dates go over the wire as `YYYY-MM-DD`; the API resolves them in its own
 * timezone (`Asia/Kolkata` by default) and echoes the resolved window back in
 * `range`, so the screen reports what the server actually used rather than what
 * was typed.
 */

const EMPTY = { totals: {}, pagination: {}, rows: [] };

/** The six reports, in the order the screen shows them. */
export const REPORTS = [
  { value: "sales", label: "Sales", path: "/reports/sales", dated: true },
  { value: "orders", label: "Orders", path: "/reports/orders", dated: true },
  { value: "products", label: "Products", path: "/reports/products", dated: true },
  {
    value: "inventory",
    label: "Inventory",
    path: "/reports/inventory",
    dated: false,
  },
  {
    value: "customers",
    label: "Customers",
    path: "/reports/customers",
    dated: true,
  },
  { value: "payments", label: "Payments", path: "/reports/payments", dated: true },
];

const pathFor = (report) => {
  const found = REPORTS.find((entry) => entry.value === report);
  if (!found) throw new Error(`Unknown report "${report}"`);
  return found.path;
};

/**
 * One fetch for all six. `params` is passed through as the query string, so a
 * caller only sends the filters its report actually has — `buildUrl` drops
 * every empty value before the request goes out.
 */
export async function getReport(report, { signal, ...params } = {}) {
  return unwrap(await api.get(pathFor(report), { signal, query: params }), EMPTY);
}

/**
 * The same rows as a CSV file. Saved through an object URL rather than by
 * linking to the endpoint, because the route needs the bearer token.
 */
export async function downloadReport(report, params = {}) {
  const { blob, filename } = await requestBlob(pathFor(report), {
    query: { ...params, format: "csv" },
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename ?? `${report}-report.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Revoked on the next tick — Safari cancels the download if it goes early.
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return filename;
}

export const SALES_GROUP_BY = [
  { value: "day", label: "By day" },
  { value: "week", label: "By week" },
  { value: "month", label: "By month" },
];

export const PRODUCT_SORTS = [
  { value: "revenue", label: "Revenue" },
  { value: "units", label: "Units sold" },
];

export const CUSTOMER_SORTS = [
  { value: "spend", label: "Total spent" },
  { value: "orders", label: "Orders" },
  { value: "recent", label: "Last order" },
  { value: "registered", label: "Registered" },
];

/** `filter` on the inventory report — a point-in-time slice of the catalogue. */
export const INVENTORY_FILTERS = [
  { value: "all", label: "Everything" },
  { value: "alert", label: "Needs attention" },
  { value: "out", label: "Out of stock" },
  { value: "low", label: "Low stock" },
  { value: "instock", label: "In stock" },
];

/** `YYYY-MM-DD` in local time, for the two date inputs. */
export function isoDate(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

/** The default window every dated report opens on: the last 30 days. */
export function defaultRange() {
  const now = new Date();
  return {
    from: isoDate(new Date(now.getTime() - 29 * 86400000)),
    to: isoDate(now),
  };
}
