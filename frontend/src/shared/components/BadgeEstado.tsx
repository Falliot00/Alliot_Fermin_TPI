import type { EstadoPedido } from "@/features/orders/types/pedido";

const estados = {
  PENDIENTE: { label: "Pendiente", className: "bg-amber-100 text-amber-900" },
  EN_PREPARACION: {
    label: "En preparación",
    className: "bg-blue-100 text-blue-900",
  },
  ENTREGADO: {
    label: "Entregado",
    className: "bg-emerald-100 text-emerald-900",
  },
  CANCELADO: { label: "Cancelado", className: "bg-stone-200 text-stone-800" },
} satisfies Record<EstadoPedido, { label: string; className: string }>;

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const { label, className } = estados[estado];
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
