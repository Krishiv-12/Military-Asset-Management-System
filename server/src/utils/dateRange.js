import { AppError } from "./AppError.js";

export function parseDateRange(query) {
  const dateFrom = query.dateFrom ? new Date(query.dateFrom) : null;
  const dateTo = query.dateTo ? new Date(query.dateTo) : null;

  if (dateFrom && Number.isNaN(dateFrom.getTime())) {
    throw new AppError("Invalid dateFrom", 422);
  }
  if (dateTo && Number.isNaN(dateTo.getTime())) {
    throw new AppError("Invalid dateTo", 422);
  }

  if (dateTo) {
    dateTo.setHours(23, 59, 59, 999);
  }

  return { dateFrom, dateTo };
}

export function dateFilter(field, { dateFrom, dateTo }) {
  if (!dateFrom && !dateTo) return {};
  const filter = {};
  if (dateFrom) filter.gte = dateFrom;
  if (dateTo) filter.lte = dateTo;
  return { [field]: filter };
}
