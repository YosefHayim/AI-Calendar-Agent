import { google } from "googleapis";
import { CONFIG } from "../config/env-config";
import { Request, Response } from "express";
import fs from "fs";
import { CREDENTIALS_FILE_PATH } from "../config/paths";
import CREDENTIALS from "../CREDENTIALS.json";

const generateAuthUrl = async (req: Request, res: Response): Promise<any> => {
  const oauth2Client = new google.auth.OAuth2(CONFIG.client_id, CONFIG.client_secret, CONFIG.redirect_url);

  const code = req.query.code as string | undefined;

  // 1. No code yet: send user to consent screen
  if (!code) {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/calendar.events.owned.readonly",
        "https://www.googleapis.com/auth/calendar.events.owned",
        "https://www.googleapis.com/auth/calendar.freebusy",
      ],
    });
    return res.redirect(url);
  }

  try {
    // 2. Check if existing token is expired
    const now = Date.now();
    const isExpired = !CREDENTIALS.expiry_date || !CREDENTIALS.access_token || now >= CREDENTIALS.expiry_date;

    if (isExpired) {
      console.log("Access token expired or missing. Requesting new token...");

      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Save refreshed token
      fs.writeFileSync(CREDENTIALS_FILE_PATH, JSON.stringify(tokens, null, 2), "utf8");

      return res.status(200).json({
        status: "success",
        message: "New tokens received and stored.",
        tokens,
      });
    }

    // 3. Token still valid
    oauth2Client.setCredentials(CREDENTIALS);
    return res.status(200).json({
      status: "valid",
      message: "Existing token is still valid.",
    });
  } catch (error) {
    console.error("generateAuthUrl error:", error);
    return res.status(500).json({ error: "Failed to process OAuth token exchange." });
  }
};

export default generateAuthUrl;
