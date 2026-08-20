import { api, requestBlob, unwrap } from "@/lib/api";



const EMPTY = { totals: {}, pagination: {}, rows: [] };

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


export async function getReport(report, { signal, ...params } = {}) {
  return unwrap(await api.get(pathFor(report), { signal, query: params }), EMPTY);
}


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

export const INVENTORY_FILTERS = [
  { value: "all", label: "Everything" },
  { value: "alert", label: "Needs attention" },
  { value: "out", label: "Out of stock" },
  { value: "low", label: "Low stock" },
  { value: "instock", label: "In stock" },
];

export function isoDate(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function defaultRange() {
  const now = new Date();
  return {
    from: isoDate(new Date(now.getTime() - 29 * 86400000)),
    to: isoDate(now),
  };
}
