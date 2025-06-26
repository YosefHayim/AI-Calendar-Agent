import { Agent, tool } from '@openai/agents';
import { calendar, requestConfigBase } from '../../config/oauth-config';

import { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport';
import { calendar_v3 } from 'googleapis';

const getEvents = async (): GaxiosPromise<calendar_v3.Schema$Events> => {
  const timeMin = new Date();
  timeMin.setDate(timeMin.getDate() - 10);

  const response = await calendar.events.list({
    ...requestConfigBase,
    calendarId: 'primary',
    timeMin: timeMin.toISOString(),
  });
  return response;
};

const getEventsTool = tool({
  name: 'get_events',
  description: 'Get events from the primary calendar for the last 10 days.',
  parameters: undefined,
  execute: async () => getEvents,
});

const getEventsAgent = new Agent({
  name: 'Get Events Agent',
  model: 'gpt-4',
  instructions:
    'You are an agent that helps users get events from their calendar. When a user asks to get events, you will handle the request.',
  outputType: 'text',
  toolUseBehavior: 'run_llm_again',
  tools: [getEventsTool],
});
