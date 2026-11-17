import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { ErrorState, LoadingState } from "@/shared/components/AsyncState";
import { CatalogHeader } from "@/shared/components/CatalogHeader";
import { CatalogTable } from "@/shared/components/CatalogTable";
import { RowActions } from "@/shared/components/RowActions";
import { moneda } from "@/shared/lib/format";
import { ProductoDialogs } from "../components/ProductoDialogs";
import type { ProductoDialogo } from "../components/ProductoDialogs";
import { useAdminProducts } from "../hooks/useProducts";
import type { Producto } from "../types/producto";

const sinProductos: Producto[] = [];

export default function AdminProductosPage() {
  const { query, save, remove, stock } = useAdminProducts();
  const categorias = useCategories();
  const [search, setSearch] = useState("");
  const [dialogo, setDialogo] = useState<ProductoDialogo | null>(null);
  const busy = save.isPending || remove.isPending || stock.isPending;
  const puedenEditar = Boolean(categorias.data);
  const { reset: resetSave } = save;
  const { reset: resetRemove } = remove;
  const { reset: resetStock } = stock;

  const columns = useMemo<ColumnDef<Producto>[]>(
    () => [
      { accessorKey: "nombre", header: "Producto" },
      {
        id: "categoria",
        accessorFn: (row) => row.categoria.nombre,
        header: "Categoría",
      },
      {
        accessorKey: "precio_base",
        header: "Precio",
        cell: ({ row }) => moneda(row.original.precio_base),
      },
      { accessorKey: "stock", header: "Stock" },
      {
        accessorKey: "disponible",
        header: "Venta",
        cell: ({ row }) => (
          <span
            className={
              row.original.disponible ? "badge-available" : "badge-unavailable"
            }
          >
            {row.original.disponible ? "Habilitada" : "Pausada"}
          </span>
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row: { original: item } }) => (
          <div className="flex flex-wrap gap-x-3">
            <RowActions
              nombre={item.nombre}
              busy={busy}
              editDisabled={!puedenEditar}
              onEdit={() => {
                resetSave();
                setDialogo({ tipo: "editar", item });
              }}
              onDelete={() => {
                resetRemove();
                setDialogo({ tipo: "baja", item });
              }}
            />
            <button
              type="button"
              className="min-h-11 font-medium text-forest underline-offset-4 hover:underline"
              aria-label={`Stock de ${item.nombre}`}
              disabled={busy}
              onClick={() => {
                resetStock();
                setDialogo({ tipo: "stock", item });
              }}
            >
              Stock
            </button>
          </div>
        ),
      },
    ],
    [busy, puedenEditar, resetSave, resetRemove, resetStock],
  );
  const table = useReactTable({
    data: query.data ?? sinProductos,
    columns,
    getRowId: (row) => String(row.id),
    state: { globalFilter: search },
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <section>
      <CatalogHeader
        title="Productos"
        description="Administrá el catálogo, el stock y la disponibilidad."
        action="Nuevo producto"
        onCreate={() => {
          resetSave();
          setDialogo({ tipo: "editar", item: null });
        }}
        busy={busy || !categorias.data?.length}
        search={search}
        onSearch={setSearch}
      />
      {categorias.isError && (
        <ErrorState
          error={categorias.error}
          onRetry={() => void categorias.refetch()}
        />
      )}
      {categorias.data?.length === 0 && (
        <p className="mb-4 text-sm text-stone-600">
          Creá una categoría activa para poder cargar productos.
        </p>
      )}
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : (
        <CatalogTable
          table={table}
          label="Productos"
          canWrite={Boolean(categorias.data?.length)}
        />
      )}
      {dialogo && (
        <ProductoDialogs
          dialogo={dialogo}
          categorias={categorias.data ?? []}
          save={save}
          stock={stock}
          remove={remove}
          cerrar={() => setDialogo(null)}
        />
      )}
    </section>
  );
}
