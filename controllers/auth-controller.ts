// @ts-nocheck

import { CONFIG, OAUTH2CLIENT, SCOPES, SUPABASE } from "../config/root-config";

import { STATUS_RESPONSE } from "../types";
import { reqResAsyncHandler } from "../utils/async-handler";
import sendR from "../utils/sendR";

const generateAuthUrl = reqResAsyncHandler(async (req, res) => {
  const code = req.query.code as string | undefined;
  const postman = req.headers["user-agent"];

  const url = OAUTH2CLIENT.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    include_granted_scopes: true,
    redirect_uri: CONFIG.node_env === "production" ? CONFIG.redirect_url_prod : CONFIG.redirect_url_dev,
  });

  // 1. No code yet: send user to consent screen
  if (!code) {
    // If from Postman, just send the URL back instead of redirecting
    if (postman?.includes("Postman")) {
      sendR(res)(STATUS_RESPONSE.SUCCESS, url);
    }
    return res.redirect(url);
  }

  try {
    // 2. Check if existing token is expired
    const now = Date.now();

    console.log("Access token expired or missing. setting new tokens...");

    const { tokens } = await OAUTH2CLIENT.getToken(code);
    console.log("New tokens received:", tokens);
    OAUTH2CLIENT.setCredentials(tokens);

    const { data, error } = await SUPABASE.from("calendars_users")
      .insert({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scopes: tokens.scope,
        token_type: tokens.token_type,
        refresh_expiry: tokens.refresh_token_expires_in,
        expiry_date: tokens.expiry_date,
      })
      .eq("user_id", req.user.id)
      .select();

    if (error) {
      console.error("Error inserting tokens into database:", error);
      sendR(res)(STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to store new tokens.", error);
    }

    // 3. Token still valid
    OAUTH2CLIENT.setCredentials(data!);
    sendR(res)(STATUS_RESPONSE.SUCCESS, "Exisiting token is still valid.", data);
  } catch (error) {
    console.error("generateAuthUrl error:", error);
    sendR(res)(STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to process OAuth token exchange.", error);
  }
});

export default generateAuthUrl;
