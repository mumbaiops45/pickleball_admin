"use client";

import { useState } from "react";
import Link from "next/link";
import BarBreakdown from "@/components/charts/BarBreakdown";
import TrendChart from "@/components/charts/TrendChart";
import StatCard from "@/components/dashboard/StatCard";
import Badge, { stockTone } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataState, { Notice } from "@/components/ui/DataState";
import { Select } from "@/components/ui/Field";
import {
  CustomersIcon,
  InventoryIcon,
  OrdersIcon,
  ProductsIcon,
  RefreshIcon,
  RupeeIcon,
  WarnIcon,
} from "@/components/ui/Icons";
import PageHeader from "@/components/ui/PageHeader";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import {
  useDashboard,
  useLowStock,
  useSalesAnalytics,
  useTopProducts,
} from "@/hooks/useDashboard";
import {
  SALES_RANGES,
  SEVERITY_LABEL,
  SEVERITY_TONE,
} from "@/services/dashboard.service";
import {
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_TONE,
} from "@/services/order.service";
import { PAYMENT_TONE } from "@/services/payment.service";
import {
  formatCompactPrice,
  formatDate,
  formatNumber,
  formatPercent,
  formatPeriod,
  formatPrice,
} from "@/lib/format";
import { useAuth } from "@/store/AuthProvider";

/**
 * Everything on this screen comes from /api/dashboard, which does the
 * aggregation in Mongo — the panel formats numbers and draws them, and never
 * sums a collection in the browser.
 *
 * Each panel owns its own request, so a slow aggregation (top products across
 * every order) does not hold up the KPI row, and one failing endpoint leaves
 * the rest of the screen readable.
 *
 * Revenue excludes cancelled orders; that rule lives on the server and is
 * echoed back in `meta.revenueRule`.
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const [range, setRange] = useState("30d");

  const {
    totals,
    last30Days,
    meta,
    status,
    recentOrders,
    categories,
    customers,
    payments,
    error,
    loading,
    refetch,
  } = useDashboard();

  const sales = useSalesAnalytics(range);
  const topProducts = useTopProducts({ limit: 6 });
  const lowStock = useLowStock({ limit: 8 });

  const firstName = user?.name?.trim().split(" ")[0];
  const points = sales.series.map((point) => ({
    label: formatPeriod(point.period),
    revenue: point.revenue,
    orders: point.orders,
  }));

  return (
    <div className="flex flex-col gap-7">
      <PageHeader
        eyebrow="Overview"
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        copy="Revenue, orders and stock, aggregated by the API."
        action={
          <>
            <Button tone="outline" href="/reports">
              Reports
            </Button>
            <Button tone="outline" icon={RefreshIcon} onClick={refetch}>
              Refresh
            </Button>
          </>
        }
      />

      {error ? (
        <Notice
          tone="bad"
          title={
            error.isNetworkError
              ? "Cannot reach the API"
              : "The dashboard summary failed"
          }
          body={error.message}
          action={
            <Button tone="outline" size="sm" icon={RefreshIcon} onClick={refetch}>
              Try again
            </Button>
          }
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatPrice(totals.revenue)}
          caption={`${formatPrice(totals.paidRevenue)} collected · ${formatPrice(
            totals.averageOrderValue,
          )} average order`}
          icon={RupeeIcon}
          tone="accent"
          loading={loading}
        />
        <StatCard
          label="Orders"
          value={formatNumber(totals.orders)}
          caption={`${formatNumber(last30Days.orders)} in 30 days · ${formatPercent(
            last30Days.ordersChangePct,
          )} on the month before`}
          icon={OrdersIcon}
          href="/orders"
          loading={loading}
        />
        <StatCard
          label="Customers"
          value={formatNumber(totals.customers)}
          caption={`${formatNumber(last30Days.newCustomers)} joined in the last 30 days`}
          icon={CustomersIcon}
          href="/customers"
          loading={loading}
        />
        <StatCard
          label="Needs restocking"
          value={formatNumber(
            (totals.outOfStockProducts ?? 0) + (totals.lowStockProducts ?? 0),
          )}
          caption={`${formatNumber(totals.outOfStockProducts)} out of stock · ${formatNumber(
            totals.lowStockProducts,
          )} at or under ${meta.lowStockThreshold ?? 5}`}
          icon={WarnIcon}
          tone={totals.outOfStockProducts ? "bad" : "warn"}
          href="/products"
          loading={loading}
        />
      </div>

      <Card
        title="Sales"
        subtitle={`Revenue and order count, ${
          meta.revenueRule
            ? meta.revenueRule.toLowerCase()
            : "cancelled orders excluded"
        }`}
        action={
          <Select
            label=""
            aria-label="Range"
            value={range}
            onChange={(event) => setRange(event.target.value)}
            className="h-9 w-44 text-[13px]"
          >
            {SALES_RANGES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        }
      >
        <DataState
          loading={sales.loading}
          error={sales.error}
          onRetry={sales.refetch}
          isEmpty={points.length === 0}
          emptyTitle="No sales data"
          emptyBody="The API returned an empty series for this range."
          rows={3}
        >
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Figure label="Revenue" value={formatPrice(sales.totals.revenue)} />
              <Figure label="Orders" value={formatNumber(sales.totals.orders)} />
              <Figure
                label="Average order"
                value={formatPrice(sales.totals.averageOrderValue)}
              />
            </div>

            {/* Two charts rather than two y-axes: revenue in rupees and orders
                as a count share an x-axis but nothing else. */}
            <TrendChart
              label="Revenue"
              points={points.map((point) => ({
                label: point.label,
                value: point.revenue,
              }))}
              formatValue={formatPrice}
              formatTick={formatCompactPrice}
            />

            <TrendChart
              label="Orders"
              points={points.map((point) => ({
                label: point.label,
                value: point.orders,
              }))}
              formatValue={formatNumber}
              formatTick={(value) => String(Math.round(value))}
            />
          </div>
        </DataState>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Order status" subtitle="Every order ever placed">
          <DataState
            loading={status.loading}
            error={status.error}
            onRetry={status.refetch}
            isEmpty={!status.data?.orderStatus?.length}
            emptyTitle="No orders yet"
            emptyBody="Status splits appear once the first order lands."
            rows={3}
          >
            <BarBreakdown
              rows={(status.data?.orderStatus ?? []).map((row) => ({
                label: row.status,
                value: row.count,
                caption: formatPrice(row.amount),
                tone: ORDER_STATUS_TONE[row.status] ?? "neutral",
              }))}
              formatValue={formatNumber}
              empty="No orders yet."
            />
          </DataState>
        </Card>

        <Card title="Payment status" subtitle="Orders by how they settled">
          <DataState
            loading={status.loading}
            error={status.error}
            onRetry={status.refetch}
            isEmpty={!status.data?.paymentStatus?.length}
            emptyTitle="Nothing to settle yet"
            rows={3}
          >
            <BarBreakdown
              rows={(status.data?.paymentStatus ?? []).map((row) => ({
                label: row.status,
                value: row.count,
                caption: formatPrice(row.amount),
                tone: PAYMENT_STATUS_TONE[row.status] ?? "neutral",
              }))}
              formatValue={formatNumber}
              empty="No payments yet."
            />
          </DataState>
        </Card>
      </div>

      <Card
        title="Recent orders"
        subtitle="Newest first"
        action={
          <Button tone="ghost" size="sm" href="/reports">
            Order report
          </Button>
        }
        padded={false}
      >
        <div className="p-5 pt-4">
          <DataState
            loading={recentOrders.loading}
            error={recentOrders.error}
            onRetry={recentOrders.refetch}
            isEmpty={!recentOrders.data?.length}
            emptyTitle="No orders yet"
            emptyBody="The storefront has not taken an order."
            rows={5}
          >
            <Table>
              <thead>
                <tr>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th align="right">Items</Th>
                  <Th align="right">Total</Th>
                  <Th>Payment</Th>
                  <Th>Status</Th>
                  <Th>Placed</Th>
                </tr>
              </thead>
              <tbody>
                {(recentOrders.data ?? []).map((order) => (
                  <Tr key={order.id}>
                    <Td className="font-mono text-[12.5px] text-ink">
                      {order.orderNumber}
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
                    <Td align="right" className="tnum text-mist">
                      {formatNumber(order.itemCount)}
                    </Td>
                    <Td align="right" className="tnum font-medium text-ink">
                      {formatPrice(order.totalAmount)}
                    </Td>
                    <Td>
                      <Badge tone={PAYMENT_STATUS_TONE[order.paymentStatus]}>
                        {order.paymentStatus}
                      </Badge>
                      <span className="ml-2 text-[12px] text-mist">
                        {order.paymentMethod}
                      </span>
                    </Td>
                    <Td>
                      <Badge tone={ORDER_STATUS_TONE[order.orderStatus]}>
                        {order.orderStatus}
                      </Badge>
                    </Td>
                    <Td className="tnum whitespace-nowrap text-mist">
                      {formatDate(order.createdAt)}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </DataState>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card title="Best sellers" subtitle="By revenue, all time" padded={false}>
          <div className="p-5 pt-4">
            <DataState
              loading={topProducts.loading}
              error={topProducts.error}
              onRetry={topProducts.refetch}
              isEmpty={topProducts.products.length === 0}
              emptyTitle="Nothing sold yet"
              emptyBody="Products appear here once they are part of an order."
              rows={4}
            >
              <Table className="min-w-0">
                <thead>
                  <tr>
                    <Th>Product</Th>
                    <Th align="right">Units</Th>
                    <Th align="right">Revenue</Th>
                    <Th align="right">Stock</Th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.products.map((product) => (
                    <Tr key={product.productId}>
                      <Td>
                        <div className="flex flex-col">
                          <span className="text-ink">{product.name}</span>
                          <span className="font-mono text-[11.5px] text-mist">
                            {product.sku ?? "—"}
                          </span>
                        </div>
                      </Td>
                      <Td align="right" className="tnum text-mist">
                        {formatNumber(product.unitsSold)}
                      </Td>
                      <Td align="right" className="tnum font-medium text-ink">
                        {formatPrice(product.revenue)}
                      </Td>
                      <Td align="right">
                        <Badge tone={stockTone(product.stock)}>
                          {formatNumber(product.stock)}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </DataState>
          </div>
        </Card>

        <Card
          title="Low stock"
          subtitle={`At or under ${lowStock.threshold} units`}
          action={
            <Button tone="ghost" size="sm" href="/products">
              Products
            </Button>
          }
        >
          <DataState
            loading={lowStock.loading}
            error={lowStock.error}
            onRetry={lowStock.refetch}
            isEmpty={lowStock.products.length === 0}
            emptyTitle="Everything is stocked"
            emptyBody="No product is at or under the threshold."
            rows={3}
          >
            <ul className="flex flex-col divide-y divide-line">
              {lowStock.products.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <Link
                    href="/products"
                    className="min-w-0 flex-1 truncate text-sm text-ink hover:text-volt-deep"
                  >
                    {product.name}
                    <span className="ml-2 text-[12px] text-mist">
                      {product.category ?? "Uncategorised"}
                    </span>
                  </Link>
                  <Badge tone={SEVERITY_TONE[product.severity]}>
                    {product.severity === "OUT_OF_STOCK"
                      ? SEVERITY_LABEL.OUT_OF_STOCK
                      : `${formatNumber(product.stock)} left`}
                  </Badge>
                </li>
              ))}
            </ul>
          </DataState>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card title="Revenue by category" subtitle="Share of all sales">
          <DataState
            loading={categories.loading}
            error={categories.error}
            onRetry={categories.refetch}
            isEmpty={!categories.data?.length}
            emptyTitle="No category sales"
            rows={3}
          >
            <BarBreakdown
              rows={(categories.data ?? []).map((row) => ({
                label: row.name,
                value: row.revenue,
                caption: `${row.sharePct}%`,
              }))}
              formatValue={formatPrice}
              empty="No category has sold anything yet."
            />
          </DataState>
        </Card>

        <Card title="Top customers" subtitle="By lifetime spend" padded={false}>
          <div className="p-5 pt-4">
            <DataState
              loading={customers.loading}
              error={customers.error}
              onRetry={customers.refetch}
              isEmpty={!customers.data?.length}
              emptyTitle="No customers yet"
              rows={3}
            >
              <ul className="flex flex-col divide-y divide-line">
                {(customers.data ?? []).map((customer) => (
                  <li
                    key={customer.userId}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm text-ink">
                        {customer.name ?? "Deleted account"}
                      </span>
                      <span className="truncate text-[12px] text-mist">
                        {formatNumber(customer.orders)} orders ·{" "}
                        {formatPrice(customer.averageOrderValue)} average
                      </span>
                    </div>
                    <span className="tnum shrink-0 text-sm font-medium text-ink">
                      {formatPrice(customer.totalSpent)}
                    </span>
                  </li>
                ))}
              </ul>
            </DataState>
          </div>
        </Card>

        <Card title="Payments" subtitle="Ledger by status, orders by method">
          <DataState
            loading={payments.loading}
            error={payments.error}
            onRetry={payments.refetch}
            isEmpty={
              !payments.data?.payments?.length &&
              !payments.data?.orderPaymentMethods?.length
            }
            emptyTitle="No payments yet"
            rows={3}
          >
            <div className="flex flex-col gap-5">
              <BarBreakdown
                rows={(payments.data?.payments ?? []).map((row) => ({
                  label: row.status,
                  value: row.amount,
                  caption: `${formatNumber(row.count)} payments`,
                  tone: PAYMENT_TONE[row.status] ?? "neutral",
                }))}
                formatValue={formatPrice}
                empty="The payment collection is empty."
              />

              <div className="flex flex-col gap-2 border-t border-line pt-4">
                <p className="text-[11.5px] font-semibold uppercase tracking-wider text-faint">
                  Order payment methods
                </p>
                <BarBreakdown
                  rows={(payments.data?.orderPaymentMethods ?? []).map((row) => ({
                    label: row.method,
                    value: row.amount,
                    caption: `${formatNumber(row.orders)} orders`,
                  }))}
                  formatValue={formatPrice}
                  empty="No orders to attribute."
                />
              </div>
            </div>
          </DataState>
        </Card>
      </div>
    </div>
  );
}

/** A number under a label — the summary line above the charts. */
function Figure({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-line bg-surface px-4 py-3">
      <span className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-mist">
        {label}
      </span>
      <span className="tnum text-[1.35rem] font-semibold leading-none text-ink">
        {value}
      </span>
    </div>
  );
}
