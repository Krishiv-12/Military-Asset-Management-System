import { z } from "zod";

export const createAssignmentSchema = z.object({
  baseId: z.string().uuid(),
  equipmentTypeId: z.string().uuid(),
  quantity: z.number().int().positive(),
  personnelName: z.string().min(2).max(120),
  personnelId: z.string().min(2).max(80),
  assignedAt: z.string().datetime({ offset: true }).or(z.string().min(8)),
  notes: z.string().max(500).optional(),
});
