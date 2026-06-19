import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET ?? "dentsalud-secret-key-2026";
const JWT_EXPIRES_IN = "8h";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function signToken(payload: { userId: number; rol: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { userId: number; rol: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; rol: string };
  } catch {
    return null;
  }
}
