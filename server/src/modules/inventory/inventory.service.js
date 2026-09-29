import { prisma } from "../../config/prisma.js";
import { isAdmin } from "../../utils/rbac.js";
import { AppError } from "../../utils/AppError.js";

export async function listInventory(user, query) {
  const where = {};

  if (!isAdmin(user)) {
    if (!user.baseId) {
      throw new AppError("User is not assigned to a base", 403);
    }
    where.baseId = user.baseId;
  } else if (query.baseId) {
    where.baseId = query.baseId;
  }

  if (query.equipmentTypeId) {
    where.equipmentTypeId = query.equipmentTypeId;
  }

  return prisma.inventory.findMany({
    where,
    orderBy: [{ base: { name: "asc" } }, { equipmentType: { name: "asc" } }],
    select: {
      id: true,
      quantity: true,
      updatedAt: true,
      base: { select: { id: true, name: true, code: true } },
      equipmentType: { select: { id: true, name: true, category: true } },
    },
  });
}
