import { describe, it, expect, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessagesPage } from '../../src/features/messaging/pages/MessagesPage';
import { AuthProvider } from '../../src/context/AuthContext';
import { setStoredAuth } from '../../src/services/apiClient';
import {
  createMockFetch,
  mockConversations,
  mockFetchResponse,
  mockMessages,
  mockUserAlex
} from '../helpers/testUtils';

class MockWebSocket {
  static OPEN = 1;
  static instances: MockWebSocket[] = [];
  readyState = 1;
  onmessage: ((event: MessageEvent) => void) | null = null;
  send = vi.fn();
  close = vi.fn();

  constructor(_url: string) {
    MockWebSocket.instances.push(this);
  }
}

describe('Messaging Feature (MessagesPage)', () => {
  it('loads conversations and messages and sends a new message', async () => {
    MockWebSocket.instances = [];
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket);

    const user = userEvent.setup();
    setStoredAuth('jwt_alex', mockUserAlex);

    createMockFetch((url, init) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/conversations') return mockFetchResponse({ conversations: mockConversations });
      if (url === '/api/conversations/conv_1/messages' && (!init?.method || init.method === 'GET')) {
        return mockFetchResponse({ messages: mockMessages });
      }
      if (url === '/api/conversations/conv_1/messages' && init?.method === 'POST') {
        const payload = JSON.parse(String(init.body));
        return mockFetchResponse({
          message: {
            id: 'msg_new',
            conversationId: 'conv_1',
            senderId: 'user_alex',
            senderName: 'Alex Rivera',
            senderAvatar: 'https://example.com/alex.jpg',
            content: payload.content,
            createdAt: new Date().toISOString(),
            read: false
          }
        });
      }
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <MessagesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Hi Alex, excited to start!')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/type a message or paste/i);
    await user.type(input, 'Ready for Tuesday at 6 PM!');
    await user.click(screen.getByLabelText('Send message'));

    await waitFor(() => {
      expect(screen.getAllByText('Ready for Tuesday at 6 PM!').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays live incoming WebSocket messages and typing indicator', async () => {
    MockWebSocket.instances = [];
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket);

    setStoredAuth('jwt_alex', mockUserAlex);
    createMockFetch((url) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/conversations') return mockFetchResponse({ conversations: mockConversations });
      if (url === '/api/conversations/conv_1/messages') return mockFetchResponse({ messages: mockMessages });
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <MessagesPage />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Hi Alex, excited to start!')).toBeInTheDocument());

    const ws = MockWebSocket.instances[MockWebSocket.instances.length - 1];
    act(() => {
      ws.onmessage?.({
        data: JSON.stringify({
          type: 'partner_typing',
          conversationId: 'conv_1',
          isTyping: true
        })
      } as MessageEvent);
    });

    await waitFor(() => {
      expect(screen.getByText('Maya Lin is typing...')).toBeInTheDocument();
    });

    act(() => {
      ws.onmessage?.({
        data: JSON.stringify({
          type: 'new_message',
          conversationId: 'conv_1',
          message: {
            id: 'msg_ws',
            conversationId: 'conv_1',
            senderId: 'user_maya',
            senderName: 'Maya Lin',
            senderAvatar: 'https://example.com/maya.jpg',
            content: 'Live WebSocket ping!',
            createdAt: new Date().toISOString(),
            read: false
          }
        })
      } as MessageEvent);
    });

    await waitFor(() => {
      expect(screen.getByText('Live WebSocket ping!')).toBeInTheDocument();
    });
  });

  it('renders empty state when user has no active partner conversations', async () => {
    MockWebSocket.instances = [];
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket);

    setStoredAuth('jwt_alex', mockUserAlex);
    createMockFetch((url) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/conversations') return mockFetchResponse({ conversations: [] });
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <MessagesPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No active partner chats.')).toBeInTheDocument();
      expect(screen.getByText('Select a conversation on the left to start chatting.')).toBeInTheDocument();
    });
  });
});
