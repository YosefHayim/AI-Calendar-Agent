import { Agent, run } from '@openai/agents';

import { insertEventAgent } from './insert-event-agent';
import { updateEventAgent } from './update-event-agent';

const calendarAssistant = Agent.create({
  name: 'Calendar Assistant',
  model: 'gpt-4',
  instructions: [
    'Help the user with their calendar.',
    'If the user asks about add / insert / schedule an event, hand off to the insertCalender agent.',
    'If the user asks about update, hand off to the updateCalendar agent.',
  ].join('\n'),
  handoffs: [insertEventAgent, updateEventAgent],
});

async function main() {
  const result = await run(calendarAssistant, 'insert an event for 2 hours from now name blabla');
  console.log(result.finalOutput);
}

main().catch((err) => console.error(err));
