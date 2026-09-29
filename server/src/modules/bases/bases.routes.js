import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import * as controller from "./bases.controller.js";

const router = Router();

router.get("/", requireAuth, controller.list);

export default router;
