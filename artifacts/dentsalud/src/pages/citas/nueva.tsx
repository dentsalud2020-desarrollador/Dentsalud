import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout/Layout";
import {
  useListPacientes, getListPacientesQueryKey,
  useListTiposTratamiento, getListTiposTratamientoQueryKey,
  useCreateCita, getGetCitasHoyQueryKey, getGetCitasQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, ArrowLeft, Save, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const CANALES = [
  { value: "presencial", label: "Presencial" },
  { value: "telefono", label: "Teléfono" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "web", label: "Web" },
];

export default function NuevaCitaPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { user } = useAuth();

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    pacienteId: "",
    tipoTratamientoId: "",
    fechaCita: today,
    horaInicio: "09:00",
    horaFin: "09:30",
    motivo: "",
    canalReserva: "presencial",
    notas: "",
  });

  const { data: pacientesResp } = useListPacientes({ limite: 500 }, {
    query: { queryKey: getListPacientesQueryKey({ limite: 500 }), staleTime: 60000 },
  });
  const pacientes = pacientesResp?.data ?? [];

  const { data: tipos = [] } = useListTiposTratamiento({
    query: { queryKey: getListTiposTratamientoQueryKey(), staleTime: 60000 },
  });

  const createMutation = useCreateCita({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetCitasHoyQueryKey() });
        qc.invalidateQueries({ queryKey: getGetCitasQueryKey() });
        toast({ title: "Cita agendada exitosamente" });
        setLocation("/citas");
      },
      onError: () => toast({ title: "Error al agendar la cita", variant: "destructive" }),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pacienteId) {
      toast({ title: "Selecciona un paciente", variant: "destructive" }); return;
    }
    if (form.horaFin <= form.horaInicio) {
      toast({ title: "La hora de fin debe ser mayor a la hora de inicio", variant: "destructive" }); return;
    }
    createMutation.mutate({
      data: {
        pacienteId: Number(form.pacienteId),
        odontologoId: user?.id ?? 1,
        tipoTratamientoId: form.tipoTratamientoId ? Number(form.tipoTratamientoId) : null,
        fechaCita: form.fechaCita,
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
        motivo: form.motivo || null,
        estado: "programada",
        canalReserva: form.canalReserva as any,
        notas: form.notas || null,
      },
    });
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/citas">
            <button className="p-2 rounded-lg hover:bg-accent transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Nueva Cita</h1>
            <p className="text-sm text-muted-foreground">Agendar nueva cita para un paciente</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#8DC63F]" />
                Información de la Cita
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Paciente */}
              <div>
                <Label className="text-sm font-medium">Paciente <span className="text-destructive">*</span></Label>
                <select
                  required
                  value={form.pacienteId}
                  onChange={e => set("pacienteId", e.target.value)}
                  className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="">Seleccionar paciente...</option>
                  {pacientes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombres} {p.apellidos} {p.dni ? `— DNI: ${p.dni}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de tratamiento */}
              <div>
                <Label className="text-sm font-medium">Tipo de Tratamiento (opcional)</Label>
                <select
                  value={form.tipoTratamientoId}
                  onChange={e => set("tipoTratamientoId", e.target.value)}
                  className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="">Sin especificar</option>
                  {tipos.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}{t.subtipo ? ` — ${t.subtipo}` : ""}</option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <Label className="text-sm font-medium">Fecha <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  required
                  value={form.fechaCita}
                  min={today}
                  onChange={e => set("fechaCita", e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Horario */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Hora inicio <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="time"
                    required
                    value={form.horaInicio}
                    onChange={e => set("horaInicio", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Hora fin <span className="text-destructive">*</span></Label>
                  <Input
                    type="time"
                    required
                    value={form.horaFin}
                    onChange={e => set("horaFin", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Motivo */}
              <div>
                <Label className="text-sm font-medium">Motivo de la cita</Label>
                <Input
                  value={form.motivo}
                  onChange={e => set("motivo", e.target.value)}
                  placeholder="Ej: Control de rutina, extracción, consulta..."
                  className="mt-1"
                />
              </div>

              {/* Canal de reserva */}
              <div>
                <Label className="text-sm font-medium">Canal de reserva</Label>
                <select
                  value={form.canalReserva}
                  onChange={e => set("canalReserva", e.target.value)}
                  className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                >
                  {CANALES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Notas */}
              <div>
                <Label className="text-sm font-medium">Notas adicionales</Label>
                <textarea
                  value={form.notas}
                  onChange={e => set("notas", e.target.value)}
                  rows={2}
                  placeholder="Observaciones, consideraciones especiales..."
                  className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-[#8DC63F] hover:bg-[#7ab535] text-white"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {createMutation.isPending ? "Guardando..." : "Agendar Cita"}
                </Button>
                <Link href="/citas">
                  <Button type="button" variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout>
  );
}
