import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfilePage } from '../../src/features/user-profile/pages/ProfilePage';
import { AuthProvider } from '../../src/context/AuthContext';
import { setStoredAuth } from '../../src/services/apiClient';
import { createMockFetch, mockFetchResponse, mockUserAlex } from '../helpers/testUtils';

describe('Skill Management inside ProfilePage', () => {
  it('adds and removes skills to teach and wishlist skills before saving', async () => {
    const user = userEvent.setup();
    setStoredAuth('jwt_alex', mockUserAlex);

    let savedBody: any = null;
    createMockFetch((url, init) => {
      if (url === '/api/auth/me') return mockFetchResponse({ user: mockUserAlex });
      if (url === '/api/profile' && init?.method === 'PUT') {
        savedBody = JSON.parse(String(init.body));
        return mockFetchResponse({
          message: 'Saved',
          user: {
            ...mockUserAlex,
            profile: {
              ...mockUserAlex.profile,
              skillsToTeach: savedBody.skillsToTeach,
              skillsToLearn: savedBody.skillsToLearn
            }
          }
        });
      }
      return mockFetchResponse({});
    });

    render(
      <AuthProvider>
        <ProfilePage />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Alex Rivera')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /edit profile/i }));

    // Add a new skill to teach
    await user.type(screen.getByPlaceholderText(/skill name \(e\.g\. docker\)/i), 'Docker');
    await user.selectOptions(screen.getByLabelText('New skill category'), 'Data Analysis');
    await user.selectOptions(screen.getByLabelText('New skill level'), 'Advanced');
    await user.click(screen.getByRole('button', { name: /^add$/i }));
    expect(screen.getByText('Docker')).toBeInTheDocument();

    // Remove existing TypeScript skill
    await user.click(screen.getByLabelText('Remove TypeScript'));
    expect(screen.queryByLabelText('Remove TypeScript')).not.toBeInTheDocument();

    // Add wishlist skill and remove Figma
    await user.type(screen.getByPlaceholderText(/e\.g\. flutter, seo, ui\/ux/i), 'GraphQL');
    await user.click(screen.getByRole('button', { name: /add to wishlist/i }));
    expect(screen.getByText('GraphQL')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Remove wanted skill Figma'));

    // Save changes
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(savedBody).not.toBeNull());
    expect(savedBody.skillsToTeach.map((s: any) => s.name)).toEqual(['React.js', 'Docker']);
    expect(savedBody.skillsToLearn).toEqual(['UI/UX Design', 'GraphQL']);
    await waitFor(() => expect(screen.queryByText('TypeScript')).not.toBeInTheDocument());
  });

  it('ignores blank skill input when Add is clicked', async () => {
    const user = userEvent.setup();
    setStoredAuth('jwt_alex', mockUserAlex);
    createMockFetch(() => mockFetchResponse({ user: mockUserAlex }));

    render(
      <AuthProvider>
        <ProfilePage />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Alex Rivera')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /edit profile/i }));

    const initialDeleteButtons = screen.getAllByLabelText(/^Remove (?!wanted)/).length;
    await user.type(screen.getByPlaceholderText(/skill name \(e\.g\. docker\)/i), '   ');
    await user.click(screen.getByRole('button', { name: /^add$/i }));

    expect(screen.getAllByLabelText(/^Remove (?!wanted)/).length).toBe(initialDeleteButtons);
  });
});
