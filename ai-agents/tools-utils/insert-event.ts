import { calendar, requestConfigBase } from "../../config/root-config";

import { GaxiosPromise } from "googleapis/build/src/apis/abusiveexperiencereport";
import { asyncHandler } from "../../utils/async-handler";
import { calendar_v3 } from "googleapis";

export const insertEventFn = asyncHandler(async (eventData: calendar_v3.Schema$Event): Promise<calendar_v3.Schema$Event> => {
  console.log("Event input received from agent:", eventData);

  const r = await calendar.events.insert({
    ...requestConfigBase,
    requestBody: eventData,
  });

  console.log("Event successfully inserted:", r.data);
  return r.data;
});
