export const estados = [
  "PENDIENTE",
  "EN_PREPARACION",
  "ENTREGADO",
  "CANCELADO",
] as const;
export type EstadoPedido = (typeof estados)[number];
export type FormaPago = "EFECTIVO" | "TRANSFERENCIA";

export interface ItemPedidoCreate {
  producto_id: number;
  cantidad: number;
}

export interface DetallePedido extends ItemPedidoCreate {
  nombre_producto: string;
  precio_unitario: number;
  subtotal: number;
}

export interface PedidoCreate {
  items: ItemPedidoCreate[];
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
}

export interface Pedido extends Omit<PedidoCreate, "items"> {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  total: number;
  created_at: string;
  updated_at: string;
  items: DetallePedido[];
}

export interface ResumenPedidos {
  pendientes: number;
  en_preparacion: number;
  entregados: number;
  cancelados: number;
  pedidos_hoy: number;
  ingresos_entregados: number;
}
