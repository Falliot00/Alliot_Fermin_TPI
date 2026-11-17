import { useForm } from "@tanstack/react-form";
import { FormModal } from "@/shared/components/FormModal";
import { FormSubmit } from "@/shared/components/FormSubmit";
import { BoundTextField } from "@/shared/components/TextField";
import type { Categoria, CategoriaInput } from "../types/categoria";

export function CategoriaForm({
  item,
  saving,
  error,
  onSave,
  onClose,
}: {
  item: Categoria | null;
  saving: boolean;
  error: string | null;
  onSave: (data: CategoriaInput) => Promise<void>;
  onClose: () => void;
}) {
  const form = useForm({
    defaultValues: {
      nombre: item?.nombre ?? "",
      descripcion: item?.descripcion ?? "",
    },
    onSubmit: async ({ value }) => {
      await onSave({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
      });
    },
  });

  return (
    <FormModal
      title={item ? "Editar categoría" : "Nueva categoría"}
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
              label="Crear categoría"
            />
          )}
        </form.Subscribe>
      }
    >
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) =>
            Array.from(value.trim()).length >= 2
              ? undefined
              : "Ingresá al menos 2 caracteres.",
        }}
      >
        {(field) => (
          <BoundTextField field={field} label="Nombre" maxLength={100} />
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
    </FormModal>
  );
}
