import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LandingPage } from '../../src/features/landing/pages/LandingPage';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { SKILL_CATEGORIES } from '../../src/data/mockDatabase';

function AuthModalStateProbe() {
  const { authModalOpen, authModalTab } = useAuth();
  return <div data-testid="auth-state">{`${authModalOpen}:${authModalTab}`}</div>;
}

describe('Landing Feature (LandingPage)', () => {
  it('renders hero headline, trust indicators, and all 14 skill categories', () => {
    render(
      <AuthProvider>
        <LandingPage onNavigate={vi.fn()} />
      </AuthProvider>
    );

    expect(screen.getByText(/Exchange Skills\./i)).toBeInTheDocument();
    expect(screen.getByText(/Empower Your Future\./i)).toBeInTheDocument();
    expect(screen.getByText('How SkillSwap AI Works')).toBeInTheDocument();
    expect(screen.getByText('Meet SkillSwap AI Assistant')).toBeInTheDocument();

    for (const category of SKILL_CATEGORIES) {
      expect(screen.getByText(category)).toBeInTheDocument();
    }
  });

  it('opens register modal when Start Swapping Free CTA is clicked', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthModalStateProbe />
        <LandingPage onNavigate={vi.fn()} />
      </AuthProvider>
    );

    await user.click(screen.getByRole('button', { name: /start swapping free/i }));
    expect(screen.getByTestId('auth-state')).toHaveTextContent('true:register');
  });

  it('navigates to browse and selects category when a featured category card is clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onSelectCategory = vi.fn();

    render(
      <AuthProvider>
        <LandingPage onNavigate={onNavigate} onSelectCategory={onSelectCategory} />
      </AuthProvider>
    );

    await user.click(screen.getByText('Programming'));
    expect(onSelectCategory).toHaveBeenCalledWith('Programming');
    expect(onNavigate).toHaveBeenCalledWith('browse');
  });

  it('navigates to browse and ai-assistant from hero and AI CTA buttons', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(
      <AuthProvider>
        <LandingPage onNavigate={onNavigate} />
      </AuthProvider>
    );

    await user.click(screen.getByRole('button', { name: /browse available skills/i }));
    expect(onNavigate).toHaveBeenCalledWith('browse');

    await user.click(screen.getByRole('button', { name: /try ai skill assistant/i }));
    expect(onNavigate).toHaveBeenCalledWith('ai-assistant');
  });
});
