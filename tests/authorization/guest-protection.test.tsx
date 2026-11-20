import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';
import { setStoredAuth } from '../../src/services/apiClient';
import { createMockFetch, mockFetchResponse, mockUserAlex, mockUserMaya } from '../helpers/testUtils';

describe('Authorization & Guest Protection (App + Navbar)', () => {
  it('allows guest access to landing and browse skills without logging in', async () => {
    const user = userEvent.setup();
    createMockFetch((url) => {
      if (url.startsWith('/api/users')) return mockFetchResponse({ users: [mockUserMaya], count: 1 });
      return mockFetchResponse({});
    });

    render(<App />);

    expect(screen.getByText(/Exchange Skills\./i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Sign In' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: 'Join SkillSwap' })).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: /explore skills/i })[0]);
    await waitFor(() => {
      expect(screen.getByText('Browse Skills & Find Partners')).toBeInTheDocument();
      expect(screen.getByText('Maya Lin')).toBeInTheDocument();
    });
  });

  it('blocks guest from protected AI Assistant route and opens login modal', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /try ai skill assistant/i }));

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(
      screen.getByText('Please log in or register to access ai assistant')
    ).toBeInTheDocument();
  });

  it('automatically routes authenticated user to Dashboard and shows protected navigation', async () => {
    setStoredAuth('jwt_alex', mockUserAlex);
    createMockFetch((url) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/stats') {
        return mockFetchResponse({
          stats: {
            skillsOffered: 2,
            skillsWanted: 2,
            sentRequestsCount: 0,
            receivedRequestsCount: 0,
            acceptedExchangesCount: 0,
            unreadMessagesCount: 0,
            exchangesCompletedCount: 3
          },
          recentRequests: [],
          smartMatches: []
        });
      }
      if (url === '/api/conversations') return mockFetchResponse({ conversations: [] });
      if (url === '/api/notifications') return mockFetchResponse({ notifications: [] });
      return mockFetchResponse({});
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, Alex Rivera')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Swap Requests' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Messages' })).toBeInTheDocument();
  });
});
