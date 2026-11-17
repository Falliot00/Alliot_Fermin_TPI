import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "react-router-dom";
import { errorMessage } from "@/shared/api/http";
import { BoundTextField } from "@/shared/components/TextField";
import { moneda } from "@/shared/lib/format";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useOrderActions } from "../hooks/useOrders";
import type { FormaPago } from "../types/pedido";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const vaciar = useCartStore((state) => state.vaciar);
  const notify = useNotificationStore((state) => state.showNotification);
  const navigate = useNavigate();
  const { crear } = useOrderActions();

  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO" as FormaPago,
      notas: "",
    },
    onSubmit: async ({ value }) => {
      if (!items.length) return;
      const pedido = await crear
        .mutateAsync({
          items: items.map(({ producto_id, cantidad }) => ({
            producto_id,
            cantidad,
          })),
          direccion_entrega: value.direccion_entrega.trim(),
          forma_pago: value.forma_pago,
          notas: value.notas.trim() || null,
        })
        .catch(() => null);
      if (!pedido) return;
      vaciar();
      notify(`Pedido #${pedido.id} confirmado.`);
      navigate("/mis-pedidos", { replace: true });
    },
  });

  return (
    <section aria-labelledby="checkout-title">
      <Link
        to="/carrito"
        className="mb-4 inline-flex text-sm font-medium text-forest underline"
      >
        Volver al carrito
      </Link>
      <h1 id="checkout-title" className="page-title mb-7">
        Confirmar pedido
      </h1>
      {items.length === 0 ? (
        <div className="state-panel">
          <h2 className="text-lg font-semibold">Tu carrito está vacío</h2>
          <Link to="/" className="btn-primary">
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr] lg:items-start">
          <form
            className="rounded-2xl border border-stone-200 bg-surface p-5 sm:p-7"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              void form.handleSubmit();
            }}
          >
            <fieldset className="grid gap-4" disabled={crear.isPending}>
              <form.Field
                name="direccion_entrega"
                validators={{
                  onChange: ({ value }) => {
                    const largo = Array.from(value.trim()).length;
                    return largo >= 5 && largo <= 200
                      ? undefined
                      : "Ingresá una dirección de 5 a 200 caracteres.";
                  },
                }}
              >
                {(field) => (
                  <BoundTextField
                    field={field}
                    label="Dirección de entrega"
                    maxLength={200}
                    autoComplete="street-address"
                  />
                )}
              </form.Field>
              <form.Field name="forma_pago">
                {(field) => (
                  <div>
                    <label htmlFor="forma_pago" className="field-label">
                      Forma de pago
                    </label>
                    <select
                      id="forma_pago"
                      className="field"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(
                          event.target.value === "TRANSFERENCIA"
                            ? "TRANSFERENCIA"
                            : "EFECTIVO",
                        )
                      }
                    >
                      <option value="EFECTIVO">Efectivo</option>
                      <option value="TRANSFERENCIA">Transferencia</option>
                    </select>
                  </div>
                )}
              </form.Field>
              <form.Field name="notas">
                {(field) => (
                  <BoundTextField
                    field={field}
                    label="Notas (opcional)"
                    maxLength={2000}
                    multiline
                  />
                )}
              </form.Field>
              {crear.isError && (
                <p role="alert" className="text-sm text-danger">
                  {errorMessage(crear.error)}
                </p>
              )}
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, submitting]) => (
                  <button
                    type="submit"
                    className="btn-primary justify-self-start"
                    disabled={!canSubmit || submitting || crear.isPending}
                  >
                    {submitting ? "Confirmando…" : "Confirmar pedido"}
                  </button>
                )}
              </form.Subscribe>
            </fieldset>
          </form>
          <aside className="rounded-2xl border border-stone-200 bg-surface p-5">
            <h2 className="mb-4 font-semibold">Tu pedido</h2>
            <ul className="space-y-3 text-sm">
              {items.map((item) => (
                <li
                  key={item.producto_id}
                  className="flex justify-between gap-3"
                >
                  <span>
                    {item.cantidad} × {item.nombre}
                  </span>
                  <span className="shrink-0">
                    {moneda(item.cantidad * item.precio_unitario)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex justify-between gap-3 border-t border-stone-200 pt-4 font-semibold">
              <span>Total estimado</span>
              <span>{moneda(total)}</span>
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
