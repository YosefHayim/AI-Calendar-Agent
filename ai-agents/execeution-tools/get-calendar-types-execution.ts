import { asyncHandler } from "../../utils/async-handler";
import { calendar } from "../../config/root-config";

export const getCalendarEventTypes = asyncHandler(async () => {
  console.log("Fetching calendar event types...");
  const r = await calendar.calendarList.list();
  console.log("Calendar items", r.data);
  if (!r) return "No calendars has been found for the user";
  const allCalendars = r.data.items?.map((item) => item.summary);
  return allCalendars;
});
