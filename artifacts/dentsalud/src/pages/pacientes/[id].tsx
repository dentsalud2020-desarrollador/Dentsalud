import { useState } from "react";
import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import {
  useGetPaciente, getGetPacienteQueryKey,
  useUpdatePaciente,
  useGetAntecedentes, getGetAntecedentesQueryKey, useUpsertAntecedentes,
  useGetExamenClinico, getGetExamenClinicoQueryKey, useUpsertExamenClinico,
  useGetPlanTratamientos, getGetPlanTratamientosQueryKey,
  useCreatePlanTratamiento, useUpdatePlanTratamiento, useDeletePlanTratamiento,
  useListTiposTratamiento, getListTiposTratamientoQueryKey,
  useGetSesiones, getGetSesionesQueryKey,
  useCreateSesion, useUpdateSesion, useDeleteSesion,
  useGetPagos, getGetPagosQueryKey, useCreatePago,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Plus, Trash2, Check, DollarSign, Calendar, FileText, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Odontodiagrama } from "@/components/odontodiagrama/Odontodiagrama";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);
}
function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function PacienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const pacienteId = Number(id);
  const { toast } = useToast();
  const qc = useQueryClient();

  // ─── Paciente ───────────────────────────────────────────────────────────────
  const { data: paciente, isLoading } = useGetPaciente(pacienteId, {
    query: { queryKey: getGetPacienteQueryKey(pacienteId), enabled: !!pacienteId },
  });
  const [datosForm, setDatosForm] = useState<Record<string, string>>({});
  const [datosEditing, setDatosEditing] = useState(false);
  const updatePacienteMutation = useUpdatePaciente({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetPacienteQueryKey(pacienteId) });
        toast({ title: "Datos guardados" });
        setDatosEditing(false);
      },
      onError: () => toast({ title: "Error al guardar", variant: "destructive" }),
    },
  });

  const initDatosForm = () => {
    if (!paciente) return;
    const p = paciente.paciente;
    setDatosForm({
      nombres: p.nombres, apellidos: p.apellidos,
      dni: p.dni ?? "", telefono: p.telefono ?? "",
      fechaNacimiento: p.fechaNacimiento ?? "", correo: p.correo ?? "",
      domicilio: p.domicilio ?? "", motivoConsulta: p.motivoConsulta ?? "",
    });
    setDatosEditing(true);
  };

  // ─── Antecedentes ──────────────────────────────────────────────────────────
  const { data: antecedentes } = useGetAntecedentes(pacienteId, {
    query: { queryKey: getGetAntecedentesQueryKey(pacienteId), enabled: !!pacienteId },
  });
  const [antForm, setAntForm] = useState({
    patologicos: "", esGestante: false, edadGestacional: "",
    medicacionActual: "", alergias: "",
  });
  const [antInit, setAntInit] = useState(false);
  if (antecedentes && !antInit) {
    setAntForm({
      patologicos: antecedentes.patologicos ?? "",
      esGestante: antecedentes.esGestante ?? false,
      edadGestacional: antecedentes.edadGestacional?.toString() ?? "",
      medicacionActual: antecedentes.medicacionActual ?? "",
      alergias: antecedentes.alergias ?? "",
    });
    setAntInit(true);
  }
  const upsertAntecedentesMutation = useUpsertAntecedentes({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetAntecedentesQueryKey(pacienteId) });
        toast({ title: "Antecedentes guardados" });
      },
      onError: () => toast({ title: "Error al guardar antecedentes", variant: "destructive" }),
    },
  });

  // ─── Examen Clínico ────────────────────────────────────────────────────────
  const { data: examen } = useGetExamenClinico(pacienteId, {
    query: { queryKey: getGetExamenClinicoQueryKey(pacienteId), enabled: !!pacienteId },
  });
  const [exForm, setExForm] = useState({
    cuello: "", atm: "", mucosaYugal: "", paladar: "",
    lengua: "", pisoBoca: "", gingiva: "", analisisOclusion: "",
  });
  const [exInit, setExInit] = useState(false);
  if (examen && !exInit) {
    setExForm({
      cuello: examen.cuello ?? "",
      atm: examen.atm ?? "",
      mucosaYugal: examen.mucosaYugal ?? "",
      paladar: examen.paladar ?? "",
      lengua: examen.lengua ?? "",
      pisoBoca: examen.pisoBoca ?? "",
      gingiva: examen.gingiva ?? "",
      analisisOclusion: examen.analisisOclusion ?? "",
    });
    setExInit(true);
  }
  const upsertExamenMutation = useUpsertExamenClinico({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetExamenClinicoQueryKey(pacienteId) });
        toast({ title: "Examen clínico guardado" });
      },
      onError: () => toast({ title: "Error al guardar examen", variant: "destructive" }),
    },
  });

  // ─── Plan de Tratamientos ──────────────────────────────────────────────────
  const { data: tipos } = useListTiposTratamiento({
    query: { queryKey: getListTiposTratamientoQueryKey(), staleTime: Infinity },
  });
  const { data: plan } = useGetPlanTratamientos(pacienteId, {
    query: { queryKey: getGetPlanTratamientosQueryKey(pacienteId), enabled: !!pacienteId },
  });
  const createPlanMutation = useCreatePlanTratamiento({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetPlanTratamientosQueryKey(pacienteId) });
        toast({ title: "Tratamiento agregado" });
        setPlanForm({ tipoId: "", cantidad: "1", precioUnitario: "", notas: "" });
      },
      onError: () => toast({ title: "Error al agregar tratamiento", variant: "destructive" }),
    },
  });
  const deletePlanMutation = useDeletePlanTratamiento({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetPlanTratamientosQueryKey(pacienteId) });
        toast({ title: "Tratamiento eliminado" });
      },
      onError: () => toast({ title: "Error al eliminar", variant: "destructive" }),
    },
  });
  const [planForm, setPlanForm] = useState({ tipoId: "", cantidad: "1", precioUnitario: "", notas: "" });

  // ─── Sesiones ─────────────────────────────────────────────────────────────
  const { data: sesiones } = useGetSesiones(pacienteId, {
    query: { queryKey: getGetSesionesQueryKey(pacienteId), enabled: !!pacienteId },
  });
  const [sesionForm, setSesionForm] = useState({
    fechaSesion: new Date().toISOString().split("T")[0],
    tratamientoRealizado: "", importe: "", observaciones: "",
  });
  const createSesionMutation = useCreateSesion({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSesionesQueryKey(pacienteId) });
        toast({ title: "Sesión registrada" });
        setSesionForm({ fechaSesion: new Date().toISOString().split("T")[0], tratamientoRealizado: "", importe: "", observaciones: "" });
      },
      onError: () => toast({ title: "Error al registrar sesión", variant: "destructive" }),
    },
  });
  const deleteSesionMutation = useDeleteSesion({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetSesionesQueryKey(pacienteId) });
        toast({ title: "Sesión eliminada" });
      },
    },
  });
  const updateSesionMutation = useUpdateSesion({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetSesionesQueryKey(pacienteId) }),
    },
  });

  // ─── Pagos ────────────────────────────────────────────────────────────────
  const { data: pagos } = useGetPagos(pacienteId, {
    query: { queryKey: getGetPagosQueryKey(pacienteId), enabled: !!pacienteId },
  });
  const [pagoForm, setPagoForm] = useState({ monto: "", metodoPago: "efectivo", notas: "" });
  const createPagoMutation = useCreatePago({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetPagosQueryKey(pacienteId) });
        toast({ title: "Pago registrado" });
        setPagoForm({ monto: "", metodoPago: "efectivo", notas: "" });
      },
      onError: () => toast({ title: "Error al registrar pago", variant: "destructive" }),
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full py-32">
          <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!paciente) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <p className="text-muted-foreground">Paciente no encontrado</p>
          <Link href="/pacientes"><button className="mt-2 text-sm text-[#8DC63F] hover:underline">Volver a pacientes</button></Link>
        </div>
      </Layout>
    );
  }

  const p = paciente.paciente;
  const totalPlan = (plan ?? []).reduce((s, t) => s + (t.total ?? 0), 0);
  const totalPagado = (pagos ?? []).reduce((s, pg) => s + pg.monto, 0);
  const saldo = totalPlan - totalPagado;

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link href="/pacientes">
            <button className="p-2 mt-1 rounded-lg border border-border hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{p.nombres} {p.apellidos}</h1>
              <Badge variant="outline" className="font-mono text-xs">{p.numeroHc}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
              <span>Apertura: {formatDate(p.fechaApertura)}</span>
              {p.dni && <span>DNI: {p.dni}</span>}
              {p.telefono && <span>Tel: {p.telefono}</span>}
              <span className="text-[#8DC63F] font-medium">Dr. Alan Miller Prado Varela</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="datos" className="w-full">
          <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted p-1">
            {[
              { value: "datos", label: "Datos" },
              { value: "antecedentes", label: "Antecedentes" },
              { value: "examen", label: "Examen Clínico" },
              { value: "odontograma", label: "Odontodiagrama" },
              { value: "plan", label: "Plan de Tratamientos" },
              { value: "sesiones", label: "Sesiones" },
              { value: "pagos", label: "Pagos" },
            ].map(t => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs sm:text-sm">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── TAB: Datos del Paciente ── */}
          <TabsContent value="datos" className="mt-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Información Personal</CardTitle>
                  {!datosEditing && (
                    <button onClick={initDatosForm} className="text-xs text-[#00AEEF] hover:underline">
                      Editar
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!datosEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {[
                      { label: "Nombres", value: p.nombres },
                      { label: "Apellidos", value: p.apellidos },
                      { label: "DNI", value: p.dni || "—" },
                      { label: "F. Nacimiento", value: p.fechaNacimiento ? formatDate(p.fechaNacimiento) : "—" },
                      { label: "Teléfono", value: p.telefono || "—" },
                      { label: "Correo", value: p.correo || "—" },
                      { label: "Domicilio", value: p.domicilio || "—" },
                      { label: "N° HC", value: p.numeroHc },
                      { label: "Apertura", value: formatDate(p.fechaApertura) },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                        <p className="font-medium">{value}</p>
                      </div>
                    ))}
                    {p.motivoConsulta && (
                      <div className="col-span-2 md:col-span-3">
                        <p className="text-xs text-muted-foreground mb-0.5">Motivo de Consulta</p>
                        <p>{p.motivoConsulta}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: "nombres", label: "Nombres", required: true },
                        { key: "apellidos", label: "Apellidos", required: true },
                        { key: "dni", label: "DNI", type: "text" },
                        { key: "fechaNacimiento", label: "Fecha Nacimiento", type: "date" },
                        { key: "telefono", label: "Teléfono" },
                        { key: "correo", label: "Correo", type: "email" },
                      ].map(({ key, label, required, type }) => (
                        <div key={key} className="space-y-1.5">
                          <Label>{label}{required && <span className="text-destructive">*</span>}</Label>
                          <Input
                            type={type ?? "text"}
                            value={datosForm[key] ?? ""}
                            onChange={e => setDatosForm(f => ({ ...f, [key]: e.target.value }))}
                          />
                        </div>
                      ))}
                      <div className="space-y-1.5 md:col-span-2">
                        <Label>Domicilio</Label>
                        <Input value={datosForm.domicilio ?? ""} onChange={e => setDatosForm(f => ({ ...f, domicilio: e.target.value }))} />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <Label>Motivo de Consulta</Label>
                        <Textarea value={datosForm.motivoConsulta ?? ""} onChange={e => setDatosForm(f => ({ ...f, motivoConsulta: e.target.value }))} rows={3} />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setDatosEditing(false)}>Cancelar</Button>
                      <Button
                        className="bg-[#8DC63F] hover:bg-[#7ab535] text-white"
                        disabled={updatePacienteMutation.isPending}
                        onClick={() => {
                          updatePacienteMutation.mutate({
                            id: pacienteId,
                            data: {
                              nombres: datosForm.nombres,
                              apellidos: datosForm.apellidos,
                              dni: datosForm.dni || undefined,
                              fechaNacimiento: datosForm.fechaNacimiento || undefined,
                              telefono: datosForm.telefono || undefined,
                              correo: datosForm.correo || undefined,
                              domicilio: datosForm.domicilio || undefined,
                              motivoConsulta: datosForm.motivoConsulta || undefined,
                            },
                          });
                        }}
                      >
                        <Save className="h-4 w-4 mr-1" /> Guardar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB: Antecedentes ── */}
          <TabsContent value="antecedentes" className="mt-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Antecedentes Clínicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Antecedentes Patológicos</Label>
                  <Textarea
                    value={antForm.patologicos}
                    onChange={e => setAntForm(f => ({ ...f, patologicos: e.target.value }))}
                    placeholder="Hipertensión, diabetes, cardiopatías, etc."
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="esGestante"
                    checked={antForm.esGestante}
                    onCheckedChange={(v) => setAntForm(f => ({ ...f, esGestante: !!v }))}
                  />
                  <Label htmlFor="esGestante">Paciente gestante</Label>
                </div>
                {antForm.esGestante && (
                  <div className="space-y-1.5">
                    <Label>Semanas de gestación</Label>
                    <Input
                      type="number"
                      min="1" max="42"
                      value={antForm.edadGestacional}
                      onChange={e => setAntForm(f => ({ ...f, edadGestacional: e.target.value }))}
                      placeholder="Semanas"
                      className="w-32"
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label>Medicación Actual</Label>
                  <Textarea
                    value={antForm.medicacionActual}
                    onChange={e => setAntForm(f => ({ ...f, medicacionActual: e.target.value }))}
                    placeholder="Medicamentos que toma actualmente..."
                    rows={2}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Alergias</Label>
                  <Textarea
                    value={antForm.alergias}
                    onChange={e => setAntForm(f => ({ ...f, alergias: e.target.value }))}
                    placeholder="Alergias conocidas (medicamentos, látex, anestésicos, etc.)"
                    rows={2}
                  />
                </div>
                <Button
                  className="bg-[#8DC63F] hover:bg-[#7ab535] text-white"
                  disabled={upsertAntecedentesMutation.isPending}
                  onClick={() => {
                    upsertAntecedentesMutation.mutate({
                      id: pacienteId,
                      data: {
                        patologicos: antForm.patologicos || undefined,
                        esGestante: antForm.esGestante,
                        edadGestacional: antForm.edadGestacional ? Number(antForm.edadGestacional) : undefined,
                        medicacionActual: antForm.medicacionActual || undefined,
                        alergias: antForm.alergias || undefined,
                      },
                    });
                  }}
                >
                  <Save className="h-4 w-4 mr-1" /> Guardar Antecedentes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB: Examen Clínico ── */}
          <TabsContent value="examen" className="mt-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Examen Clínico Extraoral e Intraoral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "cuello", label: "Cuello" },
                    { key: "atm", label: "ATM (Articulación Temporomandibular)" },
                    { key: "mucosaYugal", label: "Mucosa Yugal" },
                    { key: "paladar", label: "Paladar" },
                    { key: "lengua", label: "Lengua" },
                    { key: "pisoBoca", label: "Piso de Boca" },
                    { key: "gingiva", label: "Gingiva" },
                    { key: "analisisOclusion", label: "Análisis de Oclusión" },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-1.5">
                      <Label>{label}</Label>
                      <Textarea
                        value={exForm[key as keyof typeof exForm]}
                        onChange={e => setExForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={`Hallazgos en ${label.toLowerCase()}...`}
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
                <Button
                  className="bg-[#8DC63F] hover:bg-[#7ab535] text-white"
                  disabled={upsertExamenMutation.isPending}
                  onClick={() => {
                    upsertExamenMutation.mutate({
                      id: pacienteId,
                      data: {
                        cuello: exForm.cuello || undefined,
                        atm: exForm.atm || undefined,
                        mucosaYugal: exForm.mucosaYugal || undefined,
                        paladar: exForm.paladar || undefined,
                        lengua: exForm.lengua || undefined,
                        pisoBoca: exForm.pisoBoca || undefined,
                        gingiva: exForm.gingiva || undefined,
                        analisisOclusion: exForm.analisisOclusion || undefined,
                      },
                    });
                  }}
                >
                  <Save className="h-4 w-4 mr-1" /> Guardar Examen Clínico
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB: Odontodiagrama ── */}
          <TabsContent value="odontograma" className="mt-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Odontodiagrama FDI</CardTitle>
              </CardHeader>
              <CardContent>
                <Odontodiagrama pacienteId={pacienteId} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB: Plan de Tratamientos ── */}
          <TabsContent value="plan" className="mt-4 space-y-4">
            {/* Add form */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Agregar Tratamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2 space-y-1.5">
                    <Label>Tipo de Tratamiento</Label>
                    <Select value={planForm.tipoId} onValueChange={v => {
                      const tipo = tipos?.find(t => String(t.id) === v);
                      setPlanForm(f => ({
                        ...f, tipoId: v,
                        precioUnitario: tipo ? String(tipo.precioReferencia) : f.precioUnitario,
                      }));
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {(tipos ?? []).map(t => (
                          <SelectItem key={t.id} value={String(t.id)}>
                            {t.nombre}{t.subtipo ? ` — ${t.subtipo}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>P/U (S/)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={planForm.precioUnitario}
                      onChange={e => setPlanForm(f => ({ ...f, precioUnitario: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={planForm.cantidad}
                      onChange={e => setPlanForm(f => ({ ...f, cantidad: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Button
                      disabled={!planForm.tipoId || !planForm.precioUnitario || createPlanMutation.isPending}
                      className="bg-[#8DC63F] hover:bg-[#7ab535] text-white"
                      onClick={() => {
                        createPlanMutation.mutate({
                          id: pacienteId,
                          data: {
                            tipoTratamientoId: Number(planForm.tipoId),
                            precioUnitario: Number(planForm.precioUnitario),
                            cantidad: Number(planForm.cantidad) || 1,
                            descuento: 0,
                          },
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Agregar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plan table */}
            <Card className="shadow-sm overflow-hidden">
              <div className="grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-3 px-4 py-2.5 bg-muted/40 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <div>Tratamientos</div>
                <div className="text-right">P/U</div>
                <div className="text-center">Cant.</div>
                <div className="text-right">Total</div>
                <div></div>
              </div>
              {(plan ?? []).length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Sin tratamientos en el plan
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {(plan ?? []).map(pt => (
                    <div key={pt.id} className="grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 items-center hover:bg-muted/20">
                      <div>
                        <p className="text-sm font-medium">
                          {pt.tipoTratamiento?.nombre}
                          {pt.tipoTratamiento?.subtipo && <span className="text-muted-foreground"> — {pt.tipoTratamiento.subtipo}</span>}
                        </p>
                        {pt.notas && <p className="text-xs text-muted-foreground">{pt.notas}</p>}
                      </div>
                      <div className="text-right text-sm">{formatCurrency(pt.precioUnitario)}</div>
                      <div className="text-center text-sm">{pt.cantidad}</div>
                      <div className="text-right text-sm font-semibold">{formatCurrency(pt.total ?? 0)}</div>
                      <div>
                        <button
                          onClick={() => deletePlanMutation.mutate({ id: pt.id })}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {/* Total */}
                  <div className="grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-3 px-4 py-3 items-center bg-muted/30">
                    <div className="text-sm font-bold uppercase text-muted-foreground">Total Plan</div>
                    <div />
                    <div />
                    <div className="text-right text-base font-bold text-[#8DC63F]">{formatCurrency(totalPlan)}</div>
                    <div />
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ── TAB: Sesiones ── */}
          <TabsContent value="sesiones" className="mt-4 space-y-4">
            {/* Add form */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Registrar Sesión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Fecha</Label>
                    <Input
                      type="date"
                      value={sesionForm.fechaSesion}
                      onChange={e => setSesionForm(f => ({ ...f, fechaSesion: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Importe (S/)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={sesionForm.importe}
                      onChange={e => setSesionForm(f => ({ ...f, importe: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-3">
                    <Label>Tratamiento Realizado</Label>
                    <Input
                      value={sesionForm.tratamientoRealizado}
                      onChange={e => setSesionForm(f => ({ ...f, tratamientoRealizado: e.target.value }))}
                      placeholder="Describe el tratamiento realizado..."
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-3">
                    <Label>Observaciones</Label>
                    <Textarea
                      value={sesionForm.observaciones}
                      onChange={e => setSesionForm(f => ({ ...f, observaciones: e.target.value }))}
                      placeholder="Notas adicionales..."
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Button
                      disabled={!sesionForm.tratamientoRealizado || !sesionForm.fechaSesion || createSesionMutation.isPending}
                      className="bg-[#8DC63F] hover:bg-[#7ab535] text-white"
                      onClick={() => {
                        createSesionMutation.mutate({
                          id: pacienteId,
                          data: {
                            fechaSesion: sesionForm.fechaSesion,
                            tratamientoRealizado: sesionForm.tratamientoRealizado,
                            importe: Number(sesionForm.importe) || 0,
                            observaciones: sesionForm.observaciones || undefined,
                          },
                        });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Registrar Sesión
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sesiones table */}
            <Card className="shadow-sm overflow-hidden">
              <div className="grid grid-cols-[1fr_3fr_1fr_1fr_auto] gap-3 px-4 py-2.5 bg-muted/40 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <div>Fecha</div>
                <div>Tratamiento Realizado</div>
                <div className="text-right">Importe</div>
                <div className="text-center">Confirmado</div>
                <div></div>
              </div>
              {(sesiones ?? []).length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Sin sesiones registradas</div>
              ) : (
                <div className="divide-y divide-border">
                  {(sesiones ?? []).map(s => (
                    <div key={s.id} className="grid grid-cols-[1fr_3fr_1fr_1fr_auto] gap-3 px-4 py-3 items-center hover:bg-muted/20">
                      <div className="text-sm text-muted-foreground">{formatDate(s.fechaSesion)}</div>
                      <div>
                        <p className="text-sm">{s.tratamientoRealizado}</p>
                        {s.observaciones && <p className="text-xs text-muted-foreground">{s.observaciones}</p>}
                      </div>
                      <div className="text-right text-sm font-medium">{formatCurrency(s.importe)}</div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => updateSesionMutation.mutate({
                            id: s.id,
                            data: { confirmado: !s.confirmado },
                          })}
                          className={`h-6 w-6 rounded flex items-center justify-center border transition-colors ${
                            s.confirmado
                              ? "bg-[#8DC63F] border-[#8DC63F] text-white"
                              : "border-border text-muted-foreground hover:border-[#8DC63F]"
                          }`}
                        >
                          {s.confirmado && <Check className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <div>
                        <button
                          onClick={() => deleteSesionMutation.mutate({ id: s.id })}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ── TAB: Pagos ── */}
          <TabsContent value="pagos" className="mt-4 space-y-4">
            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Total Plan", value: totalPlan, color: "text-foreground" },
                { label: "Total Pagado", value: totalPagado, color: "text-[#8DC63F]" },
                { label: "Saldo", value: saldo, color: saldo > 0 ? "text-destructive" : "text-[#8DC63F]" },
              ].map(({ label, value, color }) => (
                <Card key={label} className="shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`text-xl font-bold mt-1 ${color}`}>{formatCurrency(value)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add pago */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Registrar Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Monto (S/)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pagoForm.monto}
                      onChange={e => setPagoForm(f => ({ ...f, monto: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Método de Pago</Label>
                    <Select value={pagoForm.metodoPago} onValueChange={v => setPagoForm(f => ({ ...f, metodoPago: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                        <SelectItem value="yape">Yape/Plin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Notas</Label>
                    <Input value={pagoForm.notas} onChange={e => setPagoForm(f => ({ ...f, notas: e.target.value }))} placeholder="Referencia..." />
                  </div>
                  <div className="md:col-span-3">
                    <Button
                      disabled={!pagoForm.monto || Number(pagoForm.monto) <= 0 || createPagoMutation.isPending}
                      className="bg-[#8DC63F] hover:bg-[#7ab535] text-white"
                      onClick={() => {
                        createPagoMutation.mutate({
                          id: pacienteId,
                          data: {
                            monto: Number(pagoForm.monto),
                            metodoPago: pagoForm.metodoPago as import("@workspace/api-client-react").PagoInputMetodoPago,
                            notas: pagoForm.notas || undefined,
                          },
                        });
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-1" /> Registrar Pago
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pagos list */}
            <Card className="shadow-sm overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_1fr_2fr] gap-3 px-4 py-2.5 bg-muted/40 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <div>Fecha</div>
                <div className="text-right">Monto</div>
                <div>Método</div>
                <div>Notas</div>
              </div>
              {(pagos ?? []).length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Sin pagos registrados</div>
              ) : (
                <div className="divide-y divide-border">
                  {(pagos ?? []).map(pg => (
                    <div key={pg.id} className="grid grid-cols-[1fr_1fr_1fr_2fr] gap-3 px-4 py-3 items-center hover:bg-muted/20">
                      <div className="text-sm text-muted-foreground">
                        {new Date(pg.fechaPago).toLocaleDateString("es-PE")}
                      </div>
                      <div className="text-right text-sm font-semibold text-[#8DC63F]">{formatCurrency(pg.monto)}</div>
                      <div>
                        <Badge variant="outline" className="text-xs capitalize">{pg.metodoPago}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{pg.notas || "—"}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
