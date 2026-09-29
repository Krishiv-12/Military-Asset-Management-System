import { z } from "zod";

export const createExpenditureSchema = z.object({
  baseId: z.string().uuid(),
  equipmentTypeId: z.string().uuid(),
  quantity: z.number().int().positive(),
  reason: z.string().min(3).max(300),
  expendedAt: z.string().datetime({ offset: true }).or(z.string().min(8)),
});
