import { useEffect, useRef } from "react";
import { BadgeEstado } from "@/shared/components/BadgeEstado";
import { ErrorState, LoadingState } from "@/shared/components/AsyncState";
import { fechaHora, moneda } from "@/shared/lib/format";
import { useDetallePedido } from "../hooks/useOrders";

export function DetallePedido({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  const query = useDetallePedido(id);
  const pedido = query.data;

  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-labelledby="detalle-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 id="detalle-title" className="text-2xl font-semibold">
          Pedido #{id}
        </h2>
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cerrar
        </button>
      </div>
      {query.isPending && <LoadingState />}
      {query.isError && (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      )}
      {pedido && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <BadgeEstado estado={pedido.estado} />
            <time
              dateTime={pedido.created_at}
              className="text-sm text-stone-600"
            >
              {fechaHora(pedido.created_at)}
            </time>
          </div>
          <dl className="mb-5 grid gap-x-3 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="font-semibold">Entrega</dt>
            <dd className="break-words">{pedido.direccion_entrega}</dd>
            <dt className="font-semibold">Pago</dt>
            <dd>
              {pedido.forma_pago === "EFECTIVO" ? "Efectivo" : "Transferencia"}
            </dd>
            {pedido.notas && (
              <>
                <dt className="font-semibold">Notas</dt>
                <dd className="whitespace-pre-wrap break-words">
                  {pedido.notas}
                </dd>
              </>
            )}
          </dl>
          <ul className="divide-y divide-stone-200 border-y border-stone-200 text-sm">
            {pedido.items.map((item) => (
              <li
                key={item.producto_id}
                className="flex justify-between gap-4 py-3"
              >
                <div>
                  <p className="font-medium break-words">
                    {item.nombre_producto}
                  </p>
                  <p className="mt-1 text-stone-600">
                    {item.cantidad} × {moneda(item.precio_unitario)}
                  </p>
                </div>
                <span className="shrink-0">{moneda(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between gap-4 font-semibold">
            <span>Total</span>
            <span>{moneda(pedido.total)}</span>
          </p>
        </>
      )}
    </dialog>
  );
}
