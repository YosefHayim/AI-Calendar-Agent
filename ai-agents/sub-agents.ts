import { Agent, run, setDefaultOpenAIKey } from "@openai/agents";
import { deleteEventTool, getEventsTool, insertEventTool, updateEventTool } from "./agents-tools";

import { CONFIG } from "../config/root-config";

setDefaultOpenAIKey(CONFIG.open_ai_api_key!);

export const insertEventAgent = new Agent({
  name: "insert_event",
  instructions: `You insert a new event into the user's calendar.

If any required detail is missing, use:
- Default title: "Untitled Event"
- Default duration: 1 hour
- Omit location if missing.`,
  tools: [insertEventTool],
});

export const getEventsByNameAgent = new Agent({
  name: "get_events_by_name",
  instructions: `You retrieve one or more events from the user's calendar by matching their title or keywords.`,
  tools: [getEventsTool],
});

export const updateEventAgent = new Agent({
  name: "update_event",
  instructions: `You update an existing calendar event.

Handle updates to:
- Title
- Time
- Location
- Duration

If a field is not specified, keep the original value.`,
  tools: [updateEventTool],
});

export const deleteEventAgent = new Agent({
  name: "delete_event",
  instructions: `You delete a calendar event based on the title or other identifying detail.`,
  tools: [deleteEventTool],
});
