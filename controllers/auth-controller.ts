import { CONFIG, SCOPES, credentials_file_path, oauth2Client } from "../config/root-config";

import credentials from "../credentials.json";
import fs from "fs";
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

    if (now >= credentials.expiry_date) {
      console.log("Access token expired or missing. setting new tokens...");

      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      fs.writeFileSync(credentials_file_path, JSON.stringify(tokens), "utf8");

      return res.status(200).json({
        status: "success",
        message: "New tokens received and stored.",
        tokens,
      });
    }

    // 3. Token still valid
    oauth2Client.setCredentials(credentials);
    return res.status(200).json({
      status: "valid",
      message: "Existing token is still valid.",
    });
  } catch (error) {
    console.error("generateAuthUrl error:", error);
    return res.status(500).json({ error: "Failed to process OAuth token exchange." });
  }
});

export default generateAuthUrl;
