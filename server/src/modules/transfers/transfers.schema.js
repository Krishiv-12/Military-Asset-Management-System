import { z } from "zod";

export const createTransferSchema = z.object({
  sourceBaseId: z.string().uuid(),
  destinationBaseId: z.string().uuid(),
  transferDate: z.string().datetime({ offset: true }).or(z.string().min(8)),
  notes: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        equipmentTypeId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});
