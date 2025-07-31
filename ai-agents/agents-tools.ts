import { EVENT_PARAMETERS } from "./parameters-tools";
import { TOOLS_DESCIPRTION } from "./description-tools";
import { getCalendarEventTypes } from "./execeution-tools/get-calendar-types-execution";
import { getEventExecution } from "./execeution-tools/get-event-execution";
import { insertEventExeuction } from "./execeution-tools/insert-event-execution";
import { tool } from "@openai/agents";

export const AGENT_TOOLS = {
  insertEvent: tool({
    name: "insert_event_tool",
    description: TOOLS_DESCIPRTION.insertEvent,
    parameters: EVENT_PARAMETERS.insertEventParameters,
    execute: insertEventExeuction,
    errorFunction: async (params, error) => {
      return `Failed to insert event. Please check event details or calendar API access. Error: ${error}`;
    },
  }),
  getEvent: tool({
    name: "get_events_by_name_tool",
    description: TOOLS_DESCIPRTION.getEvent,
    parameters: EVENT_PARAMETERS.getEventParameters,
    execute: getEventExecution,
    errorFunction: async (_, error) => {
      return `Failed to get event. Please check event details. Error: ${error}`;
    },
  }),
  updateEvent: tool({
    name: "update_events_by_name_tool",
    description: TOOLS_DESCIPRTION.updateEvent,
    parameters: EVENT_PARAMETERS.updateEventParameters,
    execute: getEventExecution,
    errorFunction: async (_, error) => {
      return `Failed to update event. Please check event details. Error: ${error}`;
    },
  }),
  deleteEvent: tool({
    name: "delete_events_by_name_tool",
    description: TOOLS_DESCIPRTION.deleteEvent,
    parameters: EVENT_PARAMETERS.deleteEventParameters,
    execute: getEventExecution,
    errorFunction: async (_, error) => {
      return `Failed to delete event. Please check event details or calendar API access. Error: ${error}`;
    },
  }),
  calendarType: tool({
    name: "calendars_types_list_tool",
    description: TOOLS_DESCIPRTION.eventType,
    parameters: EVENT_PARAMETERS.getEventParameters,
    errorFunction: async (_, error) => {
      return `Failed to determine event type. Please try again. Error: ${error}`;
    },
    execute: getCalendarEventTypes,
  }),
  eventType: tool({
    name: "event_type_tool",
    description: TOOLS_DESCIPRTION.eventType,
    parameters: EVENT_PARAMETERS.getEventParameters,
    execute: getCalendarEventTypes,
  }),
  validateEventDate: tool({
    name: "validate_event_date_tool",
    description: `Returns true or false based on the validity of the event date.`,
    parameters: EVENT_PARAMETERS.getEventParameters,
    execute: async (params) => {
      return true;
    },
  }),
  validateEventDuration: tool({
    name: "validate_event_duration_tool",
    description: `Returns true or false based on the validity of the event duration.`,
    parameters: EVENT_PARAMETERS.getEventParameters,
    execute: async (params) => {
      return true;
    },
  }),
  validateEventSummary: tool({
    name: "validate_event_summary_tool",
    description: `Returns true or false based on the validity of the event summary.`,
    parameters: EVENT_PARAMETERS.getEventParameters,
    execute: async (params) => {
      return true;
    },
  }),
};
