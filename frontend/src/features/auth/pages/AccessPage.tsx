import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { registrar } from "../api/authApi";
import { useAuthStore } from "@/store/authStore";
import { BoundTextField } from "@/shared/components/TextField";
import { LoadingState } from "@/shared/components/AsyncState";
import { errorMessage, isRecord } from "@/shared/api/http";

function requerido(value: string) {
  return value.trim() ? undefined : "Completá este campo.";
}

export default function AccessPage({
  registro = false,
}: {
  registro?: boolean;
}) {
  const checking = useAuthStore((state) => state.checking);
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    isRecord(location.state) && typeof location.state.from === "string"
      ? location.state.from
      : undefined;
  const destino = from ?? (user?.role === "admin" ? "/admin/resumen" : "/");
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: { username: "", full_name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      const username = value.username.trim();
      try {
        if (registro) {
          await registrar({
            ...value,
            username,
            full_name: value.full_name.trim(),
            email: value.email.trim(),
          });
        }
        await login({ username, password: value.password });
        const role = useAuthStore.getState().user?.role;
        navigate(from ?? (role === "admin" ? "/admin/resumen" : "/"), {
          replace: true,
        });
      } catch (error) {
        setError(errorMessage(error));
      }
    },
  });

  if (checking) return <LoadingState label="Comprobando sesión…" />;
  if (user) return <Navigate to={destino} replace />;

  return (
    <section
      className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-surface p-6 sm:p-9"
      aria-labelledby="access-title"
    >
      <h1 id="access-title" className="page-title">
        {registro ? "Creá tu cuenta" : "Iniciá sesión"}
      </h1>
      <form
        className="mt-6 grid gap-3"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="username"
          validators={{ onChange: ({ value }) => requerido(value) }}
        >
          {(field) => (
            <BoundTextField
              field={field}
              label="Nombre de usuario"
              autoComplete="username"
              maxLength={100}
            />
          )}
        </form.Field>
        {registro && (
          <>
            <form.Field
              name="full_name"
              validators={{ onChange: ({ value }) => requerido(value) }}
            >
              {(field) => (
                <BoundTextField
                  field={field}
                  label="Nombre completo"
                  autoComplete="name"
                  maxLength={100}
                />
              )}
            </form.Field>
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) =>
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
                    ? undefined
                    : "Ingresá un correo válido.",
              }}
            >
              {(field) => (
                <BoundTextField
                  field={field}
                  label="Correo electrónico"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                />
              )}
            </form.Field>
          </>
        )}
        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => {
              if (!registro)
                return value ? undefined : "Ingresá tu contraseña.";
              if (Array.from(value).length < 8)
                return "Ingresá al menos 8 caracteres.";
              if (new TextEncoder().encode(value).length > 72)
                return "La contraseña supera el límite de 72 bytes.";
            },
          }}
        >
          {(field) => (
            <BoundTextField
              field={field}
              label="Contraseña"
              type="password"
              autoComplete={registro ? "new-password" : "current-password"}
              maxLength={72}
            />
          )}
        </form.Field>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, submitting]) => (
            <button
              type="submit"
              className="btn-primary"
              disabled={!canSubmit || submitting}
            >
              {submitting
                ? "Procesando…"
                : registro
                  ? "Crear cuenta"
                  : "Ingresar"}
            </button>
          )}
        </form.Subscribe>
      </form>
      <Link
        className="mt-5 inline-block text-sm font-medium text-forest underline"
        to={registro ? "/login" : "/register"}
        state={location.state}
      >
        {registro ? "Ya tengo cuenta" : "Crear una cuenta"}
      </Link>
    </section>
  );
}
