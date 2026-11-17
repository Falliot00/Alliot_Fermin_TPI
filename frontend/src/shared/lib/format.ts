const precio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});
const fecha = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const moneda = (valor: number) => precio.format(valor);
export const fechaHora = (valor: string) => fecha.format(new Date(valor));
