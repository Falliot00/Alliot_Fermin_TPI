import { useDeferredValue, useState } from "react";
import { useCategories } from "@/features/categories/hooks/useCategories";
import {
  EmptyState,
  ErrorState,
  Skeleton,
} from "@/shared/components/AsyncState";
import { Paginacion } from "@/shared/components/Paginacion";
import { ProductoCard } from "../components/ProductoCard";
import { useProducts } from "../hooks/useProducts";

const limit = 6;

export default function CatalogoPage() {
  const [filtros, setFiltros] = useState({
    page: 0,
    search: "",
    categoria: "",
  });
  const diferidos = useDeferredValue(filtros);
  const { page, search, categoria } = diferidos;
  const categorias = useCategories();
  const productos = useProducts({
    skip: page * limit,
    limit,
    search: search.trim() || undefined,
    categoria_id: categoria ? Number(categoria) : undefined,
  });

  function reset() {
    setFiltros({ page: 0, search: "", categoria: "" });
  }

  return (
    <section aria-labelledby="catalogo-title">
      <header className="mb-7">
        <h1 id="catalogo-title" className="page-title">
          Catálogo
        </h1>
        <p className="mt-2 text-stone-600">Elegí qué comer y armá tu pedido.</p>
      </header>
      <div className="mb-7 grid gap-4 rounded-2xl border border-stone-200 bg-surface p-4 sm:grid-cols-[2fr_1fr] sm:p-5">
        <label>
          <span className="field-label">Buscar productos</span>
          <input
            type="search"
            className="field"
            placeholder="Por nombre"
            value={filtros.search}
            onChange={(event) =>
              setFiltros({ ...filtros, page: 0, search: event.target.value })
            }
          />
        </label>
        <div>
          <label htmlFor="catalogo-categoria" className="field-label">
            Categoría
          </label>
          <select
            id="catalogo-categoria"
            className="field"
            value={filtros.categoria}
            disabled={categorias.isPending}
            onChange={(event) =>
              setFiltros({ ...filtros, page: 0, categoria: event.target.value })
            }
          >
            <option value="">Todas las categorías</option>
            {categorias.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
        </div>
        {categorias.isError && (
          <button
            className="text-left text-sm text-danger underline"
            type="button"
            onClick={() => void categorias.refetch()}
          >
            No se cargaron las categorías. Reintentar.
          </button>
        )}
      </div>
      {productos.isPending ? (
        <Skeleton />
      ) : productos.isError ? (
        <ErrorState
          error={productos.error}
          onRetry={() => void productos.refetch()}
        />
      ) : (
        <>
          {productos.data.items.length === 0 ? (
            <EmptyState
              canWrite={false}
              filtered={Boolean(search || categoria)}
              onReset={reset}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {productos.data.items.map((producto) => (
                <ProductoCard
                  key={`${producto.id}-${producto.imagen_url}`}
                  producto={producto}
                />
              ))}
            </div>
          )}
          <Paginacion
            page={page}
            limit={limit}
            total={productos.data.total}
            onPage={(next) => setFiltros({ ...filtros, page: next })}
          />
        </>
      )}
    </section>
  );
}
