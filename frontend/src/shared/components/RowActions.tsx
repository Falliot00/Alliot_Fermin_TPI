interface Props {
  nombre: string;
  busy: boolean;
  editDisabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function RowActions({
  nombre,
  busy,
  editDisabled,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        className="min-h-11 font-medium text-forest underline-offset-4 hover:underline"
        disabled={busy || editDisabled}
        onClick={onEdit}
        aria-label={`Editar ${nombre}`}
      >
        Editar
      </button>
      <button
        type="button"
        className="min-h-11 text-danger underline-offset-4 hover:underline"
        disabled={busy}
        onClick={onDelete}
        aria-label={`Eliminar ${nombre}`}
      >
        Eliminar
      </button>
    </div>
  );
}
