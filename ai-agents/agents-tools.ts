import { deleteEventParameters } from "./parameters-tools/delete-event-paramters";
import { deleteEventToolDescription } from "./description-tools/delete-event-description";
import { getEventExecution } from "./execeution-tools/get-event-execution";
import { getEventParameters } from "./parameters-tools/get-event-paramters";
import { getEventToolDescription } from "./description-tools/get-event-description";
import { insertEventExeuction } from "./execeution-tools/insert-event-execution";
import { insertEventParameters } from "./parameters-tools/insert-event-parameters";
import { insertEventToolDescription } from "./description-tools/insert-event-description";
import { tool } from "@openai/agents";
import { updateEventParameters } from "./parameters-tools/update-event-paramters";
import { updateEventToolDescription } from "./description-tools/update-event-description";

export const insertEventTool = tool({
  name: "insert_event_tool",
  description: insertEventToolDescription,
  parameters: insertEventParameters,
  errorFunction: async (params, error) => {
    console.error(" Tool execution failed:", error);
    return "Failed to insert event. Please check event details or calendar API access.";
  },
  strict: true,
  execute: insertEventExeuction,
});

export const getEventsTool = tool({
  name: "get_events_by_name_tool",
  description: getEventToolDescription,
  parameters: getEventParameters,
  errorFunction: async (params, error) => {
    console.error(" Tool execution failed:", error);
    return "Failed to insert event. Please check event details or calendar API access.";
  },
  execute: getEventExecution,
});

export const updateEventTool = tool({
  name: "update_events_by_name_tool",
  description: updateEventToolDescription,
  parameters: updateEventParameters,
  errorFunction: async (params, error) => {
    console.error(" Tool execution failed:", error);
    return "Failed to insert event. Please check event details or calendar API access.";
  },
  execute: getEventExecution,
});

export const deleteEventTool = tool({
  name: "delete_events_by_name_tool",
  parameters: deleteEventParameters,
  execute: getEventExecution,
  errorFunction: async (params, error) => {
    console.error(" Tool execution failed:", error);
    return "Failed to insert event. Please check event details or calendar API access.";
  },
  description: deleteEventToolDescription,
});
