import { deleteEventAgent, eventTypeAgent, getEventsByNameAgent, insertEventAgent, updateEventAgent } from "./sub-agents";

import { Agent } from "@openai/agents";

export const calendarRouterAgent = new Agent({
  name: "calendar_crud_router",
  handoffDescription: `
Get from the calendars type list agent to get the calendares types,
after that pass the information to the relevant event agents.

Route user requests to the correct tool based on intent:
- "add", "insert", "schedule", "make", "create" pass to Insert Event
- "get", "find", "show", "list", "see" pass to Get Events
- "update", "edit", "move", "reschedule", "rename" pass to Update Event
- "delete", "remove", "cancel" pass to Delete Event

Do not respond to the user directly.
Always pass control to the correct tool agent.`,
  handoffs: [eventTypeAgent, insertEventAgent, getEventsByNameAgent, updateEventAgent, deleteEventAgent],
});
