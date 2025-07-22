import { Action } from "../../types";
import { calendar_v3 } from "googleapis";
import errorTemplate from "../../utils/error-template";
import { handleEvents } from "../../utils/handler-calendar-event";

export const insertEventExeuction = async (params: any) => {
  console.log("Params received to insert event tool:", params);

  if (!params.start?.dateTime || !params.end?.dateTime) errorTemplate("Missing dates of start and end!", 404);
  if (!params.summary) errorTemplate("Missing event summary!", 404);
  if (params.start.timeZone !== params.end.timeZone) errorTemplate("Time zones must match!", 404);

  const startDate = new Date(params.start.dateTime);
  const endDate = params.end ? new Date(params.end.dateTime) : new Date(startDate.getTime() + 60 * 60 * 1000);

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

  return handleEvents(Action.INSERT, eventData);
};
