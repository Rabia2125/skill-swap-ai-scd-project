import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SendSwapModal } from '../../src/features/swap-requests/components/SendSwapModal';
import { AuthProvider } from '../../src/context/AuthContext';
import { setStoredAuth } from '../../src/services/apiClient';
import { createMockFetch, mockFetchResponse, mockUserAlex, mockUserMaya } from '../helpers/testUtils';

describe('SendSwapModal', () => {
  it('renders nothing when targetUser is null', () => {
    const { container } = render(
      <AuthProvider>
        <SendSwapModal targetUser={null} onClose={vi.fn()} onSuccess={vi.fn()} />
      </AuthProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it('validates that personalized message cannot be empty', async () => {
    const user = userEvent.setup();
    setStoredAuth('jwt_alex', mockUserAlex);
    createMockFetch(() => mockFetchResponse({ user: mockUserAlex }));

    render(
      <AuthProvider>
        <SendSwapModal targetUser={mockUserMaya} onClose={vi.fn()} onSuccess={vi.fn()} />
      </AuthProvider>
    );

    const textarea = screen.getByLabelText('Personalized Request Message');
    await user.clear(textarea);
    await user.click(screen.getByRole('button', { name: /send swap request/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Please include a brief personalized message.');
  });

  it('submits swap request payload and displays confirmation message', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    setStoredAuth('jwt_alex', mockUserAlex);

    const fetchSpy = createMockFetch((url, init) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/swaps/requests' && init?.method === 'POST') {
        return mockFetchResponse({ message: 'Sent', request: { id: 'req_new' } }, true, 201);
      }
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <SendSwapModal targetUser={mockUserMaya} onClose={onClose} onSuccess={onSuccess} />
      </AuthProvider>
    );

    await user.click(screen.getByRole('button', { name: /send swap request/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Skill swap proposal sent to Maya Lin!');
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/swaps/requests',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"receiverId":"user_maya"')
      })
    );
  });

  it('shows server error message when swap request submission fails', async () => {
    const user = userEvent.setup();
    setStoredAuth('jwt_alex', mockUserAlex);

    createMockFetch((url, init) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/swaps/requests' && init?.method === 'POST') {
        return mockFetchResponse({ error: 'Duplicate pending swap request' }, false, 409);
      }
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <SendSwapModal targetUser={mockUserMaya} onClose={vi.fn()} onSuccess={vi.fn()} />
      </AuthProvider>
    );

    await user.click(screen.getByRole('button', { name: /send swap request/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Duplicate pending swap request');
    });
  });
});
