# Test de la funcionalidad de imágenes de pacientes

Este archivo contiene ejemplos de cómo probar los endpoints de imágenes.

## Requisitos previos

1. ✅ BD actualizada con la tabla `imagenes_pacientes`
2. ✅ Servidor ejecutándose en `http://localhost:3000`
3. ✅ Token de autenticación válido
4. ✅ Carpeta `public/uploads/pacientes/` con permisos de escritura

## Endpoints disponibles

### 1. Subir una imagen

**Endpoint**: `POST /api/pacientes/:id/imagenes`

**Ejemplo con curl**:
```bash
curl -X POST http://localhost:3000/api/pacientes/1/imagenes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "imagen=@/ruta/a/imagen.jpg" \
  -F "tipo=panorámica" \
  -F "descripcion=Panorámica del paciente"
```

**Respuesta exitosa (201)**:
```json
{
  "id": 1,
  "pacienteId": 1,
  "tipo": "panorámica",
  "descripcion": "Panorámica del paciente",
  "rutaArchivo": "/uploads/pacientes/imagen-1234567890.jpg",
  "nombreArchivo": "imagen.jpg",
  "createdAt": "2026-08-28T10:30:00.000Z",
  "updatedAt": "2026-08-28T10:30:00.000Z"
}
```

### 2. Obtener imágenes de un paciente

**Endpoint**: `GET /api/pacientes/:id/imagenes`

**Ejemplo con curl**:
```bash
curl http://localhost:3000/api/pacientes/1/imagenes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta**:
```json
[
  {
    "id": 1,
    "pacienteId": 1,
    "tipo": "panorámica",
    "descripcion": "Panorámica del paciente",
    "rutaArchivo": "/uploads/pacientes/imagen-1234567890.jpg",
    "nombreArchivo": "imagen.jpg",
    "createdAt": "2026-08-28T10:30:00.000Z",
    "updatedAt": "2026-08-28T10:30:00.000Z"
  }
]
```

### 3. Eliminar una imagen

**Endpoint**: `DELETE /api/pacientes/:id/imagenes/:imagenId`

**Ejemplo con curl**:
```bash
curl -X DELETE http://localhost:3000/api/pacientes/1/imagenes/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta exitosa**:
```json
{
  "message": "Imagen eliminada"
}
```

---

## Prueba desde JavaScript/TypeScript

```typescript
// Subir imagen
async function uploadImage(pacienteId: number, file: File, tipo: string, descripcion?: string) {
  const formData = new FormData();
  formData.append('imagen', file);
  formData.append('tipo', tipo);
  if (descripcion) {
    formData.append('descripcion', descripcion);
  }

  const response = await fetch(`/api/pacientes/${pacienteId}/imagenes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('dentsalud_token')}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Error al subir imagen');
  }

  return response.json();
}

// Obtener imágenes
async function getImagenes(pacienteId: number) {
  const response = await fetch(`/api/pacientes/${pacienteId}/imagenes`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('dentsalud_token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener imágenes');
  }

  return response.json();
}

// Eliminar imagen
async function deleteImagen(pacienteId: number, imagenId: number) {
  const response = await fetch(`/api/pacientes/${pacienteId}/imagenes/${imagenId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('dentsalud_token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Error al eliminar imagen');
  }

  return response.json();
}
```

---

## Posibles errores

| Error | Causa | Solución |
|-------|-------|----------|
| `401 Unauthorized` | Token inválido o no presente | Asegúrate de incluir el header `Authorization` |
| `404 Not Found` | Paciente no existe | Verifica que el ID del paciente es correcto |
| `400 Bad Request` | Falta el campo `tipo` o archivo | Verifica que subes el archivo y tipo de imagen |
| `413 Payload Too Large` | Archivo > 10MB | Redimensiona la imagen |
| `415 Unsupported Media Type` | Formato no soportado | Usa JPEG, PNG, WebP o GIF |
| `500 Internal Server Error` | Error del servidor | Verifica logs del servidor |

---

## Validaciones implementadas

- ✅ Token de autenticación requerido
- ✅ Máximo 10MB por archivo
- ✅ Formatos permitidos: JPEG, PNG, WebP, GIF
- ✅ Tipo de imagen obligatorio
- ✅ Paciente debe existir
- ✅ Cascada delete cuando se elimina paciente
- ✅ Nombres de archivo únicos (aleatorios)
