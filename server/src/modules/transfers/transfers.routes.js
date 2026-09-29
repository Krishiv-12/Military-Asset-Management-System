import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import { PERMISSIONS } from "../../utils/rbac.js";
import { createTransferSchema } from "./transfers.schema.js";
import * as controller from "./transfers.controller.js";

const router = Router();

router.get("/", requireAuth, requireRoles(...PERMISSIONS.transfers), controller.list);
router.get("/:id", requireAuth, requireRoles(...PERMISSIONS.transfers), controller.getById);
router.post(
  "/",
  requireAuth,
  requireRoles(...PERMISSIONS.transfers),
  validate(createTransferSchema),
  controller.create,
);

export default router;
