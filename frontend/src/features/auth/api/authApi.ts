import { api } from "@/shared/api/api";
import type { Credenciales, Registro, Usuario } from "../types/auth.types";

export async function login({ username, password }: Credenciales) {
  await api.post("/auth/token", new URLSearchParams({ username, password }));
}

export async function me() {
  const { data } = await api.get<Usuario>("/auth/me");
  return data;
}

export async function logout() {
  await api.post("/auth/logout");
}

export async function registrar(registro: Registro) {
  const { data } = await api.post<Usuario>("/auth/register", registro);
  return data;
}
