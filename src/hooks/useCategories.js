"use client";

import { useCallback, useMemo } from "react";
import { useApiMutation, useApiQuery } from "@/hooks/useApi";
import * as categoryService from "@/services/category.service";

export function useCategories({ search = "" } = {}) {
  const query = useApiQuery(
    useCallback((signal) => categoryService.listCategories({ signal }), []),
  );

  const categories = useMemo(() => query.data ?? [], [query.data]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return categories;

    return categories.filter((category) =>
      category.name?.toLowerCase().includes(needle),
    );
  }, [categories, search]);

  return { ...query, categories, filtered };
}

export function useCategory(id) {
  return useApiQuery(
    useCallback((signal) => categoryService.getCategory(id, { signal }), [id]),
    { enabled: Boolean(id) },
  );
}

export function useCreateCategory() {
  return useApiMutation(categoryService.createCategory);
}

export function useUpdateCategory() {
  return useApiMutation(categoryService.updateCategory);
}

export function useDeleteCategory() {
  return useApiMutation(categoryService.deleteCategory);
}
