import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardPage } from '../../src/features/dashboard/pages/DashboardPage';
import { AuthProvider } from '../../src/context/AuthContext';
import { setStoredAuth } from '../../src/services/apiClient';
import {
  createMockFetch,
  mockConversations,
  mockFetchResponse,
  mockSwapRequests,
  mockUserAlex,
  mockUserMaya
} from '../helpers/testUtils';

describe('Dashboard Feature (DashboardPage)', () => {
  it('renders user welcome banner, KPI metrics, recent requests, and active conversations', async () => {
    setStoredAuth('jwt_alex', mockUserAlex);
    createMockFetch((url) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/stats') {
        return mockFetchResponse({
          stats: {
            skillsOffered: 2,
            skillsWanted: 2,
            sentRequestsCount: 1,
            receivedRequestsCount: 3,
            acceptedExchangesCount: 2,
            unreadMessagesCount: 1,
            exchangesCompletedCount: 3
          },
          recentRequests: mockSwapRequests,
          smartMatches: []
        });
      }
      if (url === '/api/conversations') {
        return mockFetchResponse({ conversations: mockConversations });
      }
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <DashboardPage onNavigate={vi.fn()} onOpenSwapModalWithUser={vi.fn()} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome, Alex Rivera')).toBeInTheDocument();
      expect(screen.getByText('Received Requests')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Maya Lin').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Looking forward to our session!')).toBeInTheDocument();
  });

  it('triggers navigation from quick action buttons', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
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
            exchangesCompletedCount: 0
          },
          recentRequests: [],
          smartMatches: []
        });
      }
      if (url === '/api/conversations') return mockFetchResponse({ conversations: [] });
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <DashboardPage onNavigate={onNavigate} onOpenSwapModalWithUser={vi.fn()} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Discover Partners')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Discover Partners'));
    expect(onNavigate).toHaveBeenCalledWith('browse');

    await user.click(screen.getByText('Ask AI Assistant'));
    expect(onNavigate).toHaveBeenCalledWith('ai-assistant');

    await user.click(screen.getByText('Edit Profile'));
    expect(onNavigate).toHaveBeenCalledWith('profile');
  });

  it('handles API failure gracefully without crashing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setStoredAuth('jwt_alex', mockUserAlex);
    createMockFetch((url) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      return mockFetchResponse({ error: 'Server error' }, false, 500);
    });

    render(
      <AuthProvider>
        <DashboardPage onNavigate={vi.fn()} onOpenSwapModalWithUser={vi.fn()} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome, Alex Rivera')).toBeInTheDocument();
    });
    expect(screen.getByText(/Update your skills in profile/i)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
