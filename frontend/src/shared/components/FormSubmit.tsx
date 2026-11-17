interface Props {
  canSubmit: boolean;
  submitting: boolean;
  dirty: boolean;
  editing: boolean;
  label: string;
}

export function FormSubmit({
  canSubmit,
  submitting,
  dirty,
  editing,
  label,
}: Props) {
  return (
    <>
      <span className="mr-auto text-xs text-stone-600">
        {dirty ? "Cambios sin guardar" : "Sin cambios"}
      </span>
      <button
        type="submit"
        className="btn-primary"
        disabled={!canSubmit || submitting || (editing && !dirty)}
      >
        {submitting ? "Guardando…" : editing ? "Guardar cambios" : label}
      </button>
    </>
  );
}
