import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch, ApiError } from "@workspace/api-client-react";
import { FileSignature, Plus, Loader2, X, Printer, ShieldCheck, ShieldAlert, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SignaturePad, type SignaturePadHandle } from "./SignaturePad";
import { PLANTILLAS, NOMBRE_CLINICA, renderizarPlantilla } from "./plantillas";

interface Consentimiento {
  id: number;
  pacienteId: number;
  plantilla: string;
  titulo: string;
  contenido: string;
  firmanteNombre: string;
  firmanteDocumento: string;
  firmanteRelacion: "paciente" | "representante";
  firmaUrl: string;
  hashSha256: string;
  ip: string | null;
  firmadoAt: string;
}

interface ConsentimientosProps {
  pacienteId: number;
  pacienteNombre: string;
  pacienteDocumento: string;
}

const inputClass = "mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background";

function formatFechaHora(iso: string) {
  return new Date(iso).toLocaleString("es-PE", { dateStyle: "long", timeStyle: "short" });
}

function fechaLarga() {
  return new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
}

function escaparHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Abre el documento firmado en una ventana lista para imprimir o "Guardar como PDF"
function imprimir(doc: Consentimiento) {
  const ventana = window.open("", "_blank");
  if (!ventana) return;
  ventana.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>${escaparHtml(doc.titulo)}</title>
<style>
  body { font-family: Georgia, "Times New Roman", serif; color: #111; max-width: 720px; margin: 40px auto; padding: 0 24px; line-height: 1.55; }
  h1 { font-size: 20px; text-align: center; margin-bottom: 4px; }
  .clinica { text-align: center; font-size: 13px; color: #555; margin-bottom: 28px; }
  .contenido { white-space: pre-wrap; font-size: 14px; }
  .firma { margin-top: 40px; text-align: center; }
  .firma img { max-width: 320px; max-height: 140px; display: block; margin: 0 auto; }
  .linea { border-top: 1px solid #111; width: 320px; margin: 0 auto; padding-top: 6px; font-size: 13px; }
  .meta { margin-top: 36px; font-family: Arial, sans-serif; font-size: 10px; color: #555; border-top: 1px solid #ccc; padding-top: 8px; word-break: break-all; }
</style></head><body>
<h1>${escaparHtml(doc.titulo)}</h1>
<div class="clinica">${escaparHtml(NOMBRE_CLINICA)}</div>
<div class="contenido">${escaparHtml(doc.contenido)}</div>
<div class="firma">
  <img src="${escaparHtml(doc.firmaUrl)}" alt="Firma">
  <div class="linea">${escaparHtml(doc.firmanteNombre)}<br>Doc. ${escaparHtml(doc.firmanteDocumento)}${doc.firmanteRelacion === "representante" ? " — Representante legal" : ""}</div>
</div>
<div class="meta">
  Firmado electrónicamente el ${escaparHtml(formatFechaHora(doc.firmadoAt))}${doc.ip ? ` desde la IP ${escaparHtml(doc.ip)}` : ""}.<br>
  Código de verificación (SHA-256): ${escaparHtml(doc.hashSha256)} · Documento N° ${doc.id}
</div>
<script>window.onload = function () { window.print(); };</script>
</body></html>`);
  ventana.document.close();
}

export function Consentimientos({ pacienteId, pacienteNombre, pacienteDocumento }: ConsentimientosProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const queryKey = ["/api/pacientes", pacienteId, "consentimientos"];

  const [firmando, setFirmando] = useState(false);
  const [viendo, setViendo] = useState<Consentimiento | null>(null);
  const [verificacion, setVerificacion] = useState<Record<number, boolean | "cargando">>({});

  const [plantillaId, setPlantillaId] = useState(PLANTILLAS[0]?.id ?? "");
  const [relacion, setRelacion] = useState<"paciente" | "representante">("paciente");
  const [firmanteNombre, setFirmanteNombre] = useState(pacienteNombre);
  const [firmanteDocumento, setFirmanteDocumento] = useState(pacienteDocumento);
  const [aceptado, setAceptado] = useState(false);
  const [hayFirma, setHayFirma] = useState(false);
  const firmaRef = useRef<SignaturePadHandle>(null);

  const { data: documentos = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => customFetch<Consentimiento[]>(`/api/pacientes/${pacienteId}/consentimientos`),
  });

  const plantilla = PLANTILLAS.find(p => p.id === plantillaId);
  const contenido = useMemo(() => plantilla ? renderizarPlantilla(plantilla.texto, {
    paciente: pacienteNombre,
    documento: pacienteDocumento,
    firmante: firmanteNombre,
    documentoFirmante: firmanteDocumento,
    fecha: fechaLarga(),
  }) : "", [plantilla, pacienteNombre, pacienteDocumento, firmanteNombre, firmanteDocumento]);

  const abrirFirma = () => {
    setPlantillaId(PLANTILLAS[0]?.id ?? "");
    setRelacion("paciente");
    setFirmanteNombre(pacienteNombre);
    setFirmanteDocumento(pacienteDocumento);
    setAceptado(false);
    setHayFirma(false);
    setFirmando(true);
  };

  const cambiarRelacion = (valor: "paciente" | "representante") => {
    setRelacion(valor);
    setFirmanteNombre(valor === "paciente" ? pacienteNombre : "");
    setFirmanteDocumento(valor === "paciente" ? pacienteDocumento : "");
  };

  const firmarMutation = useMutation({
    mutationFn: (datos: Record<string, unknown>) =>
      customFetch<Consentimiento>(`/api/pacientes/${pacienteId}/consentimientos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setFirmando(false);
      toast({ title: "Documento firmado y guardado" });
    },
    onError: (err) => {
      const data = err instanceof ApiError ? (err.data as { error?: string } | null) : null;
      toast({ title: data?.error ?? "Error al guardar el documento firmado", variant: "destructive" });
    },
  });

  const handleFirmar = () => {
    const firma = firmaRef.current?.toDataURL();
    if (!plantilla || !firma) return;
    firmarMutation.mutate({
      plantilla: plantilla.id,
      titulo: plantilla.titulo,
      contenido,
      firmanteNombre,
      firmanteDocumento,
      firmanteRelacion: relacion,
      aceptado,
      firma,
    });
  };

  const verificar = async (doc: Consentimiento) => {
    setVerificacion(v => ({ ...v, [doc.id]: "cargando" }));
    try {
      const r = await customFetch<{ valido: boolean }>(`/api/consentimientos/${doc.id}/verificar`);
      setVerificacion(v => ({ ...v, [doc.id]: r.valido }));
    } catch {
      setVerificacion(v => { const { [doc.id]: _, ...resto } = v; return resto; });
      toast({ title: "No se pudo verificar el documento", variant: "destructive" });
    }
  };

  const puedeFirmar = Boolean(plantilla && firmanteNombre.trim() && firmanteDocumento.trim() && aceptado && hayFirma);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileSignature className="h-4 w-4 text-[#8DC63F]" /> Documentos firmados
          </CardTitle>
          <Button onClick={abrirFirma} disabled={PLANTILLAS.length === 0} className="bg-[#8DC63F] hover:bg-[#7ab535] text-white">
            <Plus className="h-4 w-4 mr-1" /> Firmar documento
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : documentos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Este paciente aún no tiene documentos firmados.</p>
          ) : (
            <div className="space-y-2">
              {documentos.map(doc => {
                const estado = verificacion[doc.id];
                return (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-border flex-wrap">
                    <img src={doc.firmaUrl} alt="Firma" className="h-10 w-20 object-contain bg-white rounded border border-border" />
                    <div className="flex-1 min-w-[180px]">
                      <p className="text-sm font-medium">{doc.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.firmanteNombre}{doc.firmanteRelacion === "representante" ? " (representante)" : ""} · {formatFechaHora(doc.firmadoAt)}
                      </p>
                    </div>
                    {estado === true && <span className="text-xs text-green-700 flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Íntegro</span>}
                    {estado === false && <span className="text-xs text-red-600 flex items-center gap-1"><ShieldAlert className="h-4 w-4" /> Alterado</span>}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setViendo(doc)} aria-label="Ver" title="Ver"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => imprimir(doc)} aria-label="Imprimir o guardar PDF" title="Imprimir / PDF"><Printer className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => verificar(doc)} disabled={estado === "cargando"} aria-label="Verificar integridad" title="Verificar integridad">
                        {estado === "cargando" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ver documento firmado */}
      {viendo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{viendo.titulo}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setViendo(null)} aria-label="Cerrar"><X className="h-4 w-4" /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="whitespace-pre-wrap text-sm leading-relaxed border border-border rounded-md p-4 bg-muted/30">{viendo.contenido}</div>
              <div className="text-center">
                <img src={viendo.firmaUrl} alt="Firma" className="max-h-32 mx-auto bg-white" />
                <p className="text-sm border-t border-border inline-block px-8 pt-1">
                  {viendo.firmanteNombre} · Doc. {viendo.firmanteDocumento}{viendo.firmanteRelacion === "representante" ? " · Representante legal" : ""}
                </p>
              </div>
              <p className="text-xs text-muted-foreground break-all">
                Firmado el {formatFechaHora(viendo.firmadoAt)}{viendo.ip ? ` desde la IP ${viendo.ip}` : ""}. Código SHA-256: {viendo.hashSha256}
              </p>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => imprimir(viendo)}><Printer className="h-4 w-4 mr-1" /> Imprimir / PDF</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Firmar documento: pantalla completa para usar cómodamente en tablet o celular */}
      {firmando && (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
          <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2"><FileSignature className="h-5 w-5 text-[#8DC63F]" /> Firmar documento</h2>
              <Button variant="ghost" size="icon" onClick={() => setFirmando(false)} aria-label="Cerrar"><X className="h-5 w-5" /></Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Documento</label>
                <select value={plantillaId} onChange={e => setPlantillaId(e.target.value)} className={inputClass}>
                  {PLANTILLAS.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Firma</label>
                <select value={relacion} onChange={e => cambiarRelacion(e.target.value as "paciente" | "representante")} className={inputClass}>
                  <option value="paciente">El paciente</option>
                  <option value="representante">Padre, madre o apoderado</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Nombre completo del firmante *</label>
                <input value={firmanteNombre} maxLength={150} onChange={e => setFirmanteNombre(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium">DNI / documento del firmante *</label>
                <input value={firmanteDocumento} maxLength={20} onChange={e => setFirmanteDocumento(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Lea el documento completo antes de firmar</p>
              <div className="whitespace-pre-wrap text-sm leading-relaxed border border-border rounded-md p-4 bg-muted/30 max-h-[40vh] overflow-y-auto">
                {contenido}
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={aceptado} onChange={e => setAceptado(e.target.checked)} className="mt-0.5 h-4 w-4" />
              <span>He leído y comprendido el documento, y acepto su contenido.</span>
            </label>

            <div>
              <p className="text-sm font-medium mb-1">Firma *</p>
              <SignaturePad ref={firmaRef} onChange={setHayFirma} />
            </div>

            <div className="flex justify-end gap-2 pb-6">
              <Button variant="outline" onClick={() => setFirmando(false)}>Cancelar</Button>
              <Button onClick={handleFirmar} disabled={!puedeFirmar || firmarMutation.isPending} className="bg-[#8DC63F] hover:bg-[#7ab535] text-white">
                {firmarMutation.isPending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Guardando...</> : "Firmar y guardar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
