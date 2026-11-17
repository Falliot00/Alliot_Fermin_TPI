import { useMemo } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { Usuario } from "@/features/auth/types/auth.types";
import { errorMessage } from "@/shared/api/http";
import { ErrorState, LoadingState } from "@/shared/components/AsyncState";
import { CatalogTable } from "@/shared/components/CatalogTable";
import { useAuthStore } from "@/store/authStore";
import { useUsuarios } from "../hooks/useUsuarios";

const sinUsuarios: Usuario[] = [];

export default function AdminUsuariosPage() {
  const { query, cambiar } = useUsuarios();
  const usuarioId = useAuthStore((state) => state.user?.id);
  const { isPending, mutate } = cambiar;
  const columns = useMemo<ColumnDef<Usuario>[]>(
    () => [
      { accessorKey: "username", header: "Usuario" },
      { accessorKey: "full_name", header: "Nombre" },
      { accessorKey: "email", header: "Correo" },
      { accessorKey: "role", header: "Rol" },
      {
        accessorKey: "disabled",
        header: "Estado",
        cell: ({ row }) => (
          <span
            className={
              row.original.disabled ? "badge-unavailable" : "badge-available"
            }
          >
            {row.original.disabled ? "Inactivo" : "Activo"}
          </span>
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const { id, username, disabled } = row.original;
          if (id === usuarioId)
            return <span className="text-stone-600">Tu cuenta</span>;
          const accion = disabled ? "Activar" : "Desactivar";
          return (
            <button
              type="button"
              className="btn-secondary"
              disabled={isPending}
              aria-label={`${accion} a ${username}`}
              onClick={() => mutate({ id, disabled: !disabled })}
            >
              {accion}
            </button>
          );
        },
      },
    ],
    [isPending, mutate, usuarioId],
  );
  const table = useReactTable({
    data: query.data ?? sinUsuarios,
    columns,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  return (
    <section>
      <h1 className="page-title mb-7">Usuarios</h1>
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
        <CatalogTable table={table} label="Usuarios" canWrite={false} />
      )}
    </section>
  );
}
