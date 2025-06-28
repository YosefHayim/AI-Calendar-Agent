import { Agent, run } from '@openai/agents';

import { insertEventAgent } from './insert-event-agent';

// import { updateEventAgent } from './update-event-agent';

const calendarAssistant = Agent.create({
  name: 'Calendar Assistant',
  model: 'o4-mini-2025-04-16',
  instructions: `
  You are a calendar assistant responsible for managing events.
  
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
  
  Do not respond directly to the user. Always use a handoff agent to perform the action.
  `,

  handoffs: [insertEventAgent],
  outputType: 'text',
  toolUseBehavior: 'run_llm_again',
});

async function main() {
  const result = await run(
    calendarAssistant,
    `new event today at 8 pm until 11 pm title eating with mom`,
  );
  console.log(result.finalOutput);
}

main().catch((err) => console.error(err));
