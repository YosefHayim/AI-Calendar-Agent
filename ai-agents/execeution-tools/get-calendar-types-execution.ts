import { asyncHandler } from "../../utils/async-handler";
import { calendar } from "../../config/root-config";

export const getCalendarEventTypes = asyncHandler(async (params: any) => {
  const r = calendar.calendarList.list();
  const allCalendars = (await r).data.items?.map((item) => item.summary);
  console.log("Calendars typeps received: ", allCalendars);
  return allCalendars;
});
