import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // En celular, el menú se cierra al cambiar de página
  useEffect(() => { setMenuAbierto(false); }, [location]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login", { replace: true });
    }
  }, [isLoading, isAuthenticated, setLocation]);

  // Fallback: si la carga se mantiene por demasiado tiempo (por ejemplo
  // llamadas repetidas que devuelven 401), redirigimos al login para
  // evitar que la UI se quede pegada en el estado de carga.
  useEffect(() => {
    if (!isLoading) return;
    const t = setTimeout(() => {
      setLocation("/login", { replace: true });
    }, 3000);
    return () => clearTimeout(t);
  }, [isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:text-primary focus:shadow-lg"
      >
        Saltar al contenido
      </a>
      <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
      <main id="main-content" className="flex-1 min-w-0 overflow-y-auto" aria-label="Contenido principal" role="main">
        <header role="banner" className="sticky top-0 z-30 bg-white border-b px-3 py-2 sm:p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMenuAbierto(true)}
              className="md:hidden inline-flex p-2 -ml-1 rounded-md hover:bg-muted"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-[#0b6fa1]">DentSalud</h2>
              <div className="hidden sm:block text-sm text-muted-foreground">Tu centro de armonía dentofacial</div>
            </div>
          </div>
          <div className="text-right text-xs sm:text-sm">
            <div>044 - 637 622</div>
            <div>997 054 525</div>
          </div>
        </header>
        <div className="p-3 sm:p-4">{children}</div>
      </main>
    </div>
  );
}
