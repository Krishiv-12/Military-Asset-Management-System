import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { isAdmin } from "../../utils/rbac.js";
import { decreaseInventory, createMovement } from "../../utils/inventory.js";
import { writeAuditLog } from "../audit/audit.service.js";
import { paginatedResult, parsePagination } from "../../utils/pagination.js";
import { dateFilter, parseDateRange } from "../../utils/dateRange.js";

function ensureBaseAccess(user, baseId) {
  if (!isAdmin(user) && user.baseId !== baseId) {
    throw new AppError("You can only operate on your assigned base", 403);
  }
}

export async function createExpenditure(user, input) {
  ensureBaseAccess(user, input.baseId);

  const expendedAt = new Date(input.expendedAt);
  if (Number.isNaN(expendedAt.getTime())) {
    throw new AppError("Invalid expenditure date", 422);
  }

  return prisma.$transaction(async (tx) => {
    const expenditure = await tx.expenditure.create({
      data: {
        baseId: input.baseId,
        equipmentTypeId: input.equipmentTypeId,
        quantity: input.quantity,
        reason: input.reason,
        expendedAt,
        createdById: user.id,
      },
    });

    await decreaseInventory(tx, input.baseId, input.equipmentTypeId, input.quantity);

    await createMovement(tx, {
      baseId: input.baseId,
      equipmentTypeId: input.equipmentTypeId,
      type: "EXPENDITURE",
      quantity: input.quantity,
      occurredAt: expendedAt,
      referenceType: "Expenditure",
      referenceId: expenditure.id,
    });

    await writeAuditLog(tx, {
      userId: user.id,
      action: "EXPENDITURE_CREATED",
      entity: "Expenditure",
      entityId: expenditure.id,
      baseId: input.baseId,
      metadata: {
        reason: input.reason,
        quantity: input.quantity,
        equipmentTypeId: input.equipmentTypeId,
      },
    });

    return tx.expenditure.findUnique({
      where: { id: expenditure.id },
      include: {
        base: { select: { id: true, name: true, code: true } },
        equipmentType: { select: { id: true, name: true, category: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  });
}

export async function listExpenditures(user, query) {
  const { page, pageSize, skip, take } = parsePagination(query);
  const { dateFrom, dateTo } = parseDateRange(query);

  const where = {
    ...dateFilter("expendedAt", { dateFrom, dateTo }),
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
    prisma.expenditure.findMany({
      where,
      skip,
      take,
      orderBy: { expendedAt: "desc" },
      include: {
        base: { select: { id: true, name: true, code: true } },
        equipmentType: { select: { id: true, name: true, category: true } },
        createdBy: { select: { id: true, name: true } },
      },
    }),
    prisma.expenditure.count({ where }),
  ]);

  return paginatedResult({ items, total, page, pageSize });
}
