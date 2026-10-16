import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import {
  customFetch,
  useGetCitas, useGetCitasHoy, useUpdateCitaEstado, useUpdateCita, useDeleteCita,
  useListTiposTratamiento, getListTiposTratamientoQueryKey,
  getGetCitasHoyQueryKey, getGetCitasQueryKey,
} from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, Clock, Loader2, Pencil, Trash2, X, History } from "lucide-react";
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

// Fecha de hoy (AAAA-MM-DD) en la hora local del navegador, no en UTC
function hoyLocal() {
  return new Intl.DateTimeFormat("en-CA").format(new Date());
}

const LIMITE_PASADAS = 200;

function formatHora(h: string) {
  return h?.slice(0, 5) ?? "";
}

function formatFecha(fecha: string) {
  if (!fecha) return "Sin fecha";
  return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-PE", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

function EstadoBadge({ estado }: { estado: string }) {
  const cfg = ESTADO_CONFIG[estado as EstadoCita] ?? { label: estado, color: "text-gray-700", bg: "bg-gray-100" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", cfg.bg, cfg.color)}>
      {cfg.label}
    </span>
  );
}

function CitaCard({ cita, onChangeEstado, onEdit, onDelete }: {
  cita: any;
  onChangeEstado: (id: number, estado: EstadoCita) => void;
  onEdit: (cita: any) => void;
  onDelete: (id: number) => void;
}) {
  const estado = cita.estado as EstadoCita;
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-[#8DC63F]/30 hover:bg-accent/30 transition-colors">
      <div className="flex-shrink-0 w-12 text-center">
        <p className="text-sm font-bold text-[#8DC63F]">{formatHora(cita.horaInicio)}</p>
        <p className="text-xs text-muted-foreground">{formatHora(cita.horaFin)}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground capitalize mb-1">{formatFecha(cita.fechaCita)}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium">{cita.pacienteNombres} {cita.pacienteApellidos}</p>
          <EstadoBadge estado={estado} />
        </div>
        {cita.pacienteDni && <p className="text-xs text-muted-foreground mt-0.5">DNI: {cita.pacienteDni}</p>}
        {cita.tipoTratamientoNombre && (
          <p className="text-xs text-[#00AEEF] mt-0.5">{cita.tipoTratamientoNombre}</p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">Motivo: {cita.motivo ?? "Sin motivo"}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Reserva: {cita.canalReserva ?? "Sin especificar"}</p>
        {cita.notas && <p className="text-xs text-muted-foreground mt-0.5 break-words">Notas: {cita.notas}</p>}
      </div>
      <div className="flex-shrink-0 flex flex-col gap-1">
        <button
          onClick={() => onEdit(cita)}
          className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
        >
          <Pencil className="h-3 w-3" /> Editar
        </button>
        <button
          onClick={() => onDelete(cita.id)}
          className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" /> Eliminar
        </button>
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
  const [tab, setTab] = useState<"hoy" | "fecha" | "todas" | "pasadas">("hoy");
  const [pasadasDesde, setPasadasDesde] = useState("");
  const [pasadasHasta, setPasadasHasta] = useState("");
  const [pasadasEstado, setPasadasEstado] = useState("");
  const [filterFecha, setFilterFecha] = useState("");
  const [editingCita, setEditingCita] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ fechaCita: "", horaInicio: "", horaFin: "", motivo: "", notas: "", estado: "programada", tipoTratamientoId: "" });
  const { toast } = useToast();
  const qc = useQueryClient();
  const today = hoyLocal();

  const { data: citasHoyRaw, isLoading: loadingHoy } = useGetCitasHoy({
    query: { queryKey: getGetCitasHoyQueryKey(), staleTime: 10000 },
  });
  const citasHoy = Array.isArray(citasHoyRaw) ? citasHoyRaw : [];

  const { data: citasFiltradas = [], isLoading: loadingFiltradas } = useGetCitas(
    { fecha: tab === "fecha" && filterFecha ? filterFecha : undefined, desde: tab === "todas" ? today : undefined, limit: tab === "todas" ? 200 : undefined },
    { query: { queryKey: getGetCitasQueryKey({ fecha: tab === "fecha" && filterFecha ? filterFecha : undefined, desde: tab === "todas" ? today : undefined, limit: tab === "todas" ? 200 : undefined }), staleTime: 10000 } }
  );

  // Citas pasadas: anteriores a hoy (o hasta la fecha elegida), de la más reciente a la más antigua
  const pasadasHastaExclusivo = (() => {
    if (!pasadasHasta) return today;
    const d = new Date(`${pasadasHasta}T00:00:00`);
    d.setDate(d.getDate() + 1);
    const siguiente = new Intl.DateTimeFormat("en-CA").format(d);
    return siguiente < today ? siguiente : today;
  })();
  const pasadasParams = new URLSearchParams({ hasta: pasadasHastaExclusivo, orden: "desc", limit: String(LIMITE_PASADAS) });
  if (pasadasDesde) pasadasParams.set("desde", pasadasDesde);
  if (pasadasEstado) pasadasParams.set("estado", pasadasEstado);
  const { data: citasPasadas = [], isLoading: loadingPasadas } = useQuery({
    queryKey: ["/api/citas", "pasadas", pasadasParams.toString()],
    queryFn: () => customFetch<any[]>(`/api/citas?${pasadasParams.toString()}`),
    enabled: tab === "pasadas",
    staleTime: 10000,
  });

  const { data: tipos = [] } = useListTiposTratamiento({
    query: { queryKey: getListTiposTratamientoQueryKey(), staleTime: 60000 },
  });

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

  const updateCitaMutation = useUpdateCita({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetCitasHoyQueryKey() });
        qc.invalidateQueries({ queryKey: getGetCitasQueryKey() });
        setEditingCita(null);
        toast({ title: "Cita actualizada" });
      },
      onError: () => toast({ title: "Error al actualizar la cita", variant: "destructive" }),
    },
  });

  const deleteCitaMutation = useDeleteCita({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetCitasHoyQueryKey() });
        qc.invalidateQueries({ queryKey: getGetCitasQueryKey() });
        toast({ title: "Cita eliminada" });
      },
      onError: () => toast({ title: "Error al eliminar la cita", variant: "destructive" }),
    },
  });

  const handleChangeEstado = (id: number, estado: EstadoCita) => {
    updateEstadoMutation.mutate({ id, data: { estado } });
  };

  const handleEdit = (cita: any) => {
    setEditingCita(cita);
    setEditForm({ fechaCita: cita.fechaCita, horaInicio: formatHora(cita.horaInicio), horaFin: formatHora(cita.horaFin), motivo: cita.motivo ?? "", notas: cita.notas ?? "", estado: cita.estado, tipoTratamientoId: cita.tipoTratamientoId?.toString() ?? "" });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Deseas cancelar esta cita? Quedará registrada como cancelada.")) deleteCitaMutation.mutate({ id });
  };

  const handleSaveEdit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingCita || editForm.horaFin <= editForm.horaInicio) {
      toast({ title: "La hora de fin debe ser mayor que la hora de inicio", variant: "destructive" });
      return;
    }
    updateCitaMutation.mutate({
      id: editingCita.id,
      data: { pacienteId: editingCita.pacienteId, odontologoId: editingCita.odontologoId, tipoTratamientoId: editForm.tipoTratamientoId ? Number(editForm.tipoTratamientoId) : null, fechaCita: editForm.fechaCita, horaInicio: editForm.horaInicio, horaFin: editForm.horaFin, motivo: editForm.motivo || null, estado: editForm.estado as any, canalReserva: editingCita.canalReserva, notas: editForm.notas || null },
    });
  };

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
            {(["hoy", "fecha", "todas", "pasadas"] as const).map(t => (
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
                {t === "hoy" ? "Agenda de Hoy" : t === "fecha" ? "Buscar por Fecha" : t === "todas" ? "Próximas Citas" : "Citas Pasadas"}
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
                    <CitaCard key={cita.id} cita={cita} onChangeEstado={handleChangeEstado} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filtro por fecha */}
        {tab === "fecha" && (
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
              ) : loadingFiltradas ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : citasFiltradas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Sin citas para esta fecha</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {citasFiltradas.map(cita => (
                    <CitaCard key={cita.id} cita={cita} onChangeEstado={handleChangeEstado} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {tab === "todas" && (
          <Card className="shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-[#8DC63F]" /> Próximas citas (desde hoy)</CardTitle></CardHeader>
            <CardContent>
              {loadingFiltradas ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : citasFiltradas.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No hay citas registradas</p> : <div className="space-y-2">{citasFiltradas.map(cita => <CitaCard key={cita.id} cita={cita} onChangeEstado={handleChangeEstado} onEdit={handleEdit} onDelete={handleDelete} />)}</div>}
            </CardContent>
          </Card>
        )}

        {tab === "pasadas" && (
          <Card className="shadow-sm">
            <CardHeader className="pb-2 space-y-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-[#8DC63F]" /> Citas pasadas
              </CardTitle>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Desde</label>
                  <input type="date" value={pasadasDesde} max={pasadasHasta || today} onChange={e => setPasadasDesde(e.target.value)} className="block border border-border rounded-md px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Hasta</label>
                  <input type="date" value={pasadasHasta} min={pasadasDesde || undefined} max={today} onChange={e => setPasadasHasta(e.target.value)} className="block border border-border rounded-md px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Estado</label>
                  <select value={pasadasEstado} onChange={e => setPasadasEstado(e.target.value)} className="block border border-border rounded-md px-3 py-1.5 text-sm bg-background">
                    <option value="">Todos</option>
                    {Object.entries(ESTADO_CONFIG).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}
                  </select>
                </div>
                {(pasadasDesde || pasadasHasta || pasadasEstado) && (
                  <Button variant="ghost" size="sm" onClick={() => { setPasadasDesde(""); setPasadasHasta(""); setPasadasEstado(""); }}>
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingPasadas ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : citasPasadas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No hay citas pasadas con estos filtros</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(
                    citasPasadas.reduce<Record<string, any[]>>((grupos, cita) => {
                      (grupos[cita.fechaCita] ??= []).push(cita);
                      return grupos;
                    }, {}),
                  ).map(([fecha, citas]) => (
                    <div key={fecha}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{formatFecha(fecha)}</p>
                      <div className="space-y-2">
                        {[...citas].reverse().map(cita => <CitaCard key={cita.id} cita={cita} onChangeEstado={handleChangeEstado} onEdit={handleEdit} onDelete={handleDelete} />)}
                      </div>
                    </div>
                  ))}
                  {citasPasadas.length >= LIMITE_PASADAS && (
                    <p className="text-xs text-muted-foreground text-center">
                      Se muestran las {LIMITE_PASADAS} citas más recientes. Usa los filtros de fecha para ver citas más antiguas.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {editingCita && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-lg">Editar cita</CardTitle><Button variant="ghost" size="icon" onClick={() => setEditingCita(null)} aria-label="Cerrar"><X className="h-4 w-4" /></Button></CardHeader>
              <form onSubmit={handleSaveEdit}><CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Paciente: {editingCita.pacienteNombres} {editingCita.pacienteApellidos}</p>
                <div><label className="text-sm font-medium">Fecha</label><input type="date" required value={editForm.fechaCita} onChange={e => setEditForm(f => ({ ...f, fechaCita: e.target.value }))} className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background" /></div>
                <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium">Hora inicio</label><input type="time" required value={editForm.horaInicio} onChange={e => setEditForm(f => ({ ...f, horaInicio: e.target.value }))} className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background" /></div><div><label className="text-sm font-medium">Hora fin</label><input type="time" required value={editForm.horaFin} onChange={e => setEditForm(f => ({ ...f, horaFin: e.target.value }))} className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background" /></div></div>
                <div><label className="text-sm font-medium">Tipo de tratamiento</label><select value={editForm.tipoTratamientoId} onChange={e => setEditForm(f => ({ ...f, tipoTratamientoId: e.target.value }))} className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background"><option value="">Sin especificar</option>{tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}{t.subtipo ? ` — ${t.subtipo}` : ""}</option>)}</select></div>
                <div><label className="text-sm font-medium">Estado</label><select value={editForm.estado} onChange={e => setEditForm(f => ({ ...f, estado: e.target.value }))} className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background">{Object.entries(ESTADO_CONFIG).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}</select></div>
                <div><label className="text-sm font-medium">Motivo</label><input value={editForm.motivo} onChange={e => setEditForm(f => ({ ...f, motivo: e.target.value }))} className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background" /></div>
                <div><label className="text-sm font-medium">Notas</label><textarea rows={3} value={editForm.notas} onChange={e => setEditForm(f => ({ ...f, notas: e.target.value }))} className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background resize-none" /></div>
                <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setEditingCita(null)}>Cancelar</Button><Button type="submit" disabled={updateCitaMutation.isPending} className="bg-[#8DC63F] hover:bg-[#7ab535] text-white">{updateCitaMutation.isPending ? "Guardando..." : "Guardar cambios"}</Button></div>
              </CardContent></form>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
