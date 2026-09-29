import { asyncHandler } from "../../utils/asyncHandler.js";
import * as expendituresService from "./expenditures.service.js";

export const create = asyncHandler(async (req, res) => {
  const data = await expendituresService.createExpenditure(req.user, req.body);
  res.status(201).json({ success: true, data });
});

export const list = asyncHandler(async (req, res) => {
  const data = await expendituresService.listExpenditures(req.user, req.query);
  res.json({ success: true, data });
});
