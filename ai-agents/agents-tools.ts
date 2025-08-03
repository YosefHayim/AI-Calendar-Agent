import { EVENT_PARAMETERS } from "@/parameters-tools";
import { EXECUTION_TOOLS } from "@/execution-tools";
import { TOOLS_DESCRIPTION } from "@/description-tools";
import { tool } from "@openai/agents";

export const AGENT_TOOLS = {
  insert_event: tool({
    name: "insert_event",
    description: TOOLS_DESCRIPTION.insertEvent,
    parameters: EVENT_PARAMETERS.insertEventParameters,
    execute: EXECUTION_TOOLS.insertEvent,
    errorFunction: async (params, error) => {
      return `Failed to insert event. Please check event details or calendar API access. Error: ${error}`;
    },
  } as const),
  get_event: tool({
    name: "get_event",
    description: TOOLS_DESCRIPTION.getEvent,
    parameters: EVENT_PARAMETERS.getEventParameters,
    execute: EXECUTION_TOOLS.getEvent,
    errorFunction: async (_, error) => {
      return `Failed to get event. Please check event details. Error: ${error}`;
    },
  } as const),
  update_event: tool({
    name: "update_event",
    description: TOOLS_DESCRIPTION.updateEvent,
    parameters: EVENT_PARAMETERS.updateEventParameters,
    execute: EXECUTION_TOOLS.updateEvent,
    errorFunction: async (_, error) => {
      return `Failed to update event. Please check event details. Error: ${error}`;
    },
  } as const),
  delete_event: tool({
    name: "delete_event",
    description: TOOLS_DESCRIPTION.deleteEvent,
    parameters: EVENT_PARAMETERS.deleteEventParameters,
    execute: EXECUTION_TOOLS.deleteEvent,
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
    execute: EXECUTION_TOOLS.getCalendarTypes,
  } as const),
  event_type: tool({
    name: "event_type",
    description: TOOLS_DESCRIPTION.eventType,
    parameters: EVENT_PARAMETERS.getEventParameters,
    execute: EXECUTION_TOOLS.getCalendarTypes,
  } as const),
};
