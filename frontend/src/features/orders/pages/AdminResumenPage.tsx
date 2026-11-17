import { ErrorState, LoadingState } from "@/shared/components/AsyncState";
import { moneda } from "@/shared/lib/format";
import { useResumenPedidos } from "../hooks/useOrders";

export default function AdminResumenPage() {
  const query = useResumenPedidos();
  const resumen = query.data;
  const indicadores = resumen && [
    ["Pedidos de hoy", resumen.pedidos_hoy],
    ["Pendientes", resumen.pendientes],
    ["En preparación", resumen.en_preparacion],
    ["Entregados", resumen.entregados],
    ["Cancelados", resumen.cancelados],
    ["Ingresos de pedidos entregados", moneda(resumen.ingresos_entregados)],
  ];

  return (
    <section>
      <h1 className="page-title mb-7">Resumen</h1>
      {query.isPending && <LoadingState />}
      {query.isError && (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      )}
      {indicadores && (
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {indicadores.map(([etiqueta, valor]) => (
            <div
              key={etiqueta}
              className="rounded-2xl border border-stone-200 bg-surface p-6"
            >
              <dt className="text-sm font-medium text-stone-600">{etiqueta}</dt>
              <dd className="mt-3 font-serif text-4xl text-forest tabular-nums">
                {valor}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
