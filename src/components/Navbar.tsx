import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from '../features/notifications/components/NotificationBell';
import {
  Sparkles,
  Repeat,
  User as UserIcon,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  CheckCircle2,
  History,
  Settings as SettingsIcon
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenTestRunner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenTestRunner }) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
              <Repeat className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                SkillSwap <span className="text-blue-600 font-extrabold text-sm tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-50">AI</span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  currentView === 'dashboard' ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'hover:text-slate-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('browse')}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  currentView === 'browse' ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'hover:text-slate-900'
                }`}
              >
                Browse Skills
              </button>
              <button
                onClick={() => onNavigate('requests')}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  currentView === 'requests' ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'hover:text-slate-900'
                }`}
              >
                Swap Requests
              </button>
              <button
                onClick={() => onNavigate('messages')}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  currentView === 'messages' ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'hover:text-slate-900'
                }`}
              >
                Messages
              </button>
              <button
                onClick={() => onNavigate('ai-assistant')}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                  currentView === 'ai-assistant' ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'text-blue-600/90 hover:text-blue-700'
                }`}
              >
                <Sparkles className="w-4 h-4 text-sky-500" />
                AI Assistant
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('landing')}
                className={`whitespace-nowrap shrink-0 transition-colors ${
                  currentView === 'landing' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('browse')}
                className={`whitespace-nowrap shrink-0 transition-colors ${
                  currentView === 'browse' ? 'text-blue-600 font-semibold' : 'hover:text-slate-900'
                }`}
              >
                Explore Skills
              </button>
              <a href="#how-it-works" className="whitespace-nowrap shrink-0 hover:text-slate-900 transition-colors">
                How It Works
              </a>
              <a href="#categories" className="whitespace-nowrap shrink-0 hover:text-slate-900 transition-colors">
                Categories
              </a>
            </>
          )}
        </nav>

        {/* Zone 3: Actions & Auth / Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Automated Academic Test Suite Trigger */}
          <button
            onClick={onOpenTestRunner}
            title="Open Automated SCD Test Cases (TC-01..11 & GTC-01..10)"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>SCD Tests</span>
          </button>

          {isAuthenticated && user ? (
            <>
              {/* Notifications Dropdown */}
              <NotificationBell
                isAuthenticated={isAuthenticated}
                currentView={currentView}
                isOpen={showNotifications}
                onToggle={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                onClose={() => setShowNotifications(false)}
                onNavigate={onNavigate}
              />

              {/* User Avatar Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1 pl-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <img
                    src={user.profile.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <span className="hidden sm:inline-block text-xs font-semibold text-slate-800 max-w-[110px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <div className="text-sm font-bold text-slate-900 truncate">{user.name}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-500" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('history');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      <History className="w-4 h-4 text-slate-500" />
                      Exchange History
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      <SettingsIcon className="w-4 h-4 text-slate-500" />
                      Settings
                    </button>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        onNavigate('landing');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('Sign in to connect with skill partners', 'login')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('Create your free account to start exchanging skills', 'register')}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-colors whitespace-nowrap shrink-0"
              >
                Join SkillSwap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
