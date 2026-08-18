"use client";

import { useCallback, useMemo, useState } from "react";
import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import * as reportService from "@/services/report.service";

/**
 * One hook for all six reports.
 *
 * `params` is an object, and `useApiQuery` keys on the fetcher's identity, so
 * it is serialised into the dependency list — passing a fresh object literal
 * from the screen on every render would otherwise refetch forever.
 */
export function useReport(report, params = {}) {
  const key = JSON.stringify(params);

  const query = useApiQuery(
    useCallback(
      (signal) => reportService.getReport(report, { ...JSON.parse(key), signal }),
      [report, key],
    ),
  );

  return {
    ...query,
    rows: useMemo(() => query.data?.rows ?? [], [query.data]),
    totals: query.data?.totals ?? {},
    pagination: query.data?.pagination ?? {},
    range: query.data?.range ?? null,
  };
}

/**
 * The CSV download. It is a mutation rather than a query — it has a side
 * effect (a file lands in Downloads) and only runs when the button is pressed.
 */
export function useReportDownload() {
  const [done, setDone] = useState(null);

  const mutation = useApiMutation(
    useCallback(async (report, params) => {
      const filename = await reportService.downloadReport(report, params);
      setDone(filename);
      return filename;
    }, []),
  );

  return { ...mutation, filename: done };
}
