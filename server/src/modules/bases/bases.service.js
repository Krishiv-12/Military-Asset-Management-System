import { prisma } from "../../config/prisma.js";

export async function listBases() {
  return prisma.base.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true, location: true },
  });
}
