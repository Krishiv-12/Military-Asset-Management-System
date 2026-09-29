import { asyncHandler } from "../../utils/asyncHandler.js";
import * as equipmentService from "./equipment.service.js";

export const list = asyncHandler(async (req, res) => {
  const data = await equipmentService.listEquipmentTypes();
  res.json({ success: true, data });
});
