import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';

const voiceAgentReal = async () => {
  const agent = new RealtimeAgent({
    name: 'Assistant',
    instructions: 'You are a helpful assistant.',
  });

  const session = new RealtimeSession(agent, {
    model: 'gpt-4o-realtime-preview-2025-06-03',
  });

  await session.connect({ apiKey: '<client-api-key>' });
};
