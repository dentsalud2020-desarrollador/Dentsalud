import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useListPacientes, getListPacientesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Search, UserPlus, ChevronLeft, ChevronRight, FileText, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/useDebounce";

export default function PacientesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const debouncedBusqueda = useDebounce(busqueda, 300);
  const limite = 20;

  const { data, isLoading } = useListPacientes(
    { busqueda: debouncedBusqueda || undefined, pagina, limite },
    { query: { queryKey: getListPacientesQueryKey({ busqueda: debouncedBusqueda, pagina, limite }) } }
  );

  const pacientes = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limite);

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pacientes</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {total} paciente{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/pacientes/nuevo">
            <a className="inline-flex items-center gap-2 px-4 py-2 bg-[#8DC63F] text-white rounded-lg text-sm font-medium hover:bg-[#7ab535] transition-colors">
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Nuevo Paciente
            </a>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <label htmlFor="paciente-search" className="sr-only">Buscar pacientes</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            id="paciente-search"
            type="search"
            placeholder="Buscar por nombre, DNI o número de HC..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
            className="pl-10 h-10"
          />
        </div>

        {/* Table */}
        <Card className="shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-4 flex gap-4">
                  <div className="h-10 w-10 bg-muted animate-pulse rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-48" />
                    <div className="h-3 bg-muted animate-pulse rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : pacientes.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                {busqueda ? "Sin resultados para la búsqueda" : "No hay pacientes registrados"}
              </p>
              {!busqueda && (
                <Link href="/pacientes/nuevo">
                  <a className="mt-3 inline-block text-sm text-[#8DC63F] hover:underline">
                    Registrar primer paciente
                  </a>
                </Link>
              )}
            </div>
          ) : (
            <div>
              {/* Header row */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 bg-muted/40 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <div>Paciente</div>
                <div>N° HC</div>
                <div>DNI</div>
                <div>Teléfono</div>
                <div></div>
              </div>
              <div className="divide-y divide-border">
                {pacientes.map((p) => (
                  <div
                    key={p.id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3.5 items-center hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-[#8DC63F]/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-[#8DC63F]">
                          {p.nombres.charAt(0)}{p.apellidos.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.nombres} {p.apellidos}</p>
                        {p.fechaNacimiento && (
                          <p className="text-xs text-muted-foreground">
                            {calcEdad(p.fechaNacimiento)} años
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Badge variant="outline" className="text-xs font-mono">{p.numeroHc}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{p.dni || "—"}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      {p.telefono ? (
                        <><Phone className="h-3 w-3" />{p.telefono}</>
                      ) : "—"}
                    </div>
                    <div>
                      <Link href={`/pacientes/${p.id}`}>
                        <button className="px-3 py-1.5 text-xs text-[#00AEEF] border border-[#00AEEF]/30 rounded-lg hover:bg-[#00AEEF]/5 transition-colors">
                          Ver Historia
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Página {pagina} de {totalPages} ({total} total)</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPagina(p => Math.min(totalPages, p + 1))}
                disabled={pagina === totalPages}
                className="p-1.5 rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function calcEdad(fechaNacimiento: string): number {
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}
