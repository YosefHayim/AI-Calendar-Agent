import { OAUTH2CLIENT } from "@/config/root-config";
import { asyncHandler } from "./async-handler";
import { google } from "googleapis";
import { tokens } from "@/types";

export const setAuthSpecificUserAndCalendar = asyncHandler(async (tokens: tokens) => {
  OAUTH2CLIENT.setCredentials(tokens);
  const calendar = google.calendar({ version: "v3", auth: OAUTH2CLIENT });
  return calendar;
});
