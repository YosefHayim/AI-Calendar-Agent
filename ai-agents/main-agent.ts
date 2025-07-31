import {
  analyseCalenderTypeByEventAgent,
  calendarTypeAgent,
  deleteEventAgent,
  getEventsByNameAgent,
  insertEventAgent,
  updateEventAgent,
  validateEventDateAgent,
  validateEventDurationAgent,
} from "./sub-agents";

import { Agent } from "@openai/agents";

const agents = [
  analyseCalenderTypeByEventAgent,
  calendarTypeAgent,
  insertEventAgent,
  getEventsByNameAgent,
  updateEventAgent,
  deleteEventAgent,
  validateEventDateAgent,
  validateEventDurationAgent,
  validateEventDateAgent,
];

export const calendarRouterAgent = new Agent({
  name: "calendar_crud_router",
  handoffDescription: `
Get from the analyse calender type by event agent the appropirate calender type to the event.
after that, pass the information to the validation agents, and when you have recieved a positive response from the validation agents, 
pass the information to the correct agent based on the user intent.

Route user requests to the correct tool based on intent:
- "add", "insert", "schedule", "make", "create" pass to Insert Event
- "get", "find", "show", "list", "see" pass to Get Events
- "update", "edit", "move", "reschedule", "rename" pass to Update Event
- "delete", "remove", "cancel" pass to Delete Event

Do not respond to the user directly.
Always pass control to the correct tool agent.`,
  handoffs: agents,
});
