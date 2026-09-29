import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { isAdmin } from "../../utils/rbac.js";
import { signedQuantity } from "../../utils/inventory.js";
import { parseDateRange } from "../../utils/dateRange.js";

function movementWhere(user, query, dateFrom, dateTo) {
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

  if (dateFrom || dateTo) {
    where.occurredAt = {};
    if (dateFrom) where.occurredAt.gte = dateFrom;
    if (dateTo) where.occurredAt.lte = dateTo;
  }

  return where;
}

function sumByType(rows) {
  const totals = {
    PURCHASE: 0,
    TRANSFER_IN: 0,
    TRANSFER_OUT: 0,
    ASSIGNMENT: 0,
    EXPENDITURE: 0,
  };
  for (const row of rows) {
    totals[row.type] = row._sum.quantity ?? 0;
  }
  return totals;
}

export async function getSummary(user, query) {
  const { dateFrom, dateTo } = parseDateRange(query);
  const rangeWhere = movementWhere(user, query, dateFrom, dateTo);
  const priorWhere = movementWhere(user, query, null, dateFrom ? new Date(dateFrom.getTime() - 1) : null);

  const [rangeGroups, priorGroups, currentInventory] = await Promise.all([
    prisma.inventoryMovement.groupBy({
      by: ["type"],
      where: rangeWhere,
      _sum: { quantity: true },
    }),
    dateFrom
      ? prisma.inventoryMovement.groupBy({
          by: ["type"],
          where: priorWhere,
          _sum: { quantity: true },
        })
      : Promise.resolve([]),
    prisma.inventory.aggregate({
      where: {
        ...(rangeWhere.baseId ? { baseId: rangeWhere.baseId } : {}),
        ...(rangeWhere.equipmentTypeId ? { equipmentTypeId: rangeWhere.equipmentTypeId } : {}),
      },
      _sum: { quantity: true },
    }),
  ]);

  const range = sumByType(rangeGroups);
  const prior = sumByType(priorGroups);

  const openingBalance = Object.entries(prior).reduce(
    (sum, [type, qty]) => sum + signedQuantity(type, qty),
    0,
  );

  const purchases = range.PURCHASE;
  const transferIn = range.TRANSFER_IN;
  const transferOut = range.TRANSFER_OUT;
  const assignedAssets = range.ASSIGNMENT;
  const expendedAssets = range.EXPENDITURE;
  const netMovement = purchases + transferIn - transferOut;
  const closingBalance =
    openingBalance + netMovement - assignedAssets - expendedAssets;

  return {
    openingBalance,
    closingBalance,
    netMovement,
    assignedAssets,
    expendedAssets,
    netMovementBreakdown: {
      purchases,
      transferIn,
      transferOut,
      netMovement,
    },
    currentOnHand: currentInventory._sum.quantity ?? 0,
    filters: {
      dateFrom: dateFrom?.toISOString() ?? null,
      dateTo: dateTo?.toISOString() ?? null,
      baseId: rangeWhere.baseId ?? null,
      equipmentTypeId: rangeWhere.equipmentTypeId ?? null,
    },
  };
}
