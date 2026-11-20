import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfileModal } from '../../src/features/user-profile/components/UserProfileModal';
import { mockUserMaya } from '../helpers/testUtils';

describe('UserProfileModal', () => {
  it('renders nothing when user prop is null', () => {
    const { container } = render(
      <UserProfileModal user={null} onClose={vi.fn()} onProposeSwap={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('displays peer profile details and triggers onProposeSwap + onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onProposeSwap = vi.fn();

    render(
      <UserProfileModal user={mockUserMaya} onClose={onClose} onProposeSwap={onProposeSwap} />
    );

    expect(screen.getByText('Maya Lin')).toBeInTheDocument();
    expect(screen.getByText('Lead UI/UX Designer')).toBeInTheDocument();
    expect(screen.getByText('Figma Design Systems')).toBeInTheDocument();
    expect(screen.getByText('React.js')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /send swap request/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onProposeSwap).toHaveBeenCalledWith(mockUserMaya);
  });

  it('closes when Close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <UserProfileModal user={mockUserMaya} onClose={onClose} onProposeSwap={vi.fn()} />
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
