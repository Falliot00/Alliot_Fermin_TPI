import { api } from "./api";

export interface Pagina<T> {
  total: number;
  items: T[];
}

export async function listarTodo<T>(
  getPage: (skip: number, limit: number) => Promise<Pagina<T>>,
): Promise<T[]> {
  const limit = 100;
  const items: T[] = [];
  for (let skip = 0; ; skip += limit) {
    const page = await getPage(skip, limit);
    items.push(...page.items);
    if (items.length >= page.total || page.items.length < limit) return items;
  }
}

export function resourceApi<Entity, Input>(path: string) {
  return {
    async save({
      id,
      values,
    }: {
      id?: number;
      values: Input;
    }): Promise<Entity> {
      const { data } = await api.request<Entity>({
        url: id === undefined ? path : `${path}/${id}`,
        method: id === undefined ? "POST" : "PUT",
        data: values,
      });
      return data;
    },
    async remove(id: number): Promise<void> {
      await api.delete(`${path}/${id}`);
    },
  };
}
