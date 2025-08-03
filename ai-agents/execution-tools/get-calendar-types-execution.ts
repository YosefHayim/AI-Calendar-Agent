import { CALENDAR } from "../../config/root-config";
import { asyncHandler } from "../../utils/async-handler";

export const getCalendarEventTypes = asyncHandler(async (params: any) => {
  const r = CALENDAR.calendarList.list();
  const allCalendars = (await r).data.items?.map((item) => item.summary);
  return allCalendars;
});
