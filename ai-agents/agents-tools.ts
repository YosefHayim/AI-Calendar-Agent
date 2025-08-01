import { EVENT_PARAMETERS } from "./parameters-tools";
import { TOOLS_DESCRIPTION } from "./description-tools";
import { deleteEventExecution } from "./execution-tools/delete-event-execution";
import { getCalendarEventTypes } from "./execution-tools/get-calendar-types-execution";
import { getEventExecution } from "./execution-tools/get-event-execution";
import { insertEventExecution } from "./execution-tools/insert-event-execution";
import { tool } from "@openai/agents";
import { updateEventExecution } from "./execution-tools/update-event-execution";

export const AGENT_TOOLS = {
  insertEvent: tool({
    name: "Insert event by event parameters",
    description: TOOLS_DESCRIPTION.insertEvent,
    parameters: EVENT_PARAMETERS.insertEventParameters,
    execute: insertEventExecution,
    errorFunction: async (params, error) => {
      return `Failed to insert event. Please check event details or calendar API access. Error: ${error}`;
    },
  }),
  getEvent: tool({
    name: "Get event by event Id ",
    description: TOOLS_DESCRIPTION.getEvent,
    parameters: EVENT_PARAMETERS.getEventParameters,
    execute: getEventExecution,
    errorFunction: async (_, error) => {
      return `Failed to get event. Please check event details. Error: ${error}`;
    },
  }),
  updateEvent: tool({
    name: "Update event by event id",
    description: TOOLS_DESCRIPTION.updateEvent,
    parameters: EVENT_PARAMETERS.updateEventParameters,
    execute: updateEventExecution,
    errorFunction: async (_, error) => {
      return `Failed to update event. Please check event details. Error: ${error}`;
    },
  }),
  deleteEvent: tool({
    name: "Delete event by event id",
    description: TOOLS_DESCRIPTION.deleteEvent,
    parameters: EVENT_PARAMETERS.deleteEventParameters,
    execute: deleteEventExecution,
    errorFunction: async (_, error) => {
      return `Failed to delete event. Please check event details or calendar API access. Error: ${error}`;
    },
  }),
  calendarType: tool({
    name: "Get the calendars type list",
    description: TOOLS_DESCRIPTION.eventType,
    parameters: EVENT_PARAMETERS.getEventParameters,
    errorFunction: async (_, error) => {
      return `Failed to determine event type. Please try again. Error: ${error}`;
    },
    execute: getCalendarEventTypes,
  }),
  eventType: tool({
    name: "Returns the event type",
    description: TOOLS_DESCRIPTION.eventType,
    parameters: EVENT_PARAMETERS.getEventParameters,
    execute: getCalendarEventTypes,
  }),
};
