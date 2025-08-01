import { EVENT_PARAMETERS } from "./parameters-tools";
import { TOOLS_DESCRIPTION } from "./description-tools";
import { deleteEventExecution } from "./execution-tools/delete-event-execution";
import { getCalendarEventTypes } from "./execution-tools/get-calendar-types-execution";
import { getEventExecution } from "./execution-tools/get-event-execution";
import { insertEventExecution } from "./execution-tools/insert-event-execution";
import { tool } from "@openai/agents";
import { updateEventExecution } from "./execution-tools/update-event-execution";

export const AGENT_TOOLS = {
  insert_event: tool({
    name: "insert_event",
    description: TOOLS_DESCRIPTION.insertEvent,
    parameters: EVENT_PARAMETERS.insertEventParameters,
    execute: insertEventExecution,
    errorFunction: async (params, error) => {
      return `Failed to insert event. Please check event details or calendar API access. Error: ${error}`;
    },
  } as const),
  get_event: tool({
    name: "get_event",
    description: TOOLS_DESCRIPTION.getEvent,
    parameters: EVENT_PARAMETERS.getEventParameters,
    execute: getEventExecution,
    errorFunction: async (_, error) => {
      return `Failed to get event. Please check event details. Error: ${error}`;
    },
  } as const),
  update_event: tool({
    name: "update_event",
    description: TOOLS_DESCRIPTION.updateEvent,
    parameters: EVENT_PARAMETERS.updateEventParameters,
    execute: updateEventExecution,
    errorFunction: async (_, error) => {
      return `Failed to update event. Please check event details. Error: ${error}`;
    },
  } as const),
  delete_event: tool({
    name: "delete_event",
    description: TOOLS_DESCRIPTION.deleteEvent,
    parameters: EVENT_PARAMETERS.deleteEventParameters,
    execute: deleteEventExecution,
    errorFunction: async (_, error) => {
      return `Failed to delete event. Please check event details or calendar API access. Error: ${error}`;
    },
  } as const),
  calendar_type: tool({
    name: "calendar_type",
    description: TOOLS_DESCRIPTION.eventType,
    parameters: EVENT_PARAMETERS.getEventParameters,
    errorFunction: async (_, error) => {
      return `Failed to determine event type. Please try again. Error: ${error}`;
    },
    execute: getCalendarEventTypes,
  } as const),
  event_type: tool({
    name: "event_type",
    description: TOOLS_DESCRIPTION.eventType,
    parameters: EVENT_PARAMETERS.getEventParameters,
    execute: getCalendarEventTypes,
  } as const),
};
