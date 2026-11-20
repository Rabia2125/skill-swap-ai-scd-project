import React, { useState, useEffect } from 'react';
import { Bell, Clock } from 'lucide-react';
import { NotificationItem } from '../../../types';
import { notificationService } from '../services/notificationService';

interface NotificationBellProps {
  isAuthenticated: boolean;
  currentView: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  isAuthenticated,
  currentView,
  isOpen,
  onToggle,
  onClose,
  onNavigate
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      notificationService
        .getNotifications()
        .then(res => setNotifications(Array.isArray(res?.notifications) ? res.notifications : []))
        .catch(() => {});
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, currentView]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      // Ignore transient error
    }
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <span className="font-semibold text-sm text-slate-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                No notifications yet.
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.link) onNavigate(n.link.replace('/', ''));
                    onClose();
                  }}
                  className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    n.read ? 'bg-slate-50 hover:bg-slate-100 text-slate-700' : 'bg-blue-50/80 hover:bg-blue-100/80 text-blue-950 font-medium'
                  }`}
                >
                  <div className="font-semibold text-slate-900">{n.title}</div>
                  <div className="text-slate-600 mt-0.5">{n.message}</div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
