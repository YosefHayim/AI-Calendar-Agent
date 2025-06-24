import { google } from "googleapis";
import CREDENTIALS from "../CREDENTIALS.json";
import { oauth2Client } from "../config/oauth-config";
import { asyncHandler } from "../utils/async-handler";
import throwHttpError from "../utils/error-template";

const getAllCalendars = asyncHandler(async (req, res) => {
  if (!CREDENTIALS.access_token) throwHttpError("No access token. Authenticate first.", 401);

  oauth2Client.setCredentials(CREDENTIALS);
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const result = await calendar.calendarList.list();
  res.status(200).json({ status: "success", data: result.data });
});

const createEvent = asyncHandler(async (req, res) => {});

const calendarController = {
  getAllCalendars,
  createEvent,
};

export default calendarController;
