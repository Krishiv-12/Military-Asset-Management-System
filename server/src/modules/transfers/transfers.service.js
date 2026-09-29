import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { isAdmin } from "../../utils/rbac.js";
import { increaseInventory, decreaseInventory, createMovement } from "../../utils/inventory.js";
import { writeAuditLog } from "../audit/audit.service.js";
import { paginatedResult, parsePagination } from "../../utils/pagination.js";
import { dateFilter, parseDateRange } from "../../utils/dateRange.js";

const transferInclude = {
  sourceBase: { select: { id: true, name: true, code: true } },
  destinationBase: { select: { id: true, name: true, code: true } },
  createdBy: { select: { id: true, name: true } },
  items: {
    include: {
      equipmentType: { select: { id: true, name: true, category: true } },
    },
  },
};

function ensureTransferAccess(user, sourceBaseId, destinationBaseId) {
  if (isAdmin(user)) return;
  if (user.baseId !== sourceBaseId && user.baseId !== destinationBaseId) {
    throw new AppError("You can only transfer to or from your assigned base", 403);
  }
}

export async function createTransfer(user, input) {
  if (input.sourceBaseId === input.destinationBaseId) {
    throw new AppError("Source and destination bases must be different", 422);
  }

  ensureTransferAccess(user, input.sourceBaseId, input.destinationBaseId);

  const transferDate = new Date(input.transferDate);
  if (Number.isNaN(transferDate.getTime())) {
    throw new AppError("Invalid transfer date", 422);
  }

  const [sourceBase, destBase] = await Promise.all([
    prisma.base.findUnique({ where: { id: input.sourceBaseId } }),
    prisma.base.findUnique({ where: { id: input.destinationBaseId } }),
  ]);

  if (!sourceBase || !destBase) {
    throw new AppError("Source or destination base was not found", 404);
  }

  return prisma.$transaction(async (tx) => {
    const transfer = await tx.transfer.create({
      data: {
        sourceBaseId: input.sourceBaseId,
        destinationBaseId: input.destinationBaseId,
        transferDate,
        notes: input.notes,
        createdById: user.id,
        items: {
          create: input.items.map((item) => ({
            equipmentTypeId: item.equipmentTypeId,
            quantity: item.quantity,
          })),
        },
      },
    });

    for (const item of input.items) {
      await decreaseInventory(tx, input.sourceBaseId, item.equipmentTypeId, item.quantity);
      await increaseInventory(tx, input.destinationBaseId, item.equipmentTypeId, item.quantity);

      await createMovement(tx, {
        baseId: input.sourceBaseId,
        equipmentTypeId: item.equipmentTypeId,
        type: "TRANSFER_OUT",
        quantity: item.quantity,
        occurredAt: transferDate,
        referenceType: "Transfer",
        referenceId: transfer.id,
      });

      await createMovement(tx, {
        baseId: input.destinationBaseId,
        equipmentTypeId: item.equipmentTypeId,
        type: "TRANSFER_IN",
        quantity: item.quantity,
        occurredAt: transferDate,
        referenceType: "Transfer",
        referenceId: transfer.id,
      });
    }

    await writeAuditLog(tx, {
      userId: user.id,
      action: "TRANSFER_CREATED",
      entity: "Transfer",
      entityId: transfer.id,
      baseId: input.sourceBaseId,
      metadata: {
        sourceBaseId: input.sourceBaseId,
        destinationBaseId: input.destinationBaseId,
        items: input.items,
      },
    });

    return tx.transfer.findUnique({
      where: { id: transfer.id },
      include: transferInclude,
    });
  });
}

export async function listTransfers(user, query) {
  const { page, pageSize, skip, take } = parsePagination(query);
  const { dateFrom, dateTo } = parseDateRange(query);

  const where = {
    ...dateFilter("transferDate", { dateFrom, dateTo }),
  };

  if (!isAdmin(user)) {
    where.OR = [{ sourceBaseId: user.baseId }, { destinationBaseId: user.baseId }];
  } else if (query.baseId) {
    where.OR = [{ sourceBaseId: query.baseId }, { destinationBaseId: query.baseId }];
  }

  const [items, total] = await Promise.all([
    prisma.transfer.findMany({
      where,
      skip,
      take,
      orderBy: { transferDate: "desc" },
      include: transferInclude,
    }),
    prisma.transfer.count({ where }),
  ]);

  return paginatedResult({ items, total, page, pageSize });
}

export async function getTransferById(user, id) {
  const transfer = await prisma.transfer.findUnique({
    where: { id },
    include: transferInclude,
  });

  if (!transfer) {
    throw new AppError("Transfer not found", 404);
  }

  if (
    !isAdmin(user) &&
    user.baseId !== transfer.sourceBaseId &&
    user.baseId !== transfer.destinationBaseId
  ) {
    throw new AppError("You do not have access to this transfer", 403);
  }

  return transfer;
}
