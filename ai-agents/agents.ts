import { Agent, setDefaultOpenAIKey } from "@openai/agents";

import { AGENT_TOOLS } from "./agents-tools";
import { CONFIG } from "../config/root-config";
import { CURRENT_MODEL } from "../types";

setDefaultOpenAIKey(CONFIG.open_ai_api_key!);

export const AGENTS = {
  insertEvent: new Agent({
    name: "Insert Event Agent",
    model: CURRENT_MODEL,
    instructions: `An agent that insert a new event into the user's calendar.
    If any required detail is missing, use:
    - Default Summary title: "Untitled Event"
    - Date : todays date formatted according to RFC3339.
    - Default duration: current time + 1 hour.
    - Omit location if missing.`,
    tools: [AGENT_TOOLS.insert_event],
  }),
  getEventByName: new Agent({
    name: "An agent that search for events by name",
    model: CURRENT_MODEL,
    instructions: `An agent that retrieve one or more events from the user's calendar by matching their title or keywords.`,
    tools: [AGENT_TOOLS.get_event],
  }),
  updateEventById: new Agent({
    name: "update_event",
    model: CURRENT_MODEL,
    instructions: `An agent that update an existing calendar event.
  
  Handle updates to:
  - Summary
  - Date
  - Location
  - Duration
  
  If a field is not specified, keep the original value.`,
    tools: [AGENT_TOOLS.update_event],
  }),
  deleteEventById: new Agent({
    name: "An agent that delete an event by its id",
    model: CURRENT_MODEL,
    instructions: `An agent that delete a calendar event based on the title or other identifying detail.`,
    tools: [AGENT_TOOLS.delete_event],
  }),
  calendarList: new Agent({
    name: "An agent that returns the list of calendars",
    model: CURRENT_MODEL,
    instructions: `An agent that returns the list of calendars associated with the user's account via google api calendar.`,
    tools: [AGENT_TOOLS.calendar_type],
  }),
  analyseCalendarTypeByEvent: new Agent({
    name: "An agent that analyse the event type by the event details",
    model: CURRENT_MODEL,
    instructions: `An agent that analyse the event details and return the calendar type that best fits the event.
    If the event is not suitable for any calendar type, return a default calendar type.`,
    tools: [AGENT_TOOLS.event_type],
  }),
  validateDateEvent: new Agent({
    name: "An agent that validate the event date",
    model: CURRENT_MODEL,
    instructions: `An agent that validate the date of an event.
    The agent MUST return ONLY "true" if the date is valid and understood, otherwise it MUST return ONLY "false".
    No other text or explanation is allowed.
    `,
  }),
  validateDurationEvent: new Agent({
    name: "An agent that validate the event duration",
    model: CURRENT_MODEL,
    instructions: `An agent that validate the duration of an event.
    The agent MUST return ONLY "true" if the duration is valid and understood, otherwise it MUST return ONLY "false".
    No other text or explanation is allowed.`,
  }),

  validateSummaryEvent: new Agent({
    name: "An agent that validate the event summary",
    model: CURRENT_MODEL,
    instructions: `An agent that validate the name of the event.
    The agent MUST return ONLY "true" if the summary is valid and understood, otherwise it MUST return ONLY "false".
    No other text or explanation is allowed.
    `,
  }),
  searchForEventByName: new Agent({
    name: "An agent that search for events by name",
    model: CURRENT_MODEL,
    instructions: `An agent that search for events by name.
    The agent MUST return the events that match the name provided by the user.
    If no events are found, return a message that declares that.`,
    tools: [AGENT_TOOLS.get_event],
  }),
  updateEventByName: new Agent({
    name: "An agent that update an event by name",
    model: CURRENT_MODEL,
    instructions: `An agent that update an event by name.
    The agent MUST return the updated event if the update was successful, otherwise it MUST return an error message.
    If no events are found, return a message that declares that.`,
    tools: [AGENT_TOOLS.update_event],
  }),
  deleteEventByName: new Agent({
    name: "An agent that delete an event by name",
    model: CURRENT_MODEL,
    instructions: `An agent that delete an event by name.`,
    tools: [AGENT_TOOLS.delete_event],
  }),
  chatWithAgent: new Agent({
    name: "An agent that chat with the user",
    model: CURRENT_MODEL,
    instructions: `An agent that chat with the user and act as personal calendar assistant.`,
    tools: [AGENT_TOOLS.calendar_type],
  }),
};

const subAgents = Object.values(AGENTS) as Agent[];

export const calendarRouterAgent = new Agent({
  name: "Calendar Router Agent",
  model: CURRENT_MODEL,
  handoffDescription: `
  Get from the analyst calender type by event agent the appropriate calender type to the event.
  after that, pass the information to the validation agents, and when you have received a positive response from the validation agents, 
  pass the information to the correct agent based on the user intent.

  Route user requests to the correct tool based on intent:
  - "add", "insert", "schedule", "make", "create" pass to Insert Event
  - "get", "find", "show", "list", "see" pass to Get Events
  - "update", "edit", "move", "reschedule", "rename" pass to Update Event
  - "delete", "remove", "cancel" pass to Delete Event

  Do not respond to the user directly.
  Always pass control to the correct tool agent.`,
  handoffs: subAgents,
});
