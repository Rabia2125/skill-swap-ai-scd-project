import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowseSkillsPage } from '../../src/features/browse-skills/pages/BrowseSkillsPage';
import { AuthProvider } from '../../src/context/AuthContext';
import { createMockFetch, mockFetchResponse, mockUserAlex, mockUserMaya } from '../helpers/testUtils';

describe('Browse Skills Search & Filtering', () => {
  it('filters by search keyword and location on form submission', async () => {
    const user = userEvent.setup();
    const fetchSpy = createMockFetch((url) => {
      if (url.includes('search=Figma')) {
        return mockFetchResponse({ users: [mockUserMaya], count: 1 });
      }
      return mockFetchResponse({ users: [mockUserAlex, mockUserMaya], count: 2 });
    });

    render(
      <AuthProvider>
        <BrowseSkillsPage onOpenSwapModalWithUser={vi.fn()} onViewUserProfile={vi.fn()} />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Alex Rivera')).toBeInTheDocument());

    await user.type(screen.getByPlaceholderText(/search skill/i), 'Figma');
    await user.type(screen.getByPlaceholderText(/city, state/i), 'Brooklyn');
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(screen.queryByText('Alex Rivera')).not.toBeInTheDocument();
      expect(screen.getByText('Maya Lin')).toBeInTheDocument();
    });
    expect(fetchSpy).toHaveBeenCalledWith('/api/users?search=Figma&location=Brooklyn', expect.any(Object));
  });

  it('filters by category pill and skill level dropdown', async () => {
    const user = userEvent.setup();
    const fetchSpy = createMockFetch(() => mockFetchResponse({ users: [mockUserMaya], count: 1 }));

    render(
      <AuthProvider>
        <BrowseSkillsPage onOpenSwapModalWithUser={vi.fn()} onViewUserProfile={vi.fn()} />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Maya Lin')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'UI/UX Designing' }));
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/users?category=UI%2FUX+Designing', expect.any(Object));
    });

    await user.selectOptions(screen.getByLabelText('Skill level filter'), 'Expert');
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/users?category=UI%2FUX+Designing&level=Expert',
        expect.any(Object)
      );
    });
  });

  it('renders clean empty state and resets filters when Clear Filters is clicked', async () => {
    const user = userEvent.setup();
    createMockFetch((url) => {
      if (url.includes('search=xyznonexistent')) {
        return mockFetchResponse({ users: [], count: 0 });
      }
      return mockFetchResponse({ users: [mockUserAlex], count: 1 });
    });

    render(
      <AuthProvider>
        <BrowseSkillsPage onOpenSwapModalWithUser={vi.fn()} onViewUserProfile={vi.fn()} />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Alex Rivera')).toBeInTheDocument());

    await user.type(screen.getByPlaceholderText(/search skill/i), 'xyznonexistent');
    await user.click(screen.getByRole('button', { name: /^search$/i }));

    await waitFor(() => {
      expect(screen.getByText('No matching skill partners found')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Clear Filters' }));

    await waitFor(() => {
      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    });
  });
});
