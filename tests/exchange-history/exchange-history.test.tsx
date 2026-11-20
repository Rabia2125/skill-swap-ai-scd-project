import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExchangeHistoryPage } from '../../src/features/exchange-history/pages/ExchangeHistoryPage';
import { AuthProvider } from '../../src/context/AuthContext';
import { setStoredAuth } from '../../src/services/apiClient';
import { createMockFetch, mockExchanges, mockFetchResponse, mockUserAlex } from '../helpers/testUtils';

describe('Exchange History Feature (ExchangeHistoryPage)', () => {
  it('renders active and completed exchange records with reviews', async () => {
    setStoredAuth('jwt_alex', mockUserAlex);
    createMockFetch((url) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/exchanges') return mockFetchResponse({ exchanges: mockExchanges });
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <ExchangeHistoryPage onNavigateToMessages={vi.fn()} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Maya Lin')).toBeInTheDocument();
      expect(screen.getByText('Carlos Mendez')).toBeInTheDocument();
    });
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('"Clear explanations and very patient!"')).toBeInTheDocument();
  });

  it('navigates to messages when Open Chat is clicked', async () => {
    const user = userEvent.setup();
    const onNavigateToMessages = vi.fn();
    setStoredAuth('jwt_alex', mockUserAlex);

    createMockFetch((url) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/exchanges') return mockFetchResponse({ exchanges: mockExchanges });
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <ExchangeHistoryPage onNavigateToMessages={onNavigateToMessages} />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getAllByText('Open Chat').length).toBeGreaterThan(0));
    await user.click(screen.getAllByRole('button', { name: /open chat/i })[0]);
    expect(onNavigateToMessages).toHaveBeenCalledTimes(1);
  });

  it('displays empty state when there are no exchange records', async () => {
    setStoredAuth('jwt_alex', mockUserAlex);
    createMockFetch((url) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/exchanges') return mockFetchResponse({ exchanges: [] });
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <ExchangeHistoryPage onNavigateToMessages={vi.fn()} />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No skill exchanges recorded yet')).toBeInTheDocument();
    });
  });
});
