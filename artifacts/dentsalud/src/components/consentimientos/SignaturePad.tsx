import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SignaturePadHandle {
  /** PNG en base64 (data URL) o null si no se ha firmado */
  toDataURL: () => string | null;
  clear: () => void;
}

interface SignaturePadProps {
  onChange?: (firmado: boolean) => void;
  height?: number;
}

// Panel de firma con el dedo, lápiz táctil o mouse. Sin librerías externas.
export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad({ onChange, height = 200 }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dibujando = useRef(false);
    const ultimo = useRef<{ x: number; y: number } | null>(null);
    const trazos = useRef(0);

    // Ajusta la resolución del canvas a la pantalla para que el trazo se vea nítido
    const prepararCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const escala = Math.min(window.devicePixelRatio || 1, 2);
      const { width } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * escala);
      canvas.height = Math.round(height * escala);
      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(escala, 0, 0, escala, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2.2;
      trazos.current = 0;
      onChange?.(false);
    };

    useEffect(() => {
      prepararCanvas();
      // Al girar la tablet cambia el ancho: se reinicia el panel para no deformar la firma
      const alCambiarTamano = () => prepararCanvas();
      window.addEventListener("resize", alCambiarTamano);
      return () => window.removeEventListener("resize", alCambiarTamano);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [height]);

    const posicion = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const alPresionar = (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      dibujando.current = true;
      const p = posicion(e);
      ultimo.current = p;
      // Un toque sin mover también deja un punto
      const ctx = e.currentTarget.getContext("2d")!;
      ctx.beginPath();
      ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
    };

    const alMover = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!dibujando.current || !ultimo.current) return;
      e.preventDefault();
      const ctx = e.currentTarget.getContext("2d")!;
      const p = posicion(e);
      ctx.beginPath();
      ctx.moveTo(ultimo.current.x, ultimo.current.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ultimo.current = p;
    };

    const alSoltar = () => {
      if (!dibujando.current) return;
      dibujando.current = false;
      ultimo.current = null;
      trazos.current += 1;
      onChange?.(true);
    };

    useImperativeHandle(ref, () => ({
      toDataURL: () => {
        const canvas = canvasRef.current;
        if (!canvas || trazos.current === 0) return null;
        // Se exporta sobre fondo blanco para que se vea bien al imprimir
        const salida = document.createElement("canvas");
        salida.width = canvas.width;
        salida.height = canvas.height;
        const ctx = salida.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, salida.width, salida.height);
        ctx.drawImage(canvas, 0, 0);
        return salida.toDataURL("image/png");
      },
      clear: prepararCanvas,
    }));

    return (
      <div className="space-y-2">
        <div className="relative rounded-lg border-2 border-dashed border-gray-300 bg-white">
          <canvas
            ref={canvasRef}
            style={{ height, touchAction: "none" }}
            className="block w-full cursor-crosshair rounded-lg"
            onPointerDown={alPresionar}
            onPointerMove={alMover}
            onPointerUp={alSoltar}
            onPointerCancel={alSoltar}
            onPointerLeave={alSoltar}
            aria-label="Área de firma"
          />
          <div className="pointer-events-none absolute bottom-8 left-6 right-6 border-b border-gray-300" />
          <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-xs text-gray-400">
            Firme aquí
          </p>
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={prepararCanvas}>
            <Eraser className="h-4 w-4 mr-1" /> Borrar firma
          </Button>
        </div>
      </div>
    );
  },
);
