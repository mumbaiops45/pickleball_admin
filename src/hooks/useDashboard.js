"use client";

import { useCallback, useMemo } from "react";
import { useApiQuery } from "@/hooks/useApi";
import * as dashboardService from "@/services/dashboard.service";

/**
 * The dashboard reads /api/dashboard, which does every aggregation server-side.
 *
 * Nine endpoints rather than one, so a slow panel never blocks the KPI row:
 * each card and table owns its own request and renders as soon as that one
 * lands. `useDashboard` bundles the ones that always load together and exposes
 * a single `refetch` for the toolbar button.
 *
 * The sales series is kept separate (`useSalesAnalytics`) because changing the
 * range should re-fetch that chart alone, and the low-stock and top-product
 * panels take parameters of their own.
 */
export function useDashboard() {
  const summary = useApiQuery(
    useCallback((signal) => dashboardService.getSummary({ signal }), []),
  );

  const status = useApiQuery(
    useCallback(
      (signal) => dashboardService.getOrderStatusBreakdown({ signal }),
      [],
    ),
  );

  const recentOrders = useApiQuery(
    useCallback(
      (signal) => dashboardService.getRecentOrders({ limit: 8, signal }),
      [],
    ),
  );

  const categories = useApiQuery(
    useCallback(
      (signal) => dashboardService.getCategoryPerformance({ signal }),
      [],
    ),
  );

  const customers = useApiQuery(
    useCallback(
      (signal) => dashboardService.getTopCustomers({ limit: 5, signal }),
      [],
    ),
  );

  const payments = useApiQuery(
    useCallback((signal) => dashboardService.getPaymentSummary({ signal }), []),
  );

  // One button refreshes the whole screen; the panels keep their own state.
  const refetch = useCallback(() => {
    summary.refetch();
    status.refetch();
    recentOrders.refetch();
    categories.refetch();
    customers.refetch();
    payments.refetch();
  }, [summary, status, recentOrders, categories, customers, payments]);

  const totals = summary.data?.totals ?? {};
  const last30Days = summary.data?.last30Days ?? {};

  return {
    totals,
    last30Days,
    orderStatusCounts: summary.data?.orderStatus ?? {},
    meta: summary.data?.meta ?? {},
    summary,
    status,
    recentOrders,
    categories,
    customers,
    payments,
    // The banner at the top reports the summary failing; every other panel
    // reports its own, so one dead endpoint does not blank the screen.
    error: summary.error,
    loading: summary.loading,
    refetch,
  };
}

export function useSalesAnalytics(range) {
  const query = useApiQuery(
    useCallback(
      (signal) => dashboardService.getSalesAnalytics({ range, signal }),
      [range],
    ),
  );

  return {
    ...query,
    series: useMemo(() => query.data?.series ?? [], [query.data]),
    totals: query.data?.totals ?? {},
    granularity: query.data?.granularity ?? "day",
  };
}

export function useTopProducts({ limit = 6, range } = {}) {
  const query = useApiQuery(
    useCallback(
      (signal) => dashboardService.getTopProducts({ limit, range, signal }),
      [limit, range],
    ),
  );

  return { ...query, products: query.data ?? [] };
}

export function useLowStock({ threshold, limit = 8 } = {}) {
  const query = useApiQuery(
    useCallback(
      (signal) =>
        dashboardService.getLowStockProducts({ threshold, limit, signal }),
      [threshold, limit],
    ),
  );

  return {
    ...query,
    products: query.data?.products ?? [],
    threshold: query.data?.threshold ?? threshold ?? 5,
  };
}
