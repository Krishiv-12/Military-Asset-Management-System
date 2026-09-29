import { asyncHandler } from "../../utils/asyncHandler.js";
import * as inventoryService from "./inventory.service.js";

export const list = asyncHandler(async (req, res) => {
  const data = await inventoryService.listInventory(req.user, req.query);
  res.json({ success: true, data });
});
