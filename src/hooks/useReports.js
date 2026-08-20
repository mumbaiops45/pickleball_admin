"use client";

import { useCallback, useMemo, useState } from "react";
import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import * as reportService from "@/services/report.service";


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
