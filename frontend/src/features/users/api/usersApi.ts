import { api } from "@/shared/api/api";
import type { Usuario } from "@/features/auth/types/auth.types";

export const usersApi = {
  async list(signal: AbortSignal) {
    const { data } = await api.get<Usuario[]>("/admin/usuarios", { signal });
    return data;
  },
  async cambiarEstado({ id, disabled }: { id: number; disabled: boolean }) {
    const accion = disabled ? "desactivar" : "activar";
    const { data } = await api.post<Usuario>(`/admin/usuarios/${id}/${accion}`);
    return data;
  },
};
