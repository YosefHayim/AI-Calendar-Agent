import { Agent, run, setDefaultOpenAIKey, tool } from '@openai/agents';
import { CONFIG, calendar, requestConfigBase } from './config/root-config';

import { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport';
import { calendar_v3 } from 'googleapis';
import z from 'zod';

setDefaultOpenAIKey(CONFIG.open_ai_api_key!);

const SchemaEvent = z.object({
  summary: z.string(),
  description: z.string().nullable(),
  start: z.object({
    dateTime: z.date().transform((str) => new Date(str).toISOString()),
    timeZone: z.string().default('Asia/Jerusalem'),
  }),
  end: z.object({
    dateTime: z.date().transform((str) => new Date(str).toISOString()),
    timeZone: z.string().default('Asia/Jerusalem'),
  }),
  location: z.string().nullable(),
});

const insertEventFn = async (
  eventData: calendar_v3.Schema$Event,
): GaxiosPromise<calendar_v3.Schema$Event> => {
  try {
    const r = await calendar.events.insert({
      ...requestConfigBase,
      requestBody: eventData,
    });
    if (r) console.log('fn returned: ', r);
    return r;
  } catch (error) {
    console.error('Error inserting event:', error);
    throw new Error('Failed to insert event');
  }
};

const insertEventTool = tool({
  name: 'insert_event_tool',
  parameters: SchemaEvent,
  needsApproval: true,
  description: 'Insert an event into the calendar',
  execute: async (params) => {
    const parsedParams = SchemaEvent.parse(params);
    const eventData: calendar_v3.Schema$Event = {
      summary: parsedParams.summary,
      description: parsedParams.description,
      start: {
        dateTime: parsedParams.start.dateTime,
        timeZone: parsedParams.start.timeZone,
      },
      end: {
        dateTime: parsedParams.end.dateTime,
        timeZone: parsedParams.end.timeZone,
      },
      location: parsedParams.location,
    };

    return insertEventFn(eventData);
  },
});

const insertEventFnAgent = new Agent({
  name: 'insert_event',
  instructions: `You are an agent that inserts events into a calendar.
You will receive details about the event, such as the summary and a date. Your task is to format this information correctly and call the insertEventTool to add the event to the calendar.
make sure that the date will be in ISO foramt, for example: 2025-06-28T19:16:14.000Z.
`,
  outputType: 'text',
  tools: [insertEventTool],
});

const main = async () => {
  try {
    const r = await run(
      insertEventFnAgent,
      'add event to my calendar summary eating with my mom use today date june 29 17',
    );
    console.log(r.history);
  } catch (error) {
    console.error('Error during run of agent: ', error);
  }
};

main();
