import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/rbac.js";
import { PERMISSIONS } from "../../utils/rbac.js";
import * as controller from "./audit.controller.js";

const router = Router();

router.get("/", requireAuth, requireRoles(...PERMISSIONS.audit), controller.list);

export default router;
