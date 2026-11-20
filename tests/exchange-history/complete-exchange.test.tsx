import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExchangeHistoryPage } from '../../src/features/exchange-history/pages/ExchangeHistoryPage';
import { AuthProvider } from '../../src/context/AuthContext';
import { setStoredAuth } from '../../src/services/apiClient';
import { createMockFetch, mockExchanges, mockFetchResponse, mockUserAlex } from '../helpers/testUtils';

describe('Complete Exchange & Rating Flow', () => {
  it('completes an active exchange with star rating and review feedback', async () => {
    const user = userEvent.setup();
    setStoredAuth('jwt_alex', mockUserAlex);

    const fetchSpy = createMockFetch((url, init) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/exchanges') return mockFetchResponse({ exchanges: [mockExchanges[0]] });
      if (url === '/api/exchanges/ex_1/complete' && init?.method === 'PUT') {
        return mockFetchResponse({
          message: 'Completed',
          exchange: { ...mockExchanges[0], status: 'Completed', rating: 4, review: 'Awesome mentor!' }
        });
      }
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <ExchangeHistoryPage onNavigateToMessages={vi.fn()} />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Mark as Completed')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /mark as completed/i }));

    await user.click(screen.getByLabelText('Rate 4 stars'));
    expect(screen.getByText('4 / 5 Stars')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Review & Feedback'), 'Awesome mentor!');
    await user.click(screen.getByRole('button', { name: /confirm completion/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'Exchange with Maya Lin marked as completed!'
      );
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/exchanges/ex_1/complete',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ rating: 4, review: 'Awesome mentor!' })
      })
    );
  });

  it('displays error banner when completion API request fails', async () => {
    const user = userEvent.setup();
    setStoredAuth('jwt_alex', mockUserAlex);

    createMockFetch((url, init) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/exchanges') return mockFetchResponse({ exchanges: [mockExchanges[0]] });
      if (url === '/api/exchanges/ex_1/complete' && init?.method === 'PUT') {
        return mockFetchResponse({ error: 'Exchange already completed' }, false, 400);
      }
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <ExchangeHistoryPage onNavigateToMessages={vi.fn()} />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Mark as Completed')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /mark as completed/i }));
    await user.type(screen.getByLabelText('Review & Feedback'), 'Test review');
    await user.click(screen.getByRole('button', { name: /confirm completion/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Exchange already completed');
    });
  });
});
