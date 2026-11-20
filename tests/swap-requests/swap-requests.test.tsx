import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SwapRequestsPage } from '../../src/features/swap-requests/pages/SwapRequestsPage';
import { AuthProvider } from '../../src/context/AuthContext';
import { setStoredAuth } from '../../src/services/apiClient';
import { createMockFetch, mockFetchResponse, mockSwapRequests, mockUserAlex } from '../helpers/testUtils';

describe('Swap Requests Feature (SwapRequestsPage)', () => {
  it('loads received requests and allows accepting a pending proposal', async () => {
    const user = userEvent.setup();
    setStoredAuth('jwt_alex', mockUserAlex);

    const fetchSpy = createMockFetch((url, init) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/swaps/requests?tab=received') {
        return mockFetchResponse({ requests: mockSwapRequests });
      }
      if (url === '/api/swaps/requests/req_1/accept' && init?.method === 'POST') {
        return mockFetchResponse({
          message: 'Swap request accepted! Conversation opened.',
          request: { ...mockSwapRequests[0], status: 'Accepted' },
          conversationId: 'conv_1'
        });
      }
      return mockFetchResponse({ requests: [] });
    });

    render(
      <AuthProvider>
        <SwapRequestsPage onNavigateToMessages={vi.fn()} onViewUserProfile={vi.fn()} />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Maya Lin')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /accept request/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'Swap request accepted! Conversation opened.'
      );
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/swaps/requests/req_1/accept',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('declines an incoming request and handles server errors cleanly', async () => {
    const user = userEvent.setup();
    setStoredAuth('jwt_alex', mockUserAlex);

    createMockFetch((url, init) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/swaps/requests?tab=received') {
        return mockFetchResponse({ requests: mockSwapRequests });
      }
      if (url === '/api/swaps/requests/req_1/reject' && init?.method === 'POST') {
        return mockFetchResponse({ error: 'Unable to reject request' }, false, 400);
      }
      return mockFetchResponse({ requests: [] });
    });

    render(
      <AuthProvider>
        <SwapRequestsPage onNavigateToMessages={vi.fn()} onViewUserProfile={vi.fn()} />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Maya Lin')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /decline/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Unable to reject request');
    });
  });

  it('switches across Sent and Accepted tabs and invokes profile & chat callbacks', async () => {
    const user = userEvent.setup();
    const onNavigateToMessages = vi.fn();
    const onViewUserProfile = vi.fn();
    setStoredAuth('jwt_alex', mockUserAlex);

    const sentReq = {
      ...mockSwapRequests[0],
      id: 'req_sent',
      senderId: 'user_alex',
      senderName: 'Alex Rivera',
      receiverId: 'user_maya',
      receiverName: 'Maya Lin',
      status: 'Pending' as const
    };
    const acceptedReq = { ...sentReq, id: 'req_acc', status: 'Accepted' as const };

    const fetchSpy = createMockFetch((url, init) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/swaps/requests?tab=received') return mockFetchResponse({ requests: [] });
      if (url === '/api/swaps/requests?tab=sent') return mockFetchResponse({ requests: [sentReq] });
      if (url === '/api/swaps/requests?tab=accepted') return mockFetchResponse({ requests: [acceptedReq] });
      if (url === '/api/swaps/requests/req_sent/cancel' && init?.method === 'POST') {
        return mockFetchResponse({ message: 'Request cancelled.', request: { ...sentReq, status: 'Cancelled' } });
      }
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <SwapRequestsPage
          onNavigateToMessages={onNavigateToMessages}
          onViewUserProfile={onViewUserProfile}
        />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No incoming swap requests right now')).toBeInTheDocument();
    });

    // Switch to Sent tab and cancel request
    await user.click(screen.getByRole('button', { name: /sent requests/i }));
    await waitFor(() => expect(screen.getByText('Cancel Request')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /cancel request/i }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Request cancelled.'));
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/swaps/requests/req_sent/cancel',
      expect.objectContaining({ method: 'POST' })
    );

    // Switch to Accepted tab
    await user.click(screen.getByRole('button', { name: /accepted partnerships/i }));
    await waitFor(() => expect(screen.getByText('Start Chat & Video')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /view profile/i }));
    expect(onViewUserProfile).toHaveBeenCalledWith('user_maya');

    await user.click(screen.getByRole('button', { name: /start chat & video/i }));
    expect(onNavigateToMessages).toHaveBeenCalledTimes(1);
  });
});
