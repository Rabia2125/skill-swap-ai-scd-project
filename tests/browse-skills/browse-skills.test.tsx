import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowseSkillsPage } from '../../src/features/browse-skills/pages/BrowseSkillsPage';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { setStoredAuth } from '../../src/services/apiClient';
import { createMockFetch, mockFetchResponse, mockUserAlex, mockUserMaya } from '../helpers/testUtils';

function AuthModalTracker() {
  const { authModalOpen, authModalReason } = useAuth();
  return <span data-testid="auth-modal-probe">{authModalOpen ? authModalReason : 'closed'}</span>;
}

describe('Browse Skills Feature (BrowseSkillsPage)', () => {
  it('loads and displays peer skill cards with offered and wanted skills', async () => {
    createMockFetch(() => mockFetchResponse({ users: [mockUserAlex, mockUserMaya], count: 2 }));

    render(
      <AuthProvider>
        <BrowseSkillsPage
          onOpenSwapModalWithUser={vi.fn()}
          onViewUserProfile={vi.fn()}
        />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
      expect(screen.getByText('Maya Lin')).toBeInTheDocument();
    });
    expect(screen.getAllByText('React.js').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Figma Design Systems')).toBeInTheDocument();
  });

  it('calls onViewUserProfile when View Profile is clicked', async () => {
    const user = userEvent.setup();
    const onViewUserProfile = vi.fn();
    createMockFetch(() => mockFetchResponse({ users: [mockUserMaya], count: 1 }));

    render(
      <AuthProvider>
        <BrowseSkillsPage
          onOpenSwapModalWithUser={vi.fn()}
          onViewUserProfile={onViewUserProfile}
        />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Maya Lin')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /view profile/i }));
    expect(onViewUserProfile).toHaveBeenCalledWith(mockUserMaya);
  });

  it('prompts login modal when an unauthenticated guest clicks Send Swap Request', async () => {
    const user = userEvent.setup();
    const onOpenSwapModalWithUser = vi.fn();
    createMockFetch(() => mockFetchResponse({ users: [mockUserMaya], count: 1 }));

    render(
      <AuthProvider>
        <AuthModalTracker />
        <BrowseSkillsPage
          onOpenSwapModalWithUser={onOpenSwapModalWithUser}
          onViewUserProfile={vi.fn()}
        />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Maya Lin')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /send swap request/i }));

    expect(onOpenSwapModalWithUser).not.toHaveBeenCalled();
    expect(screen.getByTestId('auth-modal-probe')).toHaveTextContent(
      'Sign in or register to send a skill swap request to Maya Lin'
    );
  });

  it('opens swap modal when an authenticated user clicks Send Swap Request', async () => {
    const user = userEvent.setup();
    const onOpenSwapModalWithUser = vi.fn();
    setStoredAuth('jwt_alex', mockUserAlex);
    createMockFetch((url) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      return mockFetchResponse({ users: [mockUserMaya], count: 1 });
    });

    render(
      <AuthProvider>
        <BrowseSkillsPage
          onOpenSwapModalWithUser={onOpenSwapModalWithUser}
          onViewUserProfile={vi.fn()}
        />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Maya Lin')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /send swap request/i }));
    expect(onOpenSwapModalWithUser).toHaveBeenCalledWith(mockUserMaya);
  });
});
