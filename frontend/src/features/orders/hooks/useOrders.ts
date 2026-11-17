import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsKey } from "@/features/products/hooks/useProducts";
import { useAuthStore } from "@/store/authStore";
import { ordersApi } from "../api/ordersApi";
import type { FiltrosPedidos } from "../api/ordersApi";

const queryKey = ["pedidos"] as const;

export function usePedidos(filtros: FiltrosPedidos, propios = false) {
  const usuario = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: [...queryKey, usuario?.id, propios, filtros],
    queryFn: ({ signal }) =>
      propios && usuario?.role === "admin"
        ? ordersApi.propiosAdmin(usuario.id, filtros, signal)
        : ordersApi.list(filtros, signal),
  });
}

export function useDetallePedido(id: number) {
  return useQuery({
    queryKey: [...queryKey, "detalle", id],
    queryFn: ({ signal }) => ordersApi.detalle(id, signal),
  });
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: [...queryKey, "resumen"],
    queryFn: ({ signal }) => ordersApi.resumen(signal),
  });
}

export function useOrderActions() {
  const client = useQueryClient();
  const onSuccess = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey }),
      client.invalidateQueries({ queryKey: productsKey }),
    ]);
  };
  const crear = useMutation({ mutationFn: ordersApi.crear, onSuccess });
  const cambiar = useMutation({ mutationFn: ordersApi.cambiar, onSuccess });
  const cancelar = useMutation({ mutationFn: ordersApi.cancelar, onSuccess });
  return { crear, cambiar, cancelar };
}
