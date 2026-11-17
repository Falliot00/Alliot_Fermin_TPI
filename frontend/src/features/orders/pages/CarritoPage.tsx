import { Link } from "react-router-dom";
import { moneda } from "@/shared/lib/format";
import { useCartStore } from "@/store/cartStore";

export default function CarritoPage() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const quitar = useCartStore((state) => state.quitar);
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);

  return (
    <section aria-labelledby="carrito-title">
      <h1 id="carrito-title" className="page-title mb-7">
        Carrito
      </h1>
      {items.length === 0 ? (
        <div className="state-panel">
          <h2 className="text-lg font-semibold">Tu carrito está vacío</h2>
          <Link to="/" className="btn-primary">
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr] lg:items-start">
          <ul className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-surface">
            {items.map((item) => (
              <li
                key={item.producto_id}
                className="flex flex-wrap items-center justify-between gap-4 p-5"
              >
                <div className="min-w-36 grow">
                  <h2 className="font-semibold break-words">{item.nombre}</h2>
                  <p className="mt-1 text-sm text-stone-600">
                    {moneda(item.precio_unitario)} por unidad
                  </p>
                </div>
                <div
                  className="flex items-center gap-2"
                  aria-label={`Cantidad de ${item.nombre}`}
                >
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={item.cantidad <= 1}
                    aria-label={`Reducir cantidad de ${item.nombre}`}
                    onClick={() =>
                      cambiarCantidad(item.producto_id, item.cantidad - 1)
                    }
                  >
                    −
                  </button>
                  <span className="min-w-6 text-center tabular-nums">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={item.cantidad >= 2_147_483_647}
                    aria-label={`Aumentar cantidad de ${item.nombre}`}
                    onClick={() =>
                      cambiarCantidad(item.producto_id, item.cantidad + 1)
                    }
                  >
                    +
                  </button>
                </div>
                <div className="min-w-24 text-right">
                  <p className="font-semibold">
                    {moneda(item.precio_unitario * item.cantidad)}
                  </p>
                  <button
                    type="button"
                    className="min-h-9 text-sm text-danger underline"
                    onClick={() => quitar(item.producto_id)}
                    aria-label={`Quitar ${item.nombre}`}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <aside className="rounded-2xl border border-stone-200 bg-surface p-5">
            <div className="mb-5 flex justify-between gap-3 text-lg font-semibold">
              <span>Total estimado</span>
              <span>{moneda(total)}</span>
            </div>
            <Link to="/checkout" className="btn-primary w-full">
              Continuar al checkout
            </Link>
            <Link
              to="/"
              className="mt-3 flex min-h-10 items-center justify-center text-sm text-forest underline"
            >
              Seguir comprando
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
