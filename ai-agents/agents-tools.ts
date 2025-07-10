import { deleteEventToolDescription } from "./description-tools/delete-event-description";
import { getEventToolDescription } from "./description-tools/get-event-description";
import { insertEventExeuction } from "./execeution-tools/insert-event-execution";
import { insertEventParameters } from "./parameters-tools/insert-event-paramters";
import { insertEventToolDescription } from "./description-tools/insert-event-description";
import { tool } from "@openai/agents";
import { updateEventToolDescription } from "./description-tools/update-event-description";

export const insertEventTool = tool({
  name: "insert_event_tool",
  parameters: insertEventParameters,
  errorFunction: async (params, error) => {
    console.error(" Tool execution failed:", error);
    return "Failed to insert event. Please check event details or calendar API access.";
  },
  strict: true,
  description: insertEventToolDescription,
  execute: insertEventExeuction,
});

export const getEventsTool = tool({
  name: "get_events_by_name_tool",
  description: getEventToolDescription,
  parameters: {},
});

export const updateEventTool = tool({
  name: "update_events_by_name_tool",
  description: updateEventToolDescription,
});

export const deleteEventTool = tool({
  name: "delete_events_by_name_tool",
  description: deleteEventToolDescription,
  
});
