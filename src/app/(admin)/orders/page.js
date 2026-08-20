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
import {
  Record,
  RecordField,
  Records,
  TableOrCards,
  Td,
  Th,
  Tr,
} from "@/components/ui/Table";
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
        // eyebrow="Commerce"
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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Figure label="Orders" value={formatNumber(totals.matchedOrders)} />
        <Figure label="Revenue" value={formatPrice(totals.grossRevenue)} />
        <Figure label="Shipping" value={formatPrice(totals.shipping)} />
        <Figure label="Units" value={formatNumber(totals.unitsSold)} />
      </div>

      <Card padded={false}>
        <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-2 md:flex md:flex-row md:flex-wrap md:items-end">
          <div className="relative sm:col-span-2 md:min-w-56 md:flex-1">
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

        <div className="flex flex-col gap-5 p-4 sm:p-5">
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
              <TableOrCards
                minWidth="56rem"
                cards={
                  <Records>
                    {rows.map((order) => (
                      <Record
                        key={order.orderNumber}
                        title={
                          <span className="font-mono text-[13px]">
                            {order.orderNumber}
                          </span>
                        }
                        subtitle={
                          [order.customer, order.email]
                            .filter(Boolean)
                            .join(" · ") || undefined
                        }
                        badges={
                          <>
                            <Badge
                              tone={ORDER_STATUS_TONE[order.orderStatus]}
                              dot
                            >
                              {order.orderStatus}
                            </Badge>
                            <Badge
                              tone={PAYMENT_STATUS_TONE[order.paymentStatus]}
                            >
                              {order.paymentStatus}
                            </Badge>
                          </>
                        }
                      >
                        <RecordField label="Total">
                          <span className="tnum font-medium">
                            {formatPrice(order.totalAmount)}
                          </span>
                        </RecordField>

                        <RecordField label="Units">
                          <span className="tnum">
                            {formatNumber(order.units)}
                          </span>
                        </RecordField>

                        <RecordField label="Placed">
                          <span className="tnum">
                            {formatDate(order.placedAt)}
                          </span>
                        </RecordField>

                        <RecordField label="Method">
                          {order.paymentMethod}
                        </RecordField>

                        <RecordField label="Ships to" wide>
                          {[order.city, order.state]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </RecordField>

                        {order.cancellationReason ? (
                          <RecordField label="Cancelled" wide>
                            {order.cancellationReason}
                          </RecordField>
                        ) : null}
                      </Record>
                    ))}
                  </Records>
                }
              >
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
              </TableOrCards>

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
    <div className="flex flex-col gap-1 rounded-xl border border-line bg-paper px-4 py-3.5 sm:px-5 sm:py-4">
      <span className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-mist sm:text-[11.5px]">
        {label}
      </span>
      <span className="tnum text-[clamp(1.15rem,4.6vw,1.5rem)] font-semibold leading-none text-ink">
        {value}
      </span>
    </div>
  );
}
