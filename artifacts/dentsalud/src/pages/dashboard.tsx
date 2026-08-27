import { Layout } from "@/components/layout/Layout";
import {
  useGetDashboardStats, getGetDashboardStatsQueryKey,
  useGetActividadReciente, getGetActividadRecienteQueryKey,
  useGetCitasHoy, getGetCitasHoyQueryKey,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { Users, CalendarCheck, ClipboardList, DollarSign, TrendingUp, UserPlus, Clock, CalendarDays, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);
}

function StatCard({ title, value, sub, icon: Icon, color }: {
  title: string; value: string | number; sub?: string; icon: React.ElementType; color: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-xl ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const ESTADO_CONFIG: Record<string, { label: string; dot: string }> = {
  programada:  { label: "Programada",  dot: "bg-amber-400" },
  confirmada:  { label: "Confirmada",  dot: "bg-blue-400" },
  en_atencion: { label: "En Atención", dot: "bg-purple-400" },
  completada:  { label: "Completada",  dot: "bg-green-500" },
  cancelada:   { label: "Cancelada",   dot: "bg-red-400" },
  no_asistio:  { label: "No Asistió",  dot: "bg-gray-400" },
};

function formatHora(h: string) { return h?.slice(0, 5) ?? ""; }

export default function DashboardPage() {
  const { data: stats, isLoading: loadingStats } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey(), staleTime: 30000 },
  });
  const { data: actividadRaw, isLoading: loadingActividad } = useGetActividadReciente({ limite: 10 }, {
    query: { queryKey: getGetActividadRecienteQueryKey({ limite: 10 }), staleTime: 30000 },
  });
  const actividad = Array.isArray(actividadRaw) ? actividadRaw : [];
  const { data: citasHoyRaw, isLoading: loadingCitas } = useGetCitasHoy({
    query: { queryKey: getGetCitasHoyQueryKey(), staleTime: 15000 },
  });
  const citasHoy = Array.isArray(citasHoyRaw) ? citasHoyRaw : [];

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5 capitalize">
              {new Date().toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/citas/nueva">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#00AEEF] text-white rounded-lg text-sm font-medium hover:bg-[#0099d4] transition-colors">
                <CalendarDays className="h-4 w-4" />
                Nueva Cita
              </button>
            </Link>
            <Link href="/pacientes/nuevo">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#8DC63F] text-white rounded-lg text-sm font-medium hover:bg-[#7ab535] transition-colors">
                <UserPlus className="h-4 w-4" />
                Nuevo Paciente
              </button>
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        {loadingStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-5">
                  <div className="h-16 bg-muted animate-pulse rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Pacientes"
              value={stats?.totalPacientes ?? 0}
              sub={`+${stats?.pacientesEsteMes ?? 0} este mes`}
              icon={Users}
              color="bg-[#8DC63F]"
            />
            <StatCard
              title="Citas Hoy"
              value={stats?.citasHoy ?? 0}
              sub={`${stats?.citasPendientes ?? 0} pendientes`}
              icon={CalendarDays}
              color="bg-[#00AEEF]"
            />
            <StatCard
              title="Tratamientos Pendientes"
              value={stats?.tratamientosPendientes ?? 0}
              sub={`${stats?.tratamientosCompletados ?? 0} completados`}
              icon={ClipboardList}
              color="bg-amber-500"
            />
            <StatCard
              title="Ingresos del Mes"
              value={formatCurrency(stats?.ingresosMes ?? 0)}
              sub={`Hoy: ${formatCurrency(stats?.ingresosHoy ?? 0)}`}
              icon={DollarSign}
              color="bg-emerald-600"
            />
          </div>
        )}

        {/* Main content: Agenda del día + Actividad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Agenda del día */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#00AEEF]" />
                  Agenda de Hoy
                </CardTitle>
                <Link href="/citas">
                  <a className="text-xs text-[#00AEEF] hover:underline cursor-pointer">Ver todas</a>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loadingCitas ? (
                <div className="space-y-2 py-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : citasHoy.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sin citas para hoy</p>
                  <Link href="/citas/nueva">
                    <a className="text-xs text-[#8DC63F] hover:underline cursor-pointer mt-1 inline-block">
                      + Agendar cita
                    </a>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {citasHoy.map(cita => {
                    const cfg = ESTADO_CONFIG[cita.estado] ?? { label: cita.estado, dot: "bg-gray-400" };
                    return (
                      <div key={cita.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-accent/30 transition-colors">
                        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dot)} />
                        <div className="flex-shrink-0 text-center min-w-[40px]">
                          <p className="text-xs font-bold text-[#8DC63F]">{formatHora(cita.horaInicio)}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{cita.pacienteNombres} {cita.pacienteApellidos}</p>
                          <p className="text-xs text-muted-foreground truncate">{cita.motivo ?? cita.tipoTratamientoNombre ?? "Sin motivo"}</p>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{cfg.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actividad reciente + Acciones rápidas */}
          <div className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingActividad ? (
                  <div className="space-y-3 py-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : actividad && actividad.length > 0 ? (
                  <div className="divide-y divide-border max-h-44 overflow-y-auto">
                    {actividad.map((item, i) => (
                      <div key={i} className="py-2.5 flex items-start gap-3">
                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${item.tipo === "nuevo_paciente" ? "bg-[#8DC63F]" : "bg-[#00AEEF]"}`} />
                        <div className="flex-1 min-w-0">
                          {item.pacienteNombre && (
                            <Link href={`/pacientes/${item.pacienteId}`}>
                              <p className="text-xs font-medium hover:text-[#8DC63F] cursor-pointer truncate">{item.pacienteNombre}</p>
                            </Link>
                          )}
                          <p className="text-xs text-muted-foreground truncate">{item.descripcion}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          {item.importe != null && (
                            <p className="text-xs font-medium text-emerald-600">{formatCurrency(item.importe)}</p>
                          )}
                          <p className="text-xs text-muted-foreground">{new Date(item.fecha).toLocaleDateString("es-PE")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">Sin actividad reciente</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/pacientes/nuevo">
                  <a className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:border-[#8DC63F]/50 hover:bg-[#8DC63F]/5 transition-colors">
                    <div className="p-1.5 bg-[#8DC63F]/10 rounded-lg"><UserPlus className="h-3.5 w-3.5 text-[#8DC63F]" aria-hidden="true" /></div>
                    <p className="text-sm font-medium">Registrar Paciente</p>
                  </a>
                </Link>
                <Link href="/citas/nueva">
                  <a className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:border-[#00AEEF]/50 hover:bg-[#00AEEF]/5 transition-colors">
                    <div className="p-1.5 bg-[#00AEEF]/10 rounded-lg"><CalendarDays className="h-3.5 w-3.5 text-[#00AEEF]" aria-hidden="true" /></div>
                    <p className="text-sm font-medium">Agendar Cita</p>
                  </a>
                </Link>
                <Link href="/pacientes">
                  <a className="flex items-center gap-3 p-2.5 rounded-lg border border-border hover:border-gray-400/50 hover:bg-gray-50 transition-colors">
                    <div className="p-1.5 bg-gray-100 rounded-lg"><Users className="h-3.5 w-3.5 text-gray-600" aria-hidden="true" /></div>
                    <p className="text-sm font-medium">Ver Pacientes</p>
                  </a>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
