import { ACTION, SCHEMA_EVENT_PROPS, STATUS_RESPONSE } from "@/types";
import { SUPABASE, requestConfigBase } from "@/config/root-config";

import { Request } from "express";
import { TOKEN_FIELDS } from "./storage";
import { User } from "@supabase/supabase-js";
import { asyncHandler } from "./async-handler";
import errorTemplate from "./error-template";
import { getEventDurationString } from "./get-event-duration-string";
import { setAuthSpecificUserAndCalendar } from "./set-credentials-oauth-specific-user";

export const handleEvents = asyncHandler(async (req: Request, action: ACTION, eventData?: SCHEMA_EVENT_PROPS, extra?: Object): Promise<any> => {
  const user = (req as Request & { user: User }).user;

  const { data, error } = await SUPABASE.from("calendars_of_users").select(TOKEN_FIELDS).eq("email", user.email!);

  if (error) {
    return console.error(`Error occurred durning handle event fn: ${error}`);
  }

  const calendar = await setAuthSpecificUserAndCalendar(data[0]);
  const calendarEvents = calendar.events;
  let r;

  if ((action === ACTION.UPDATE && !eventData?.id) || (action === ACTION.DELETE && eventData?.id)) {
    return errorTemplate("Event ID is required for update or delete action", STATUS_RESPONSE.BAD_REQUEST);
  }

  switch (action) {
    case ACTION.GET:
      const events = await calendarEvents.list({
        ...requestConfigBase,
        prettyPrint: true,
        maxResults: 2500,
        ...extra,
      });
      r = events.data.items
        ?.map((event: any) => {
          return {
            eventId: event.id,
            summary: event.summary,
            durationOfEvent: getEventDurationString(event.start.date || event.start?.dateTime, event.end.date || event.end?.dateTime),
            description: event.description,
            location: event.location,
          };
        })
        .sort((a: any, b: any) => {
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
      errorTemplate("Unsupported calendar action", STATUS_RESPONSE.BAD_REQUEST);
  }
  console.log(`Calendar action: ${action}, Result:`, r);
  return r;
});
