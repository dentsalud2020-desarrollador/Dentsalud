import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";

export function useAuth() {
  const [, setLocation] = useLocation();

  const { data: me, isLoading, error } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  });

  const logout = () => {
    localStorage.removeItem("dentsalud_token");
    setLocation("/login");
  };

  return {
    user: me ?? null,
    isLoading,
    isAuthenticated: !!me && !error,
    logout,
  };
}
