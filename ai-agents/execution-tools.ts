import { ACTION, TIMEZONE } from "@/types";

import { CALENDAR } from "@/config/root-config";
import { asyncHandler } from "@/utils/async-handlers";
import { calendar_v3 } from "googleapis";
import errorTemplate from "@/utils/error-template";
import { getUserCalendarTokens } from "@/utils/get-user-calendar-tokens";
import { handleEvents } from "@/utils/handle-events";

export const executionTools = {
  validateUser: asyncHandler(async (params: { email: string }) => {
    const tokens = await getUserCalendarTokens(params.email);
    return tokens;
  }),
  updateEvent: asyncHandler(async (params: calendar_v3.Schema$Event) => {
    if (!params.start?.dateTime || !params.end?.dateTime) {
      errorTemplate("Missing dates of start and end!", 404);
    }

    const startDate = new Date(params.start?.dateTime!);
    const endDate = new Date(params.end?.dateTime!);

    const eventData: calendar_v3.Schema$Event = {
      summary: params.summary,
      description: params.description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: params.start?.timeZone,
        date: startDate.toISOString().split("T")[0],
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: params.end?.timeZone || params.start?.timeZone,
        date: endDate.toISOString().split("T")[0],
      },
    };

    return handleEvents(ACTION.UPDATE, eventData);
  }),
  insertEvent: asyncHandler(async (params: calendar_v3.Schema$Event) => {
    if (!params.start?.dateTime || !params.end?.dateTime) errorTemplate("Missing dates of start and end!", 404);
    if (params.start?.timeZone !== params.end?.timeZone && !(params.start?.timeZone! in TIMEZONE && params?.end?.timeZone! in TIMEZONE))
      errorTemplate("Time zones must match!", 404);

    const startDate = new Date(params.start?.dateTime!);
    const endDate = new Date(params.end?.dateTime!);

    const eventData: calendar_v3.Schema$Event = {
      summary: params.summary,
      description: params.description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: params?.start?.timeZone,
        date: startDate.toISOString().split("T")[0],
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: params.end?.timeZone,
        date: endDate.toISOString().split("T")[0],
      },
    };

    return handleEvents(ACTION.INSERT, eventData);
  }),
  getEvent: asyncHandler(async () => {
    handleEvents(ACTION.GET);
  }),
  getCalendarTypes: asyncHandler(async () => {
    const r = await CALENDAR.calendarList.list();
    const allCalendars = r.data.items?.map((item) => item.summary);
    return allCalendars;
  }),
  deleteEvent: asyncHandler(async (params: calendar_v3.Params$Resource$Events$Delete) => {
    if (!params.eventId) errorTemplate("Missing event id!", 404);

    return handleEvents(ACTION.DELETE, params.eventId);
  }),
};
