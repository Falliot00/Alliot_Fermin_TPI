import { useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { ErrorState, LoadingState } from "@/shared/components/AsyncState";
import { CatalogHeader } from "@/shared/components/CatalogHeader";
import { CatalogTable } from "@/shared/components/CatalogTable";
import { DeleteDialog } from "@/shared/components/DeleteDialog";
import { RowActions } from "@/shared/components/RowActions";
import { errorMessage } from "@/shared/api/http";
import { useNotificationStore } from "@/store/notificationStore";
import { CategoriaForm } from "../components/CategoriaForm";
import { useCategories, useCategoryActions } from "../hooks/useCategories";
import type { Categoria } from "../types/categoria";

const sinCategorias: Categoria[] = [];

export default function AdminCategoriasPage() {
  const query = useCategories();
  const { save, remove } = useCategoryActions();
  const notify = useNotificationStore((state) => state.showNotification);
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<{ item: Categoria | null } | null>(null);
  const [baja, setBaja] = useState<Categoria | null>(null);
  const busy = save.isPending || remove.isPending;
  const { reset: resetSave } = save;
  const { reset: resetRemove } = remove;
  const columns = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { accessorKey: "nombre", header: "Nombre" },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        cell: ({ row }) => row.original.descripcion ?? "—",
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <RowActions
            nombre={row.original.nombre}
            busy={busy}
            onEdit={() => {
              resetSave();
              setEditor({ item: row.original });
            }}
            onDelete={() => {
              resetRemove();
              setBaja(row.original);
            }}
          />
        ),
      },
    ],
    [busy, resetSave, resetRemove],
  );
  const table = useReactTable({
    data: query.data ?? sinCategorias,
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
        title="Categorías"
        description="Organizá los productos del catálogo por categoría."
        action="Nueva categoría"
        onCreate={() => {
          save.reset();
          setEditor({ item: null });
        }}
        busy={busy}
        search={search}
        onSearch={setSearch}
      />
      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : (
        <CatalogTable table={table} label="Categorías" canWrite />
      )}
      {editor && (
        <CategoriaForm
          item={editor.item}
          saving={save.isPending}
          error={save.isError ? errorMessage(save.error) : null}
          onClose={() => setEditor(null)}
          onSave={async (values) => {
            const result = await save
              .mutateAsync({ id: editor.item?.id, values })
              .catch(() => null);
            if (result) {
              setEditor(null);
              notify("Categoría guardada.");
            }
          }}
        />
      )}
      {baja && (
        <DeleteDialog
          nombre={baja.nombre}
          entidad="categoría"
          deleting={remove.isPending}
          error={remove.isError ? errorMessage(remove.error) : null}
          onClose={() => setBaja(null)}
          onConfirm={() =>
            remove.mutate(baja.id, {
              onSuccess: () => {
                setBaja(null);
                notify("Categoría dada de baja.");
              },
            })
          }
        />
      )}
    </section>
  );
}
