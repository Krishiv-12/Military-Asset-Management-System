import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import { env, isProduction } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import { writeAuditLog } from "../audit/audit.service.js";

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  baseId: true,
  base: { select: { id: true, name: true, code: true } },
};

export async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.isActive) {
    throw new AppError("Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = jwt.sign({ userId: user.id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  await writeAuditLog(prisma, {
    userId: user.id,
    action: "LOGIN",
    entity: "User",
    entityId: user.id,
    baseId: user.baseId,
  });

  const safeUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: publicUserSelect,
  });

  return { token, user: safeUser };
}

export async function logout(user) {
  if (!user) return;
  await writeAuditLog(prisma, {
    userId: user.id,
    action: "LOGOUT",
    entity: "User",
    entityId: user.id,
    baseId: user.baseId,
  });
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure || isProduction,
    sameSite: isProduction ? "strict" : "lax",
    path: "/",
    maxAge: 8 * 60 * 60 * 1000,
  };
}

export { publicUserSelect };
