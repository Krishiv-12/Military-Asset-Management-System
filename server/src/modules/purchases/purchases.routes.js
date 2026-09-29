import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import { PERMISSIONS } from "../../utils/rbac.js";
import { createPurchaseSchema } from "./purchases.schema.js";
import * as controller from "./purchases.controller.js";

const router = Router();

router.get("/", requireAuth, requireRoles(...PERMISSIONS.purchases), controller.list);
router.post(
  "/",
  requireAuth,
  requireRoles(...PERMISSIONS.purchases),
  validate(createPurchaseSchema),
  controller.create,
);

export default router;
