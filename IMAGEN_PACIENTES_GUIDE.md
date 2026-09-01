# 📸 Guía de Implementación: Subida de Imágenes para Pacientes

## ✅ ¿Qué se ha hecho?

Se ha implementado un sistema completo para que los pacientes puedan subir imágenes (panorámicas, tomografías, radiografías, fotos dentales, etc.).

### 📋 Cambios realizados:

#### 1. **Base de Datos** ✓
- Nueva tabla `imagenes_pacientes` creada
- Campos: tipo de imagen, descripción, ruta del archivo, nombre original, fecha de creación

#### 2. **Backend API** ✓
- Endpoints configurados para:
  - Subir imágenes: `POST /api/pacientes/:id/imagenes`
  - Obtener imágenes: `GET /api/pacientes/:id/imagenes`
  - Eliminar imágenes: `DELETE /api/pacientes/:id/imagenes/:imagenId`
- Validación: máximo 10MB, formatos JPEG/PNG/WebP/GIF
- Almacenamiento automático en carpeta `public/uploads/pacientes/`

#### 3. **Frontend** ✓
- Nueva pestaña "Imágenes" en la vista detalle del paciente
- Componente para subir imágenes con:
  - Selección de tipo (panorámica, tomografía, etc.)
  - Campo opcional de descripción
  - Galería visual de imágenes subidas
  - Opción de eliminar imágenes

---

## 🚀 Pasos para Activar

### Paso 1: ✅ Instalar dependencias
```bash
pnpm install --no-frozen-lockfile
```
**Estado**: Completado

### Paso 2: ✅ Generar migraciones de BD
```bash
cd lib/db
pnpm exec drizzle-kit generate --name add_imagenes_pacientes
```
**Estado**: Completado - Archivo generado: `lib/db/drizzle/0000_add_imagenes_pacientes.sql`

### Paso 3: 📋 Aplicar migraciones a la BD (ESTE PASO)

**Opción A: Automático (si tienes DATABASE_URL)**
```bash
cd lib/db
pnpm exec drizzle-kit migrate
```

**Opción B: Manual - En tu cliente PostgreSQL (pgAdmin, DBeaver, psql)**
1. Abre el archivo: `lib/db/drizzle/0000_add_imagenes_pacientes.sql`
2. Copia TODO el contenido
3. Pégalo y ejecuta en tu cliente PostgreSQL

ℹ️ **Nota**: El archivo SQL contiene la creación de todas las tablas y relaciones. Solo es necesario ejecutarlo una vez.

### Paso 4: Compilar y ejecutar
```bash
# Compilar
pnpm run build

# Ejecutar (desarrollo)
cd artifacts/api-server
pnpm run dev

# O ejecutar (producción, después de build)
cd artifacts/api-server
pnpm run start
```

---

## 📸 ¿Cómo se usa?

1. **Acceder al detalle de un paciente**
   - Click en un paciente de la lista

2. **Ir a la pestaña "Imágenes"**
   - Nueva pestaña disponible junto a "Datos", "Antecedentes", etc.

3. **Subir una imagen**
   - Seleccionar tipo de imagen (panorámica, tomografía, radiografía periapical, etc.)
   - (Opcional) Agregar descripción
   - Seleccionar archivo de imagen
   - Subida automática - máximo 10MB

4. **Ver las imágenes**
   - Galería visual con todas las imágenes del paciente
   - Muestra tipo, fecha, descripción
   - Click en la X roja para eliminar

---

## 🎯 Tipos de imágenes disponibles

- ✓ Panorámica
- ✓ Tomografía
- ✓ Radiografía Periapical
- ✓ Radiografía Oclusal
- ✓ Foto Dental
- ✓ Foto Sonrisa
- ✓ Fotografía Frontal
- ✓ Fotografía Lateral
- ✓ Otro (personalizado)

---

## 📁 Archivos creados/modificados

### Archivos Nuevos:
```
lib/db/src/schema/imagenes_pacientes.ts
artifacts/api-server/src/routes/imagenes.ts
artifacts/dentsalud/src/components/pacientes/ImagenesUpload.tsx
```

### Archivos Modificados:
```
lib/db/src/schema/index.ts (agregó export)
artifacts/api-server/src/routes/index.ts (agregó ruta)
artifacts/api-server/src/app.ts (aumentó límite de payload)
artifacts/api-server/package.json (agregó multer)
artifacts/dentsalud/src/pages/pacientes/[id].tsx (agregó pestaña)
```

---

## 🔐 Consideraciones de seguridad

- ✓ Validación de tipos MIME
- ✓ Límite de tamaño (10MB)
- ✓ Autenticación requerida (middleware requireAuth)
- ✓ Eliminación en cascada cuando se elimina paciente
- ✓ Nombres de archivo aleatorios para evitar sobreescrituras

---

## 📋 Estado de Implementación

### ✅ Completado
- [x] Tabla `imagenes_pacientes` creada en schema
- [x] Endpoints API configurados (upload, get, delete)
- [x] Componente frontend `ImagenesUpload` desarrollado
- [x] Pestaña "Imágenes" integrada en vista de paciente
- [x] Dependencias instaladas (multer, @types/multer)
- [x] Migración de BD generada
- [x] Validación TypeScript completada

### ⏳ Pendiente (Por ti)
- [ ] Aplicar migración a la BD PostgreSQL
- [ ] Verificar carpeta `public/uploads/pacientes/` con permisos de escritura
- [ ] Compilar proyecto: `pnpm run build`
- [ ] Ejecutar servidor

---

1. **Carpeta de uploads**: Se crea automáticamente en `public/uploads/pacientes/`
2. **Rutas del archivo**: El archivo debe tener una carpeta `public` en el mismo nivel que `artifacts`
3. **Base de datos**: Asegúrate de que la BD tenga acceso de escritura

---

## 🆘 Troubleshooting

### "Error al subir la imagen"
- Verifica que el archivo sea imagen válida (JPEG, PNG, WebP, GIF)
- Verifica que el archivo sea menor a 10MB
- Verifica que la carpeta `public/uploads/pacientes/` tenga permisos de escritura

### "No se ven las imágenes"
- Verifica que la BD tenga la tabla `imagenes_pacientes`
- Verifica que el servidor esté ejecutándose
- Abre la consola del navegador (F12) para ver errores

### "Cambios no aparecen"
- Reconstruye el proyecto: `pnpm run build`
- Reinicia el servidor de desarrollo

---

¡Listo! 🎉 Las imágenes de los pacientes están habilitadas.
