import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "../api/productsApi";
import type { ProductoFiltros } from "../types/producto";

export const productsKey = ["productos"] as const;

export function useProducts(filtros: ProductoFiltros) {
  return useQuery({
    queryKey: [...productsKey, filtros],
    queryFn: ({ signal }) => productsApi.list(filtros, signal),
  });
}

export function useAdminProducts() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: [...productsKey, "admin"],
    queryFn: ({ signal }) => productsApi.all(signal),
  });
  const onSuccess = () => client.invalidateQueries({ queryKey: productsKey });
  const save = useMutation({ mutationFn: productsApi.save, onSuccess });
  const remove = useMutation({ mutationFn: productsApi.remove, onSuccess });
  const stock = useMutation({ mutationFn: productsApi.stock, onSuccess });
  return { query, save, remove, stock };
}
