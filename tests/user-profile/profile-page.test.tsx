import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProfilePage } from '../../src/features/user-profile/pages/ProfilePage';
import { AuthProvider } from '../../src/context/AuthContext';
import { setStoredAuth } from '../../src/services/apiClient';
import { createMockFetch, mockFetchResponse, mockUserAlex } from '../helpers/testUtils';

describe('User Profile Feature (ProfilePage)', () => {
  it('displays user details, skills to teach, wishlist, and 100% completion score', async () => {
    setStoredAuth('jwt_alex', mockUserAlex);
    createMockFetch(() => mockFetchResponse({ user: mockUserAlex }));

    render(
      <AuthProvider>
        <ProfilePage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    });

    expect(screen.getByText('Senior Full-Stack Developer')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Skills I Can Teach (2)')).toBeInTheDocument();
    expect(screen.getByText('React.js')).toBeInTheDocument();
    expect(screen.getByText('Skills I Want to Learn (2)')).toBeInTheDocument();
    expect(screen.getByText('UI/UX Design')).toBeInTheDocument();
  });

  it('calculates partial profile completion percentage when optional fields are empty', async () => {
    const partialUser = {
      ...mockUserAlex,
      profile: {
        ...mockUserAlex.profile,
        bio: '',
        skillsToTeach: [],
        skillsToLearn: [],
        experience: '',
        education: '',
        availability: '',
        learningGoals: ''
      }
    };
    setStoredAuth('jwt_partial', partialUser);
    createMockFetch(() => mockFetchResponse({ user: partialUser }));

    render(
      <AuthProvider>
        <ProfilePage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('30%')).toBeInTheDocument();
    });
    expect(screen.getByText('No skills listed to teach yet.')).toBeInTheDocument();
    expect(screen.getByText('No skills added to wishlist yet.')).toBeInTheDocument();
  });
});
