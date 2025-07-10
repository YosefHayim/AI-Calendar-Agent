import { Agent, run } from "@openai/agents";

export const activateAgent = async (agent: Agent, text: string) => {
  if (!agent) return `Please provide an agent in order to activate it.`;

  if (!text) return `Please provide the prompt for the agent: ${agent.name}`;

  try {
    const r = await run(agent, text);

    return r.finalOutput;
  } catch (error) {
    console.error(`Error occured while running an agent: ${agent.name}.\n The error from activateAgentFn: ${error}`);
    throw error;
  }
};
