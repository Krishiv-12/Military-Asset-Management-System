import { z } from "zod";

export const createPurchaseSchema = z.object({
  baseId: z.string().uuid(),
  equipmentTypeId: z.string().uuid(),
  quantity: z.number().int().positive(),
  purchaseDate: z.string().datetime({ offset: true }).or(z.string().min(8)),
  notes: z.string().max(500).optional(),
});
