import { calendar, requestConfigBase } from './config/root-config';

import { Agent } from '@openai/agents';
import { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport';
import { calendar_v3 } from 'googleapis';
import z from 'zod';

const SchemaEvent = z.object({
  summary: z.string(),
  description: z.string().nullable(),
  start: z.object({
    dateTime: z.string(),
    timeZone: z.string(),
  }),
  end: z.object({
    dateTime: z.string(),
    timeZone: z.string(),
  }),
  location: z.string().nullable(),
});

const insertEventTool = async (): GaxiosPromise<calendar_v3.Schema$Event> => {
  try {
    const r = await calendar.events.insert({
      ...requestConfigBase,
      requestBody: {
        summary: 'Sample Event',
        description: 'This is a sample event description.',
        start: {
          dateTime: new Date().toISOString(), // Example date in ISO format
          timeZone: 'Asia/Jeruslam', // Specify the time zone
        },
        end: {
          dateTime: new Date().toISOString(), // Example end time in ISO format
          timeZone: 'Asia/Jeruslam', // Specify the time zone
        },
      },
    });
    if (r) console.log(r);
    return r;
  } catch (error) {
    console.error('Error inserting event:', error);
    throw new Error('Failed to insert event');
  }
};

const insertEventAgent = new Agent({
  name: 'insert_event',
  description: 'Insert an event into the calendar',
  instructions: `You are an agent that inserts events into a calendar.
You will receive details about the event, such as the title, date, time, and location. Your task is to format this information correctly and call the insertEventTool to add the event to the calendar.
make sure that the date will be in ISO foramt: YYYY-MM-DDTHOUR:MIN:SECONDS.000Z . for example: 2025-06-28T19:16:14.000Z.
`,
  outputType: SchemaEvent,
  tools: [insertEventTool],
});
