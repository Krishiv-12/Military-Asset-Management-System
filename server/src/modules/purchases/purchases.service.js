import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { isAdmin } from "../../utils/rbac.js";
import { increaseInventory, createMovement } from "../../utils/inventory.js";
import { writeAuditLog } from "../audit/audit.service.js";
import { paginatedResult, parsePagination } from "../../utils/pagination.js";
import { dateFilter, parseDateRange } from "../../utils/dateRange.js";

function ensureBaseAccess(user, baseId) {
  if (!isAdmin(user) && user.baseId !== baseId) {
    throw new AppError("You can only operate on your assigned base", 403);
  }
}

export async function createPurchase(user, input) {
  ensureBaseAccess(user, input.baseId);

  const purchaseDate = new Date(input.purchaseDate);
  if (Number.isNaN(purchaseDate.getTime())) {
    throw new AppError("Invalid purchase date", 422);
  }

  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        baseId: input.baseId,
        equipmentTypeId: input.equipmentTypeId,
        quantity: input.quantity,
        purchaseDate,
        notes: input.notes,
        createdById: user.id,
      },
    });

    await increaseInventory(tx, input.baseId, input.equipmentTypeId, input.quantity);

    await createMovement(tx, {
      baseId: input.baseId,
      equipmentTypeId: input.equipmentTypeId,
      type: "PURCHASE",
      quantity: input.quantity,
      occurredAt: purchaseDate,
      referenceType: "Purchase",
      referenceId: purchase.id,
    });

    await writeAuditLog(tx, {
      userId: user.id,
      action: "PURCHASE_CREATED",
      entity: "Purchase",
      entityId: purchase.id,
      baseId: input.baseId,
      metadata: {
        equipmentTypeId: input.equipmentTypeId,
        quantity: input.quantity,
      },
    });

    return tx.purchase.findUnique({
      where: { id: purchase.id },
      include: {
        base: { select: { id: true, name: true, code: true } },
        equipmentType: { select: { id: true, name: true, category: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  });
}

export async function listPurchases(user, query) {
  const { page, pageSize, skip, take } = parsePagination(query);
  const { dateFrom, dateTo } = parseDateRange(query);

  const where = {
    ...dateFilter("purchaseDate", { dateFrom, dateTo }),
  };

  if (!isAdmin(user)) {
    where.baseId = user.baseId;
  } else if (query.baseId) {
    where.baseId = query.baseId;
  }

  if (query.equipmentTypeId) {
    where.equipmentTypeId = query.equipmentTypeId;
  }

  const [items, total] = await Promise.all([
    prisma.purchase.findMany({
      where,
      skip,
      take,
      orderBy: { purchaseDate: "desc" },
      include: {
        base: { select: { id: true, name: true, code: true } },
        equipmentType: { select: { id: true, name: true, category: true } },
        createdBy: { select: { id: true, name: true } },
      },
    }),
    prisma.purchase.count({ where }),
  ]);

  return paginatedResult({ items, total, page, pageSize });
}
