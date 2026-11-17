import { useState } from "react";
import { Link } from "react-router-dom";
import { BadgeEstado } from "@/shared/components/BadgeEstado";
import { ErrorState, LoadingState } from "@/shared/components/AsyncState";
import { Paginacion } from "@/shared/components/Paginacion";
import { errorMessage } from "@/shared/api/http";
import { fechaHora, moneda } from "@/shared/lib/format";
import { DetallePedido } from "../components/DetallePedido";
import { useOrderActions, usePedidos } from "../hooks/useOrders";

const limit = 10;

export default function MisPedidosPage() {
  const [page, setPage] = useState(0);
  const [detalle, setDetalle] = useState<number | null>(null);
  const query = usePedidos({ skip: page * limit, limit }, true);
  const { cancelar } = useOrderActions();

  return (
    <section aria-labelledby="mis-pedidos-title">
      <h1 id="mis-pedidos-title" className="page-title mb-7">
        Mis pedidos
      </h1>
      {cancelar.isError && (
        <p role="alert" className="mb-4 text-danger">
          {errorMessage(cancelar.error)}
        </p>
      )}
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : (
        <>
          {query.data.items.length === 0 ? (
            <div className="state-panel">
              <h2 className="text-lg font-semibold">Todavía no hay pedidos</h2>
              <Link to="/" className="btn-primary">
                Ver catálogo
              </Link>
            </div>
          ) : (
            <ul className="grid gap-3">
              {query.data.items.map((pedido) => (
                <li
                  key={pedido.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-surface p-5"
                >
                  <div>
                    <h2 className="text-lg font-semibold">
                      Pedido #{pedido.id}
                    </h2>
                    <p className="mt-1 text-sm text-stone-600">
                      {fechaHora(pedido.created_at)} · {moneda(pedido.total)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <BadgeEstado estado={pedido.estado} />
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setDetalle(pedido.id)}
                    >
                      Ver detalle
                    </button>
                    {pedido.estado === "PENDIENTE" && (
                      <button
                        type="button"
                        className="btn-secondary text-danger"
                        disabled={cancelar.isPending}
                        onClick={() => cancelar.mutate(pedido.id)}
                      >
                        {cancelar.isPending && cancelar.variables === pedido.id
                          ? "Cancelando…"
                          : "Cancelar pedido"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Paginacion
            page={page}
            limit={limit}
            total={query.data.total}
            onPage={setPage}
          />
        </>
      )}
      {detalle !== null && (
        <DetallePedido id={detalle} onClose={() => setDetalle(null)} />
      )}
    </section>
  );
}
