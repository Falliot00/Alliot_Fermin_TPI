import { DeleteDialog } from "@/shared/components/DeleteDialog";
import { errorMessage } from "@/shared/api/http";
import { useNotificationStore } from "@/store/notificationStore";
import type { Categoria } from "@/features/categories/types/categoria";
import type { useAdminProducts } from "../hooks/useProducts";
import type { Producto } from "../types/producto";
import { ProductoForm } from "./ProductoForm";
import { StockForm } from "./StockForm";

export type ProductoDialogo =
  | { tipo: "editar"; item: Producto | null }
  | { tipo: "baja" | "stock"; item: Producto };

export function ProductoDialogs({
  dialogo,
  categorias,
  save,
  remove,
  stock,
  cerrar,
}: {
  dialogo: ProductoDialogo;
  categorias: Categoria[];
  save: ReturnType<typeof useAdminProducts>["save"];
  remove: ReturnType<typeof useAdminProducts>["remove"];
  stock: ReturnType<typeof useAdminProducts>["stock"];
  cerrar: () => void;
}) {
  const notify = useNotificationStore((state) => state.showNotification);

  if (dialogo.tipo === "editar") {
    return (
      <ProductoForm
        item={dialogo.item}
        categorias={categorias}
        saving={save.isPending}
        error={save.isError ? errorMessage(save.error) : null}
        onClose={cerrar}
        onSave={async (values) => {
          const result = await save
            .mutateAsync({ id: dialogo.item?.id, values })
            .catch(() => null);
          if (result) {
            cerrar();
            notify("Producto guardado.");
          }
        }}
      />
    );
  }

  if (dialogo.tipo === "baja") {
    return (
      <DeleteDialog
        nombre={dialogo.item.nombre}
        entidad="producto"
        deleting={remove.isPending}
        error={remove.isError ? errorMessage(remove.error) : null}
        onClose={cerrar}
        onConfirm={() =>
          remove.mutate(dialogo.item.id, {
            onSuccess: () => {
              cerrar();
              notify("Producto dado de baja.");
            },
          })
        }
      />
    );
  }

  return (
    <StockForm
      producto={dialogo.item}
      saving={stock.isPending}
      error={stock.isError ? errorMessage(stock.error) : null}
      onClose={cerrar}
      onSave={async (values) => {
        const result = await stock.mutateAsync(values).catch(() => null);
        if (result) {
          cerrar();
          notify("Stock y disponibilidad guardados.");
        }
      }}
    />
  );
}
