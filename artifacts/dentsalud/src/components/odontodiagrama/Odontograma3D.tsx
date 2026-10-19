import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch, getGetOdontodiagramaQueryKey } from "@workspace/api-client-react";
import { Box, Check, Loader2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PiezaSistema {
  numeroPieza: string;
  estado: string;
  superficies?: string | null;
  observacion?: string | null;
}

interface Odontograma3DProps {
  pacienteId: number;
  pacienteNombre?: string;
  piezas: PiezaSistema[];
  onClose: () => void;
}

type Estado = "cargando" | "listo" | "guardando" | "guardado" | "error";

const ESPERA_GUARDADO_MS = 1200;
const ordenSup = (s?: string | null) => (s ?? "").split(",").filter(Boolean).sort().join(",");

// Abre el odontograma 3D (public/odontograma-3d.html) y lo mantiene sincronizado con el odontodiagrama del paciente
export function Odontograma3D({ pacienteId, pacienteNombre, piezas, onClose }: Odontograma3DProps) {
  const qc = useQueryClient();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const visorListo = useRef(false);
  const datosEnviados = useRef(false);
  // Último estado conocido del odontodiagrama en la base, para enviar solo las piezas que cambian
  const sistema = useRef(new Map(piezas.map(p => [p.numeroPieza, p])));
  const pendiente = useRef<{ datos: unknown; piezas: PiezaSistema[] } | null>(null);
  const temporizador = useRef<number | undefined>(undefined);
  const guardando = useRef<Promise<void> | null>(null);
  const [estado, setEstado] = useState<Estado>("cargando");

  const { data: guardado, isError } = useQuery({
    queryKey: ["/api/pacientes", pacienteId, "odontograma-3d"],
    queryFn: () => customFetch<{ datos: unknown }>(`/api/pacientes/${pacienteId}/odontograma-3d`),
    staleTime: 0,
  });

  const enviarDatosAlVisor = useCallback(() => {
    const ventana = iframeRef.current?.contentWindow;
    if (!ventana || !visorListo.current || !guardado || datosEnviados.current) return;
    datosEnviados.current = true;
    ventana.postMessage(
      { type: "odo3d:cargar", datos: guardado.datos, piezas: [...sistema.current.values()] },
      window.location.origin,
    );
    setEstado("listo");
  }, [guardado]);

  useEffect(() => { enviarDatosAlVisor(); }, [enviarDatosAlVisor]);

  const guardar = useCallback(async (): Promise<void> => {
    if (guardando.current) await guardando.current;
    const cambio = pendiente.current;
    if (!cambio) return;
    pendiente.current = null;

    const cambiadas = cambio.piezas.filter(p => {
      const actual = sistema.current.get(p.numeroPieza);
      const estadoActual = actual?.estado ?? "sano";
      return estadoActual !== p.estado || ordenSup(actual?.superficies) !== ordenSup(p.superficies);
    });

    setEstado("guardando");
    const tarea = (async () => {
      try {
        await customFetch(`/api/pacientes/${pacienteId}/odontograma-3d`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ datos: cambio.datos, piezas: cambiadas }),
        });
        cambiadas.forEach(p => sistema.current.set(p.numeroPieza, { ...sistema.current.get(p.numeroPieza), ...p }));
        if (cambiadas.length) qc.invalidateQueries({ queryKey: getGetOdontodiagramaQueryKey(pacienteId) });
        qc.setQueryData(["/api/pacientes", pacienteId, "odontograma-3d"], { datos: cambio.datos });
        setEstado(pendiente.current ? "guardando" : "guardado");
      } catch {
        // Se conserva el cambio para reintentarlo con el próximo cambio o al cerrar
        pendiente.current ??= cambio;
        setEstado("error");
      }
    })();
    guardando.current = tarea;
    await tarea;
    guardando.current = null;
  }, [pacienteId, qc]);

  useEffect(() => {
    const alRecibir = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== iframeRef.current?.contentWindow) return;
      const msg = e.data as { type?: string; datos?: unknown; piezas?: PiezaSistema[] };
      if (msg.type === "odo3d:listo") {
        visorListo.current = true;
        enviarDatosAlVisor();
      } else if (msg.type === "odo3d:cambio" && msg.datos && Array.isArray(msg.piezas)) {
        pendiente.current = { datos: msg.datos, piezas: msg.piezas };
        window.clearTimeout(temporizador.current);
        temporizador.current = window.setTimeout(() => { void guardar(); }, ESPERA_GUARDADO_MS);
      }
    };
    window.addEventListener("message", alRecibir);
    return () => window.removeEventListener("message", alRecibir);
  }, [enviarDatosAlVisor, guardar]);

  // Bloquea el desplazamiento de la página mientras el visor está abierto
  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = anterior; window.clearTimeout(temporizador.current); };
  }, []);

  const cerrar = async () => {
    window.clearTimeout(temporizador.current);
    await guardar();
    if (pendiente.current && !window.confirm("No se pudieron guardar los últimos cambios del odontograma 3D. ¿Cerrar de todas formas?")) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background" role="dialog" aria-modal="true" aria-label="Odontograma 3D">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-white px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <Box className="h-5 w-5 flex-shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Odontograma 3D{pacienteNombre ? ` · ${pacienteNombre}` : ""}</p>
            <EstadoGuardado estado={isError ? "error" : estado} />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={cerrar} disabled={estado === "guardando"}>
          <X className="mr-1 h-4 w-4" /> Cerrar
        </Button>
      </div>
      <div className="relative flex-1">
        {estado === "cargando" && !isError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={`${import.meta.env.BASE_URL}odontograma-3d.html`}
          title="Odontograma 3D"
          className="h-full w-full border-0"
        />
      </div>
    </div>
  );
}

function EstadoGuardado({ estado }: { estado: Estado }) {
  if (estado === "cargando") return <p className="text-xs text-muted-foreground">Cargando…</p>;
  if (estado === "guardando") return <p className="flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Guardando…</p>;
  if (estado === "guardado") return <p className="flex items-center gap-1 text-xs text-primary"><Check className="h-3 w-3" /> Cambios guardados</p>;
  if (estado === "error") return <p className="flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3 w-3" /> Error al guardar o cargar. Revisa tu conexión.</p>;
  return <p className="text-xs text-muted-foreground">Los cambios se guardan automáticamente</p>;
}
