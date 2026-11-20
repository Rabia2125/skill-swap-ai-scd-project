import { request } from '../../../services/apiClient';
import { Conversation, MeetingInfo, Message } from '../../../types';

export const messagingService = {
  getConversations: () => request<{ conversations: Conversation[] }>('/api/conversations'),

  getMessages: (conversationId: string) =>
    request<{ messages: Message[] }>(`/api/conversations/${conversationId}/messages`),

  sendMessage: (conversationId: string, content: string, meeting?: MeetingInfo) =>
    request<{ message: Message }>(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, meeting })
    })
};
