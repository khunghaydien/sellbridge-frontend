"use client";

import { useFacebookWebhookContext } from '@/providers';
import { useEffect, useState } from 'react';

interface WebhookNotificationProps {
  /**
   * Show notification badge on new messages
   */
  showBadge?: boolean;
  /**
   * Filter by page ID (optional)
   */
  pageId?: string;
  /**
   * Only show specific event types
   */
  eventTypes?: ('message' | 'postback' | 'delivery' | 'read')[];
}

export function WebhookNotification({
  showBadge = true,
  pageId,
  eventTypes = ['message'],
}: WebhookNotificationProps) {
  const { messages, isConnected } = useFacebookWebhookContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (messages.length === 0) return;

    const latestMessage = messages[0];

    // Filter by page ID if specified
    if (pageId && latestMessage.pageId !== pageId) return;

    // Filter by event types
    if (!eventTypes.includes(latestMessage.type as any)) return;

    // Increment unread count
    setUnreadCount((prev) => prev + 1);
    setLastMessage(latestMessage);

    // Show toast notification
    if (showBadge) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }

    // Play notification sound (optional)
    // const audio = new Audio('/notification.mp3');
    // audio.play().catch(console.error);
  }, [messages, pageId, eventTypes, showBadge]);

  if (!isConnected || messages.length === 0) return null;

  return (
    <>
      {/* Notification Badge */}
      {showBadge && unreadCount > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className="relative inline-flex items-center justify-center w-10 h-10 bg-red-500 text-white rounded-full cursor-pointer hover:bg-red-600 transition-all shadow-lg"
            onClick={() => setUnreadCount(0)}
            title="Clear notifications"
          >
            <span className="text-sm font-bold">{unreadCount > 99 ? '99+' : unreadCount}</span>
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && lastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 max-w-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  New {lastMessage.type}
                </p>
                {lastMessage.text && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                    {lastMessage.text}
                  </p>
                )}
                {lastMessage.title && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                    {lastMessage.title}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Page: {lastMessage.pageId}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowToast(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

