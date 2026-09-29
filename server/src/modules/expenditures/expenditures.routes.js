import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import { PERMISSIONS } from "../../utils/rbac.js";
import { createExpenditureSchema } from "./expenditures.schema.js";
import * as controller from "./expenditures.controller.js";

const router = Router();

router.get("/", requireAuth, requireRoles(...PERMISSIONS.expenditures), controller.list);
router.post(
  "/",
  requireAuth,
  requireRoles(...PERMISSIONS.expenditures),
  validate(createExpenditureSchema),
  controller.create,
);

export default router;
