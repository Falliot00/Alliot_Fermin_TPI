import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import { EmptyState } from "./AsyncState";
import { Icon } from "./Icon";

export function CatalogTable<T>({
  table,
  canWrite,
  label,
  paginar = true,
}: {
  table: Table<T>;
  canWrite: boolean;
  label: string;
  paginar?: boolean;
}) {
  const count = table.getFilteredRowModel().rows.length;
  const filtered = Boolean(
    table.getState().globalFilter || table.getState().columnFilters.length,
  );
  return (
    <section
      aria-label={label}
      className="overflow-hidden rounded-2xl border border-stone-200 bg-surface"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{label}</caption>
          <thead className="border-b border-stone-200 bg-stone-50">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-5 py-4 font-medium text-stone-600"
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : "none"
                    }
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-2 whitespace-nowrap"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <Icon
                          className="size-4 shrink-0"
                          name={
                            header.column.getIsSorted() === "asc"
                              ? "sort-up"
                              : header.column.getIsSorted() === "desc"
                                ? "sort-down"
                                : "sort"
                          }
                        />
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-stone-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-stone-50/60">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="max-w-xs px-5 py-5 break-words">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {count === 0 ? (
        <EmptyState
          canWrite={canWrite}
          filtered={filtered}
          onReset={() => {
            table.setGlobalFilter("");
            table.resetColumnFilters();
          }}
        />
      ) : paginar ? (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 px-5 py-4 text-sm text-stone-600">
          <span>
            {count} registros · Página{" "}
            {table.getState().pagination.pageIndex + 1} de{" "}
            {Math.max(1, table.getPageCount())}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              Anterior
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              Siguiente
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
