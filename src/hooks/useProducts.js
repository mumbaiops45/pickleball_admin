"use client";

import { useCallback, useMemo } from "react";
import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import * as productService from "@/services/product.service";


export function useProducts({ search = "", category = "", status = "" } = {}) {
  const query = useApiQuery(
    useCallback((signal) => productService.listProducts({ signal }), []),
  );

  const products = useMemo(() => query.data ?? [], [query.data]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return products.filter((product) => {
      if (status && product.status !== status) return false;
      if (category && (product.category?._id ?? product.category) !== category) {
        return false;
      }
      if (!needle) return true;

      return [product.name, product.sku, product.brand, product.slug]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(needle));
    });
  }, [products, search, category, status]);

  return { ...query, products, filtered };
}

export function useProduct(id) {
  return useApiQuery(
    useCallback((signal) => productService.getProduct(id, { signal }), [id]),
    { enabled: Boolean(id) },
  );
}

export function useCreateProduct() {
  return useApiMutation(productService.createProduct);
}

export function useUpdateProduct() {
  return useApiMutation(productService.updateProduct);
}

export function useDeleteProduct() {
  return useApiMutation(productService.deleteProduct);
}
