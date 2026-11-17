import { useEffect, useRef } from "react";

type Props = {
  nombre: string;
  entidad: string;
  deleting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteDialog({
  nombre,
  entidad,
  deleting,
  error,
  onClose,
  onConfirm,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="delete-title"
      aria-describedby="delete-help"
      onCancel={(event) => {
        event.preventDefault();
        if (!deleting) onClose();
      }}
      className="modal"
    >
      <h2 id="delete-title" className="text-2xl font-semibold tracking-tight">
        ¿Eliminar {entidad}?
      </h2>
      <p
        id="delete-help"
        className="mt-4 break-words text-sm leading-relaxed text-stone-600"
      >
        Se eliminará <strong className="text-stone-900">{nombre}</strong> del
        catálogo. Esta acción no se puede deshacer.
      </p>
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl bg-error-surface p-3 text-sm text-danger"
        >
          {error}
        </p>
      )}
      <div className="mt-7 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={deleting}
          className="btn-secondary"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={deleting}
          className="btn-danger"
        >
          {deleting ? "Eliminando…" : `Eliminar ${entidad}`}
        </button>
      </div>
    </dialog>
  );
}
