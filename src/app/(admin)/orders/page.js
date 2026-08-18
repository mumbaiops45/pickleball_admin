"use client";

import { useMemo, useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataState, { FormError } from "@/components/ui/DataState";
import { Select, TextInput } from "@/components/ui/Field";
import {
  DownloadIcon,
  RefreshIcon,
  SearchIcon,
} from "@/components/ui/Icons";
import PageHeader from "@/components/ui/PageHeader";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { useReport, useReportDownload } from "@/hooks/useReports";
import {
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_TONE,
} from "@/services/order.service";
import { defaultRange } from "@/services/report.service";
import { formatDate, formatNumber, formatPrice } from "@/lib/format";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];
const METHODS = ["COD", "ONLINE"];

/**
 * The order register, read from `GET /api/reports/orders`.
 *
 * Every `/api/orders` route filters by `req.user`, so there is still nothing
 * store-wide to read there — but the reports router answers exactly that:
 * admin-only, one row per order with the customer and shipping address
 * resolved, filtered by date, status, payment and free text, and paged.
 *
 * Read-only: moving an order through its statuses needs
 * `PATCH /api/orders/:id/status`, which does not exist on any router, so there
 * is nothing to wire an action to yet.
 */
export default function OrdersPage() {
  const [filters, setFilters] = useState(() => ({
    ...defaultRange(),
    search: "",
    orderStatus: "",
    paymentStatus: "",
    paymentMethod: "",
    page: 1,
    limit: 50,
  }));

  const query = useMemo(() => filters, [filters]);
  const { rows, totals, pagination, loading, error, refetch } = useReport(
    "orders",
    query,
  );
  const download = useReportDownload();

  const set = (key) => (event) =>
    setFilters((current) => ({
      ...current,
      [key]: event.target.value,
      page: 1,
    }));

  const narrowed =
    filters.search ||
    filters.orderStatus ||
    filters.paymentStatus ||
    filters.paymentMethod;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Commerce"
        title="Orders"
        copy="Every order placed on the storefront, newest first."
        action={
          <>
            <Button tone="outline" icon={RefreshIcon} onClick={refetch}>
              Refresh
            </Button>
            <Button
              tone="outline"
              icon={DownloadIcon}
              loading={download.loading}
              onClick={() => download.mutate("orders", query)}
            >
              Export CSV
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Figure label="Orders" value={formatNumber(totals.matchedOrders)} />
        <Figure label="Revenue" value={formatPrice(totals.grossRevenue)} />
        <Figure label="Shipping" value={formatPrice(totals.shipping)} />
        <Figure label="Units" value={formatNumber(totals.unitsSold)} />
      </div>

      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:flex-wrap md:items-end">
          <div className="relative flex-1 md:min-w-56">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-[2.85rem] size-4 -translate-y-1/2 text-faint"
              aria-hidden="true"
            />
            <TextInput
              label="Search"
              type="search"
              placeholder="Order number, name or e-mail"
              value={filters.search}
              onChange={set("search")}
              className="pl-9"
            />
          </div>

          <TextInput
            label="From"
            type="date"
            value={filters.from}
            onChange={set("from")}
            className="md:w-40"
          />
          <TextInput
            label="To"
            type="date"
            value={filters.to}
            onChange={set("to")}
            className="md:w-40"
          />

          <Select
            label="Status"
            value={filters.orderStatus}
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
            value={filters.paymentStatus}
            onChange={set("paymentStatus")}
            className="md:w-40"
          >
            <option value="">Any payment</option>
            {PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>

          <Select
            label="Method"
            value={filters.paymentMethod}
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
        </div>

        <div className="flex flex-col gap-5 p-5">
          <FormError error={download.error} />

          <DataState
            loading={loading}
            error={error}
            onRetry={refetch}
            isEmpty={rows.length === 0}
            emptyTitle={
              narrowed ? "Nothing matches those filters" : "No orders yet"
            }
            emptyBody={
              narrowed
                ? "Clear the search or a filter, or widen the date range."
                : "Orders appear here as soon as the storefront takes one. Widen the dates if you are looking for older activity."
            }
            rows={6}
          >
            <>
              <Table>
                <thead>
                  <tr>
                    <Th>Order</Th>
                    <Th>Placed</Th>
                    <Th>Customer</Th>
                    <Th>Ships to</Th>
                    <Th align="right">Units</Th>
                    <Th align="right">Total</Th>
                    <Th>Payment</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((order) => (
                    <Tr key={order.orderNumber}>
                      <Td className="font-mono text-[12.5px] font-medium text-ink">
                        {order.orderNumber}
                      </Td>
                      <Td className="tnum whitespace-nowrap text-mist">
                        {formatDate(order.placedAt)}
                      </Td>
                      <Td>
                        <div className="flex flex-col">
                          <span className="text-ink">{order.customer}</span>
                          {order.email ? (
                            <span className="text-[12px] text-mist">
                              {order.email}
                            </span>
                          ) : null}
                        </div>
                      </Td>
                      <Td className="text-mist">
                        {[order.city, order.state].filter(Boolean).join(", ") ||
                          "—"}
                      </Td>
                      <Td align="right" className="tnum text-mist">
                        {formatNumber(order.units)}
                      </Td>
                      <Td align="right" className="tnum font-medium text-ink">
                        {formatPrice(order.totalAmount)}
                      </Td>
                      <Td>
                        <Badge tone={PAYMENT_STATUS_TONE[order.paymentStatus]}>
                          {order.paymentMethod} · {order.paymentStatus}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge tone={ORDER_STATUS_TONE[order.orderStatus]} dot>
                          {order.orderStatus}
                        </Badge>
                        {order.cancellationReason ? (
                          <span
                            className="ml-2 text-[12px] text-mist"
                            title={order.cancellationReason}
                          >
                            {order.cancellationReason}
                          </span>
                        ) : null}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12.5px] text-mist">
                  {formatNumber(rows.length)} of{" "}
                  {formatNumber(pagination.total ?? rows.length)} orders
                  {pagination.totalPages > 1
                    ? ` · page ${pagination.page} of ${pagination.totalPages}`
                    : ""}
                </p>

                {pagination.totalPages > 1 ? (
                  <div className="flex gap-2">
                    <Button
                      tone="outline"
                      size="sm"
                      disabled={!pagination.hasPrev}
                      onClick={() =>
                        setFilters((current) => ({
                          ...current,
                          page: current.page - 1,
                        }))
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      tone="outline"
                      size="sm"
                      disabled={!pagination.hasNext}
                      onClick={() =>
                        setFilters((current) => ({
                          ...current,
                          page: current.page + 1,
                        }))
                      }
                    >
                      Next
                    </Button>
                  </div>
                ) : null}
              </div>
            </>
          </DataState>
        </div>
      </Card>
    </div>
  );
}

function Figure({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-line bg-paper px-5 py-4">
      <span className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-mist">
        {label}
      </span>
      <span className="tnum text-[1.5rem] font-semibold leading-none text-ink">
        {value}
      </span>
    </div>
  );
}
