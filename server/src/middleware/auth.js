import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[env.cookieName];
    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    let payload;
    try {
      payload = jwt.verify(token, env.jwtSecret);
    } catch {
      throw new AppError("Invalid or expired session", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        baseId: true,
        isActive: true,
        base: { select: { id: true, name: true, code: true } },
      },
    });

    if (!user || !user.isActive) {
      throw new AppError("Account is not active", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
