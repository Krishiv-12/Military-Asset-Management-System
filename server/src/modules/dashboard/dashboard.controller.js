import { asyncHandler } from "../../utils/asyncHandler.js";
import * as dashboardService from "./dashboard.service.js";

export const summary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary(req.user, req.query);
  res.json({ success: true, data });
});
