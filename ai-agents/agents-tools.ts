import { Database } from "@/database.types";
import { TOOLS_DESCRIPTION } from "./description-tools";
import { eventParameters } from "./parameters-tools";
import { executionTools } from "./execution-tools";
import { tool } from "@openai/agents";

export const AGENT_TOOLS = {
  validate_user_db: tool({
    name: "validate_user",
    description: TOOLS_DESCRIPTION.validateUser,
    parameters: eventParameters.validateUserDbParameters,
    execute: executionTools.validateUser,
    errorFunction: async (params, error) => {
      return `Failed to validate user from database query Error: ${error}`;
    },
  }),
  validate_event_fields: tool({
    name: "validate_event_fields",
    description: "Validate/normalize summary, date/time, and duration; output RFC3339.",
    parameters: eventParameters.insertEventParameters,
    execute: executionTools.validateEventFields,
  }),
  insert_event: tool({
    name: "insert_event",
    description: TOOLS_DESCRIPTION.insertEvent,
    parameters: eventParameters.insertEventParameters,
    execute: executionTools.insertEvent,
    errorFunction: async (params, error) => {
      return `Failed to insert event. Please check event details or calendar API access. Error: ${error}`;
    },
  } as const),
  get_event: tool({
    name: "get_event",
    description: TOOLS_DESCRIPTION.getEvent,
    parameters: eventParameters.getEventParameters,
    execute: executionTools.getEvent,
    errorFunction: async (_, error) => {
      return `Failed to get event. Please check event details. Error: ${error}`;
    },
  } as const),
  update_event: tool({
    name: "update_event",
    description: TOOLS_DESCRIPTION.updateEvent,
    parameters: eventParameters.updateEventParameters,
    execute: executionTools.updateEvent,
    errorFunction: async (_, error) => {
      return `Failed to update event. Please check event details. Error: ${error}`;
    },
  } as const),
  delete_event: tool({
    name: "delete_event",
    description: TOOLS_DESCRIPTION.deleteEvent,
    parameters: eventParameters.deleteEventParameters,
    execute: executionTools.deleteEvent,
    errorFunction: async (_, error) => {
      return `Failed to delete event. Please check event details or calendar API access. Error: ${error}`;
    },
  } as const),
  calendar_type: tool({
    name: "calendar_type",
    description: TOOLS_DESCRIPTION.eventType,
    parameters: eventParameters.getEventParameters,
    errorFunction: async (_, error) => {
      return `Failed to determine event type. Please try again. Error: ${error}`;
    },
    execute: executionTools.getCalendarTypes,
  } as const),

  event_type: tool({
    name: "event_type",
    description: TOOLS_DESCRIPTION.eventType,
    parameters: eventParameters.getEventParameters,
    execute: executionTools.getCalendarTypes,
  } as const),
};
