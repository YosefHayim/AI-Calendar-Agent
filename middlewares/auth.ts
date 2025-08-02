import { NextFunction, Request, Response } from "express";

import { STATUS_RESPONSE } from "../types";
import { SUPABASE } from "../config/root-config";
import { UserResponse } from "@supabase/supabase-js";
import { asyncHandler } from "../utils/async-handler";
import sendR from "../utils/sendR";

export const authHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return sendR(res)(STATUS_RESPONSE.UNAUTHORIZED, "Token is missing in authorization headers.");

  const {
    data: { user },
  } = await SUPABASE.auth.getUser(token);

  if (!user) return sendR(res)(STATUS_RESPONSE.UNAUTHORIZED, "User is not authenticated.");

  (req as Request & { user: UserResponse["data"]["user"] }).user = user;
  console.log(`User that has been pass the auth middleware: ${user.email}`);
  next();
});
