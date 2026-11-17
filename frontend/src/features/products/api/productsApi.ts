import { api } from "@/shared/api/api";
import { listarTodo, resourceApi } from "@/shared/api/catalogResource";
import type { Pagina } from "@/shared/api/catalogResource";
import type {
  Producto,
  ProductoFiltros,
  ProductoInput,
} from "../types/producto";

async function list(params: ProductoFiltros, signal: AbortSignal) {
  const { data } = await api.get<Pagina<Producto>>("/productos", {
    params,
    signal,
  });
  return data;
}

export const productsApi = {
  ...resourceApi<Producto, Partial<ProductoInput>>("/productos"),
  list,
  all: (signal: AbortSignal) =>
    listarTodo((skip, limit) => list({ skip, limit }, signal)),
  async stock({
    id,
    stock,
    disponible,
  }: {
    id: number;
    stock: number;
    disponible: boolean;
  }) {
    const { data } = await api.patch<Producto>(`/productos/${id}/stock`, {
      stock,
      disponible,
    });
    return data;
  },
};
