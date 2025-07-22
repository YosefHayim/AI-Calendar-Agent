import { Action } from "../../types";
import { asyncHandler } from "../../utils/async-handler";
import { handleEvents } from "../../utils/handler-calendar-event";

export const getEventExecution = asyncHandler(async (params: any) => {
  return handleEvents(Action.GET);
});
