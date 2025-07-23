import { deleteEventParameters } from "./parameters-tools/delete-event-paramters";
import { deleteEventToolDescription } from "./description-tools/delete-event-description";
import { eventTypeToolDescription } from "./description-tools/event-type-tool";
import { eventTypeToolParameters } from "./parameters-tools/event-type-tool-parameters";
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
  execute: insertEventExeuction,
  errorFunction: async (params, error) => {
    console.log("Params received: ", params);
    console.error(" Tool execution failed:", error);
    return "Failed to insert event. Please check event details or calendar API access.";
  },
  strict: true,
});

export const getEventsTool = tool({
  name: "get_events_by_name_tool",
  description: getEventToolDescription,
  parameters: getEventParameters,
  execute: getEventExecution,
  errorFunction: async (params, error) => {
    console.error(" Tool execution failed:", error);
    return "Failed to insert event. Please check event details or calendar API access.";
  },
  strict: true,
});

export const updateEventTool = tool({
  name: "update_events_by_name_tool",
  description: updateEventToolDescription,
  parameters: updateEventParameters,
  execute: getEventExecution,
  errorFunction: async (params, error) => {
    console.error(" Tool execution failed:", error);
    return "Failed to insert event. Please check event details or calendar API access.";
  },
  strict: true,
});

export const deleteEventTool = tool({
  name: "delete_events_by_name_tool",
  description: deleteEventToolDescription,
  parameters: deleteEventParameters,
  execute: getEventExecution,
  errorFunction: async (params, error) => {
    console.error(" Tool execution failed:", error);
    return "Failed to insert event. Please check event details or calendar API access.";
  },
  strict: true,
});

export const eventTypeTool = tool({
  name: "event_type_tool",
  description: eventTypeToolDescription,
  parameters: eventTypeToolParameters,
  errorFunction: async (params, error) => {
    console.error(" Tool execution failed:", error);
    return "Failed to determine event type. Please try again.";
  },
  execute: async (params) => {
    console.log("Event type tool executed with params:", params);
    return "Event type determined successfully.";
  },
  strict: true,
});
