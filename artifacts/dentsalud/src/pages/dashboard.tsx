import { Layout } from "@/components/layout/Layout";
import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetActividadReciente, getGetActividadRecienteQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Users, CalendarCheck, ClipboardList, DollarSign, TrendingUp, UserPlus, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export default function DashboardPage() {
  const { data: stats, isLoading: loadingStats } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey(), staleTime: 30000 },
  });
  const { data: actividad, isLoading: loadingActividad } = useGetActividadReciente({ limite: 10 }, {
    query: { queryKey: getGetActividadRecienteQueryKey({ limite: 10 }), staleTime: 30000 },
  });

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <Link href="/pacientes/nuevo">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#8DC63F] text-white rounded-lg text-sm font-medium hover:bg-[#7ab535] transition-colors">
              <UserPlus className="h-4 w-4" />
              Nuevo Paciente
            </button>
          </Link>
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
              title="Sesiones Hoy"
              value={stats?.sesionesHoy ?? 0}
              sub={`${stats?.sesionesMes ?? 0} este mes`}
              icon={CalendarCheck}
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

        {/* Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {loadingActividad ? (
                <div className="space-y-3 py-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : actividad && actividad.length > 0 ? (
                <div className="divide-y divide-border">
                  {actividad.map((item, i) => (
                    <div key={i} className="py-3 flex items-start gap-3">
                      <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${
                        item.tipo === "nuevo_paciente" ? "bg-[#8DC63F]" : "bg-[#00AEEF]"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.pacienteNombre && (
                            <Link href={`/pacientes/${item.pacienteId}`}>
                              <span className="hover:text-[#8DC63F] cursor-pointer">{item.pacienteNombre}</span>
                            </Link>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{item.descripcion}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {item.importe !== null && item.importe !== undefined && (
                          <p className="text-xs font-medium text-emerald-600">{formatCurrency(item.importe)}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.fecha).toLocaleDateString("es-PE")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-6 text-center">Sin actividad reciente</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/pacientes/nuevo">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-[#8DC63F]/50 hover:bg-[#8DC63F]/5 cursor-pointer transition-colors">
                  <div className="p-2 bg-[#8DC63F]/10 rounded-lg">
                    <UserPlus className="h-4 w-4 text-[#8DC63F]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Registrar Paciente</p>
                    <p className="text-xs text-muted-foreground">Agregar nuevo paciente al sistema</p>
                  </div>
                </div>
              </Link>
              <Link href="/pacientes">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-[#00AEEF]/50 hover:bg-[#00AEEF]/5 cursor-pointer transition-colors">
                  <div className="p-2 bg-[#00AEEF]/10 rounded-lg">
                    <Users className="h-4 w-4 text-[#00AEEF]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ver Pacientes</p>
                    <p className="text-xs text-muted-foreground">Lista completa de pacientes</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
