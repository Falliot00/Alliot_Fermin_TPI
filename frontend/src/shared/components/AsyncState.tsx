import { errorMessage } from "@/shared/api/http";

export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return (
    <div role="status" className="state-panel">
      <span className="spinner" aria-hidden="true" />
      {label}
    </div>
  );
}

export function Skeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando productos"
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="overflow-hidden rounded-2xl border border-stone-200 bg-surface"
        >
          <div className="aspect-[16/9] bg-stone-100 motion-safe:animate-pulse" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 rounded bg-stone-100" />
            <div className="h-4 w-5/6 rounded bg-stone-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="state-panel">
      <h2 className="text-xl font-semibold">No pudimos cargar los datos</h2>
      <p className="max-w-lg text-sm text-stone-600">{errorMessage(error)}</p>
      <button type="button" className="btn-secondary" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  );
}

export function EmptyState({
  canWrite,
  filtered,
  onReset,
}: {
  canWrite: boolean;
  filtered: boolean;
  onReset: () => void;
}) {
  return (
    <div className="state-panel">
      <h2 className="text-xl font-semibold">
        {filtered ? "Sin resultados" : "Todavía no hay registros"}
      </h2>
      {canWrite && !filtered && (
        <p className="text-sm text-stone-600">
          Agregá el primer registro para empezar.
        </p>
      )}
      {filtered && (
        <button type="button" className="btn-secondary" onClick={onReset}>
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
