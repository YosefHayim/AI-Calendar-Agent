import { TOOLS_DESCIPRTION } from "./description-tools";
import { deleteEventParameters } from "./parameters-tools/delete-event-paramters";
import { eventTypeToolParameters } from "./parameters-tools/event-type-tool-parameters";
import { getCalendarEventTypes } from "./execeution-tools/get-calendar-types-execution";
import { getEventExecution } from "./execeution-tools/get-event-execution";
import { getEventParameters } from "./parameters-tools/get-event-paramters";
import { insertEventExeuction } from "./execeution-tools/insert-event-execution";
import { insertEventParameters } from "./parameters-tools/insert-event-parameters";
import { tool } from "@openai/agents";
import { updateEventParameters } from "./parameters-tools/update-event-paramters";

export const insertEventTool = tool({
  name: "insert_event_tool",
  description: TOOLS_DESCIPRTION.insertEvent,
  parameters: insertEventParameters,
  execute: insertEventExeuction,
  errorFunction: async (params, error) => {
    console.log("Params received: ", params);
    console.error(" Tool execution failed:", error);
    return "Failed to insert event. Please check event details or calendar API access.";
  },
});

export const getEventsTool = tool({
  name: "get_events_by_name_tool",
  description: TOOLS_DESCIPRTION.getEvent,
  parameters: getEventParameters,
  execute: getEventExecution,
  errorFunction: async (params, error) => {
    console.error(" Tool execution failed:", error);
    return "Failed to insert event. Please check event details or calendar API access.";
  },
});

export const updateEventTool = tool({
  name: "update_events_by_name_tool",
  description: TOOLS_DESCIPRTION.updateEvent,
  parameters: updateEventParameters,
  execute: getEventExecution,
  errorFunction: async (params, error) => {
    console.error(" Tool execution failed:", error);
    return "Failed to insert event. Please check event details or calendar API access.";
  },
});

export const deleteEventTool = tool({
  name: "delete_events_by_name_tool",
  description: TOOLS_DESCIPRTION.deleteEvent,
  parameters: deleteEventParameters,
  execute: getEventExecution,
  errorFunction: async (params, error) => {
    console.error(" Tool execution failed:", error);
    return "Failed to insert event. Please check event details or calendar API access.";
  },
});

export const calendarTypeTool = tool({
  name: "calendars_types_list_tool",
  description: TOOLS_DESCIPRTION.eventType,
  parameters: eventTypeToolParameters,
  errorFunction: async (params, error) => {
    console.error(" Tool execution failed:", error);
    return "Failed to determine event type. Please try again.";
  },
  execute: getCalendarEventTypes,
});
