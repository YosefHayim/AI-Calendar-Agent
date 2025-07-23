import { asyncHandler } from "../../utils/async-handler";
import { calendar } from "../../config/root-config";

export const getCalendarEventTypes = asyncHandler(async () => {
  const r = await calendar.calendarList.get({ alt: "json", prettyPrint: true });
  console.log(`All calendars that has been found about the user:\n${r.data}`);
  return r;
});
