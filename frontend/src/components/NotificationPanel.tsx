'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  notification_id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  status: string;
  created_at: string;
  metadata?: any;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const priorityColors: Record<string, { bg: string; border: string; text: string }> = {
  urgent: { bg: 'bg-red-950/30', border: 'border-red-500/50', text: 'text-red-200' },
  high: { bg: 'bg-orange-950/30', border: 'border-orange-500/50', text: 'text-orange-200' },
  medium: { bg: 'bg-yellow-950/30', border: 'border-yellow-500/50', text: 'text-yellow-200' },
  low: { bg: 'bg-green-950/30', border: 'border-green-500/50', text: 'text-green-200' },
};

const notificationIcons: Record<string, string> = {
  medication_reminder: 'M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2M16 7a4 4 0 11-8 0 4 4 0 018 0z',
  appointment_reminder: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  symptom_checkin: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  outbreak_alert: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  followup_care: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  ai_consultation_followup: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
};

export default function NotificationPanel({ isOpen, onClose, userId }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filter]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const { getUserNotifications } = await import('@/lib/api');
      const response = await getUserNotifications(
        userId,
        undefined,
        filter === 'unread' ? 'sent' : undefined
      );

      setNotifications(response.data?.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to mock data
      setNotifications([
        {
          notification_id: 'notif-1',
          type: 'medication_reminder',
          title: 'Time for Ibuprofen',
          message: 'Take 500mg of Ibuprofen. Frequency: daily',
          priority: 'high',
          status: 'sent',
          created_at: new Date().toISOString(),
          metadata: { medication_name: 'Ibuprofen', dosage: '500mg' },
        },
        {
          notification_id: 'notif-2',
          type: 'symptom_checkin',
          title: 'How are your headache symptoms?',
          message: "It's been a while since your last check-in. Let us know how you're feeling.",
          priority: 'medium',
          status: 'sent',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          metadata: { condition: 'Headache' },
        },
        {
          notification_id: 'notif-3',
          type: 'outbreak_alert',
          title: '⚠️ Flu Alert in Boston',
          message: 'Flu cases are up in Boston (450 active cases - moderate severity).',
          priority: 'high',
          status: 'read',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          metadata: { location: 'Boston', case_count: 450 },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { markNotificationRead } = await import('@/lib/api');
      await markNotificationRead(userId, notificationId);

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n.notification_id === notificationId
            ? { ...n, status: 'read' }
            : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => n.status !== 'read').length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-start justify-end bg-black/50 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-md h-[90vh] mt-16 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 to-indigo-950 overflow-hidden flex flex-col"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-indigo-500/20 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/30">
                  <svg className="h-6 w-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Notifications</h3>
                  <p className="text-sm text-indigo-300">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-indigo-300 transition-colors hover:bg-indigo-500/20 hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-950/30 text-indigo-300 hover:bg-indigo-950/50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-950/30 text-indigo-300 hover:bg-indigo-950/50'
                }`}
              >
                Unread
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg className="h-16 w-16 text-indigo-500/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-indigo-300">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification, index) => {
                const colors = priorityColors[notification.priority] || priorityColors.medium;
                const iconPath = notificationIcons[notification.type] || notificationIcons.symptom_checkin;
                const isUnread = notification.status !== 'read';

                return (
                  <motion.div
                    key={notification.notification_id}
                    className={`rounded-lg border ${colors.border} ${colors.bg} p-4 ${
                      isUnread ? 'ring-2 ring-indigo-500/30' : 'opacity-70'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${colors.bg} ${colors.border} border`}>
                        <svg className={`h-5 w-5 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                        </svg>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-semibold ${colors.text}`}>{notification.title}</h4>
                          {isUnread && (
                            <span className="flex h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500"></span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-indigo-300/80">{notification.message}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-indigo-400/60">
                            {getRelativeTime(notification.created_at)}
                          </span>
                          {isUnread && (
                            <button
                              onClick={() => handleMarkAsRead(notification.notification_id)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
