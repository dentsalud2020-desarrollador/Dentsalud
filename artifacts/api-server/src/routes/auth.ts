import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usuariosTable } from "@workspace/db";
import { LoginBody } from "@workspace/api-zod";
import { comparePassword, signToken } from "../lib/auth";
import { requireAuth, type AuthRequest } from "../middlewares/requireAuth";

const router = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const [usuario] = await db.select().from(usuariosTable).where(eq(usuariosTable.email, email));
  if (!usuario || !comparePassword(password, usuario.passwordHash)) {
    res.status(401).json({ error: "Credenciales incorrectas" });
    return;
  }
  if (!usuario.activo) {
    res.status(401).json({ error: "Usuario inactivo" });
    return;
  }
  await db.update(usuariosTable).set({ ultimoAcceso: new Date() }).where(eq(usuariosTable.id, usuario.id));
  const token = signToken({ userId: usuario.id, rol: usuario.rol });
  res.json({
    token,
    usuario: {
      id: usuario.id,
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      rol: usuario.rol,
      especialidad: usuario.especialidad,
      telefono: usuario.telefono,
      activo: usuario.activo,
    },
  });
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const [usuario] = await db.select().from(usuariosTable).where(eq(usuariosTable.id, req.userId!));
  if (!usuario) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  res.json({
    id: usuario.id,
    nombreCompleto: usuario.nombreCompleto,
    email: usuario.email,
    rol: usuario.rol,
    especialidad: usuario.especialidad,
    telefono: usuario.telefono,
    activo: usuario.activo,
  });
});

export default router;
