"use client";

import { useState } from "react";
import Link from "next/link";
import BarBreakdown from "@/components/charts/BarBreakdown";
import DonutChart from "@/components/charts/DonutChart";
import TrendChart from "@/components/charts/TrendChart";
import PipelineStages from "@/components/dashboard/PipelineStages";
import StatCard from "@/components/dashboard/StatCard";
import Avatar from "@/components/ui/Avatar";
import Badge, { stockTone } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataState, { Notice } from "@/components/ui/DataState";
import {
  CategoriesIcon,
  CustomersIcon,
  OrdersIcon,
  PaymentsIcon,
  ProductsIcon,
  RefreshIcon,
  ReportsIcon,
  RupeeIcon,
  WarnIcon,
} from "@/components/ui/Icons";
import PageHeader from "@/components/ui/PageHeader";
import SegmentedControl from "@/components/ui/SegmentedControl";
import {
  Record,
  RecordField,
  Records,
  TableOrCards,
  Td,
  Th,
  Tr,
} from "@/components/ui/Table";
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
  ORDER_STATUS_EXITS,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_TONE,
} from "@/services/order.service";
import { PAYMENT_TONE } from "@/services/payment.service";
import {
  formatCompactPrice,
  formatDate,
  formatNumber,
  formatPeriod,
  formatPrice,
} from "@/lib/format";
import { useAuth } from "@/store/AuthProvider";



const RANGE_OPTIONS = SALES_RANGES.map((option) => ({
  value: option.value,
  label: option.label.replace("Last ", "").replace(" days", "D").replace(" months", "M"),
  title: option.label,
}));

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
  const rangeLabel =
    SALES_RANGES.find((option) => option.value === range)?.label ?? "the range";

  const points = sales.series.map((point) => ({
    label: formatPeriod(point.period),
    revenue: point.revenue,
    orders: point.orders,
  }));

  const orderStatusRows = status.data?.orderStatus ?? [];
  const orderStatusTotal = orderStatusRows.reduce(
    (sum, row) => sum + (row.count || 0),
    0,
  );

  const byStatus = new Map(orderStatusRows.map((row) => [row.status, row]));
  const toStage = (statusName) => {
    const row = byStatus.get(statusName);
    return {
      status: statusName,
      count: row?.count ?? 0,
      amount: row?.amount ?? 0,
      tone: ORDER_STATUS_TONE[statusName] ?? "neutral",
    };
  };

  const known = new Set([...ORDER_STATUS_FLOW, ...ORDER_STATUS_EXITS]);
  const stages = [
    ...ORDER_STATUS_FLOW,
    ...orderStatusRows.map((row) => row.status).filter((name) => !known.has(name)),
  ].map(toStage);
  const exits = ORDER_STATUS_EXITS.filter((name) => byStatus.has(name)).map(toStage);

  const restocking =
    (totals.outOfStockProducts ?? 0) + (totals.lowStockProducts ?? 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        // eyebrow="Overview"
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        copy="Revenue, orders and stock, aggregated by the API."
        action={
          <>
            <Button tone="outline" icon={ReportsIcon} href="/reports">
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

      {/* ── The four figures the panel is opened for ─────────────────── */}
      <section aria-label="Headline figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={formatPrice(totals.revenue)}
          caption={`${formatPrice(totals.averageOrderValue)} average order value`}
          icon={RupeeIcon}
          tone="accent"
          loading={loading}
          meter={
            totals.revenue
              ? {
                  value: totals.paidRevenue ?? 0,
                  max: totals.revenue,
                  label: `${formatPrice(totals.paidRevenue)} collected`,
                  tone: "accent",
                }
              : undefined
          }
        />

        <StatCard
          label="Orders"
          value={formatNumber(totals.orders)}
          caption={`${formatNumber(last30Days.orders)} placed in the last 30 days`}
          icon={OrdersIcon}
          href="/orders"
          loading={loading}
          delta={{
            value: last30Days.ordersChangePct,
            label: "against the 30 days before",
          }}
        />

        <StatCard
          label="Customers"
          value={formatNumber(totals.customers)}
          caption={`${formatNumber(last30Days.newCustomers)} joined in the last 30 days`}
          icon={CustomersIcon}
          href="/customers"
          loading={loading}
          meter={
            totals.customers
              ? {
                  value: last30Days.newCustomers ?? 0,
                  max: totals.customers,
                  label: "Share joined this month",
                  tone: "neutral",
                }
              : undefined
          }
        />

        <StatCard
          label="Needs restocking"
          value={formatNumber(restocking)}
          caption={`${formatNumber(totals.outOfStockProducts)} out of stock · ${formatNumber(
            totals.lowStockProducts,
          )} at or under ${meta.lowStockThreshold ?? 5}`}
          icon={WarnIcon}
          tone={totals.outOfStockProducts ? "bad" : "warn"}
          href="/products"
          loading={loading}
          meter={
            totals.products
              ? {
                  value: restocking,
                  max: totals.products,
                  label: `Of ${formatNumber(totals.products)} products`,
                  tone: totals.outOfStockProducts ? "bad" : "warn",
                }
              : undefined
          }
        />
      </section>

      {/* ── The trend behind them ────────────────────────────────────── */}
      <Card
        icon={ReportsIcon}
        title="Sales performance"
        subtitle={
          meta.revenueRule
            ? meta.revenueRule
            : "Revenue and order count, cancelled orders excluded"
        }
        action={
          <SegmentedControl
            label="Sales range"
            value={range}
            onChange={setRange}
            options={RANGE_OPTIONS}
          />
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
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-8">
            {/* Two charts rather than two y-axes: revenue in rupees and orders
                as a count share an x-axis but nothing else. Orders is the
                secondary read, so it gets the short chart. */}
            <div className="order-2 flex flex-col gap-7 xl:order-1">
              <TrendChart
                label="Revenue"
                caption={rangeLabel.toLowerCase()}
                points={points.map((point) => ({
                  label: point.label,
                  value: point.revenue,
                }))}
                formatValue={formatPrice}
                formatTick={formatCompactPrice}
              />

              <TrendChart
                label="Orders"
                height="sm"
                caption={rangeLabel.toLowerCase()}
                points={points.map((point) => ({
                  label: point.label,
                  value: point.orders,
                }))}
                formatValue={formatNumber}
                formatTick={(value) => String(Math.round(value))}
              />
            </div>

            <aside className="order-1 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:order-2 xl:grid-cols-1 xl:content-start">
              <Figure
                label="Revenue"
                value={formatPrice(sales.totals.revenue)}
                emphasis
              />
              <Figure label="Orders" value={formatNumber(sales.totals.orders)} />
              <Figure
                label="Average order"
                value={formatPrice(sales.totals.averageOrderValue)}
              />
              {sales.totals.units === undefined ? null : (
                <Figure
                  label="Units sold"
                  value={formatNumber(sales.totals.units)}
                />
              )}
            </aside>
          </div>
        </DataState>
      </Card>

      {/* ── Where the orders currently sit ───────────────────────────── */}
      <Card
        icon={OrdersIcon}
        title="Order pipeline"
        subtitle="Every order ever placed, by the stage it reached"
        action={
          <Button tone="ghost" size="sm" href="/orders">
            All orders
          </Button>
        }
      >
        <DataState
          loading={status.loading}
          error={status.error}
          onRetry={status.refetch}
          isEmpty={!orderStatusRows.length}
          emptyTitle="No orders yet"
          emptyBody="Status splits appear once the first order lands."
          rows={3}
        >
          <PipelineStages stages={stages} exits={exits} total={orderStatusTotal} />
        </DataState>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card
          icon={PaymentsIcon}
          title="Settlement"
          subtitle="Orders by how they settled"
        >
          <DataState
            loading={status.loading}
            error={status.error}
            onRetry={status.refetch}
            isEmpty={!status.data?.paymentStatus?.length}
            emptyTitle="Nothing to settle yet"
            rows={3}
          >
            <DonutChart
              centerLabel="orders"
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

        <Card
          icon={CategoriesIcon}
          title="Revenue by category"
          subtitle="Share of all sales"
        >
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
      </div>

      {/* ── The tables an operator drills into ───────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <Card
          title="Recent orders"
          subtitle="Newest first"
          padded={false}
          action={
            <Button tone="ghost" size="sm" href="/orders">
              All orders
            </Button>
          }
        >
          <div className="p-4 pt-4 sm:p-5 sm:pt-4">
            <DataState
              loading={recentOrders.loading}
              error={recentOrders.error}
              onRetry={recentOrders.refetch}
              isEmpty={!recentOrders.data?.length}
              emptyTitle="No orders yet"
              emptyBody="The storefront has not taken an order."
              rows={5}
            >
              <TableOrCards
                minWidth="44rem"
                cards={
                  <Records>
                    {(recentOrders.data ?? []).map((order) => (
                      <Record
                        key={order.id}
                        media={
                          <Avatar
                            user={{ name: order.customer, email: order.email }}
                            size="md"
                          />
                        }
                        title={order.customer}
                        subtitle={`${order.orderNumber} · ${formatNumber(
                          order.itemCount,
                        )} ${order.itemCount === 1 ? "item" : "items"}`}
                        badges={
                          <>
                            <Badge
                              dot
                              tone={ORDER_STATUS_TONE[order.orderStatus]}
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
                        <RecordField label="Placed">
                          <span className="tnum">
                            {formatDate(order.createdAt)}
                          </span>
                        </RecordField>
                      </Record>
                    ))}
                  </Records>
                }
              >
                <thead>
                  <tr>
                    <Th>Order</Th>
                    <Th>Customer</Th>
                    <Th align="right">Total</Th>
                    <Th>Payment</Th>
                    <Th>Status</Th>
                    <Th align="right">Placed</Th>
                  </tr>
                </thead>
                <tbody>
                  {(recentOrders.data ?? []).map((order) => (
                    <Tr key={order.id}>
                      <Td>
                        <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[12px] text-ink">
                          {order.orderNumber}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            user={{ name: order.customer, email: order.email }}
                            size="sm"
                          />
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-ink">
                              {order.customer}
                            </span>
                            <span className="truncate text-[12px] text-mist">
                              {formatNumber(order.itemCount)}{" "}
                              {order.itemCount === 1 ? "item" : "items"}
                              {order.email ? ` · ${order.email}` : ""}
                            </span>
                          </div>
                        </div>
                      </Td>
                      <Td align="right" className="tnum font-medium text-ink">
                        {formatPrice(order.totalAmount)}
                      </Td>
                      <Td>
                        <div className="flex flex-col items-start gap-1">
                          <Badge tone={PAYMENT_STATUS_TONE[order.paymentStatus]}>
                            {order.paymentStatus}
                          </Badge>
                          <span className="text-[11.5px] text-mist">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </Td>
                      <Td>
                        <Badge dot tone={ORDER_STATUS_TONE[order.orderStatus]}>
                          {order.orderStatus}
                        </Badge>
                      </Td>
                      <Td
                        align="right"
                        className="tnum whitespace-nowrap text-mist"
                      >
                        {formatDate(order.createdAt)}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </TableOrCards>
            </DataState>
          </div>
        </Card>

        <Card
          icon={WarnIcon}
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
                <li key={product.id}>
                  <Link
                    href="/products"
                    className="group flex items-center justify-between gap-3 py-2.5 first:pt-0"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm text-ink group-hover:text-volt-deep">
                        {product.name}
                      </span>
                      <span className="truncate text-[12px] text-mist">
                        {product.category ?? "Uncategorised"}
                      </span>
                    </span>
                    <Badge tone={SEVERITY_TONE[product.severity]}>
                      {product.severity === "OUT_OF_STOCK"
                        ? SEVERITY_LABEL.OUT_OF_STOCK
                        : `${formatNumber(product.stock)} left`}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </DataState>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <Card
          icon={ProductsIcon}
          title="Best sellers"
          subtitle="By revenue, all time"
          padded={false}
        >
          <div className="p-4 pt-4 sm:p-5 sm:pt-4">
            <DataState
              loading={topProducts.loading}
              error={topProducts.error}
              onRetry={topProducts.refetch}
              isEmpty={topProducts.products.length === 0}
              emptyTitle="Nothing sold yet"
              emptyBody="Products appear here once they are part of an order."
              rows={4}
            >
              <BestSellers products={topProducts.products} />
            </DataState>
          </div>
        </Card>

        <Card
          icon={CustomersIcon}
          title="Top customers"
          subtitle="By lifetime spend"
          action={
            <Button tone="ghost" size="sm" href="/customers">
              Customers
            </Button>
          }
        >
          <DataState
            loading={customers.loading}
            error={customers.error}
            onRetry={customers.refetch}
            isEmpty={!customers.data?.length}
            emptyTitle="No customers yet"
            rows={3}
          >
            <ol className="flex flex-col divide-y divide-line">
              {(customers.data ?? []).map((customer, index) => (
                <li
                  key={customer.userId}
                  className="flex items-center gap-3 py-2.5 first:pt-0"
                >
                  <span className="tnum w-4 shrink-0 text-[12px] font-medium text-faint">
                    {index + 1}
                  </span>
                  <Avatar user={{ name: customer.name }} size="sm" />
                  <div className="flex min-w-0 flex-1 flex-col">
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
            </ol>
          </DataState>
        </Card>
      </div>

      <Card
        icon={PaymentsIcon}
        title="Payments ledger"
        subtitle="Payment records by status, and the methods orders were placed with"
        action={
          <Button tone="ghost" size="sm" href="/payments">
            Ledger
          </Button>
        }
      >
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
          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            <section className="flex flex-col gap-3">
              <h3 className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
                By status
              </h3>
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
            </section>

            <section className="flex flex-col gap-3 border-t border-line pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <h3 className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-faint">
                By method
              </h3>
              <BarBreakdown
                rows={(payments.data?.orderPaymentMethods ?? []).map((row) => ({
                  label: row.method,
                  value: row.amount,
                  caption: `${formatNumber(row.orders)} orders`,
                }))}
                formatValue={formatPrice}
                empty="No orders to attribute."
              />
            </section>
          </div>
        </DataState>
      </Card>
    </div>
  );
}

/** A number under a label — the range totals beside the sales charts. */
function Figure({ label, value, emphasis = false }) {
  return (
    <div
      className={`flex flex-col gap-1.5 rounded-lg border px-3.5 py-3 sm:px-4 ${
        emphasis
          ? "border-volt-deep/25 bg-volt/10"
          : "border-line bg-surface/60"
      }`}
    >
      <span className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-mist">
        {label}
      </span>
      <span className="tnum text-[clamp(1.05rem,4.4vw,1.3rem)] font-semibold leading-none tracking-[-0.03em] text-ink">
        {value}
      </span>
    </div>
  );
}


function BestSellers({ products }) {
  const top = Math.max(0, ...products.map((product) => product.revenue || 0));

  return (
   
    <TableOrCards
      minWidth="30rem"
      cards={
        <Records>
          {products.map((product, index) => (
            <Record
              key={product.productId}
              title={`${index + 1}. ${product.name}`}
              subtitle={product.sku ?? undefined}
              badges={
                <Badge tone={stockTone(product.stock)}>
                  {formatNumber(product.stock)}
                </Badge>
              }
            >
              <RecordField label="Units">
                <span className="tnum">{formatNumber(product.unitsSold)}</span>
              </RecordField>
              <RecordField label="Revenue">
                <span className="tnum font-medium">
                  {formatPrice(product.revenue)}
                </span>
              </RecordField>
            </Record>
          ))}
        </Records>
      }
    >
      <thead>
        <tr>
          <Th className="w-8">#</Th>
          <Th>Product</Th>
          <Th align="right">Units</Th>
          <Th align="right">Revenue</Th>
          <Th align="right">Stock</Th>
        </tr>
      </thead>
      <tbody>
        {products.map((product, index) => (
          <Tr key={product.productId}>
            <Td className="tnum text-[12px] font-medium text-faint">
              {index + 1}
            </Td>
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
            <Td align="right">
              <span className="tnum block font-medium text-ink">
                {formatPrice(product.revenue)}
              </span>
              <span className="mt-1 ml-auto block h-1 w-16 overflow-hidden rounded-full bg-surface-2">
                <span
                  className="block h-full rounded-full bg-volt-deep"
                  style={{
                    width: `${
                      top ? Math.max(((product.revenue || 0) / top) * 100, 3) : 0
                    }%`,
                  }}
                />
              </span>
            </Td>
            <Td align="right">
              <Badge tone={stockTone(product.stock)}>
                {formatNumber(product.stock)}
              </Badge>
            </Td>
          </Tr>
        ))}
      </tbody>
    </TableOrCards>
  );
}
