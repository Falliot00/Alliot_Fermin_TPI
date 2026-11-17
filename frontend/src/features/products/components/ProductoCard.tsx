import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import { moneda } from "@/shared/lib/format";
import type { Producto } from "../types/producto";

export function ProductoCard({ producto }: { producto: Producto }) {
  const {
    id,
    nombre,
    descripcion,
    categoria,
    precio_base,
    stock,
    disponible,
    imagen_url,
  } = producto;
  const [imagenFallida, setImagenFallida] = useState(false);
  const cantidad = useCartStore(
    (state) =>
      state.items.find((item) => item.producto_id === id)?.cantidad ?? 0,
  );
  const agregar = useCartStore((state) => state.agregar);
  const notify = useNotificationStore((state) => state.showNotification);
  const ocupado = !disponible || stock <= cantidad;
  const accion = !disponible
    ? "No disponible"
    : stock === 0
      ? "Sin stock"
      : ocupado
        ? "Stock en el carrito"
        : "Agregar al carrito";
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-surface">
      <div className="aspect-[16/9] overflow-hidden bg-accent-surface">
        {imagen_url && !imagenFallida ? (
          <img
            src={imagen_url}
            alt={nombre}
            className="size-full object-cover"
            loading="lazy"
            onError={() => setImagenFallida(true)}
          />
        ) : (
          <div
            className="grid size-full place-items-center px-4 text-center font-serif text-2xl text-forest"
            aria-hidden="true"
          >
            {categoria.nombre}
          </div>
        )}
      </div>
      <div className="flex grow flex-col p-5">
        <p className="mb-2 text-xs font-semibold text-forest">
          {categoria.nombre}
        </p>
        <h3 className="text-xl font-semibold tracking-tight break-words">
          {nombre}
        </h3>
        {descripcion && (
          <p className="mt-2 text-sm leading-6 break-words text-stone-600">
            {descripcion}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          <span className="text-lg font-semibold tabular-nums">
            {moneda(precio_base)}
          </span>
          <button
            type="button"
            className="btn-primary"
            disabled={ocupado}
            aria-label={`${accion}: ${nombre}`}
            onClick={() => {
              agregar(
                { producto_id: id, nombre, precio_unitario: precio_base },
                stock,
              );
              notify(`${nombre} en el carrito.`);
            }}
          >
            {accion}
          </button>
        </div>
      </div>
    </article>
  );
}
