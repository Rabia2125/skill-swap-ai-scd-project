import { request } from '../../../services/apiClient';
import { AIHistoryTurn } from '../types';

export const aiAssistantService = {
  askAI: (prompt: string, conversationHistory: AIHistoryTurn[] = []) =>
    request<{ reply: string }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, conversationHistory })
    })
};
