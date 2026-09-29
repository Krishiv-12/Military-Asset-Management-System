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

export async function createAssignment(user, input) {
  ensureBaseAccess(user, input.baseId);

  const assignedAt = new Date(input.assignedAt);
  if (Number.isNaN(assignedAt.getTime())) {
    throw new AppError("Invalid assignment date", 422);
  }

  return prisma.$transaction(async (tx) => {
    const assignment = await tx.assignment.create({
      data: {
        baseId: input.baseId,
        equipmentTypeId: input.equipmentTypeId,
        quantity: input.quantity,
        personnelName: input.personnelName,
        personnelId: input.personnelId,
        assignedAt,
        notes: input.notes,
        createdById: user.id,
      },
    });

    await decreaseInventory(tx, input.baseId, input.equipmentTypeId, input.quantity);

    await createMovement(tx, {
      baseId: input.baseId,
      equipmentTypeId: input.equipmentTypeId,
      type: "ASSIGNMENT",
      quantity: input.quantity,
      occurredAt: assignedAt,
      referenceType: "Assignment",
      referenceId: assignment.id,
    });

    await writeAuditLog(tx, {
      userId: user.id,
      action: "ASSIGNMENT_CREATED",
      entity: "Assignment",
      entityId: assignment.id,
      baseId: input.baseId,
      metadata: {
        personnelName: input.personnelName,
        personnelId: input.personnelId,
        quantity: input.quantity,
        equipmentTypeId: input.equipmentTypeId,
      },
    });

    return tx.assignment.findUnique({
      where: { id: assignment.id },
      include: {
        base: { select: { id: true, name: true, code: true } },
        equipmentType: { select: { id: true, name: true, category: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  });
}

export async function listAssignments(user, query) {
  const { page, pageSize, skip, take } = parsePagination(query);
  const { dateFrom, dateTo } = parseDateRange(query);

  const where = {
    ...dateFilter("assignedAt", { dateFrom, dateTo }),
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
    prisma.assignment.findMany({
      where,
      skip,
      take,
      orderBy: { assignedAt: "desc" },
      include: {
        base: { select: { id: true, name: true, code: true } },
        equipmentType: { select: { id: true, name: true, category: true } },
        createdBy: { select: { id: true, name: true } },
      },
    }),
    prisma.assignment.count({ where }),
  ]);

  return paginatedResult({ items, total, page, pageSize });
}
