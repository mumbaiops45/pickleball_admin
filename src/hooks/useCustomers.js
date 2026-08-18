"use client";

import { useCallback, useMemo } from "react";
import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import * as customerService from "@/services/customer.service";

/**
 * `GET /auth/users` returns every account unfiltered, so the search and the
 * role/state filters run in the browser — same arrangement as the products
 * list.
 */
export function useCustomers({ search = "", role = "", state = "" } = {}) {
  const query = useApiQuery(
    useCallback((signal) => customerService.listCustomers({ signal }), []),
  );

  const customers = useMemo(() => query.data ?? [], [query.data]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return customers.filter((customer) => {
      if (role && customer.role !== role) return false;
      if (state === "BLOCKED" && !customer.isBlocked) return false;
      if (state === "ACTIVE" && customer.isBlocked) return false;
      if (!needle) return true;

      return [customer.name, customer.email, customer.phone]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(needle));
    });
  }, [customers, search, role, state]);

  return { ...query, customers, filtered };
}

export function useCustomer(id) {
  return useApiQuery(
    useCallback((signal) => customerService.getCustomer(id, { signal }), [id]),
    { enabled: Boolean(id) },
  );
}

export function useCreateCustomer() {
  return useApiMutation(customerService.createCustomer);
}

export function useUpdateCustomer() {
  return useApiMutation(customerService.updateCustomer);
}

export function useBlockCustomer() {
  return useApiMutation(customerService.setCustomerBlocked);
}

export function useSetCustomerRole() {
  return useApiMutation(customerService.setCustomerRole);
}

export function useDeleteCustomer() {
  return useApiMutation(customerService.deleteCustomer);
}
