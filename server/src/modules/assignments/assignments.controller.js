import { asyncHandler } from "../../utils/asyncHandler.js";
import * as assignmentsService from "./assignments.service.js";

export const create = asyncHandler(async (req, res) => {
  const data = await assignmentsService.createAssignment(req.user, req.body);
  res.status(201).json({ success: true, data });
});

export const list = asyncHandler(async (req, res) => {
  const data = await assignmentsService.listAssignments(req.user, req.query);
  res.json({ success: true, data });
});
