import { useCallback } from "react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";

export function useAuth() {
  const [, setLocation] = useLocation();

  const tokenPresent = typeof localStorage !== "undefined" && !!localStorage.getItem("dentsalud_token");

  const logout = useCallback(() => {
    localStorage.removeItem("dentsalud_token");
    setLocation("/login");
  }, [setLocation]);

  const { data: me, isLoading, error } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
      staleTime: 5 * 60 * 1000,
      enabled: tokenPresent,
      onError: (error: unknown) => {
        const status = (error as { status?: number })?.status;
        if (status === 401 || status === 403) {
          logout();
        }
      },
    },
  });

  return {
    user: me ?? null,
    isLoading,
    isAuthenticated: !!me && !error,
    logout,
  };
}
