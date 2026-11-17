export function Paginacion({
  page,
  limit,
  total,
  onPage,
}: {
  page: number;
  limit: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const paginas = Math.max(1, Math.ceil(total / limit));
  if (paginas === 1 && page === 0) return null;
  return (
    <nav
      aria-label="Paginación"
      className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-4"
    >
      <span className="text-sm text-stone-600">
        Página {page + 1} de {Math.max(page + 1, paginas)} · {total} registros
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-secondary"
          disabled={page === 0}
          onClick={() => onPage(page - 1)}
        >
          Anterior
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={page + 1 >= paginas}
          onClick={() => onPage(page + 1)}
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}
