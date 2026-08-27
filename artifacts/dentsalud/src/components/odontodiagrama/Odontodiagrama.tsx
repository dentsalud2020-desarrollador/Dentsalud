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
  | "sano" | "caries" | "restauracion" | "restauracion_temporal" | "ausente"
  | "corona_definitiva" | "corona_temporal" | "implante" | "tratamiento_pulpar"
  | "aparato_fijo" | "aparato_removible" | "desgaste" | "diastema" | "discromico"
  | "ectopico" | "clavija" | "extruido" | "intruido" | "edentulo_total"
  | "fractura" | "geminacion_fusion" | "giroversion" | "impactacion" | "macrodoncia"
  | "microdoncia" | "migracion" | "movilidad" | "protesis_fija" | "protesis_removible"
  | "protesis_total" | "remanente_radicular" | "semi_impactacion" | "supernumerario"
  | "transposicion" | "otro"
  | "obturado" | "corona" | "endodoncia" | "extraccion_indicada" | "sellante";

type Superficie = "oclusal" | "mesial" | "distal" | "vestibular" | "lingual";

const SUPERFICIES: { key: Superficie; label: string }[] = [
  { key: "oclusal", label: "Oclusal / incisal" },
  { key: "mesial", label: "Mesial" },
  { key: "distal", label: "Distal" },
  { key: "vestibular", label: "Vestibular" },
  { key: "lingual", label: "Lingual / palatina" },
];

interface PiezaRegistro {
  estado: EstadoDiente;
  superficies: Superficie[];
  observacion: string;
}

interface EstadoConfig {
  label: string;
  color: string;
  textColor: string;
  symbol?: string;
}

const ESTADOS: Record<EstadoDiente, EstadoConfig> = {
  sano: { label: "Sano", color: "#ffffff", textColor: "#222222" },
  caries: { label: "Caries", color: "#fff1f2", textColor: "#dc2626", symbol: "C" },
  restauracion: { label: "Restauración", color: "#ffffff", textColor: "#087ea4", symbol: "R" },
  restauracion_temporal: { label: "Restauración temporal", color: "#fff1f2", textColor: "#dc2626", symbol: "RT" },
  ausente: { label: "Diente ausente", color: "#ffffff", textColor: "#087ea4", symbol: "X" },
  corona_definitiva: { label: "Corona definitiva", color: "#ffffff", textColor: "#087ea4", symbol: "CC" },
  corona_temporal: { label: "Corona temporal", color: "#fff1f2", textColor: "#dc2626", symbol: "CT" },
  implante: { label: "Implante", color: "#ffffff", textColor: "#087ea4", symbol: "IMP" },
  tratamiento_pulpar: { label: "Tratamiento pulpar", color: "#ffffff", textColor: "#087ea4", symbol: "TC" },
  aparato_fijo: { label: "Aparato ortodóntico fijo", color: "#ffffff", textColor: "#087ea4", symbol: "AF" },
  aparato_removible: { label: "Aparato ortodóntico removible", color: "#ffffff", textColor: "#087ea4", symbol: "AR" },
  desgaste: { label: "Desgaste oclusal/incisal", color: "#ffffff", textColor: "#087ea4", symbol: "DES" },
  diastema: { label: "Diastema", color: "#ffffff", textColor: "#087ea4", symbol: "∪" },
  discromico: { label: "Diente discromico", color: "#ffffff", textColor: "#087ea4", symbol: "DIS" },
  ectopico: { label: "Diente ectópico", color: "#ffffff", textColor: "#087ea4", symbol: "E" },
  clavija: { label: "Diente en clavija", color: "#ffffff", textColor: "#087ea4", symbol: "△" },
  extruido: { label: "Diente extruido", color: "#ffffff", textColor: "#087ea4", symbol: "↑" },
  intruido: { label: "Diente intruido", color: "#ffffff", textColor: "#087ea4", symbol: "↓" },
  edentulo_total: { label: "Edéntulo total", color: "#ffffff", textColor: "#087ea4", symbol: "ET" },
  fractura: { label: "Fractura", color: "#fff1f2", textColor: "#dc2626", symbol: "F" },
  geminacion_fusion: { label: "Geminación / fusión", color: "#ffffff", textColor: "#087ea4", symbol: "∞" },
  giroversion: { label: "Giroversión", color: "#ffffff", textColor: "#087ea4", symbol: "↻" },
  impactacion: { label: "Impactación", color: "#ffffff", textColor: "#087ea4", symbol: "I" },
  macrodoncia: { label: "Macrodoncia", color: "#ffffff", textColor: "#087ea4", symbol: "MAC" },
  microdoncia: { label: "Microdoncia", color: "#ffffff", textColor: "#087ea4", symbol: "MIC" },
  migracion: { label: "Migración", color: "#ffffff", textColor: "#087ea4", symbol: "→" },
  movilidad: { label: "Movilidad", color: "#ffffff", textColor: "#087ea4", symbol: "M" },
  protesis_fija: { label: "Prótesis fija", color: "#ffffff", textColor: "#087ea4", symbol: "PF" },
  protesis_removible: { label: "Prótesis removible", color: "#ffffff", textColor: "#087ea4", symbol: "PR" },
  protesis_total: { label: "Prótesis total", color: "#ffffff", textColor: "#087ea4", symbol: "PT" },
  remanente_radicular: { label: "Remanente radicular", color: "#fff1f2", textColor: "#dc2626", symbol: "RR" },
  semi_impactacion: { label: "Semi-impactación", color: "#ffffff", textColor: "#087ea4", symbol: "SI" },
  supernumerario: { label: "Supernumerario", color: "#ffffff", textColor: "#087ea4", symbol: "S" },
  transposicion: { label: "Transposición", color: "#ffffff", textColor: "#087ea4", symbol: "↔" },
  otro: { label: "Otro", color: "#ffffff", textColor: "#087ea4", symbol: "?" },
  obturado: { label: "Restauración", color: "#ffffff", textColor: "#087ea4", symbol: "R" },
  corona: { label: "Corona definitiva", color: "#ffffff", textColor: "#087ea4", symbol: "CC" },
  endodoncia: { label: "Tratamiento pulpar", color: "#ffffff", textColor: "#087ea4", symbol: "TC" },
  extraccion_indicada: { label: "Extracción indicada", color: "#fff1f2", textColor: "#dc2626", symbol: "EX" },
  sellante: { label: "Sellante", color: "#ffffff", textColor: "#087ea4", symbol: "S" },
};

const GRUPOS_LEYENDA: { label: string; estados: EstadoDiente[] }[] = [
  {
    label: "Hallazgos y anomalías",
    estados: ["caries", "fractura", "extraccion_indicada", "ausente", "discromico", "ectopico", "clavija", "extruido", "intruido", "giroversion", "impactacion", "macrodoncia", "microdoncia", "migracion", "movilidad", "semi_impactacion", "supernumerario", "transposicion", "geminacion_fusion", "diastema", "edentulo_total"],
  },
  {
    label: "Tratamientos y restauraciones",
    estados: ["restauracion", "restauracion_temporal", "corona_definitiva", "corona_temporal", "tratamiento_pulpar", "implante", "remanente_radicular", "desgaste"],
  },
  {
    label: "Aparatos y prótesis",
    estados: ["aparato_fijo", "aparato_removible", "protesis_fija", "protesis_removible", "protesis_total"],
  },
  { label: "Otros", estados: ["sano", "otro"] },
];

const ESTADOS_ROJOS: EstadoDiente[] = [
  "caries", "fractura", "restauracion_temporal", "corona_temporal", "remanente_radicular", "extraccion_indicada",
];
const ORDEN_COLOR: Record<EstadoDiente, number> = {
  caries: 0, fractura: 0, restauracion_temporal: 0, corona_temporal: 0, remanente_radicular: 0, extraccion_indicada: 0,
  sano: 2,
  restauracion: 1, ausente: 1, corona_definitiva: 1, implante: 1, tratamiento_pulpar: 1, aparato_fijo: 1, aparato_removible: 1,
  desgaste: 1, diastema: 1, discromico: 1, ectopico: 1, clavija: 1, extruido: 1, intruido: 1, edentulo_total: 1,
  geminacion_fusion: 1, giroversion: 1, impactacion: 1, macrodoncia: 1, microdoncia: 1, migracion: 1, movilidad: 1,
  protesis_fija: 1, protesis_removible: 1, protesis_total: 1, semi_impactacion: 1, supernumerario: 1, transposicion: 1,
  otro: 1, obturado: 1, corona: 1, endodoncia: 1, sellante: 1,
};

const DIENTES_ADULTOS_SUPERIOR = ["18","17","16","15","14","13","12","11","21","22","23","24","25","26","27","28"];
const DIENTES_ADULTOS_INFERIOR = ["48","47","46","45","44","43","42","41","31","32","33","34","35","36","37","38"];
const DIENTES_DECIDUOS_SUPERIOR = ["55","54","53","52","51","61","62","63","64","65"];
const DIENTES_DECIDUOS_INFERIOR = ["85","84","83","82","81","71","72","73","74","75"];

interface DienteSVGProps {
  numero: string;
  estado: EstadoDiente;
  superficies: Superficie[];
  onClick: () => void;
}

function DienteSVG({ numero, estado, superficies, onClick }: DienteSVGProps) {
  const cfg = ESTADOS[estado];
  const isAusente = estado === "ausente";
  const hasSurface = (surface: Superficie) => estado === "caries" && superficies.includes(surface);
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
        {estado === "corona_definitiva" && <circle cx="16" cy="14" r="13" fill="none" stroke="#087ea4" strokeWidth="1.8" />}
        {estado === "corona_temporal" && <circle cx="16" cy="14" r="13" fill="none" stroke="#dc2626" strokeWidth="1.8" />}
        {estado === "fractura" && <line x1="8" y1="8" x2="24" y2="21" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />}
        {estado === "tratamiento_pulpar" && <line x1="16" y1="23" x2="16" y2="33" stroke="#087ea4" strokeWidth="2" />}
        {estado === "remanente_radicular" && <text x="16" y="31" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#dc2626">RR</text>}
        {estado === "aparato_fijo" && (
          <g fill="none" stroke="#087ea4" strokeWidth="1.5"><rect x="5" y="29" width="5" height="5" /><path d="M7.5 29v5M5 31.5h5" /><line x1="10" y1="31.5" x2="22" y2="31.5" /><rect x="22" y="29" width="5" height="5" /><path d="M24.5 29v5M22 31.5h5" /></g>
        )}
        {estado === "aparato_removible" && <polyline points="5,32 8,29 11,32 14,29 17,32 20,29 23,32 26,29" fill="none" stroke="#087ea4" strokeWidth="1.5" />}
        {estado === "protesis_fija" && <path d="M5 32H27M8 29V34M24 29V34" fill="none" stroke="#087ea4" strokeWidth="1.5" />}
        {estado === "protesis_removible" && <path d="M5 30H27M5 33H27" fill="none" stroke="#087ea4" strokeWidth="1.5" />}
        {estado === "protesis_total" && <path d="M5 7H27M5 10H27" fill="none" stroke="#087ea4" strokeWidth="1.5" />}
        {estado === "supernumerario" && <circle cx="16" cy="33" r="4" fill="none" stroke="#087ea4" strokeWidth="1.5" />}
        {estado === "clavija" && <path d="M16 1L27 6L16 11L5 6Z" fill="none" stroke="#087ea4" strokeWidth="1.5" />}
        {estado === "geminacion_fusion" && <g fill="none" stroke="#087ea4" strokeWidth="1.5"><circle cx="12" cy="4" r="5" /><circle cx="20" cy="4" r="5" /></g>}
        {estado === "diastema" && <path d="M12 27Q16 32 20 27" fill="none" stroke="#087ea4" strokeWidth="1.5" />}
        {estado === "giroversion" && <path d="M8 27Q16 22 24 27M21 24L24 27L20 29" fill="none" stroke="#087ea4" strokeWidth="1.5" />}
        {estado === "transposicion" && <g fill="none" stroke="#087ea4" strokeWidth="1.4"><path d="M7 28Q16 22 25 28M22 25L25 28L21 29" /><path d="M25 32Q16 26 7 32M10 29L7 32L11 33" /></g>}
        {(estado === "extruido" || estado === "intruido") && <path d={estado === "extruido" ? "M16 2V10M13 7L16 10L19 7" : "M16 34V26M13 29L16 26L19 29"} fill="none" stroke="#087ea4" strokeWidth="1.5" />}
        {(estado === "migracion" || estado === "ectopico") && <path d="M6 3H25M21 0L25 3L21 6" fill="none" stroke="#087ea4" strokeWidth="1.5" />}
        {hasSurface("oclusal") && <rect x="8" y="8" width="16" height="5" rx="1" fill="#dc2626" />}
        {hasSurface("vestibular") && <rect x="8" y="19" width="16" height="2" fill="#dc2626" />}
        {hasSurface("mesial") && <rect x="7" y="9" width="3" height="10" fill="#dc2626" />}
        {hasSurface("distal") && <rect x="22" y="9" width="3" height="10" fill="#dc2626" />}
        {hasSurface("lingual") && <rect x="11" y="14" width="10" height="4" fill="#dc2626" />}
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
  superficies: Superficie[];
  onSelect: (estado: EstadoDiente) => void;
  onToggleSurface: (surface: Superficie) => void;
  observacion: string;
  onObservacionChange: (value: string) => void;
  onClose: () => void;
}

function VistaPreviaCaries({ superficies }: { superficies: Superficie[] }) {
  const marcada = (superficie: Superficie) => superficies.includes(superficie);

  return (
    <div className="rounded-lg border border-red-200 bg-red-50/60 p-3 text-center">
      <p className="text-xs font-semibold text-red-800">Vista previa de caries</p>
      <svg viewBox="0 0 120 150" className="mx-auto mt-2 h-36 w-28" role="img" aria-label="Vista previa de las superficies con caries">
        <path d="M42 68 L35 136 M60 70 L60 140 M78 68 L85 136" fill="none" stroke="#555" strokeWidth="3" strokeLinecap="round" />
        <rect x="20" y="35" width="80" height="45" rx="10" fill="#fff" stroke="#222" strokeWidth="3" />
        {marcada("oclusal") && <rect x="28" y="41" width="64" height="13" rx="3" fill="#dc2626" />}
        {marcada("mesial") && <rect x="23" y="45" width="13" height="25" rx="2" fill="#dc2626" />}
        {marcada("distal") && <rect x="84" y="45" width="13" height="25" rx="2" fill="#dc2626" />}
        {marcada("lingual") && <rect x="42" y="55" width="36" height="15" rx="2" fill="#dc2626" />}
        {marcada("vestibular") && <rect x="28" y="73" width="64" height="4" rx="2" fill="#dc2626" />}
        <path d="M28 55 H92 M60 41 V77" fill="none" stroke="#222" strokeWidth="1.5" opacity=".35" />
        <text x="60" y="101" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#222">Diente seleccionado</text>
      </svg>
      <p className="text-[10px] text-red-700">
        {superficies.length ? `${superficies.length} superficie${superficies.length === 1 ? "" : "s"} marcada${superficies.length === 1 ? "" : "s"}` : "Seleccione una superficie"}
      </p>
    </div>
  );
}

function PopoverEstado({ numero, estadoActual, superficies, onSelect, onToggleSurface, observacion, onObservacionChange, onClose }: PopoverEstadoProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-white p-4 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-3 flex flex-shrink-0 items-center justify-between">
          <span className="text-sm font-semibold">Diente {numero}</span>
          <span className="text-[10px] text-muted-foreground">Los cambios se aplican al guardar</span>
        </div>
        <div className="min-h-0 flex-1 grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
          <div className="min-h-0 overflow-y-auto pr-2">
            <p className="mb-2 text-xs font-semibold">Estado del diente</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(ESTADOS) as [EstadoDiente, EstadoConfig][]).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelect(key)}
                  className="flex flex-col items-center gap-1 rounded-lg border-2 p-2 text-center transition-all hover:opacity-90"
                  style={{
                    backgroundColor: cfg.color,
                    borderColor: estadoActual === key ? cfg.textColor : "transparent",
                  }}
                >
                  <span className="text-xs font-bold" style={{ color: cfg.textColor }}>{cfg.symbol ?? "✓"}</span>
                  <span className="text-[10px] leading-tight" style={{ color: cfg.textColor }}>{cfg.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-3">
              <label htmlFor={`especificaciones-${numero}`} className="mb-1 block text-xs font-semibold">Especificaciones</label>
              <textarea
                id={`especificaciones-${numero}`}
                value={observacion}
                onChange={event => onObservacionChange(event.target.value)}
                placeholder="Tipo de aparato, material, clasificación, color u otro detalle..."
                rows={2}
                className="w-full resize-none rounded-md border border-border px-2.5 py-2 text-xs outline-none focus:border-[#087ea4] focus:ring-1 focus:ring-[#087ea4]"
              />
            </div>
          </div>
          {estadoActual === "caries" && (
            <div className="min-h-0 overflow-y-auto">
              <VistaPreviaCaries superficies={superficies} />
              <div className="mt-3 border-t border-border pt-3">
                <p className="mb-2 text-xs font-semibold">Superficies afectadas</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {SUPERFICIES.map(surface => {
                    const selected = superficies.includes(surface.key);
                    return (
                      <button
                        key={surface.key}
                        type="button"
                        onClick={() => onToggleSurface(surface.key)}
                        className={`rounded-md border px-2 py-1.5 text-left text-[11px] transition-colors ${selected ? "border-red-600 bg-red-50 text-red-700" : "border-border hover:bg-muted"}`}
                      >
                        <span className="mr-1">{selected ? "✓" : "○"}</span>{surface.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">Marque cada zona comprometida en rojo.</p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end border-t border-border pt-3">
          <Button type="button" onClick={onClose} className="bg-[#087ea4] text-white hover:bg-[#066b8b]">
            <Save className="mr-2 h-4 w-4" />Guardar y cerrar
          </Button>
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
  const [piezas, setPiezas] = useState<Record<string, PiezaRegistro>>({});
  const [popover, setPopover] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const { data: odontoData, isLoading } = useGetOdontodiagrama(pacienteId, {
    query: { queryKey: getGetOdontodiagramaQueryKey(pacienteId) },
  });

  useEffect(() => {
    if (odontoData) {
      const map: Record<string, PiezaRegistro> = {};
      for (const entry of odontoData) {
        map[entry.numeroPieza] = {
          estado: (entry.estado as EstadoDiente) ?? "sano",
          superficies: entry.superficies ? entry.superficies.split(",").filter(Boolean) as Superficie[] : [],
          observacion: entry.observacion ?? "",
        };
      }
      setPiezas(map);
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
    piezas[num]?.estado ?? "sano";

  const getSuperficies = (num: string): Superficie[] => piezas[num]?.superficies ?? [];

  const setEstado = (num: string, estado: EstadoDiente) => {
    setPiezas(prev => ({
      ...prev,
      [num]: {
        estado,
        superficies: estado === "caries" ? prev[num]?.superficies ?? [] : [],
        observacion: prev[num]?.observacion ?? "",
      },
    }));
    setDirty(true);
  };

  const toggleSurface = (num: string, surface: Superficie) => {
    setPiezas(prev => {
      const current = prev[num]?.superficies ?? [];
      const next = current.includes(surface) ? current.filter(item => item !== surface) : [...current, surface];
      return { ...prev, [num]: { estado: "caries", superficies: next, observacion: prev[num]?.observacion ?? "" } };
    });
    setDirty(true);
  };

  const handleSave = () => {
    const allNums = [
      ...DIENTES_ADULTOS_SUPERIOR, ...DIENTES_ADULTOS_INFERIOR,
      ...DIENTES_DECIDUOS_SUPERIOR, ...DIENTES_DECIDUOS_INFERIOR,
    ];
    const piezasToSave = Object.entries(piezas)
      .filter(([num]) => allNums.includes(num))
      .map(([num, pieza]) => ({
        numeroPieza: num,
        estado: pieza.estado,
        superficies: pieza.superficies.length ? pieza.superficies.join(",") : null,
        observacion: pieza.observacion || null,
      }));

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
              superficies={getSuperficies(n)}
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
      <div className="space-y-3 rounded-xl border border-border bg-white p-3">
        {GRUPOS_LEYENDA.map(group => (
          <div key={group.label}>
            <p className="mb-1.5 border-b border-border pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{group.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {[...group.estados].sort((left, right) => ORDEN_COLOR[left] - ORDEN_COLOR[right]).map(key => {
                const cfg = ESTADOS[key];
                return (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium"
                    style={{ backgroundColor: cfg.color, color: cfg.textColor, border: `1px solid ${cfg.textColor}40` }}
                  >
                    {cfg.symbol && <span className="font-bold">{cfg.symbol}</span>}
                    {cfg.label}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Diagrama */}
      <div className="border border-border rounded-xl p-5 bg-muted/20 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Seleccione un diente para registrar el hallazgo; en caries puede marcar cada superficie afectada en rojo.</span>
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
                      <DienteSVG key={n} numero={n} estado={getEstado(n)} superficies={getSuperficies(n)} onClick={() => setPopover(n)} />
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
                          {getEstado(n) === "caries" && getSuperficies(n).includes("oclusal") && <rect x="8" y="16" width="16" height="5" rx="1" fill="#dc2626" />}
                          {getEstado(n) === "caries" && getSuperficies(n).includes("vestibular") && <rect x="8" y="28" width="16" height="2" fill="#dc2626" />}
                          {getEstado(n) === "caries" && getSuperficies(n).includes("mesial") && <rect x="7" y="17" width="3" height="10" fill="#dc2626" />}
                          {getEstado(n) === "caries" && getSuperficies(n).includes("distal") && <rect x="22" y="17" width="3" height="10" fill="#dc2626" />}
                          {getEstado(n) === "caries" && getSuperficies(n).includes("lingual") && <rect x="11" y="22" width="10" height="4" fill="#dc2626" />}
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
                    <DienteSVG key={n} numero={n} estado={getEstado(n)} superficies={getSuperficies(n)} onClick={() => setPopover(n)} />
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
                          {getEstado(n) === "caries" && getSuperficies(n).includes("oclusal") && <rect x="8" y="16" width="16" height="5" rx="1" fill="#dc2626" />}
                          {getEstado(n) === "caries" && getSuperficies(n).includes("vestibular") && <rect x="8" y="28" width="16" height="2" fill="#dc2626" />}
                          {getEstado(n) === "caries" && getSuperficies(n).includes("mesial") && <rect x="7" y="17" width="3" height="10" fill="#dc2626" />}
                          {getEstado(n) === "caries" && getSuperficies(n).includes("distal") && <rect x="22" y="17" width="3" height="10" fill="#dc2626" />}
                          {getEstado(n) === "caries" && getSuperficies(n).includes("lingual") && <rect x="11" y="22" width="10" height="4" fill="#dc2626" />}
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
          superficies={getSuperficies(popover)}
          onSelect={(e) => setEstado(popover, e)}
          onToggleSurface={(surface) => toggleSurface(popover, surface)}
          observacion={piezas[popover]?.observacion ?? ""}
          onObservacionChange={(value) => {
            setPiezas(prev => ({ ...prev, [popover]: { ...(prev[popover] ?? { estado: getEstado(popover), superficies: [] }), observacion: value } }));
            setDirty(true);
          }}
          onClose={() => setPopover(null)}
        />
      )}
    </div>
  );
}
