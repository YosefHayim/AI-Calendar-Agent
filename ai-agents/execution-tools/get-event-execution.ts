import { ACTION } from "../../types";
import { asyncHandler } from "../../utils/async-handler";
import { handleEvents } from "../../utils/handle-events";

export const getEventExecution = asyncHandler(async (params: any) => {
  return handleEvents(ACTION.GET);
});
