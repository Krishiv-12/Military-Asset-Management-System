import { asyncHandler } from "../../utils/asyncHandler.js";
import * as basesService from "./bases.service.js";

export const list = asyncHandler(async (req, res) => {
  const data = await basesService.listBases();
  res.json({ success: true, data });
});
