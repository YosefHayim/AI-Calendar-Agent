import { ACTION, TIMEZONE } from "@/types";

import { CALENDAR } from "@/config/root-config";
import { asyncHandler } from "@/utils/async-handler";
import { calendar_v3 } from "googleapis";
import errorTemplate from "@/utils/error-template";
import { handleEvents } from "@/utils/handle-events";

export const EXECUTION_TOOLS = {
  updateEvent: asyncHandler(async (params: any) => {
    if (!params.start?.dateTime || !params.end?.dateTime) {
      errorTemplate("Missing dates of start and end!", 404);
    }

    const startDate = new Date(params.start.dateTime);
    const endDate = new Date(params.end.dateTime);

    const eventData: calendar_v3.Schema$Event = {
      summary: params.summary,
      description: params.description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: params.start.timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: params.end?.timeZone || params.start.timeZone,
      },
    };

    return handleEvents(ACTION.UPDATE, eventData);
  }),
  insertEvent: asyncHandler(async (params: any) => {
    if (!params.start?.dateTime || !params.end?.dateTime) errorTemplate("Missing dates of start and end!", 404);
    if (params.start.timeZone !== params.end.timeZone && !(params.start.timeZone in TIMEZONE && params.end.timeZone in TIMEZONE))
      errorTemplate("Time zones must match!", 404);

    const startDate = new Date(params.start.dateTime);
    const endDate = new Date(params.end.dateTime);

    const eventData: calendar_v3.Schema$Event = {
      summary: params.summary,
      description: params.description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: params.start.timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: params.end?.timeZone,
      },
    };

    return handleEvents(ACTION.INSERT, eventData);
  }),
  getEvent: asyncHandler(async (params: any) => {
    handleEvents(ACTION.GET);
  }),
  getCalendarTypes: asyncHandler(async (params: any) => {
    const r = await CALENDAR.calendarList.list();
    const allCalendars = r.data.items?.map((item) => item.summary);
    return allCalendars;
  }),
  deleteEvent: asyncHandler(async (params: any) => {
    if (!params.start?.dateTime || !params.end?.dateTime) errorTemplate("Missing dates of start and end!", 404);
    if (!params.summary) errorTemplate("Missing event summary!", 404);
    if (params.start.timeZone !== params.end.timeZone && !(params.start.timeZone in TIMEZONE && params.end.timeZone in TIMEZONE))
      errorTemplate("Time zones must match!", 404);

    const startDate = new Date(params.start.dateTime);
    const endDate = new Date(params.end.dateTime);

    const eventData: calendar_v3.Schema$Event = {
      summary: params.summary,
      description: params.description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: params.start.timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: params.end.timeZone,
      },
    };

    return handleEvents(ACTION.DELETE, eventData);
  }),
};
