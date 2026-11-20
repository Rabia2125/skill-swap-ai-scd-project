import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIAssistantPage } from '../../src/features/ai-assistant/pages/AIAssistantPage';
import { AuthProvider } from '../../src/context/AuthContext';
import { setStoredAuth } from '../../src/services/apiClient';
import { createMockFetch, mockFetchResponse, mockUserAlex } from '../helpers/testUtils';

describe('AI Assistant Feature (AIAssistantPage)', () => {
  it('renders greeting, suggested prompts, and submits custom prompt', async () => {
    const user = userEvent.setup();
    setStoredAuth('jwt_alex', mockUserAlex);

    const fetchSpy = createMockFetch((url, init) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/ai/chat' && init?.method === 'POST') {
        return mockFetchResponse({ reply: 'Week 1: Learn TypeScript generics & hooks.' });
      }
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <AIAssistantPage />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText(/Hello Alex Rivera!/i)).toBeInTheDocument());
    expect(screen.getByText('Generate Learning Roadmap')).toBeInTheDocument();

    const askButton = screen.getByRole('button', { name: /^ask$/i });
    expect(askButton).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/ask anything about skills/i), 'Give me a React plan');
    expect(askButton).toBeEnabled();
    await user.click(askButton);

    await waitFor(() => {
      expect(screen.getByText('Week 1: Learn TypeScript generics & hooks.')).toBeInTheDocument();
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/ai/chat',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Give me a React plan')
      })
    );
  });

  it('triggers prompt when clicking a suggested prompt card and clears chat history', async () => {
    const user = userEvent.setup();
    setStoredAuth('jwt_alex', mockUserAlex);

    createMockFetch((url) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/ai/chat') return mockFetchResponse({ reply: 'Build a SaaS design kit!' });
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <AIAssistantPage />
      </AuthProvider>
    );

    await user.click(screen.getByText('Collaborative Project Ideas'));

    await waitFor(() => {
      expect(screen.getByText('Build a SaaS design kit!')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /clear chat/i }));
    expect(screen.queryByText('Build a SaaS design kit!')).not.toBeInTheDocument();
    expect(screen.getByText(/Chat history cleared\./i)).toBeInTheDocument();
  });

  it('shows graceful fallback assistant message when AI API fails', async () => {
    const user = userEvent.setup();
    setStoredAuth('jwt_alex', mockUserAlex);

    createMockFetch((url) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/ai/chat') return mockFetchResponse({ error: 'Gemini quota exceeded' }, false, 503);
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <AIAssistantPage />
      </AuthProvider>
    );

    await user.type(screen.getByPlaceholderText(/ask anything about skills/i), 'Help me learn');
    await user.click(screen.getByRole('button', { name: /^ask$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Gemini quota exceeded/)).toBeInTheDocument();
    });
  });
});
