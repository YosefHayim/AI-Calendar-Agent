import { Action } from "../../types";
import { calendar_v3 } from "googleapis";
import { handleEvents } from "../../utils/handler-calendar-event";

export const insertEventExeuction = async (params: any) => {
  console.log("Params received to insert event tool:", params);

  const startDate = new Date(params.start.dateTime);
  const endDate = params.end ? new Date(params.end.dateTime) : new Date(startDate.getTime() + 60 * 60 * 1000);

  const eventData: calendar_v3.Schema$Event = {
    summary: params.summary,
    description: params.description ?? "",
    start: {
      dateTime: startDate.toISOString(),
      timeZone: params.start.timeZone,
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: params.end?.timeZone || params.start.timeZone,
    },
  };

  return handleEvents(Action.INSERT, eventData);
};
