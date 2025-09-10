import type { User } from "@supabase/supabase-js";
import type { NextFunction, Request, Response } from "express";
import { SUPABASE } from "@/config/root-config";
import { STATUS_RESPONSE } from "@/types";
import { asyncHandler } from "@/utils/async-handlers";
import sendR from "@/utils/send-response";

export const authHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Missing authorization in headers: ", token);
  }

  const {
    data: { user },
  } = await SUPABASE.auth.getUser(token);

  if (!user) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User is not authenticated.");
  }

  (req as Request & { user: User }).user = user;
  next();
});
