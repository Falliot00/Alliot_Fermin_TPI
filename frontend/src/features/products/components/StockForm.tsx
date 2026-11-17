import { useForm } from "@tanstack/react-form";
import { FormModal } from "@/shared/components/FormModal";
import { FormSubmit } from "@/shared/components/FormSubmit";
import { BoundTextField } from "@/shared/components/TextField";
import { stockValido } from "../lib/validation";
import type { Producto } from "../types/producto";

export function StockForm({
  producto,
  saving,
  error,
  onSave,
  onClose,
}: {
  producto: Producto;
  saving: boolean;
  error: string | null;
  onSave: (data: {
    id: number;
    stock: number;
    disponible: boolean;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const form = useForm({
    defaultValues: {
      stock: String(producto.stock),
      disponible: producto.disponible,
    },
    onSubmit: async ({ value }) => {
      await onSave({
        id: producto.id,
        stock: Number(value.stock),
        disponible: value.disponible,
      });
    },
  });
  return (
    <FormModal
      title={`Stock de ${producto.nombre}`}
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
              editing
              label="Guardar"
            />
          )}
        </form.Subscribe>
      }
    >
      <form.Field
        name="stock"
        validators={{ onChange: ({ value }) => stockValido(value) }}
      >
        {(field) => (
          <BoundTextField
            field={field}
            label="Stock"
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
    </FormModal>
  );
}
