import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardPage } from '../../src/features/dashboard/pages/DashboardPage';
import { AuthProvider } from '../../src/context/AuthContext';
import { setStoredAuth } from '../../src/services/apiClient';
import { createMockFetch, mockFetchResponse, mockUserAlex, mockUserMaya } from '../helpers/testUtils';

describe('Dashboard Smart Matches', () => {
  it('displays smart matches and opens swap modal with selected partner', async () => {
    const user = userEvent.setup();
    const onOpenSwapModalWithUser = vi.fn();
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
          smartMatches: [
            {
              user: mockUserMaya,
              matchScore: 95,
              matchingOffers: ['Figma Design Systems'],
              matchingWants: ['React.js'],
              reason: 'Teaches Figma Design Systems · Wants React.js'
            }
          ]
        });
      }
      if (url === '/api/conversations') return mockFetchResponse({ conversations: [] });
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <DashboardPage onNavigate={vi.fn()} onOpenSwapModalWithUser={onOpenSwapModalWithUser} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Maya Lin')).toBeInTheDocument();
      expect(screen.getByText('Teaches Figma Design Systems · Wants React.js')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /propose swap/i }));
    expect(onOpenSwapModalWithUser).toHaveBeenCalledWith(mockUserMaya);
  });
});
