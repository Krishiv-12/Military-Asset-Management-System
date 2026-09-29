import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/rbac.js";
import { PERMISSIONS } from "../../utils/rbac.js";
import * as controller from "./inventory.controller.js";

const router = Router();

router.get("/", requireAuth, requireRoles(...PERMISSIONS.inventory), controller.list);

export default router;
