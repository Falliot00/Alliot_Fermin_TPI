import { isAxiosError } from "axios";
import { useNotificationStore } from "@/store/notificationStore";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function errorMessage(error: unknown): string {
  if (isAxiosError<unknown>(error)) {
    if (!error.response)
      return "No se pudo conectar con el servidor. Verificá la conexión y volvé a intentar.";
    if (error.response.status === 403)
      return "Acceso denegado. No tenés permiso para realizar esta acción.";
    const data = error.response.data;
    if (isRecord(data)) {
      if (typeof data.detail === "string") return data.detail;
      if (Array.isArray(data.detail))
        return data.detail
          .map((item: unknown) =>
            isRecord(item) && typeof item.msg === "string"
              ? item.msg
              : "Datos inválidos.",
          )
          .join(" · ");
    }
    return `La solicitud falló (${error.response.status}).`;
  }
  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado.";
}

export function notifyRequestError(error: unknown) {
  // El interceptor ya informa los 403.
  if (isAxiosError(error) && error.response?.status === 403) return;
  useNotificationStore
    .getState()
    .showNotification(errorMessage(error), "error");
}
