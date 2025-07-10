import { Agent } from "@openai/agents";
import { insertEventAgent } from "./sub-agents";

export const calendarRouterAgent = new Agent({
  name: "calendar_crud_router",
  model: "gpt-4.1-nano-2025-04-14",
  instructions: `
You are the router agent for calendar CRUD operations.

Route user requests to the correct tool based on intent:
- "add", "insert", "schedule", "make", "create" → Insert Event
- "get", "find", "show", "list", "see" → Get Events
- "update", "edit", "move", "reschedule", "rename" → Update Event
- "delete", "remove", "cancel" → Delete Event

Do not respond to the user directly.
Always pass control to the correct tool agent.`,
  tools: [insertEventAgent, getEventsByNameAgent, updateEventAgent, deleteEventAgent],
});
