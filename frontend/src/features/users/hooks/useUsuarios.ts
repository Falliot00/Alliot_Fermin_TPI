import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/usersApi";

const queryKey = ["usuarios"] as const;

export function useUsuarios() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => usersApi.list(signal),
  });
  const cambiar = useMutation({
    mutationFn: usersApi.cambiarEstado,
    onSuccess: () => client.invalidateQueries({ queryKey }),
  });
  return { query, cambiar };
}
