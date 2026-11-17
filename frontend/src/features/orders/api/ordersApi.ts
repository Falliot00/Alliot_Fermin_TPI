import { api } from "@/shared/api/api";
import { listarTodo } from "@/shared/api/catalogResource";
import type { Pagina } from "@/shared/api/catalogResource";
import type {
  EstadoPedido,
  Pedido,
  PedidoCreate,
  ResumenPedidos,
} from "../types/pedido";

export interface FiltrosPedidos {
  skip: number;
  limit: number;
  estado?: EstadoPedido;
}

async function list(params: FiltrosPedidos, signal: AbortSignal) {
  const { data } = await api.get<Pagina<Pedido>>("/pedidos", {
    params,
    signal,
  });
  return data;
}

export const ordersApi = {
  list,
  async propiosAdmin(
    usuarioId: number,
    filtros: FiltrosPedidos,
    signal: AbortSignal,
  ): Promise<Pagina<Pedido>> {
    const todos = await listarTodo((skip, limit) =>
      list({ ...filtros, skip, limit }, signal),
    );
    const propios = todos.filter((pedido) => pedido.usuario_id === usuarioId);
    return {
      total: propios.length,
      items: propios.slice(filtros.skip, filtros.skip + filtros.limit),
    };
  },
  async detalle(id: number, signal: AbortSignal) {
    const { data } = await api.get<Pedido>(`/pedidos/${id}`, { signal });
    return data;
  },
  async crear(payload: PedidoCreate) {
    const { data } = await api.post<Pedido>("/pedidos", payload);
    return data;
  },
  async cambiar({ id, estado }: { id: number; estado: EstadoPedido }) {
    const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, {
      estado,
    });
    return data;
  },
  async cancelar(id: number) {
    const { data } = await api.patch<Pedido>(`/pedidos/${id}/cancelar`);
    return data;
  },
  async resumen(signal: AbortSignal) {
    const { data } = await api.get<ResumenPedidos>("/pedidos/resumen", {
      signal,
    });
    return data;
  },
};
