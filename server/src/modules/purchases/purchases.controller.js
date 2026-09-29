import { asyncHandler } from "../../utils/asyncHandler.js";
import * as purchasesService from "./purchases.service.js";

export const create = asyncHandler(async (req, res) => {
  const data = await purchasesService.createPurchase(req.user, req.body);
  res.status(201).json({ success: true, data });
});

export const list = asyncHandler(async (req, res) => {
  const data = await purchasesService.listPurchases(req.user, req.query);
  res.json({ success: true, data });
});
