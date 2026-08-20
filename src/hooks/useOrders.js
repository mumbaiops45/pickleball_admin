"use client";

import { useCallback } from "react";
import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import * as orderService from "@/services/order.service";


export function useOrder(id) {
  return useApiQuery(
    useCallback((signal) => orderService.getOrder(id, { signal }), [id]),
    { enabled: Boolean(id) },
  );
}

export function useUpdateOrderStatus() {
  return useApiMutation(orderService.updateOrderStatus);
}

export function useCancelOrder() {
  return useApiMutation(orderService.cancelOrder);
}
