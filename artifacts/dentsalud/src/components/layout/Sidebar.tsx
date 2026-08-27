import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Users, LogOut, Stethoscope, CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/citas", label: "Agenda / Citas", icon: CalendarDays },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-[#8DC63F]" />
          <div>
            <div className="font-bold text-base leading-tight">
              <span className="text-[#8DC63F]">Dent</span><span className="text-[#00AEEF]">Salud</span>
            </div>
            <div className="text-xs text-sidebar-foreground/60 leading-tight">Tu Centro de Armonía Dentofacial</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Navegación principal">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location === href || location.startsWith(href + "/");
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}>
              <a
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-[#8DC63F]/20 text-[#8DC63F]"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-medium text-sidebar-foreground/90 truncate">{user?.nombreCompleto}</p>
          <p className="text-xs text-sidebar-foreground/50 truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
