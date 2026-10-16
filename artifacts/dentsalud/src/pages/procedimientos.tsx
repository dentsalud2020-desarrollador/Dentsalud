import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { customFetch, ApiError, getListTiposTratamientoQueryKey } from "@workspace/api-client-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Plus, Pencil, Loader2, X, Search, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Procedimiento = {
  id: number;
  nombre: string;
  subtipo: string | null;
  codigo: string | null;
  precioReferencia: number;
  descripcion: string | null;
  activo: boolean;
};

type FormState = {
  nombre: string;
  subtipo: string;
  codigo: string;
  precioReferencia: string;
  descripcion: string;
};

const FORM_VACIO: FormState = { nombre: "", subtipo: "", codigo: "", precioReferencia: "", descripcion: "" };
const QUERY_KEY = ["/api/tipos-tratamiento/todos"] as const;

function formatMonto(n: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(n);
}

function mensajeError(err: unknown, porDefecto: string) {
  if (err instanceof ApiError) {
    const data = err.data as { error?: string } | null;
    if (data?.error) return data.error;
  }
  return porDefecto;
}

const inputClass = "mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background";

export default function ProcedimientosPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [busqueda, setBusqueda] = useState("");
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [editando, setEditando] = useState<Procedimiento | "nuevo" | null>(null);
  const [form, setForm] = useState<FormState>(FORM_VACIO);

  const { data: procedimientos = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => customFetch<Procedimiento[]>("/api/tipos-tratamiento/todos"),
  });

  const refrescar = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    // La lista de procedimientos activos se usa en citas y planes de tratamiento
    queryClient.invalidateQueries({ queryKey: getListTiposTratamientoQueryKey() });
  };

  const guardarMutation = useMutation({
    mutationFn: (vars: { id?: number; datos: Record<string, unknown> }) =>
      customFetch<Procedimiento>(
        vars.id ? `/api/tipos-tratamiento/${vars.id}` : "/api/tipos-tratamiento",
        {
          method: vars.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(vars.datos),
        },
      ),
    onSuccess: (_data, vars) => {
      refrescar();
      setEditando(null);
      toast({ title: vars.id ? "Procedimiento actualizado" : "Procedimiento creado" });
    },
    onError: (err) => toast({ title: mensajeError(err, "Error al guardar el procedimiento"), variant: "destructive" }),
  });

  const activoMutation = useMutation({
    mutationFn: (p: Procedimiento) =>
      customFetch<Procedimiento>(`/api/tipos-tratamiento/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !p.activo }),
      }),
    onSuccess: (p) => {
      refrescar();
      toast({ title: p.activo ? "Procedimiento activado" : "Procedimiento desactivado" });
    },
    onError: (err) => toast({ title: mensajeError(err, "Error al cambiar el estado"), variant: "destructive" }),
  });

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return procedimientos.filter(p =>
      (mostrarInactivos || p.activo) &&
      (!q || [p.nombre, p.subtipo, p.codigo].some(v => v?.toLowerCase().includes(q))),
    );
  }, [procedimientos, busqueda, mostrarInactivos]);

  const totalActivos = procedimientos.filter(p => p.activo).length;

  const abrirNuevo = () => {
    setForm(FORM_VACIO);
    setEditando("nuevo");
  };

  const abrirEditar = (p: Procedimiento) => {
    setForm({
      nombre: p.nombre,
      subtipo: p.subtipo ?? "",
      codigo: p.codigo ?? "",
      precioReferencia: String(p.precioReferencia ?? ""),
      descripcion: p.descripcion ?? "",
    });
    setEditando(p);
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    guardarMutation.mutate({
      id: editando && editando !== "nuevo" ? editando.id : undefined,
      datos: {
        nombre: form.nombre,
        subtipo: form.subtipo,
        codigo: form.codigo,
        precioReferencia: form.precioReferencia === "" ? 0 : Number(form.precioReferencia),
        descripcion: form.descripcion,
      },
    });
  };

  const handleToggleActivo = (p: Procedimiento) => {
    if (p.activo && !window.confirm(`¿Desactivar "${p.nombre}"? Ya no aparecerá al crear citas ni planes de tratamiento, pero se conserva en el historial.`)) return;
    activoMutation.mutate(p);
  };

  return (
    <Layout>
      <div className="sm:p-2 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Procedimientos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Catálogo de tratamientos y precios de referencia · {totalActivos} activos
            </p>
          </div>
          <Button onClick={abrirNuevo} className="bg-[#8DC63F] hover:bg-[#7ab535] text-white">
            <Plus className="h-4 w-4 mr-1" /> Nuevo procedimiento
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, subtipo o código..."
              className="w-full border border-input rounded-md pl-9 pr-3 py-2 text-sm bg-background"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={mostrarInactivos} onChange={e => setMostrarInactivos(e.target.checked)} />
            Mostrar desactivados
          </label>
        </div>

        {/* Lista */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[#8DC63F]" /> Lista de procedimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#8DC63F]" /></div>
            ) : filtrados.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                {procedimientos.length === 0 ? "Aún no hay procedimientos registrados." : "No se encontraron procedimientos."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border">
                      <th className="py-2 pr-3 font-medium">Código</th>
                      <th className="py-2 pr-3 font-medium">Procedimiento</th>
                      <th className="py-2 pr-3 font-medium text-right">Precio ref.</th>
                      <th className="py-2 pr-3 font-medium">Estado</th>
                      <th className="py-2 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map(p => (
                      <tr key={p.id} className={cn("border-b border-border last:border-0", !p.activo && "opacity-60")}>
                        <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">{p.codigo || "—"}</td>
                        <td className="py-2.5 pr-3">
                          <p className="font-medium">{p.nombre}</p>
                          {p.subtipo && <p className="text-xs text-muted-foreground">{p.subtipo}</p>}
                          {p.descripcion && <p className="text-xs text-muted-foreground line-clamp-1">{p.descripcion}</p>}
                        </td>
                        <td className="py-2.5 pr-3 text-right whitespace-nowrap">{formatMonto(p.precioReferencia)}</td>
                        <td className="py-2.5 pr-3">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                            p.activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700",
                          )}>
                            {p.activo ? "Activo" : "Desactivado"}
                          </span>
                        </td>
                        <td className="py-2.5 text-right whitespace-nowrap">
                          <Button variant="ghost" size="icon" onClick={() => abrirEditar(p)} aria-label="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => handleToggleActivo(p)}
                            disabled={activoMutation.isPending}
                            aria-label={p.activo ? "Desactivar" : "Activar"}
                            title={p.activo ? "Desactivar" : "Activar"}
                          >
                            <Power className={cn("h-4 w-4", p.activo ? "text-red-500" : "text-green-600")} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal crear / editar */}
        {editando && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{editando === "nuevo" ? "Nuevo procedimiento" : "Editar procedimiento"}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setEditando(null)} aria-label="Cerrar"><X className="h-4 w-4" /></Button>
              </CardHeader>
              <form onSubmit={handleGuardar}>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nombre *</label>
                    <input required maxLength={80} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej. Endodoncia" className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Subtipo</label>
                      <input maxLength={50} value={form.subtipo} onChange={e => setForm(f => ({ ...f, subtipo: e.target.value }))} placeholder="Ej. Unirradicular" className={inputClass} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Código</label>
                      <input maxLength={20} value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} placeholder="Ej. END-01" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Precio de referencia (S/)</label>
                    <input type="number" min="0" step="0.01" value={form.precioReferencia} onChange={e => setForm(f => ({ ...f, precioReferencia: e.target.value }))} placeholder="0.00" className={inputClass} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descripción</label>
                    <textarea rows={3} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} className={cn(inputClass, "resize-none")} />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
                    <Button type="submit" disabled={guardarMutation.isPending} className="bg-[#8DC63F] hover:bg-[#7ab535] text-white">
                      {guardarMutation.isPending ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
