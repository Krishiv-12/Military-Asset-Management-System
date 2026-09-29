import { prisma } from "../../config/prisma.js";
import { isAdmin } from "../../utils/rbac.js";
import { paginatedResult, parsePagination } from "../../utils/pagination.js";
import { dateFilter, parseDateRange } from "../../utils/dateRange.js";

export async function writeAuditLog(txOrPrisma, payload) {
  const client = txOrPrisma ?? prisma;
  return client.auditLog.create({
    data: {
      userId: payload.userId,
      action: payload.action,
      entity: payload.entity,
      entityId: payload.entityId,
      baseId: payload.baseId ?? null,
      metadata: payload.metadata ?? undefined,
    },
  });
}

export async function listAuditLogs(user, query) {
  const { page, pageSize, skip, take } = parsePagination(query);
  const { dateFrom, dateTo } = parseDateRange(query);

  const where = {
    ...dateFilter("createdAt", { dateFrom, dateTo }),
  };

  if (query.action) where.action = query.action;
  if (query.entity) where.entity = query.entity;

  if (!isAdmin(user)) {
    where.baseId = user.baseId;
    if (user.role === "LOGISTICS_OFFICER") {
      where.entity = { in: ["Purchase", "Transfer"] };
    }
  } else if (query.baseId) {
    where.baseId = query.baseId;
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        baseId: true,
        metadata: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true, role: true } },
        base: { select: { id: true, name: true, code: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return paginatedResult({ items, total, page, pageSize });
}
