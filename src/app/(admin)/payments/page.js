"use client";

import { useMemo, useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataState, { FormError } from "@/components/ui/DataState";
import { Select, TextInput } from "@/components/ui/Field";
import { DownloadIcon, RefreshIcon } from "@/components/ui/Icons";
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
import { PAYMENT_TONE } from "@/services/payment.service";
import { defaultRange } from "@/services/report.service";
import { formatDateTime, formatNumber, formatPrice } from "@/lib/format";

const STATUSES = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"];
const METHODS = ["COD", "ONLINE"];


export default function PaymentsPage() {
  const [filters, setFilters] = useState(() => ({
    ...defaultRange(),
    status: "",
    method: "",
    page: 1,
    limit: 50,
  }));

  const query = useMemo(() => filters, [filters]);
  const { rows, totals, pagination, range, loading, error, refetch } = useReport(
    "payments",
    query,
  );
  const download = useReportDownload();

  const set = (key) => (event) =>
    setFilters((current) => ({
      ...current,
      [key]: event.target.value,
      page: 1,
    }));

  const filtered = filters.status || filters.method;

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        // eyebrow="Commerce"
        title="Payments"
        copy="Transactions against orders, with their gateway references."
        action={
          <>
            <Button tone="outline" icon={RefreshIcon} onClick={refetch}>
              Refresh
            </Button>
            <Button
              tone="outline"
              icon={DownloadIcon}
              loading={download.loading}
              onClick={() => download.mutate("payments", query)}
            >
              Export CSV
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 max-sm:[&>*:last-child]:col-span-2">
        <Figure label="Payments" value={formatNumber(totals.payments)} />
        <Figure label="Settled" value={formatNumber(totals.settledCount)} />
        <Figure
          label="Settled value"
          value={formatPrice(totals.settledAmount)}
        />
      </div>

      <Card padded={false}>
        <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-2 md:flex md:flex-row md:items-end">
          <TextInput
            label="From"
            type="date"
            value={filters.from}
            onChange={set("from")}
            className="md:w-44"
          />
          <TextInput
            label="To"
            type="date"
            value={filters.to}
            onChange={set("to")}
            className="md:w-44"
          />

          <Select
            label="Status"
            value={filters.status}
            onChange={set("status")}
            className="md:w-40"
          >
            <option value="">Any status</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>

          <Select
            label="Method"
            value={filters.method}
            onChange={set("method")}
            className="md:w-36"
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
              filtered ? "Nothing matches those filters" : "No payments yet"
            }
            emptyBody={
              filtered
                ? "Clear the status or method, or widen the date range."
                : "Checkout writes a payment row for every order it takes — the ledger fills as soon as the storefront takes its first one. Widen the dates if you are looking for older activity."
            }
            rows={6}
          >
            <>
             
              {totals.byStatus?.length ? (
                <div className="flex flex-wrap gap-2">
                  {totals.byStatus.map((row) => (
                    <span
                      key={row.status}
                      className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-[12.5px]"
                    >
                      <Badge tone={PAYMENT_TONE[row.status]}>{row.status}</Badge>
                      <span className="tnum text-ink">
                        {formatNumber(row.count)}
                      </span>
                      <span className="tnum text-mist">
                        {formatPrice(row.amount)}
                      </span>
                    </span>
                  ))}
                </div>
              ) : null}

              <TableOrCards
                minWidth="52rem"
                cards={
                  <Records>
                    {rows.map((payment) => (
                      <Record
                        key={payment.paymentId}
                        title={
                          <span className="font-mono text-[13px]">
                            {payment.orderNumber ?? "—"}
                          </span>
                        }
                        subtitle={
                          [payment.customer, payment.email]
                            .filter(Boolean)
                            .join(" · ") || undefined
                        }
                        badges={
                          <Badge tone={PAYMENT_TONE[payment.status]}>
                            {payment.status}
                          </Badge>
                        }
                      >
                        <RecordField label="Amount">
                          <span className="tnum font-medium">
                            {formatPrice(payment.amount)}
                          </span>
                        </RecordField>

                        <RecordField label="Method">
                          {payment.method}
                        </RecordField>

                        <RecordField label="Taken" wide>
                          <span className="tnum">
                            {formatDateTime(payment.createdAt)}
                          </span>
                        </RecordField>

                        <RecordField label="Transaction" wide>
                          <span className="font-mono text-[12px] text-mist">
                            {payment.transactionId ??
                              payment.failureReason ??
                              "—"}
                          </span>
                        </RecordField>
                      </Record>
                    ))}
                  </Records>
                }
              >
                <thead>
                  <tr>
                    <Th>Taken</Th>
                    <Th>Order</Th>
                    <Th>Customer</Th>
                    <Th align="right">Amount</Th>
                    <Th>Method</Th>
                    <Th>Status</Th>
                    <Th>Transaction</Th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((payment) => (
                    <Tr key={payment.paymentId}>
                      <Td className="tnum whitespace-nowrap text-mist">
                        {formatDateTime(payment.createdAt)}
                      </Td>
                      <Td className="font-mono text-[12.5px] text-ink">
                        {payment.orderNumber ?? "—"}
                      </Td>
                      <Td>
                        <div className="flex flex-col">
                          <span className="text-ink">
                            {payment.customer ?? "—"}
                          </span>
                          {payment.email ? (
                            <span className="text-[12px] text-mist">
                              {payment.email}
                            </span>
                          ) : null}
                        </div>
                      </Td>
                      <Td align="right" className="tnum font-medium text-ink">
                        {formatPrice(payment.amount)}
                      </Td>
                      <Td className="text-mist">{payment.method}</Td>
                      <Td>
                        <Badge tone={PAYMENT_TONE[payment.status]}>
                          {payment.status}
                        </Badge>
                      </Td>
                      <Td className="font-mono text-[12px] text-mist">
                        {payment.transactionId ?? payment.failureReason ?? "—"}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </TableOrCards>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12.5px] text-mist">
                  {formatNumber(rows.length)} of{" "}
                  {formatNumber(pagination.total ?? rows.length)} payments
                  {pagination.totalPages > 1
                    ? ` · page ${pagination.page} of ${pagination.totalPages}`
                    : ""}
                  {range?.from ? ` · ${range.timezone ?? ""}` : ""}
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
