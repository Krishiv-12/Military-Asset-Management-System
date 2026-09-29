import { asyncHandler } from "../../utils/asyncHandler.js";
import * as auditService from "./audit.service.js";

export const list = asyncHandler(async (req, res) => {
  const data = await auditService.listAuditLogs(req.user, req.query);
  res.json({ success: true, data });
});
