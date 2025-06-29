import { Agent, run, setDefaultOpenAIKey, tool } from '@openai/agents';
import { CONFIG, calendar, requestConfigBase } from './config/root-config';

import { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport';
import { calendar_v3 } from 'googleapis';
import errorFn from './utils/error-template';
import z from 'zod';

setDefaultOpenAIKey(CONFIG.open_ai_api_key!);

const insertEventFn = async (
  eventData: calendar_v3.Schema$Event,
): GaxiosPromise<calendar_v3.Schema$Event> => {
  console.log('Event input recieved from agent: ', eventData);
  try {
    const r = await calendar.events.insert({
      ...requestConfigBase,
      requestBody: eventData,
    });
    if (r) console.log('Event has been successfully inserted: ', r.data);
    return r;
  } catch (error) {
    console.error('Error inserting event:', error);
    throw new Error('Failed to insert event');
  }
};

const insertEventTool = tool({
  name: 'insert_event_tool',
  parameters: z.object({
    summary: z.string(),
    description: z.string(),
    start: z.object({
      dateTime: z.string(), // correct
      timeZone: z.string().default('Asia/Jerusalem'),
    }),
    end: z.object({
      dateTime: z.string(), // correct
      timeZone: z.string().default('Asia/Jerusalem'),
    }),
  }),
  errorFunction: async (params, error) => {
    console.error(' Tool execution failed:', error);
    return 'Failed to insert event. Please check event details or calendar API access.';
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
    console.log('Params received to tool:', params);

    if (!params.start?.dateTime || !params.end?.dateTime) {
      errorFn('Missing dates of start and end!', 404);
    }

    const startDate = new Date(params.start.dateTime);
    const endDate = params.end
      ? new Date(params.end.dateTime)
      : new Date(startDate.getTime() + 60 * 60 * 1000);

    const eventData: calendar_v3.Schema$Event = {
      summary: params.summary,
      description: params.description ?? '',
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

const insertEventFnAgent = new Agent({
  name: 'insert_event',
  instructions: `You are a calendar assistant responsible for managing events.Add commentMore actions
  
  Your job is to:
  - Insert new events using the Insert Event Agent.
  - Update existing events using the Update Event Agent.
  
  Do not ask the user for confirmation or follow-up questions.
  
  If the user provides incomplete details (e.g., missing location, duration, or time), assume reasonable defaults:
  
  - Default duration: 1 hour
  - If no title is provided, use "Untitled Event"
  - If no location is provided, omit it
  
  Always hand off the request to the appropriate agent based on intent.
  
  Intent matching rules:
  - If the user asks to add, insert, create, make, schedule, or set an event, hand off to the Insert Event Agent.
  - If the user asks to update, change, move, reschedule, rename, or edit an event, hand off to the Update Event Agent.
  
  Do not respond directly to the user. Always use a handoff agent to perform the action.`,
  tools: [insertEventTool],
});

const main = async () => {
  let r;
  try {
    r = await run(
      insertEventFnAgent,
      'Create an event titled "eating with my mom" starting June 29 at 17:00, for one hour, in Asia/Jerusalem timezone.',
    );
  } catch (error) {
    console.error('Error during run of agent: ', error);
  } finally {
    console.dir(r?.rawResponses, { depth: null });
  }
};

main();
