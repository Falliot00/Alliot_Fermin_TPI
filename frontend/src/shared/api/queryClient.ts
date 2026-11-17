import { isAxiosError } from "axios";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { notifyRequestError } from "./http";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: notifyRequestError }),
  mutationCache: new MutationCache({ onError: notifyRequestError }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        return status !== 401 && status !== 403 && failureCount < 1;
      },
    },
    mutations: { retry: false },
  },
});
