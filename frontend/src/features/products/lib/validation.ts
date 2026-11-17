export function precioValido(valor: string) {
  return valor.trim() && Number.isFinite(Number(valor)) && Number(valor) >= 0
    ? undefined
    : "Ingresá un precio igual o mayor que cero.";
}

export function stockValido(valor: string) {
  return /^\d+$/.test(valor) && Number.isSafeInteger(Number(valor))
    ? undefined
    : "Ingresá un número entero igual o mayor que cero.";
}

export function imagenValida(valor: string) {
  const url = valor.trim();
  if (!url) return;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return;
  } catch {
    // Mostrar el mismo mensaje para cualquier URL inválida.
  }
  return "Ingresá una URL de imagen HTTP o HTTPS.";
}
