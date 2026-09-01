import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImagenPaciente {
  id: number;
  pacienteId: number;
  tipo: string;
  descripcion?: string;
  rutaArchivo: string;
  nombreArchivo: string;
  createdAt: string;
}

interface ImagenesUploadProps {
  pacienteId: number;
  imagenes: ImagenPaciente[];
  onImagenesChange: (imagenes: ImagenPaciente[]) => void;
}

const tiposImagen = [
  { value: "panorámica", label: "Panorámica" },
  { value: "tomografía", label: "Tomografía" },
  { value: "radiografía periapical", label: "Radiografía Periapical" },
  { value: "radiografía oclusal", label: "Radiografía Oclusal" },
  { value: "foto dental", label: "Foto Dental" },
  { value: "foto sonrisa", label: "Foto Sonrisa" },
  { value: "fotografía frontal", label: "Fotografía Frontal" },
  { value: "fotografía lateral", label: "Fotografía Lateral" },
  { value: "otro", label: "Otro" },
];

export function ImagenesUpload({
  pacienteId,
  imagenes,
  onImagenesChange,
}: ImagenesUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [selectedImage, setSelectedImage] = useState<ImagenPaciente | null>(null);
  const getAuthHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("dentsalud_token") : null;
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!tipo) {
      toast({
        title: "Error",
        description: "Selecciona el tipo de imagen",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("imagen", file);
      formData.append("tipo", tipo);
      if (descripcion) {
        formData.append("descripcion", descripcion);
      }

      const response = await fetch(`/api/pacientes/${pacienteId}/imagenes`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al subir la imagen");
      }

      const nuevaImagen: ImagenPaciente = await response.json();
      onImagenesChange([...imagenes, nuevaImagen]);

      // Limpiar formulario
      setTipo("");
      setDescripcion("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Éxito",
        description: "Imagen subida correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al subir la imagen",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imagenId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta imagen?")) return;

    try {
      const response = await fetch(
        `/api/pacientes/${pacienteId}/imagenes/${imagenId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar la imagen");
      }

      onImagenesChange(imagenes.filter((img) => img.id !== imagenId));
      toast({
        title: "Éxito",
        description: "Imagen eliminada correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al eliminar la imagen",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-white">
          {selectedImage && (
            <>
              <div className="relative">
                <img
                  src={selectedImage.rutaArchivo}
                  alt={selectedImage.tipo}
                  className="max-h-[75vh] w-full object-contain bg-slate-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='900'%3E%3Crect fill='%23f0f0f0' width='1200' height='900'/%3E%3Ctext x='50%' y='50%' text-anchor='middle' dy='.3em' fill='%23999' font-size='40'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div className="p-4 border-t">
                <DialogHeader className="mb-2">
                  <DialogTitle className="text-left capitalize">{selectedImage.tipo}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2 text-sm text-gray-600">
                  <span>{selectedImage.nombreArchivo}</span>
                  {selectedImage.descripcion && <span>{selectedImage.descripcion}</span>}
                  <span>
                    {new Date(selectedImage.createdAt).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Formulario de subida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Subir Nueva Imagen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo de Imagen *</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecciona el tipo de imagen" />
                </SelectTrigger>
                <SelectContent>
                  {tiposImagen.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Textarea
                id="descripcion"
                placeholder="Ej: Radiografía del área frontal superior"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="archivo">Archivo de Imagen *</Label>
              <div className="flex gap-2">
                <Input
                  id="archivo"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Seleccionar
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Máximo 10MB. Formatos: JPEG, PNG, WebP, GIF
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Galería de imágenes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Imágenes Subidas ({imagenes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {imagenes.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No hay imágenes subidas aún
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {imagenes.map((imagen) => (
                <div
                  key={imagen.id}
                  className="border rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gray-200 relative overflow-hidden">
                    <img
                      src={imagen.rutaArchivo}
                      alt={imagen.tipo}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50%' y='50%' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <div className="p-3 space-y-2">
                    <div>
                      <p className="font-semibold text-sm capitalize">
                        {imagen.tipo}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {imagen.nombreArchivo}
                      </p>
                    </div>
                    {imagen.descripcion && (
                      <p className="text-xs text-gray-700 line-clamp-2">
                        {imagen.descripcion}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t gap-2">
                      <span>
                        {new Date(imagen.createdAt).toLocaleDateString("es-PE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedImage(imagen)}
                          className="h-7 px-2 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(imagen.id)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
