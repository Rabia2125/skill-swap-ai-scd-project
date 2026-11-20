import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
  readyState = 1;
  onmessage: ((event: MessageEvent) => void) | null = null;
  send = vi.fn();
  close = vi.fn();
}

describe('Messaging Meeting Links (MessagesPage)', () => {
  it('shares a Zoom meeting room link in chat and supports copying link', async () => {
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket);
    const user = userEvent.setup();
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    setStoredAuth('jwt_alex', mockUserAlex);

    createMockFetch((url, init) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/conversations') return mockFetchResponse({ conversations: mockConversations });
      if (url === '/api/conversations/conv_1/messages' && (!init?.method || init.method === 'GET')) {
        return mockFetchResponse({ messages: mockMessages });
      }
      if (url === '/api/conversations/conv_1/messages' && init?.method === 'POST') {
        const body = JSON.parse(String(init.body));
        return mockFetchResponse({
          message: {
            id: 'msg_meet',
            conversationId: 'conv_1',
            senderId: 'user_alex',
            senderName: 'Alex Rivera',
            senderAvatar: 'https://example.com/alex.jpg',
            content: body.content,
            meeting: body.meeting,
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

    await waitFor(() => expect(screen.getByText('Schedule Meeting')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /schedule meeting/i }));
    await user.click(screen.getByRole('button', { name: 'Zoom' }));
    await user.type(screen.getByLabelText(/meeting url/i), 'https://zoom.us/j/987654321');
    await user.click(screen.getByRole('button', { name: /send meeting link to chat/i }));

    await waitFor(() => {
      expect(screen.getByText('Zoom Session')).toBeInTheDocument();
      expect(screen.getByText('https://zoom.us/j/987654321')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /copy/i }));
    expect(writeTextSpy).toHaveBeenCalledWith('https://zoom.us/j/987654321');
    expect(screen.getByText('Copied')).toBeInTheDocument();
  });
});
