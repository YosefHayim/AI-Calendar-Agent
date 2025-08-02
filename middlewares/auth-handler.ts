import { NextFunction, Request, Response } from "express";

import { STATUS_RESPONSE } from "../types";
import { SUPABASE } from "../config/root-config";
import { User } from "@supabase/supabase-js";
import { asyncHandler } from "../utils/async-handler";
import sendR from "../utils/send-response";

export const authHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return sendR(res)(STATUS_RESPONSE.UNAUTHORIZED, "Missing access token.");

  const {
    data: { user },
  } = await SUPABASE.auth.getUser(token);

  if (!user) return sendR(res)(STATUS_RESPONSE.UNAUTHORIZED, "User is not authenticated.");

  (req as Request & { user: User }).user = user;
  console.log(`Current user: ${user.email}`);
  next();
});
