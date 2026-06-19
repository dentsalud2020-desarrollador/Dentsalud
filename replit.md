# DentSalud – Sistema de Gestión Odontológica

Sistema de gestión clínica dental para **Centro DentSalud – Tu Centro de Armonía Dentofacial** (Trujillo, Perú). Gestiona pacientes, historia clínica, odontograma FDI, planes de tratamiento, sesiones y pagos.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — API server (port 8080 → proxy at /api)
- `pnpm --filter @workspace/dentsalud run dev` — Frontend React/Vite
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/db run seed` — seed admin user, treatment types, and FDI dental pieces
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + JWT auth (jsonwebtoken + bcryptjs)
- DB: PostgreSQL + Drizzle ORM (11 tables)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Frontend: React 19 + Vite + Wouter + TanStack Query + Tailwind v4 + shadcn/ui
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/api-server/src/routes/` — all Express routes (auth, pacientes, historia, odontodiagrama, tratamientos, sesiones, pagos, dashboard)
- `artifacts/api-server/src/middlewares/requireAuth.ts` — JWT middleware
- `artifacts/dentsalud/src/pages/` — frontend pages (login, dashboard, pacientes)
- `artifacts/dentsalud/src/components/odontodiagrama/` — SVG FDI odontogram component
- `lib/db/src/schema/index.ts` — Drizzle ORM schema (source of truth for DB)
- `lib/api-spec/` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/` — generated React Query hooks + Axios client

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval generates React Query hooks and Zod schemas
- JWT stored in `localStorage('dentsalud_token')`, read by custom-fetch in api-client-react
- All routes require auth except POST /api/auth/login
- FDI odontogram uses inline SVG with 52 dental pieces, 12 possible states per tooth
- Pagos are linked to paciente (via tratamientos), not directly to sesiones

## Product

- **Login**: JWT auth, roles admin/dentist
- **Dashboard**: stats (pacientes, tratamientos, ingresos), actividad reciente
- **Pacientes**: list + search, nuevo registro, ficha completa con 7 tabs:
  - Datos personales | Antecedentes médicos | Examen clínico | Odontograma FDI | Plan de tratamientos | Sesiones | Pagos
- **Odontograma**: SVG interactivo con 52 piezas FDI, selector de estados por pieza
- **Plan de tratamientos**: tabla con precios unitarios y totales
- **Pagos**: múltiples métodos (efectivo, transferencia, tarjeta, Yape, Plin, otro)

## Credentials (dev)

- **Email**: alan@dentsalud.com
- **Password**: DentSalud2026!
- **Rol**: admin

## Brand

- Verde primario: `#8DC63F`
- Azul acento: `#00AEEF`
- Clínica: Centro DentSalud – Tu Centro de Armonía Dentofacial, Trujillo, Perú
- Dentista: Alan Miller Prado Varela

## User preferences

- No integración SUNAT
- Colores de marca: verde #8DC63F, azul #00AEEF
- Idioma: español (Perú)

## Gotchas

- After changing the OpenAPI spec, run `pnpm --filter @workspace/api-spec run codegen` to regenerate hooks
- After DB schema changes, run `pnpm --filter @workspace/db run push`
- `queryKey` must be passed explicitly to generated hooks (Orval strict mode)
- `metodoPago` must be cast to `PagoInputMetodoPago` type when coming from a string state

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
