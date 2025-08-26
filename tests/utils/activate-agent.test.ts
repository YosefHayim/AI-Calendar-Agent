import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Agent } from '@openai/agents';

const run = jest.fn();

jest.mock('@openai/agents', () => ({
  run,
}));

const AGENTS_REGISTRY: Record<string, Agent> = {
  coder: { name: 'Coder' } as Agent,
};

jest.mock('@/ai-agents/agents', () => ({
  AGENTS: AGENTS_REGISTRY,
}));

jest.mock('@/utils/async-handlers', () => ({
  asyncHandler: (fn: any) => fn,
}));

import { run as openAiRun } from '@openai/agents';
import { AGENTS } from '@/ai-agents/text-agents';
import { activateAgent } from '@/utils/activate-agent';

const openAiRunMock = jest.mocked(openAiRun);

const Agents = AGENTS as unknown as Record<string, Agent>;

describe('activateAgent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(AGENTS_REGISTRY).forEach((k) => delete AGENTS_REGISTRY[k]);
    AGENTS_REGISTRY.coder = { name: 'Coder' } as Agent;
  });

  it('resolves with result when called with agent key (string)', async () => {
    openAiRunMock.mockResolvedValueOnce({ ok: true, output: 'done' } as any);

    const res = await activateAgent('coder' as any, 'build me a thing');

    expect(Agents.coder.name).toBe('Coder');
    expect(openAiRunMock).toHaveBeenCalledTimes(1);
    expect(openAiRunMock).toHaveBeenCalledWith(Agents.coder, 'build me a thing');
    expect(res).toEqual({ ok: true, output: 'done' });
  });

  it('resolves with result when called with an Agent object directly', async () => {
    const customAgent = { name: 'Custom' } as Agent;
    openAiRunMock.mockResolvedValueOnce('ok' as any);

    const res = await activateAgent(customAgent, 'hello');

    expect(openAiRunMock).toHaveBeenCalledWith(customAgent, 'hello');
    expect(res).toBe('ok');
  });

  it('throws when agent key is invalid', async () => {
    delete AGENTS_REGISTRY.coder;
    await expect(activateAgent('coder' as any, 'x')).rejects.toThrow('The provided agent is not valid.');
    expect(openAiRunMock).not.toHaveBeenCalled();
  });

  it('throws when prompt is empty (after resolving agent name)', async () => {
    openAiRunMock.mockResolvedValueOnce('should-not-run' as any);
    await expect(activateAgent('coder' as any, '')).rejects.toThrow('Please provide the prompt for the agent: Coder');
    expect(openAiRunMock).not.toHaveBeenCalled();
  });

  it('throws when prompt is falsy even with direct Agent object', async () => {
    const a = { name: 'Direct' } as Agent;
    await expect(activateAgent(a, '')).rejects.toThrow('Please provide the prompt for the agent: Direct');
    expect(openAiRunMock).not.toHaveBeenCalled();
  });
});
