import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import {
  useGetCitas, useGetCitasHoy, useUpdateCitaEstado,
  getGetCitasHoyQueryKey, getGetCitasQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, Clock, CheckCircle, XCircle, UserRound, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type EstadoCita = "programada" | "confirmada" | "en_atencion" | "completada" | "cancelada" | "no_asistio";

const ESTADO_CONFIG: Record<EstadoCita, { label: string; color: string; bg: string }> = {
  programada:   { label: "Programada",   color: "text-amber-700",   bg: "bg-amber-100" },
  confirmada:   { label: "Confirmada",   color: "text-blue-700",    bg: "bg-blue-100" },
  en_atencion:  { label: "En Atención",  color: "text-purple-700",  bg: "bg-purple-100" },
  completada:   { label: "Completada",   color: "text-green-700",   bg: "bg-green-100" },
  cancelada:    { label: "Cancelada",    color: "text-red-700",     bg: "bg-red-100" },
  no_asistio:   { label: "No Asistió",   color: "text-gray-700",    bg: "bg-gray-100" },
};

function formatHora(h: string) {
  return h?.slice(0, 5) ?? "";
}

function EstadoBadge({ estado }: { estado: string }) {
  const cfg = ESTADO_CONFIG[estado as EstadoCita] ?? { label: estado, color: "text-gray-700", bg: "bg-gray-100" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", cfg.bg, cfg.color)}>
      {cfg.label}
    </span>
  );
}

function CitaCard({ cita, onChangeEstado }: {
  cita: any;
  onChangeEstado: (id: number, estado: EstadoCita) => void;
}) {
  const estado = cita.estado as EstadoCita;
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-[#8DC63F]/30 hover:bg-accent/30 transition-colors">
      <div className="flex-shrink-0 w-12 text-center">
        <p className="text-sm font-bold text-[#8DC63F]">{formatHora(cita.horaInicio)}</p>
        <p className="text-xs text-muted-foreground">{formatHora(cita.horaFin)}</p>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium">{cita.pacienteNombres} {cita.pacienteApellidos}</p>
          <EstadoBadge estado={estado} />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{cita.motivo ?? "Sin motivo"}</p>
        {cita.tipoTratamientoNombre && (
          <p className="text-xs text-[#00AEEF] mt-0.5">{cita.tipoTratamientoNombre}</p>
        )}
      </div>
      <div className="flex-shrink-0 flex flex-col gap-1">
        {estado === "programada" && (
          <>
            <button
              onClick={() => onChangeEstado(cita.id, "en_atencion")}
              className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
            >
              Atender
            </button>
            <button
              onClick={() => onChangeEstado(cita.id, "cancelada")}
              className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
            >
              Cancelar
            </button>
          </>
        )}
        {estado === "en_atencion" && (
          <button
            onClick={() => onChangeEstado(cita.id, "completada")}
            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            Completar
          </button>
        )}
        {estado === "programada" && (
          <Link href={`/pacientes/${cita.pacienteId}`}>
            <button className="text-xs px-2 py-1 bg-[#8DC63F]/10 text-[#8DC63F] rounded hover:bg-[#8DC63F]/20 transition-colors">
              Historia
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function CitasPage() {
  const [tab, setTab] = useState<"hoy" | "proximas" | "todas">("hoy");
  const [filterFecha, setFilterFecha] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: citasHoyRaw, isLoading: loadingHoy } = useGetCitasHoy({
    query: { queryKey: getGetCitasHoyQueryKey(), staleTime: 10000 },
  });
  const citasHoy = Array.isArray(citasHoyRaw) ? citasHoyRaw : [];

  const { data: todasCitas = [], isLoading: loadingTodas } = useGetCitas(
    { fecha: filterFecha || undefined },
    { query: { queryKey: getGetCitasQueryKey({ fecha: filterFecha || undefined }), staleTime: 10000 } }
  );

  const updateEstadoMutation = useUpdateCitaEstado({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetCitasHoyQueryKey() });
        qc.invalidateQueries({ queryKey: getGetCitasQueryKey() });
        toast({ title: "Estado actualizado" });
      },
      onError: () => toast({ title: "Error al actualizar estado", variant: "destructive" }),
    },
  });

  const handleChangeEstado = (id: number, estado: EstadoCita) => {
    updateEstadoMutation.mutate({ id, data: { estado } });
  };

  const today = new Date().toISOString().split("T")[0];
  const hoy = new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });

  const pendientesHoy = citasHoy.filter(c => c.estado === "programada" || c.estado === "en_atencion");
  const completadasHoy = citasHoy.filter(c => c.estado === "completada");

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Agenda de Citas</h1>
            <p className="text-sm text-muted-foreground mt-0.5 capitalize">{hoy}</p>
          </div>
          <Link href="/citas/nueva">
            <Button className="bg-[#8DC63F] hover:bg-[#7ab535] text-white">
              <Plus className="h-4 w-4 mr-1" /> Nueva Cita
            </Button>
          </Link>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-700">{pendientesHoy.length}</p>
            <p className="text-xs text-amber-600 mt-0.5">Pendientes hoy</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-700">{completadasHoy.length}</p>
            <p className="text-xs text-green-600 mt-0.5">Completadas hoy</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{citasHoy.length}</p>
            <p className="text-xs text-blue-600 mt-0.5">Total del día</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-6">
            {(["hoy", "todas"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors capitalize",
                  tab === t
                    ? "border-[#8DC63F] text-[#8DC63F]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "hoy" ? "Agenda de Hoy" : "Buscar por Fecha"}
              </button>
            ))}
          </div>
        </div>

        {/* Hoy tab */}
        {tab === "hoy" && (
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#8DC63F]" />
                Citas del día — {today}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHoy ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : citasHoy.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No hay citas programadas para hoy</p>
                  <Link href="/citas/nueva">
                    <Button className="mt-3 bg-[#8DC63F] hover:bg-[#7ab535] text-white" size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Agendar cita
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {citasHoy.map(cita => (
                    <CitaCard key={cita.id} cita={cita} onChangeEstado={handleChangeEstado} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Todas tab — filtro por fecha */}
        {tab === "todas" && (
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Buscar citas por fecha</CardTitle>
                <input
                  type="date"
                  value={filterFecha}
                  onChange={e => setFilterFecha(e.target.value)}
                  className="border border-border rounded-md px-3 py-1.5 text-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {!filterFecha ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Selecciona una fecha para ver las citas
                </p>
              ) : loadingTodas ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : todasCitas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sin citas para esta fecha</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todasCitas.map(cita => (
                    <CitaCard key={cita.id} cita={cita} onChangeEstado={handleChangeEstado} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
