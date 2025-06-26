import { Agent, run } from '@openai/agents';

import { RECOMMENDED_PROMPT_PREFIX } from '@openai/agents-core/extensions';
import { insertEventAgent } from './insert-event-agent';
import { updateEventAgent } from './update-event-agent';

const calendarAssistant = Agent.create({
  name: 'Calendar Assistant',
  model: 'gpt-4',
  instructions: [
    RECOMMENDED_PROMPT_PREFIX,
    'Help the user with their calendar.',
    'If the user asks about add / insert / schedule an event, hand off to the insertCalender agent.',
    'If the user asks about update, hand off to the updateCalendar agent.',
  ].join('\n'),
  handoffs: [insertEventAgent, updateEventAgent],
});

(async () => {
  const result = await run(
    calendarAssistant,
    'add an appointment to my calendar for tomorrow at 3 PM',
  );

  console.log(result.finalOutput);
})();
