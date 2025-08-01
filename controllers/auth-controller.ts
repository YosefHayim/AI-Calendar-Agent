// @ts-nocheck

import { CONFIG, SCOPES, oauth2Client, supabase } from "../config/root-config";

import { reqResAsyncHandler } from "../utils/async-handler";

const generateAuthUrl = reqResAsyncHandler(async (req, res) => {
  const code = req.query.code as string | undefined;
  const postman = req.headers["user-agent"];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    include_granted_scopes: true,
    redirect_uri: CONFIG.redirect_url,
  });

  // 1. No code yet: send user to consent screen
  if (!code) {
    // If from Postman, just send the URL back instead of redirecting
    if (postman?.includes("Postman")) {
      return res.status(200).send({ status: "success", url });
    }
    return res.redirect(url);
  }

  try {
    // 2. Check if existing token is expired
    const now = Date.now();

    if (now >= data.expiry_date) {
      console.log("Access token expired or missing. setting new tokens...");

      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const { data, error } = await supabase
        .from("calendars_users")
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
        return res.status(500).json({
          status: "error",
          message: "Failed to store new tokens.",
          error,
        });
      }

      return res.status(200).json({
        status: "success",
        message: "New tokens received and stored.",
        data,
      });
    }

    // 3. Token still valid
    oauth2Client.setCredentials(data!);
    return res.status(200).json({
      status: "valid",
      message: "Existing token is still valid.",
      data,
    });
  } catch (error) {
    console.error("generateAuthUrl error:", error);
    return res.status(500).json({ error: "Failed to process OAuth token exchange." });
  }
});

export default generateAuthUrl;
