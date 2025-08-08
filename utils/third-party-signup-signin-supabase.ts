import { CONFIG, SCOPES_STRING, SUPABASE } from "@/config/root-config";
import { PROVIDERS, STATUS_RESPONSE } from "@/types";
import { Request, Response } from "express";

import { asyncHandler } from "./async-handlers";
import sendR from "./send-response";

export const thirdPartySignInOrSignUp = asyncHandler(async (req: Request, res: Response, provider: PROVIDERS) => {
  const { data, error } = await SUPABASE.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: CONFIG.node_env === "production" ? CONFIG.redirect_url_prod : CONFIG.redirect_url_dev,
      scopes: SCOPES_STRING,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (data.url) {
    res.redirect(data.url);
  }

  if (error) {
    console.error("error received:", error);
    console.error("Error signing up user:", error);
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to sign up user.", error);
  }
});
