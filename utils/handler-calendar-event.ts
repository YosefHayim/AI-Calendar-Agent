import { ACTION, SCHEMA_EVENT_PROPS } from "../types";
import { calendar, requestConfigBase } from "../config/root-config";

import { asyncHandler } from "./async-handler";
import errorTemplate from "./error-template";
import formatDate from "./formatDate";

export const handleEvents = asyncHandler(async (action: ACTION, eventData?: SCHEMA_EVENT_PROPS, extra?: Object): Promise<any> => {
  const calendarEvents = calendar.events;
  let r;

  if ((ACTION.UPDATE && !eventData?.id) || (ACTION.DELETE && eventData?.id)) {
    return errorTemplate("Event ID is required for update or delete action", 400);
  }

  switch (action) {
    case ACTION.GET:
      const events = await calendarEvents.list({
        ...requestConfigBase,
        timeMin: new Date().toISOString(),
        prettyPrint: true,
        ...extra,
      });
      r = events.data.items
        ?.map((event) => {
          return {
            eventId: event.id,
            summary: event.summary,
            start: formatDate(event.start?.date || event.start?.dateTime),
            end: formatDate(event.end?.date || event.end?.dateTime),

            description: event.description,
            location: event.location,
          };
        })
        .sort((a, b) => {
          return new Date(a.start).getTime() - new Date(b.start).getTime();
        });
      break;

    case ACTION.INSERT:
      r = await calendarEvents.insert({
        ...requestConfigBase,
        requestBody: eventData,
      });
      break;

    case ACTION.UPDATE:
      r = await calendarEvents.update({
        ...requestConfigBase,
        eventId: eventData?.id!,
        requestBody: eventData,
      });
      break;

    case ACTION.DELETE:
      r = await calendarEvents.delete({
        ...requestConfigBase,
        eventId: eventData?.id!,
      });
      break;

    default:
      errorTemplate("Unsupported calendar action", 400);
  }
  console.log(`Calendar action: ${action}, Result:`, r);
  return r;
});
