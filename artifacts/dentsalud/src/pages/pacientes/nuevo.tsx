import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useCreatePaciente } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { ArrowLeft, Save, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function NuevoPacientePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    fechaNacimiento: "",
    telefono: "",
    dni: "",
    domicilio: "",
    correo: "",
    motivoConsulta: "",
  });

  const createMutation = useCreatePaciente({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Paciente registrado", description: `HC asignado: ${data.numeroHc}` });
        setLocation(`/pacientes/${data.id}`);
      },
      onError: () => {
        toast({ title: "Error", description: "No se pudo registrar el paciente", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombres || !form.apellidos) return;
    createMutation.mutate({
      data: {
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        fechaNacimiento: form.fechaNacimiento || undefined,
        telefono: form.telefono.trim() || undefined,
        dni: form.dni.trim() || undefined,
        domicilio: form.domicilio.trim() || undefined,
        correo: form.correo.trim() || undefined,
        motivoConsulta: form.motivoConsulta.trim() || undefined,
      },
    });
  };

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  return (
    <Layout>
      <div className="p-6 max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/pacientes">
            <button className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Nuevo Paciente</h1>
            <p className="text-sm text-muted-foreground">Complete los datos del paciente</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Datos personales */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-[#8DC63F]" />
                Datos Personales
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nombres">Nombres <span className="text-destructive">*</span></Label>
                <Input
                  id="nombres"
                  value={form.nombres}
                  onChange={e => update("nombres", e.target.value)}
                  placeholder="Ej: María Elena"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="apellidos">Apellidos <span className="text-destructive">*</span></Label>
                <Input
                  id="apellidos"
                  value={form.apellidos}
                  onChange={e => update("apellidos", e.target.value)}
                  placeholder="Ej: García López"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  value={form.dni}
                  onChange={e => update("dni", e.target.value)}
                  placeholder="12345678"
                  maxLength={8}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={e => update("fechaNacimiento", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={form.telefono}
                  onChange={e => update("telefono", e.target.value)}
                  placeholder="999 123 456"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="correo">Correo electrónico</Label>
                <Input
                  id="correo"
                  type="email"
                  value={form.correo}
                  onChange={e => update("correo", e.target.value)}
                  placeholder="paciente@correo.com"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="domicilio">Domicilio</Label>
                <Input
                  id="domicilio"
                  value={form.domicilio}
                  onChange={e => update("domicilio", e.target.value)}
                  placeholder="Av. España 123, Trujillo"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="motivoConsulta">Motivo de Consulta</Label>
                <Textarea
                  id="motivoConsulta"
                  value={form.motivoConsulta}
                  onChange={e => update("motivoConsulta", e.target.value)}
                  placeholder="Describir el motivo de la primera consulta..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Link href="/pacientes">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button
              type="submit"
              disabled={createMutation.isPending || !form.nombres || !form.apellidos}
              className="bg-[#8DC63F] hover:bg-[#7ab535] text-white"
            >
              {createMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center gap-2"><Save className="h-4 w-4" />Registrar Paciente</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
