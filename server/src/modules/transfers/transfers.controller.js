import { asyncHandler } from "../../utils/asyncHandler.js";
import * as transfersService from "./transfers.service.js";

export const create = asyncHandler(async (req, res) => {
  const data = await transfersService.createTransfer(req.user, req.body);
  res.status(201).json({ success: true, data });
});

export const list = asyncHandler(async (req, res) => {
  const data = await transfersService.listTransfers(req.user, req.query);
  res.json({ success: true, data });
});

export const getById = asyncHandler(async (req, res) => {
  const data = await transfersService.getTransferById(req.user, req.params.id);
  res.json({ success: true, data });
});
