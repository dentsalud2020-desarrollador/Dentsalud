import { useState, useEffect } from "react";
import {
  useGetOdontodiagrama, getGetOdontodiagramaQueryKey,
  useUpdateOdontodiagrama,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Save, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type EstadoDiente =
  | "sano" | "caries" | "obturado" | "ausente" | "corona"
  | "implante" | "endodoncia" | "extraccion_indicada" | "fractura"
  | "movilidad" | "sellante" | "otro";

interface EstadoConfig {
  label: string;
  color: string;
  textColor: string;
  symbol?: string;
}

const ESTADOS: Record<EstadoDiente, EstadoConfig> = {
  sano: { label: "Sano", color: "#e8f5e9", textColor: "#2e7d32" },
  caries: { label: "Caries", color: "#ffebee", textColor: "#c62828", symbol: "C" },
  obturado: { label: "Obturado", color: "#e3f2fd", textColor: "#1565c0", symbol: "O" },
  ausente: { label: "Ausente", color: "#f5f5f5", textColor: "#757575", symbol: "X" },
  corona: { label: "Corona", color: "#fff9c4", textColor: "#f57f17", symbol: "CR" },
  implante: { label: "Implante", color: "#f3e5f5", textColor: "#6a1b9a", symbol: "I" },
  endodoncia: { label: "Endodoncia", color: "#fff3e0", textColor: "#e65100", symbol: "E" },
  extraccion_indicada: { label: "Extr. Indicada", color: "#ffcdd2", textColor: "#b71c1c", symbol: "EX" },
  fractura: { label: "Fractura", color: "#efebe9", textColor: "#4e342e", symbol: "F" },
  movilidad: { label: "Movilidad", color: "#e0f7fa", textColor: "#006064", symbol: "M" },
  sellante: { label: "Sellante", color: "#f1f8e9", textColor: "#558b2f", symbol: "S" },
  otro: { label: "Otro", color: "#fafafa", textColor: "#616161", symbol: "?" },
};

const DIENTES_ADULTOS_SUPERIOR = ["18","17","16","15","14","13","12","11","21","22","23","24","25","26","27","28"];
const DIENTES_ADULTOS_INFERIOR = ["48","47","46","45","44","43","42","41","31","32","33","34","35","36","37","38"];
const DIENTES_DECIDUOS_SUPERIOR = ["55","54","53","52","51","61","62","63","64","65"];
const DIENTES_DECIDUOS_INFERIOR = ["85","84","83","82","81","71","72","73","74","75"];

interface DienteSVGProps {
  numero: string;
  estado: EstadoDiente;
  onClick: () => void;
}

function DienteSVG({ numero, estado, onClick }: DienteSVGProps) {
  const cfg = ESTADOS[estado];
  const isAusente = estado === "ausente";
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 cursor-pointer group"
      title={`${numero} — ${cfg.label}`}
    >
      <span className="text-[9px] text-muted-foreground font-medium">{numero}</span>
      <svg width="32" height="36" viewBox="0 0 32 36" className="group-hover:opacity-80 transition-opacity">
        {/* Raíces */}
        <g stroke="#999" strokeWidth="1.2" strokeLinecap="round">
          <line x1="12" y1="22" x2="10" y2="34" opacity={isAusente ? "0.2" : "0.6"} />
          <line x1="16" y1="23" x2="16" y2="34" opacity={isAusente ? "0.2" : "0.6"} />
          <line x1="20" y1="22" x2="22" y2="34" opacity={isAusente ? "0.2" : "0.6"} />
        </g>
        {/* Corona */}
        <rect
          x="6" y="6" width="20" height="16" rx="4"
          fill={cfg.color}
          stroke={cfg.textColor}
          strokeWidth={estado === "sano" ? "1" : "1.8"}
          opacity={isAusente ? "0.3" : "1"}
        />
        {/* Símbolo */}
        {cfg.symbol && !isAusente && (
          <text
            x="16" y="17" textAnchor="middle"
            fontSize={cfg.symbol.length > 1 ? "7" : "9"}
            fontWeight="bold"
            fill={cfg.textColor}
            fontFamily="sans-serif"
          >{cfg.symbol}</text>
        )}
        {isAusente && (
          <>
            <line x1="8" y1="8" x2="24" y2="22" stroke={cfg.textColor} strokeWidth="2" strokeLinecap="round" />
            <line x1="24" y1="8" x2="8" y2="22" stroke={cfg.textColor} strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </svg>
    </div>
  );
}

interface PopoverEstadoProps {
  numero: string;
  estadoActual: EstadoDiente;
  onSelect: (estado: EstadoDiente) => void;
  onClose: () => void;
}

function PopoverEstado({ numero, estadoActual, onSelect, onClose }: PopoverEstadoProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl p-4 w-72 border border-border"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold">Diente {numero}</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">&times;</button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(ESTADOS) as [EstadoDiente, EstadoConfig][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => { onSelect(key); onClose(); }}
              className="flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-center hover:opacity-90"
              style={{
                backgroundColor: cfg.color,
                borderColor: estadoActual === key ? cfg.textColor : "transparent",
              }}
            >
              <span className="text-xs font-bold" style={{ color: cfg.textColor }}>
                {cfg.symbol ?? "✓"}
              </span>
              <span className="text-[10px] leading-tight" style={{ color: cfg.textColor }}>
                {cfg.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface OdontodiagramaProps {
  pacienteId: number;
}

export function Odontodiagrama({ pacienteId }: OdontodiagramaProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [estadosPiezas, setEstadosPiezas] = useState<Record<string, EstadoDiente>>({});
  const [popover, setPopover] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const { data: odontoData, isLoading } = useGetOdontodiagrama(pacienteId, {
    query: { queryKey: getGetOdontodiagramaQueryKey(pacienteId) },
  });

  useEffect(() => {
    if (odontoData) {
      const map: Record<string, EstadoDiente> = {};
      for (const entry of odontoData) {
        map[entry.numeroPieza] = (entry.estado as EstadoDiente) ?? "sano";
      }
      setEstadosPiezas(map);
      setDirty(false);
    }
  }, [odontoData]);

  const updateMutation = useUpdateOdontodiagrama({
    mutation: {
      onSuccess: (data) => {
        qc.invalidateQueries({ queryKey: getGetOdontodiagramaQueryKey(pacienteId) });
        toast({ title: "Odontodiagrama guardado" });
        setDirty(false);
      },
      onError: () => {
        toast({ title: "Error al guardar odontodiagrama", variant: "destructive" });
      },
    },
  });

  const getEstado = (num: string): EstadoDiente =>
    estadosPiezas[num] ?? "sano";

  const setEstado = (num: string, estado: EstadoDiente) => {
    setEstadosPiezas(prev => ({ ...prev, [num]: estado }));
    setDirty(true);
  };

  const handleSave = () => {
    const allNums = [
      ...DIENTES_ADULTOS_SUPERIOR, ...DIENTES_ADULTOS_INFERIOR,
      ...DIENTES_DECIDUOS_SUPERIOR, ...DIENTES_DECIDUOS_INFERIOR,
    ];
    const piezasToSave = Object.entries(estadosPiezas)
      .filter(([num]) => allNums.includes(num))
      .map(([num, estado]) => ({ numeroPieza: num, estado }));

    updateMutation.mutate({
      id: pacienteId,
      data: { piezas: piezasToSave },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const renderArcada = (numeros: string[], label: string, flip = false) => (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground text-center font-medium">{label}</p>
      <div className={`flex gap-1 justify-center flex-wrap ${flip ? "scale-y-[-1]" : ""}`}>
        {numeros.map(n => (
          <div key={n} className={flip ? "scale-y-[-1]" : ""}>
            <DienteSVG
              numero={n}
              estado={getEstado(n)}
              onClick={() => setPopover(n)}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Leyenda */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(ESTADOS) as [EstadoDiente, EstadoConfig][]).map(([key, cfg]) => (
          <div
            key={key}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: cfg.color, color: cfg.textColor, border: `1px solid ${cfg.textColor}40` }}
          >
            {cfg.symbol && <span className="font-bold">{cfg.symbol}</span>}
            {cfg.label}
          </div>
        ))}
      </div>

      {/* Diagrama */}
      <div className="border border-border rounded-xl p-5 bg-muted/20 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Haga click en un diente para cambiar su estado</span>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider mb-3">Dentición Adulta</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-center text-muted-foreground mb-1">Superior Derecho / Superior Izquierdo</p>
                <div className="flex justify-center">
                  <div className="flex gap-0.5 flex-wrap justify-center">
                    {DIENTES_ADULTOS_SUPERIOR.map(n => (
                      <DienteSVG key={n} numero={n} estado={getEstado(n)} onClick={() => setPopover(n)} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-dashed border-border" />
              <div>
                <div className="flex justify-center">
                  <div className="flex gap-0.5 flex-wrap justify-center">
                    {DIENTES_ADULTOS_INFERIOR.map(n => (
                      <div key={n} className="flex flex-col-reverse items-center gap-0.5">
                        <span className="text-[9px] text-muted-foreground font-medium">{n}</span>
                        <svg width="32" height="36" viewBox="0 0 32 36" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setPopover(n)}>
                          <g stroke="#999" strokeWidth="1.2" strokeLinecap="round">
                            <line x1="12" y1="14" x2="10" y2="2" opacity={getEstado(n) === "ausente" ? "0.2" : "0.6"} />
                            <line x1="16" y1="13" x2="16" y2="2" opacity={getEstado(n) === "ausente" ? "0.2" : "0.6"} />
                            <line x1="20" y1="14" x2="22" y2="2" opacity={getEstado(n) === "ausente" ? "0.2" : "0.6"} />
                          </g>
                          <rect
                            x="6" y="14" width="20" height="16" rx="4"
                            fill={ESTADOS[getEstado(n)].color}
                            stroke={ESTADOS[getEstado(n)].textColor}
                            strokeWidth={getEstado(n) === "sano" ? "1" : "1.8"}
                            opacity={getEstado(n) === "ausente" ? "0.3" : "1"}
                          />
                          {ESTADOS[getEstado(n)].symbol && getEstado(n) !== "ausente" && (
                            <text
                              x="16" y="25" textAnchor="middle"
                              fontSize={ESTADOS[getEstado(n)].symbol!.length > 1 ? "7" : "9"}
                              fontWeight="bold"
                              fill={ESTADOS[getEstado(n)].textColor}
                              fontFamily="sans-serif"
                            >{ESTADOS[getEstado(n)].symbol}</text>
                          )}
                          {getEstado(n) === "ausente" && (
                            <>
                              <line x1="8" y1="16" x2="24" y2="28" stroke={ESTADOS["ausente"].textColor} strokeWidth="2" strokeLinecap="round" />
                              <line x1="24" y1="16" x2="8" y2="28" stroke={ESTADOS["ausente"].textColor} strokeWidth="2" strokeLinecap="round" />
                            </>
                          )}
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-1">Inferior Derecho / Inferior Izquierdo</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider mb-3">Dentición Decidua (Temporal)</h4>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-center text-muted-foreground mb-1">Superior</p>
                <div className="flex justify-center gap-0.5 flex-wrap">
                  {DIENTES_DECIDUOS_SUPERIOR.map(n => (
                    <DienteSVG key={n} numero={n} estado={getEstado(n)} onClick={() => setPopover(n)} />
                  ))}
                </div>
              </div>
              <div className="border-t border-dashed border-border" />
              <div>
                <div className="flex justify-center gap-0.5 flex-wrap">
                  {DIENTES_DECIDUOS_INFERIOR.map(n => (
                    <div key={n} className="flex flex-col-reverse items-center gap-0.5">
                      <span className="text-[9px] text-muted-foreground font-medium">{n}</span>
                      <svg width="32" height="36" viewBox="0 0 32 36" className="cursor-pointer hover:opacity-80" onClick={() => setPopover(n)}>
                        <rect x="6" y="14" width="20" height="16" rx="4"
                          fill={ESTADOS[getEstado(n)].color}
                          stroke={ESTADOS[getEstado(n)].textColor}
                          strokeWidth={getEstado(n) === "sano" ? "1" : "1.8"}
                        />
                        {ESTADOS[getEstado(n)].symbol && getEstado(n) !== "ausente" && (
                          <text x="16" y="25" textAnchor="middle" fontSize="8" fontWeight="bold" fill={ESTADOS[getEstado(n)].textColor} fontFamily="sans-serif">
                            {ESTADOS[getEstado(n)].symbol}
                          </text>
                        )}
                      </svg>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground mt-1">Inferior</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!dirty || updateMutation.isPending}
          className="bg-[#8DC63F] hover:bg-[#7ab535] text-white"
        >
          {updateMutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Guardando...
            </span>
          ) : (
            <span className="flex items-center gap-2"><Save className="h-4 w-4" />Guardar Odontodiagrama</span>
          )}
        </Button>
      </div>

      {/* Popover */}
      {popover && (
        <PopoverEstado
          numero={popover}
          estadoActual={getEstado(popover)}
          onSelect={(e) => setEstado(popover, e)}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
}
