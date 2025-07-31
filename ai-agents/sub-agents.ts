import { Agent, setDefaultOpenAIKey } from "@openai/agents";
import { calendarTypeTool, deleteEventTool, getEventsTool, insertEventTool, updateEventTool } from "./agents-tools";

import { CONFIG } from "../config/root-config";

setDefaultOpenAIKey(CONFIG.open_ai_api_key!);

export const insertEventAgent = new Agent({
  name: "Insert Event Agent",
  instructions: `An agent that insert a new event into the user's calendar.
  If any required detail is missing, use:
  - Default Summary title: "Untitled Event"
  - Date : todays date formatted according to RFC3339.
  - Default duration: current time + 1 hour.
  - Omit location if missing.`,
  tools: [insertEventTool],
});

export const getEventsByNameAgent = new Agent({
  name: "Get Events By Name Agent",
  instructions: `An agent that retrieve one or more events from the user's calendar by matching their title or keywords.`,
  tools: [getEventsTool],
});

export const updateEventAgent = new Agent({
  name: "update_event",
  instructions: `An agent that update an existing calendar event.

Handle updates to:
- Summary
- Date
- Location
- Duration

If a field is not specified, keep the original value.`,
  tools: [updateEventTool],
});

export const deleteEventAgent = new Agent({
  name: "Delete Event Agent",
  instructions: `An agent that delete a calendar event based on the title or other identifying detail.`,
  tools: [deleteEventTool],
});

export const calendarTypeAgent = new Agent({
  name: "Calendar Types Agent",
  instructions: `An agent that returns the list of calendars assositaed with the user's account via google api calendar.`,
  tools: [calendarTypeTool],
});

export const analyseCalenderTypeByEventAgent = new Agent({
  name: "Analyse Calender Type By Event Agent",
  instructions: `An agent that analyse the event details and return the calendar type that best fits the event.
  If the event is not suitable for any calendar type, return a default calendar type.`,
  tools: [calendarTypeTool],
});

export const validateEventDateAgent = new Agent({
  name: "Validate Event Date Agent",
  instructions: `An agent that validate the date of an event.
  The agent MUST return ONLY "true" if the date is valid and understood, otherwise it MUST return ONLY "false".
  No other text or explanation is allowed.
  `,
  tools: [],
});
export const validateEventDurationAgent = new Agent({
  name: "validate the event duration",
  instructions: `An agent that validate the duration of an event.
  The agent MUST return ONLY "true" if the duration is valid and understood, otherwise it MUST return ONLY "false".
  No other text or explanation is allowed.`,
  tools: [],
});
export const validateEventSummaryAgent = new Agent({
  name: "validate the event summary",
  instructions: `An agent that validate the name of the event.
  The agent MUST return ONLY "true" if the summary is valid and understood, otherwise it MUST return ONLY "false".
  No other text or explanation is allowed.
  `,
  tools: [],
});
