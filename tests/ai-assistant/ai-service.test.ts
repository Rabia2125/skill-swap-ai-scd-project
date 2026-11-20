import { describe, it, expect } from 'vitest';
import { aiAssistantService } from '../../src/features/ai-assistant/services/aiAssistantService';
import { createMockFetch, mockFetchResponse } from '../helpers/testUtils';

describe('aiAssistantService', () => {
  it('posts prompt and conversation history to /api/ai/chat', async () => {
    const fetchSpy = createMockFetch(() =>
      mockFetchResponse({ reply: 'Start with Python fundamentals.' })
    );

    const res = await aiAssistantService.askAI('Next step?', [
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello!' }
    ]);

    expect(res.reply).toBe('Start with Python fundamentals.');
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/ai/chat',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Next step?',
          conversationHistory: [
            { role: 'user', content: 'Hi' },
            { role: 'assistant', content: 'Hello!' }
          ]
        })
      })
    );
  });

  it('rejects when AI endpoint returns 401 for unauthenticated users', async () => {
    createMockFetch(() => mockFetchResponse({ error: 'Unauthorized' }, false, 401));
    await expect(aiAssistantService.askAI('Hello')).rejects.toThrow('Unauthorized');
  });
});
