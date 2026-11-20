import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { TestRunnerModal } from './components/TestRunnerModal';
import { AuthModal } from './features/authentication/components/AuthModal';
import { SendSwapModal } from './features/swap-requests/components/SendSwapModal';
import { UserProfileModal } from './features/user-profile/components/UserProfileModal';
import { profileService } from './features/user-profile/services/profileService';
import { LandingPage } from './features/landing/pages/LandingPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { BrowseSkillsPage } from './features/browse-skills/pages/BrowseSkillsPage';
import { SwapRequestsPage } from './features/swap-requests/pages/SwapRequestsPage';
import { MessagesPage } from './features/messaging/pages/MessagesPage';
import { AIAssistantPage } from './features/ai-assistant/pages/AIAssistantPage';
import { ProfilePage } from './features/user-profile/pages/ProfilePage';
import { ExchangeHistoryPage } from './features/exchange-history/pages/ExchangeHistoryPage';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { User } from './types';

function AppContent() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [browseCategory, setBrowseCategory] = useState<string>('All');

  // Modals state
  const [swapTargetUser, setSwapTargetUser] = useState<User | null>(null);
  const [inspectUser, setInspectUser] = useState<User | null>(null);
  const [showTestRunner, setShowTestRunner] = useState<boolean>(false);

  // Switch to dashboard when user logs in if currently on landing
  React.useEffect(() => {
    if (isAuthenticated && currentView === 'landing') {
      setCurrentView('dashboard');
    }
  }, [isAuthenticated, currentView]);

  const handleNavigate = (view: string) => {
    // Guest protection check
    const protectedViews = ['dashboard', 'requests', 'messages', 'ai-assistant', 'profile', 'history', 'settings'];
    if (protectedViews.includes(view) && !isAuthenticated) {
      openAuthModal(`Please log in or register to access ${view.replace('-', ' ')}`, 'login');
      return;
    }
    setCurrentView(view);
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSwapModal = (targetUser: User) => {
    if (!isAuthenticated) {
      openAuthModal(`Sign in or create an account to propose a skill swap with ${targetUser.name}`, 'login');
      return;
    }
    setSwapTargetUser(targetUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenTestRunner={() => setShowTestRunner(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            onSelectCategory={(cat) => setBrowseCategory(cat)}
          />
        )}

        {currentView === 'dashboard' && (
          <DashboardPage
            onNavigate={handleNavigate}
            onOpenSwapModalWithUser={handleOpenSwapModal}
          />
        )}

        {currentView === 'browse' && (
          <BrowseSkillsPage
            initialCategory={browseCategory}
            onOpenSwapModalWithUser={handleOpenSwapModal}
            onViewUserProfile={(u) => setInspectUser(u)}
          />
        )}

        {currentView === 'requests' && (
          <SwapRequestsPage
            onNavigateToMessages={() => setCurrentView('messages')}
            onViewUserProfile={(userId) => {
              profileService
                .getUserById(userId)
                .then(data => data.user && setInspectUser(data.user))
                .catch(() => {});
            }}
          />
        )}

        {currentView === 'messages' && <MessagesPage />}

        {currentView === 'ai-assistant' && <AIAssistantPage />}

        {currentView === 'profile' && <ProfilePage />}

        {currentView === 'history' && (
          <ExchangeHistoryPage onNavigateToMessages={() => setCurrentView('messages')} />
        )}

        {currentView === 'settings' && <SettingsPage />}
      </main>

      {/* Global Modals */}
      <AuthModal />

      <SendSwapModal
        targetUser={swapTargetUser}
        onClose={() => setSwapTargetUser(null)}
        onSuccess={() => {
          // If on requests page or browse page, state reloads
        }}
      />

      <UserProfileModal
        user={inspectUser}
        onClose={() => setInspectUser(null)}
        onProposeSwap={(u) => {
          setInspectUser(null);
          handleOpenSwapModal(u);
        }}
      />

      {showTestRunner && (
        <TestRunnerModal onClose={() => setShowTestRunner(false)} />
      )}
    </div>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected error occurred on the frontend.'
    };
  }

  componentDidCatch(error: Error) {
    console.error('SkillSwap frontend error caught by ErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Something went wrong</h2>
            <p className="text-xs text-slate-600">{this.state.errorMessage}</p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, errorMessage: '' })}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AppErrorBoundary>
  );
}
