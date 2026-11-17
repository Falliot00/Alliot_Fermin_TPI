import { api } from "@/shared/api/api";
import { resourceApi } from "@/shared/api/catalogResource";
import type { Categoria, CategoriaInput } from "../types/categoria";

export const categoriesApi = {
  ...resourceApi<Categoria, CategoriaInput>("/categorias"),
  async list(signal: AbortSignal): Promise<Categoria[]> {
    const { data } = await api.get<Categoria[]>("/categorias", { signal });
    return data;
  },
};
