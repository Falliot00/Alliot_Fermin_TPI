import { useMemo, useState } from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/shared/components/AsyncState";
import { BadgeEstado } from "@/shared/components/BadgeEstado";
import { CatalogTable } from "@/shared/components/CatalogTable";
import { Paginacion } from "@/shared/components/Paginacion";
import { errorMessage } from "@/shared/api/http";
import { fechaHora, moneda } from "@/shared/lib/format";
import { DetallePedido } from "../components/DetallePedido";
import { useOrderActions, usePedidos } from "../hooks/useOrders";
import { estados } from "../types/pedido";
import type { EstadoPedido, Pedido } from "../types/pedido";

const limit = 20;
const sinPedidos: Pedido[] = [];
const acciones = {
  PENDIENTE: { next: "EN_PREPARACION", label: "Empezar preparación" },
  EN_PREPARACION: { next: "ENTREGADO", label: "Marcar entregado" },
  ENTREGADO: null,
  CANCELADO: null,
} satisfies Record<EstadoPedido, { next: EstadoPedido; label: string } | null>;

const opciones: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendientes",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregados",
  CANCELADO: "Cancelados",
};

export default function AdminPedidosPage() {
  const [filtro, setFiltro] = useState<{ estado?: EstadoPedido; page: number }>(
    { page: 0 },
  );
  const [detalle, setDetalle] = useState<number | null>(null);
  const query = usePedidos({
    skip: filtro.page * limit,
    limit,
    estado: filtro.estado,
  });
  const { cambiar } = useOrderActions();
  const { isPending, mutate } = cambiar;

  const columns = useMemo<ColumnDef<Pedido>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Pedido",
        cell: ({ row }) => `#${row.original.id}`,
      },
      {
        accessorKey: "usuario_id",
        header: "Cliente",
        cell: ({ row }) => `#${row.original.usuario_id}`,
      },
      {
        accessorKey: "created_at",
        header: "Fecha",
        cell: ({ row }) => fechaHora(row.original.created_at),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => moneda(row.original.total),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const { id, estado } = row.original;
          const siguiente = acciones[estado];
          return (
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <button
                type="button"
                className="min-h-11 text-forest underline"
                aria-label={`Ver detalle del pedido #${id}`}
                onClick={() => setDetalle(id)}
              >
                Ver detalle
              </button>
              {siguiente && (
                <>
                  <button
                    type="button"
                    className="min-h-11 font-medium text-forest underline"
                    disabled={isPending}
                    onClick={() => mutate({ id, estado: siguiente.next })}
                  >
                    {siguiente.label}
                  </button>
                  <button
                    type="button"
                    className="min-h-11 text-danger underline"
                    disabled={isPending}
                    onClick={() => mutate({ id, estado: "CANCELADO" })}
                  >
                    Cancelar pedido
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [isPending, mutate],
  );
  const table = useReactTable({
    data: query.data?.items ?? sinPedidos,
    columns,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <section>
      <h1 className="page-title mb-7">Pedidos</h1>
      <div className="mb-5 max-w-xs">
        <label htmlFor="filtro-estado" className="field-label">
          Filtrar por estado
        </label>
        <select
          id="filtro-estado"
          className="field"
          value={filtro.estado ?? ""}
          onChange={(event) => {
            const valor = event.target.value;
            setFiltro({
              estado: estados.find((estado) => estado === valor),
              page: 0,
            });
          }}
        >
          <option value="">Todos los estados</option>
          {estados.map((estado) => (
            <option key={estado} value={estado}>
              {opciones[estado]}
            </option>
          ))}
        </select>
      </div>
      {cambiar.isError && (
        <p className="mb-4 text-danger" role="alert">
          {errorMessage(cambiar.error)}
        </p>
      )}
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : (
        <>
          {query.data.items.length > 0 ? (
            <CatalogTable
              table={table}
              label="Pedidos"
              canWrite={false}
              paginar={false}
            />
          ) : (
            <EmptyState
              canWrite={false}
              filtered={Boolean(filtro.estado)}
              onReset={() => setFiltro({ page: 0 })}
            />
          )}
          <Paginacion
            page={filtro.page}
            limit={limit}
            total={query.data.total}
            onPage={(page) => setFiltro({ ...filtro, page })}
          />
        </>
      )}
      {detalle !== null && (
        <DetallePedido id={detalle} onClose={() => setDetalle(null)} />
      )}
    </section>
  );
}
