import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { NotificationBell } from '../../src/features/notifications/components/NotificationBell';
import { createMockFetch, mockFetchResponse, mockNotifications } from '../helpers/testUtils';

function NotificationHarness({ onNavigate = vi.fn() }: { onNavigate?: (view: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <NotificationBell
      isAuthenticated={true}
      currentView="dashboard"
      isOpen={open}
      onToggle={() => setOpen((v) => !v)}
      onClose={() => setOpen(false)}
      onNavigate={onNavigate}
    />
  );
}

describe('Notifications Feature (NotificationBell)', () => {
  it('shows unread badge count, opens dropdown, and marks all notifications read', async () => {
    const user = userEvent.setup();
    const fetchSpy = createMockFetch((url, init) => {
      if (url === '/api/notifications') return mockFetchResponse({ notifications: mockNotifications });
      if (url === '/api/notifications/read-all' && init?.method === 'PUT') {
        return mockFetchResponse({ message: 'Marked read' });
      }
      return mockFetchResponse({});
    });

    render(<NotificationHarness />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText('View notifications'));
    expect(screen.getByText('New Swap Request')).toBeInTheDocument();
    expect(screen.getByText('Welcome to SkillSwap AI')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /mark all read/i }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /mark all read/i })).not.toBeInTheDocument();
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/notifications/read-all',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  it('navigates to notification target link and closes dropdown when clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    createMockFetch(() => mockFetchResponse({ notifications: mockNotifications }));

    render(<NotificationHarness onNavigate={onNavigate} />);

    await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument());
    await user.click(screen.getByLabelText('View notifications'));
    await user.click(screen.getByText('New Swap Request'));

    expect(onNavigate).toHaveBeenCalledWith('requests');
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('renders empty state when user has no notifications', async () => {
    const user = userEvent.setup();
    createMockFetch(() => mockFetchResponse({ notifications: [] }));

    render(<NotificationHarness />);

    await user.click(screen.getByLabelText('View notifications'));
    await waitFor(() => {
      expect(screen.getByText('No notifications yet.')).toBeInTheDocument();
    });
  });
});
