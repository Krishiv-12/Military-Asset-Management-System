import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import { PERMISSIONS } from "../../utils/rbac.js";
import { createAssignmentSchema } from "./assignments.schema.js";
import * as controller from "./assignments.controller.js";

const router = Router();

router.get("/", requireAuth, requireRoles(...PERMISSIONS.assignments), controller.list);
router.post(
  "/",
  requireAuth,
  requireRoles(...PERMISSIONS.assignments),
  validate(createAssignmentSchema),
  controller.create,
);

export default router;
