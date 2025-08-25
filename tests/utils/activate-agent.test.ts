import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Agent } from '@openai/agents';

const run = jest.fn();
jest.mock('@openai/agents', () => ({
  run: (...args: any[]) => (run as any)(...args),
}));

const AGENTS_REGISTRY: Record<string, Agent> = {
  coder: { name: 'Coder' } as Agent,
};
jest.mock('@/ai-agents/agents', () => ({
  AGENTS: AGENTS_REGISTRY,
}));

jest.mock('./async-handlers', () => ({
  asyncHandler: (fn: any) => fn,
}));

import { run as openAiRun } from '@openai/agents';
import { AGENTS } from '@/ai-agents/agents';
import { activateAgent } from '@/utils/activate-agent'; 

describe('activateAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(AGENTS_REGISTRY).forEach((k) => delete AGENTS_REGISTRY[k]);
    AGENTS_REGISTRY.coder = { name: 'Coder' } as Agent;
  });

  it('resolves with result when called with agent key (string)', async () => {
    (openAiRun as jest.Mock).mockResolvedValueOnce({ ok: true, output: 'done' });

    const res = await activateAgent('coder' as any, 'build me a thing');

    expect(AGENTS.coder.name).toBe('Coder');
    expect(openAiRun).toHaveBeenCalledTimes(1);
    expect(openAiRun).toHaveBeenCalledWith(AGENTS.coder, 'build me a thing');
    expect(res).toEqual({ ok: true, output: 'done' });
  });

  it('resolves with result when called with an Agent object directly', async () => {
    const customAgent = { name: 'Custom' } as Agent;
    (openAiRun as jest.Mock).mockResolvedValueOnce('ok');

    const res = await activateAgent(customAgent, 'hello');

    expect(openAiRun).toHaveBeenCalledWith(customAgent, 'hello');
    expect(res).toBe('ok');
  });

  it('throws when agent key is invalid', async () => {
    delete AGENTS_REGISTRY.coder;
    await expect(activateAgent('coder' as any, 'x')).rejects.toThrow('The provided agent is not valid.');
    expect(openAiRun).not.toHaveBeenCalled();
  });

  it('throws when prompt is empty (after resolving agent name)', async () => {
    (openAiRun as jest.Mock).mockResolvedValueOnce('should-not-run');
    await expect(activateAgent('coder' as any, '')).rejects.toThrow('Please provide the prompt for the agent: Coder');
    expect(openAiRun).not.toHaveBeenCalled();
  });

  it('throws when prompt is falsy even with direct Agent object', async () => {
    const a = { name: 'Direct' } as Agent;
    await expect(activateAgent(a, '')).rejects.toThrow('Please provide the prompt for the agent: Direct');
    expect(openAiRun).not.toHaveBeenCalled();
  });
});
