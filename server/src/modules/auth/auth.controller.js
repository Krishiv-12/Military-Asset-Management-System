import { asyncHandler } from "../../utils/asyncHandler.js";
import { env } from "../../config/env.js";
import * as authService from "./auth.service.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { token, user } = await authService.login(email, password);
  res.cookie(env.cookieName, token, authService.cookieOptions());
  res.json({ success: true, data: { user } });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user);
  res.clearCookie(env.cookieName, { ...authService.cookieOptions(), maxAge: 0 });
  res.json({ success: true, message: "Logged out" });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});
