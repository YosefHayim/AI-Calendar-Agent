import { google } from "googleapis";
import { CONFIG } from "../config";
import { Request, Response } from "express";
import fs from "fs";

const generateAuthUrl = async (req: Request, res: Response) => {
  const oauth2Client = new google.auth.OAuth2(CONFIG.client_id, CONFIG.client_secret, CONFIG.redirect_url);
  const code = req.query.code as string | undefined;

  try {
    if (!code) {
      const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
          "https://www.googleapis.com/auth/calendar.events.owned.readonly",
          "https://www.googleapis.com/auth/calendar.events.owned",
          "https://www.googleapis.com/auth/calendar.freebusy",
        ],
      });
      res.redirect(url);
      return;
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    fs.writeFileSync("../CREDENTAILS.JSON", JSON.stringify(tokens), { encoding: "utf8" });
    console.log("tokens written to file successfully.");
  } catch (error) {
    console.error("generateAuthUrl fn: ", error);
    res.status(500).send("Failed to exchange code for tokens.");
  }
};

export default generateAuthUrl;
