import { useCallback } from "react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const tokenPresent = typeof localStorage !== "undefined" && !!localStorage.getItem("dentsalud_token");

  const logout = useCallback(() => {
    localStorage.removeItem("dentsalud_token");
    queryClient.removeQueries({ queryKey: getGetMeQueryKey() });
    setLocation("/login", { replace: true });
  }, [queryClient, setLocation]);

  const { data: me, isLoading, error } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
      staleTime: 5 * 60 * 1000,
      enabled: tokenPresent,
    },
  });

  if (me === undefined && tokenPresent && !isLoading) {
    logout();
  }

  return {
    user: me ?? null,
    isLoading,
    isAuthenticated: !!me && !error,
    logout,
  };
}
