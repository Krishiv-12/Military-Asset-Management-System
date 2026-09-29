import { prisma } from "../../config/prisma.js";

export async function listEquipmentTypes() {
  return prisma.equipmentType.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: { id: true, name: true, category: true, description: true },
  });
}
