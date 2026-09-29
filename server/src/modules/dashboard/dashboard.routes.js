import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRoles } from "../../middleware/rbac.js";
import { PERMISSIONS } from "../../utils/rbac.js";
import * as controller from "./dashboard.controller.js";

const router = Router();

router.get("/summary", requireAuth, requireRoles(...PERMISSIONS.dashboard), controller.summary);

export default router;
