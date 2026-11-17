import { useForm } from "@tanstack/react-form";
import type { Categoria } from "@/features/categories/types/categoria";
import { FormModal } from "@/shared/components/FormModal";
import { FormSubmit } from "@/shared/components/FormSubmit";
import { BoundTextField } from "@/shared/components/TextField";
import { imagenValida, precioValido, stockValido } from "../lib/validation";
import type { Producto, ProductoInput } from "../types/producto";

export function ProductoForm({
  item,
  categorias,
  saving,
  error,
  onSave,
  onClose,
}: {
  item: Producto | null;
  categorias: Categoria[];
  saving: boolean;
  error: string | null;
  onSave: (data: Partial<ProductoInput>) => Promise<void>;
  onClose: () => void;
}) {
  const categoriaActualBaja =
    item && !categorias.some((categoria) => categoria.id === item.categoria_id);
  const form = useForm({
    defaultValues: {
      nombre: item?.nombre ?? "",
      descripcion: item?.descripcion ?? "",
      precio_base: item ? String(item.precio_base) : "",
      imagen_url: item?.imagen_url ?? "",
      categoria_id: item ? String(item.categoria_id) : "",
      stock: "0",
      disponible: true,
    },
    onSubmit: async ({ value }) => {
      const categoriaId = Number(value.categoria_id);
      await onSave({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        ...(categoriaId !== item?.categoria_id && {
          categoria_id: categoriaId,
        }),
        ...(!item && {
          stock: Number(value.stock),
          disponible: value.disponible,
        }),
      });
    },
  });
  return (
    <FormModal
      title={item ? "Editar producto" : "Nuevo producto"}
      saving={saving}
      error={error}
      onClose={onClose}
      onSubmit={form.handleSubmit}
      submitButton={
        <form.Subscribe
          selector={(state) => [
            state.canSubmit,
            state.isSubmitting,
            state.isDirty,
          ]}
        >
          {([canSubmit, submitting, dirty]) => (
            <FormSubmit
              canSubmit={canSubmit}
              submitting={submitting || saving}
              dirty={dirty}
              editing={Boolean(item)}
              label="Crear producto"
            />
          )}
        </form.Subscribe>
      }
    >
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) =>
            value.trim() ? undefined : "Ingresá un nombre.",
        }}
      >
        {(field) => (
          <BoundTextField field={field} label="Nombre" maxLength={160} />
        )}
      </form.Field>
      <form.Field
        name="categoria_id"
        validators={{
          onChange: ({ value }) => (value ? undefined : "Elegí una categoría."),
        }}
      >
        {(field) => {
          const invalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <div>
              <label htmlFor="categoria_id" className="field-label">
                Categoría
              </label>
              <select
                id="categoria_id"
                className="field"
                value={field.state.value}
                onBlur={field.handleBlur}
                aria-invalid={invalid}
                aria-describedby={invalid ? "categoria-error" : undefined}
                onChange={(event) => field.handleChange(event.target.value)}
              >
                <option value="">Elegí una categoría</option>
                {categoriaActualBaja && (
                  <option value={item.categoria_id}>
                    {item.categoria.nombre} (dada de baja)
                  </option>
                )}
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
              {invalid && (
                <p
                  id="categoria-error"
                  role="alert"
                  className="mt-1 text-sm text-danger"
                >
                  Elegí una categoría.
                </p>
              )}
            </div>
          );
        }}
      </form.Field>
      <form.Field
        name="precio_base"
        validators={{ onChange: ({ value }) => precioValido(value) }}
      >
        {(field) => (
          <BoundTextField
            field={field}
            label="Precio base"
            type="number"
            step="any"
            maxLength={32}
          />
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <BoundTextField
            field={field}
            label="Descripción (opcional)"
            maxLength={2000}
            multiline
          />
        )}
      </form.Field>
      <form.Field
        name="imagen_url"
        validators={{ onChange: ({ value }) => imagenValida(value) }}
      >
        {(field) => (
          <BoundTextField
            field={field}
            label="URL de imagen (opcional)"
            type="url"
            maxLength={2083}
          />
        )}
      </form.Field>
      {!item && (
        <>
          <form.Field
            name="stock"
            validators={{ onChange: ({ value }) => stockValido(value) }}
          >
            {(field) => (
              <BoundTextField
                field={field}
                label="Stock inicial"
                type="number"
                step={1}
                maxLength={16}
              />
            )}
          </form.Field>
          <form.Field name="disponible">
            {(field) => (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(event) => field.handleChange(event.target.checked)}
                />
                Disponible para la venta
              </label>
            )}
          </form.Field>
        </>
      )}
    </FormModal>
  );
}
