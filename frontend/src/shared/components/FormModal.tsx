import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

export interface FormModalProps {
  title: string;
  saving: boolean;
  error: string | null;
  children: ReactNode;
  submitButton: ReactNode;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}

export function FormModal({
  title,
  saving,
  error,
  children,
  submitButton,
  onClose,
  onSubmit,
}: FormModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="modal"
      aria-labelledby="form-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="form-title" className="text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        <button
          type="button"
          disabled={saving}
          onClick={onClose}
          aria-label="Cerrar formulario"
          className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
        >
          <Icon name="close" />
        </button>
      </div>
      <form
        className="mt-7 space-y-5"
        noValidate
        aria-busy={saving}
        onSubmit={(event) => {
          event.preventDefault();
          if (!saving) void onSubmit();
        }}
      >
        <fieldset disabled={saving} className="space-y-5">
          {children}
        </fieldset>
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-error-surface p-3 text-sm text-danger"
          >
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-stone-100 pt-5">
          <button
            type="button"
            disabled={saving}
            className="btn-secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
          {submitButton}
        </div>
      </form>
    </dialog>
  );
}
