"use client";

import { useMemo, useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataState, { FormError } from "@/components/ui/DataState";
import { Select, TextInput } from "@/components/ui/Field";
import { DownloadIcon, RefreshIcon, SearchIcon } from "@/components/ui/Icons";
import PageHeader from "@/components/ui/PageHeader";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { useCategories } from "@/hooks/useCategories";
import { useReport, useReportDownload } from "@/hooks/useReports";
import {
  CUSTOMER_SORTS,
  INVENTORY_FILTERS,
  PRODUCT_SORTS,
  REPORTS,
  SALES_GROUP_BY,
  defaultRange,
} from "@/services/report.service";
import {
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_TONE,
} from "@/services/order.service";
import { PAYMENT_TONE } from "@/services/payment.service";
import { SEVERITY_TONE } from "@/services/dashboard.service";
import {
  formatDate,
  formatDateTime,
  formatNumber,
  formatPeriod,
  formatPrice,
} from "@/lib/format";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
const ORDER_PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];
const PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"];
const METHODS = ["COD", "ONLINE"];

/**
 * /api/reports, one screen.
 *
 * The six reports answer the same envelope — `{ range, totals, pagination,
 * rows }` — so the filters, the totals strip, the table and the pager are
 * written once and driven by the descriptor in `REPORT_VIEWS`. Adding a
 * seventh report is a new entry there, not a new page.
 *
 * Filters live in one state object per report and are sent verbatim as the
 * query string; `buildUrl` drops the empty ones, so "any status" needs no
 * special case. Every change resets the page back to 1, since page 4 of a
 * different filter is a different set of rows.
 */
export default function ReportsPage() {
  const [report, setReport] = useState("sales");
  const [filters, setFilters] = useState(() => initialFilters("sales"));

  const view = REPORT_VIEWS[report];
  const { categories } = useCategories();
  const download = useReportDownload();

  const query = useMemo(
    () => ({ ...filters, page: filters.page ?? 1 }),
    [filters],
  );

  const { rows, totals, pagination, range, loading, error, refetch } = useReport(
    report,
    query,
  );

  const set = (key) => (event) =>
    setFilters((current) => ({
      ...current,
      [key]: event.target.value,
      page: 1,
    }));

  const selectReport = (next) => {
    setReport(next);
    setFilters(initialFilters(next));
    download.reset();
  };

  const goto = (page) => setFilters((current) => ({ ...current, page }));

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Analysis"
        title="Reports"
        copy="Registers behind the dashboard numbers, filterable and downloadable as CSV."
        action={
          <>
            <Button tone="outline" icon={RefreshIcon} onClick={refetch}>
              Refresh
            </Button>
            <Button
              icon={DownloadIcon}
              loading={download.loading}
              onClick={() => download.mutate(report, query)}
            >
              Download CSV
            </Button>
          </>
        }
      />

      {/* Tabs rather than a select: six is few enough to show at once, and the
          current report has to be obvious when the table below changes shape. */}
      <div
        role="tablist"
        aria-label="Report"
        className="flex flex-wrap gap-1.5 rounded-xl border border-line bg-paper p-1.5"
      >
        {REPORTS.map((entry) => (
          <button
            key={entry.value}
            type="button"
            role="tab"
            aria-selected={entry.value === report}
            onClick={() => selectReport(entry.value)}
            className={`rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors ${
              entry.value === report
                ? "bg-ink text-paper"
                : "text-mist hover:bg-surface hover:text-ink"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:flex-wrap md:items-end">
          {view.dated ? (
            <>
              <TextInput
                label="From"
                type="date"
                value={filters.from ?? ""}
                onChange={set("from")}
                className="md:w-44"
              />
              <TextInput
                label="To"
                type="date"
                value={filters.to ?? ""}
                onChange={set("to")}
                className="md:w-44"
              />
            </>
          ) : null}

          {view.filters?.({ filters, set, categories })}

          <Select
            label="Rows"
            value={filters.limit ?? 50}
            onChange={set("limit")}
            className="md:w-28"
          >
            {[25, 50, 100, 200].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-5 p-5">
          <FormError error={download.error} />

          <DataState
            loading={loading}
            error={error}
            onRetry={refetch}
            isEmpty={rows.length === 0}
            emptyTitle="No rows"
            emptyBody="Nothing matched this range and these filters."
            rows={6}
          >
            <>
              <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {view.totals(totals).map((total) => (
                  <div
                    key={total.label}
                    className="flex flex-col gap-1 rounded-lg border border-line bg-surface px-4 py-3"
                  >
                    <dt className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-mist">
                      {total.label}
                    </dt>
                    <dd className="tnum text-[1.2rem] font-semibold leading-none text-ink">
                      {total.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <Table>
                <thead>
                  <tr>
                    {view.columns.map((column) => (
                      <Th key={column.key} align={column.align}>
                        {column.label}
                      </Th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <Tr key={view.rowKey(row, index)}>
                      {view.columns.map((column) => (
                        <Td
                          key={column.key}
                          align={column.align}
                          className={column.className}
                        >
                          {column.render(row)}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </tbody>
              </Table>

              <Pager
                pagination={pagination}
                rows={rows.length}
                onGoto={goto}
                range={range}
              />
            </>
          </DataState>
        </div>
      </Card>
    </div>
  );
}

/** Prev/next only — the API returns a page count, not a cursor. */
function Pager({ pagination, rows, onGoto, range }) {
  const { page, totalPages, total, hasNext, hasPrev } = pagination ?? {};

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[12.5px] text-mist">
        {total
          ? `${formatNumber(rows)} of ${formatNumber(total)} rows${
              totalPages ? ` · page ${page} of ${totalPages}` : ""
            }`
          : `${formatNumber(rows)} rows`}
        {range?.from ? (
          <>
            {" · "}
            {formatDate(range.from)} to {formatDate(range.to)}
            {range.timezone ? ` (${range.timezone})` : ""}
          </>
        ) : null}
      </p>

      {totalPages > 1 ? (
        <div className="flex gap-2">
          <Button
            tone="outline"
            size="sm"
            disabled={!hasPrev}
            onClick={() => onGoto(page - 1)}
          >
            Previous
          </Button>
          <Button
            tone="outline"
            size="sm"
            disabled={!hasNext}
            onClick={() => onGoto(page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function initialFilters(report) {
  const view = REPORT_VIEWS[report];
  return {
    ...(view.dated ? defaultRange() : null),
    ...(view.defaults ?? null),
    page: 1,
    limit: 50,
  };
}

/* ------------------------------------------------------------------ *
 * The six reports. Each one names its extra filters, the totals strip
 * it wants, and its columns; everything else is shared above.
 * ------------------------------------------------------------------ */

const money = (key) => (row) => formatPrice(row[key]);
const count = (key) => (row) => formatNumber(row[key]);
const text = (key, fallback = "—") => (row) => row[key] || fallback;

const REPORT_VIEWS = {
  sales: {
    dated: true,
    defaults: { groupBy: "day" },
    filters: ({ filters, set }) => (
      <Select
        label="Group by"
        value={filters.groupBy ?? "day"}
        onChange={set("groupBy")}
        className="md:w-40"
      >
        {SALES_GROUP_BY.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    ),
    totals: (totals) => [
      { label: "Revenue", value: formatPrice(totals.grossRevenue) },
      { label: "Collected", value: formatPrice(totals.paidRevenue) },
      { label: "Orders", value: formatNumber(totals.orders) },
      { label: "Average order", value: formatPrice(totals.averageOrderValue) },
    ],
    rowKey: (row) => row.period,
    columns: [
      {
        key: "period",
        label: "Period",
        render: (row) => formatPeriod(row.period),
        className: "tnum whitespace-nowrap text-ink",
      },
      { key: "orders", label: "Orders", align: "right", render: count("orders"), className: "tnum" },
      { key: "unitsSold", label: "Units", align: "right", render: count("unitsSold"), className: "tnum" },
      { key: "itemsSubtotal", label: "Subtotal", align: "right", render: money("itemsSubtotal"), className: "tnum" },
      { key: "shipping", label: "Shipping", align: "right", render: money("shipping"), className: "tnum" },
      { key: "discount", label: "Discount", align: "right", render: money("discount"), className: "tnum" },
      {
        key: "grossRevenue",
        label: "Revenue",
        align: "right",
        render: money("grossRevenue"),
        className: "tnum font-medium text-ink",
      },
      {
        key: "averageOrderValue",
        label: "Avg order",
        align: "right",
        render: money("averageOrderValue"),
        className: "tnum",
      },
    ],
  },

  orders: {
    dated: true,
    filters: ({ filters, set }) => (
      <>
        <div className="relative flex-1 md:min-w-56">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-[2.85rem] size-4 -translate-y-1/2 text-faint"
            aria-hidden="true"
          />
          <TextInput
            label="Search"
            type="search"
            placeholder="Order number, name or e-mail"
            value={filters.search ?? ""}
            onChange={set("search")}
            className="pl-9"
          />
        </div>
        <Select
          label="Status"
          value={filters.orderStatus ?? ""}
          onChange={set("orderStatus")}
          className="md:w-40"
        >
          <option value="">Any status</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
        <Select
          label="Payment"
          value={filters.paymentStatus ?? ""}
          onChange={set("paymentStatus")}
          className="md:w-40"
        >
          <option value="">Any payment</option>
          {ORDER_PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
        <Select
          label="Method"
          value={filters.paymentMethod ?? ""}
          onChange={set("paymentMethod")}
          className="md:w-32"
        >
          <option value="">Any method</option>
          {METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </Select>
      </>
    ),
    totals: (totals) => [
      { label: "Orders", value: formatNumber(totals.matchedOrders) },
      { label: "Revenue", value: formatPrice(totals.grossRevenue) },
      { label: "Shipping", value: formatPrice(totals.shipping) },
      { label: "Units", value: formatNumber(totals.unitsSold) },
    ],
    rowKey: (row) => row.orderNumber,
    columns: [
      {
        key: "orderNumber",
        label: "Order",
        render: text("orderNumber"),
        className: "font-mono text-[12.5px] text-ink",
      },
      {
        key: "placedAt",
        label: "Placed",
        render: (row) => formatDate(row.placedAt),
        className: "tnum whitespace-nowrap text-mist",
      },
      {
        key: "customer",
        label: "Customer",
        render: (row) => (
          <div className="flex flex-col">
            <span className="text-ink">{row.customer}</span>
            {row.email ? (
              <span className="text-[12px] text-mist">{row.email}</span>
            ) : null}
          </div>
        ),
      },
      {
        key: "city",
        label: "Ships to",
        render: (row) =>
          [row.city, row.state].filter(Boolean).join(", ") || "—",
        className: "text-mist",
      },
      { key: "units", label: "Units", align: "right", render: count("units"), className: "tnum" },
      {
        key: "totalAmount",
        label: "Total",
        align: "right",
        render: money("totalAmount"),
        className: "tnum font-medium text-ink",
      },
      {
        key: "paymentStatus",
        label: "Payment",
        render: (row) => (
          <>
            <Badge tone={PAYMENT_STATUS_TONE[row.paymentStatus]}>
              {row.paymentStatus}
            </Badge>
            <span className="ml-2 text-[12px] text-mist">
              {row.paymentMethod}
            </span>
          </>
        ),
      },
      {
        key: "orderStatus",
        label: "Status",
        render: (row) => (
          <Badge tone={ORDER_STATUS_TONE[row.orderStatus]}>
            {row.orderStatus}
          </Badge>
        ),
      },
    ],
  },

  products: {
    dated: true,
    defaults: { sort: "revenue" },
    filters: ({ filters, set, categories }) => (
      <>
        <Select
          label="Category"
          value={filters.categoryId ?? ""}
          onChange={set("categoryId")}
          className="md:w-52"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select
          label="Sort by"
          value={filters.sort ?? "revenue"}
          onChange={set("sort")}
          className="md:w-40"
        >
          {PRODUCT_SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </>
    ),
    totals: (totals) => [
      { label: "Products sold", value: formatNumber(totals.productsSold) },
      { label: "Units", value: formatNumber(totals.unitsSold) },
      { label: "Revenue", value: formatPrice(totals.revenue) },
    ],
    rowKey: (row) => row.productId,
    columns: [
      {
        key: "name",
        label: "Product",
        render: (row) => (
          <div className="flex flex-col">
            <span className="text-ink">{row.name}</span>
            <span className="font-mono text-[11.5px] text-mist">
              {row.sku ?? "—"}
            </span>
          </div>
        ),
      },
      { key: "categoryName", label: "Category", render: text("categoryName"), className: "text-mist" },
      { key: "unitsSold", label: "Units", align: "right", render: count("unitsSold"), className: "tnum" },
      { key: "orders", label: "Orders", align: "right", render: count("orders"), className: "tnum" },
      {
        key: "revenue",
        label: "Revenue",
        align: "right",
        render: money("revenue"),
        className: "tnum font-medium text-ink",
      },
      {
        key: "averageSellingPrice",
        label: "Avg price",
        align: "right",
        render: money("averageSellingPrice"),
        className: "tnum",
      },
      {
        key: "currentStock",
        label: "Stock now",
        align: "right",
        render: count("currentStock"),
        className: "tnum",
      },
    ],
  },

  inventory: {
    dated: false,
    defaults: { filter: "all" },
    filters: ({ filters, set, categories }) => (
      <>
        <Select
          label="Show"
          value={filters.filter ?? "all"}
          onChange={set("filter")}
          className="md:w-44"
        >
          {INVENTORY_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select
          label="Category"
          value={filters.categoryId ?? ""}
          onChange={set("categoryId")}
          className="md:w-52"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </Select>
      </>
    ),
    totals: (totals) => [
      { label: "Products", value: formatNumber(totals.products) },
      { label: "Units in stock", value: formatNumber(totals.unitsInStock) },
      { label: "Stock value", value: formatPrice(totals.sellingValue) },
      {
        label: "Alerts",
        value: `${formatNumber(totals.outOfStock)} out · ${formatNumber(
          totals.lowStock,
        )} low`,
      },
    ],
    rowKey: (row) => row.productId,
    columns: [
      {
        key: "name",
        label: "Product",
        render: (row) => (
          <div className="flex flex-col">
            <span className="text-ink">{row.name}</span>
            <span className="font-mono text-[11.5px] text-mist">{row.sku}</span>
          </div>
        ),
      },
      { key: "category", label: "Category", render: text("category"), className: "text-mist" },
      { key: "stock", label: "Stock", align: "right", render: count("stock"), className: "tnum" },
      { key: "price", label: "Price", align: "right", render: money("price"), className: "tnum" },
      {
        key: "discountPrice",
        label: "Discounted",
        align: "right",
        render: (row) =>
          row.discountPrice === null ? "—" : formatPrice(row.discountPrice),
        className: "tnum",
      },
      {
        key: "stockValue",
        label: "Stock value",
        align: "right",
        render: money("stockValue"),
        className: "tnum font-medium text-ink",
      },
      {
        key: "severity",
        label: "Alert",
        render: (row) => (
          <Badge tone={SEVERITY_TONE[row.severity]}>
            {row.severity.replace("_", " ")}
          </Badge>
        ),
      },
    ],
  },

  customers: {
    dated: true,
    defaults: { sort: "spend" },
    filters: ({ filters, set }) => (
      <>
        <Select
          label="Sort by"
          value={filters.sort ?? "spend"}
          onChange={set("sort")}
          className="md:w-44"
        >
          {CUSTOMER_SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select
          label="Include"
          value={filters.onlyBuyers ?? ""}
          onChange={set("onlyBuyers")}
          className="md:w-44"
        >
          <option value="">Every customer</option>
          <option value="true">Only buyers</option>
        </Select>
      </>
    ),
    totals: (totals) => [
      { label: "Customers", value: formatNumber(totals.customers) },
      { label: "Bought in range", value: formatNumber(totals.buyersInRange) },
      { label: "Orders", value: formatNumber(totals.orders) },
      { label: "Revenue", value: formatPrice(totals.revenue) },
    ],
    rowKey: (row) => row.customerId,
    columns: [
      {
        key: "name",
        label: "Customer",
        render: (row) => (
          <div className="flex flex-col">
            <span className="text-ink">
              {row.name}
              {row.isBlocked ? (
                <Badge tone="bad" className="ml-2">
                  Blocked
                </Badge>
              ) : null}
            </span>
            <span className="text-[12px] text-mist">{row.email}</span>
          </div>
        ),
      },
      { key: "phone", label: "Phone", render: text("phone"), className: "tnum text-mist" },
      { key: "orders", label: "Orders", align: "right", render: count("orders"), className: "tnum" },
      {
        key: "totalSpent",
        label: "Spent",
        align: "right",
        render: money("totalSpent"),
        className: "tnum font-medium text-ink",
      },
      {
        key: "averageOrderValue",
        label: "Avg order",
        align: "right",
        render: money("averageOrderValue"),
        className: "tnum",
      },
      {
        key: "lastOrderAt",
        label: "Last order",
        render: (row) => (row.lastOrderAt ? formatDate(row.lastOrderAt) : "—"),
        className: "tnum whitespace-nowrap text-mist",
      },
      {
        key: "registeredAt",
        label: "Registered",
        render: (row) => formatDate(row.registeredAt),
        className: "tnum whitespace-nowrap text-mist",
      },
    ],
  },

  payments: {
    dated: true,
    filters: ({ filters, set }) => (
      <>
        <Select
          label="Status"
          value={filters.status ?? ""}
          onChange={set("status")}
          className="md:w-40"
        >
          <option value="">Any status</option>
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
        <Select
          label="Method"
          value={filters.method ?? ""}
          onChange={set("method")}
          className="md:w-32"
        >
          <option value="">Any method</option>
          {METHODS.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </Select>
      </>
    ),
    totals: (totals) => [
      { label: "Payments", value: formatNumber(totals.payments) },
      { label: "Settled", value: formatNumber(totals.settledCount) },
      { label: "Settled value", value: formatPrice(totals.settledAmount) },
    ],
    rowKey: (row) => row.paymentId,
    columns: [
      {
        key: "createdAt",
        label: "Date",
        render: (row) => formatDateTime(row.createdAt),
        className: "tnum whitespace-nowrap text-mist",
      },
      {
        key: "orderNumber",
        label: "Order",
        render: text("orderNumber"),
        className: "font-mono text-[12.5px] text-ink",
      },
      {
        key: "customer",
        label: "Customer",
        render: (row) => (
          <div className="flex flex-col">
            <span className="text-ink">{row.customer ?? "—"}</span>
            {row.email ? (
              <span className="text-[12px] text-mist">{row.email}</span>
            ) : null}
          </div>
        ),
      },
      {
        key: "amount",
        label: "Amount",
        align: "right",
        render: money("amount"),
        className: "tnum font-medium text-ink",
      },
      { key: "method", label: "Method", render: text("method"), className: "text-mist" },
      {
        key: "status",
        label: "Status",
        render: (row) => (
          <Badge tone={PAYMENT_TONE[row.status]}>{row.status}</Badge>
        ),
      },
      {
        key: "transactionId",
        label: "Transaction",
        render: (row) => row.transactionId ?? row.failureReason ?? "—",
        className: "font-mono text-[11.5px] text-mist",
      },
    ],
  },
};
