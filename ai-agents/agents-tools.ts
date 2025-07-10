import { calendar_v3 } from "googleapis";
import errorTemplate from "../utils/error-template";
import { insertEventFn } from "./tools-utils/insert-event";
import { tool } from "@openai/agents";
import z from "zod";

export const insertEventTool = tool({
  name: "insert_event_tool",
  parameters: z.object({
    summary: z.string(),
    description: z.string(),
    start: z.object({
      dateTime: z.string(),
      timeZone: z.string().default("Asia/Jerusalem"),
    }),
    end: z.object({
      dateTime: z.string(),
      timeZone: z.string().default("Asia/Jerusalem"),
    }),
  }),
  errorFunction: async (params, error) => {
    console.error(" Tool execution failed:", error);
    return "Failed to insert event. Please check event details or calendar API access.";
  },
  strict: true,
  description: `Insert an event into the calendar. Must follow the paramters provided the structure is json format example to a request {
  "summary": "Quick Standup Meeting",
  "location": "Online - Google Meet",
  "description": "Daily standup to sync team updates.",
  "start": {
    "dateTime": "2025-06-29T15:00:00+03:00",
    "timeZone": "Asia/Jerusalem"
  },
  "end": {
    "dateTime": "2025-06-29T15:30:00+03:00",
    "timeZone": "Asia/Jerusalem"
  }
}
`,
  execute: async (params) => {
    console.log("Params received to tool:", params);

    if (!params.start?.dateTime || !params.end?.dateTime) {
      errorTemplate("Missing dates of start and end!", 404);
    }

    const startDate = new Date(params.start.dateTime);
    const endDate = params.end ? new Date(params.end.dateTime) : new Date(startDate.getTime() + 60 * 60 * 1000);

    const eventData: calendar_v3.Schema$Event = {
      summary: params.summary,
      description: params.description ?? "",
      start: {
        dateTime: startDate.toISOString(),
        timeZone: params.start.timeZone,
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: params.end?.timeZone || params.start.timeZone,
      },
    };

    return insertEventFn(eventData);
  },
});

export const getEventsTool = tool({
  name: "get_events_by_name_tool",
});

export const updateEventTool = tool({
  name: "update_events_by_name_tool",
});

export const deleteEventTool = tool({
  name: "delete_events_by_name_tool",
});
