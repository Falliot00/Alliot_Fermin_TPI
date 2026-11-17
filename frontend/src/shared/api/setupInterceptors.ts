import { isAxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import { api } from "./api";
import { isRecord } from "./http";

api.interceptors.response.use(undefined, (error: unknown) => {
  if (isAxiosError<unknown>(error)) {
    const status = error.response?.status;
    const path = error.config?.url;
    const data = error.response?.data;
    const inactive =
      status === 400 &&
      isRecord(data) &&
      data.detail === "Cuenta de usuario desactivada";

    if (
      path !== "/auth/token" &&
      path !== "/auth/me" &&
      (status === 401 || inactive)
    ) {
      useAuthStore.getState().clearSession();
    }
  }
  return Promise.reject(error);
});
