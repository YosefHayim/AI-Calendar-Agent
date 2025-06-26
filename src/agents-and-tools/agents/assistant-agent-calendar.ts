import { Agent, run } from '@openai/agents';

import { RECOMMENDED_PROMPT_PREFIX } from '@openai/agents-core/extensions';
import { createEventAgent } from './insert-event-agent';
import { updateEventAgent } from './update-event-agent';

const calendarAssistant = Agent.create({
  name: 'Calendar Assistant',
  model: 'gpt-4',
  instructions: [
    RECOMMENDED_PROMPT_PREFIX,
    'Help the user with their calendar.',
    'if the user asks about getting what events he has nextr, hand off to the getEvents agent.',
    'If the user asks about add / insert / schedule an event, hand off to the createEvent agent.',
    'If the user asks about update, hand off to the updateEventAgent agent.',
  ].join('\n'),
  handoffs: [createEventAgent, updateEventAgent],
});

(async () => {
  const result = await run(calendarAssistant, 'add an appointment to my calendar for tomorrow at 3 PM');

  console.log(result.finalOutput);
})();
