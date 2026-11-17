import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi } from "../api/categoriesApi";

const queryKey = ["categorias"] as const;

export function useCategories() {
  return useQuery({
    queryKey,
    queryFn: ({ signal }) => categoriesApi.list(signal),
  });
}

export function useCategoryActions() {
  const client = useQueryClient();
  const onSuccess = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey }),
      client.invalidateQueries({ queryKey: ["productos"] }),
    ]);
  };
  const save = useMutation({ mutationFn: categoriesApi.save, onSuccess });
  const remove = useMutation({ mutationFn: categoriesApi.remove, onSuccess });
  return { save, remove };
}
