import { useEffect, useRef, useState } from 'react';
import { useNotificationStore } from '@/features/notifications/store/notificationStore';
import { useNotificationPolling } from '@/features/notifications/hooks/useNotificationPolling';
import { mockDataSource } from '@/api/mockDataSource';

const PAGE_SIZE = 20;

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const notifications = useNotificationStore((s) => s.notifications);
  const hydrate = useNotificationStore((s) => s.hydrate);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const unreadCount = useNotificationStore((s) => s.unreadCount());

  useNotificationPolling(isOpen);

  // Seed initial notifications from mock-data.json once.
  useEffect(() => {
    void mockDataSource.getInitialNotifications().then(hydrate);
  }, [hydrate]);

  // Click outside and Escape key handler to close panel
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Notifications, ${unreadCount} unread`}
        className="relative rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications panel"
          className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex items-center justify-between px-2 py-1">
            <h3 className="text-sm font-semibold">Notifications</h3>
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-medium text-brand-600 dark:text-emerald-400 hover:underline"
            >
              Mark all read
            </button>
          </div>

          <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800">
            {visible.length === 0 && (
              <li className="px-2 py-4 text-center text-sm text-gray-500">No notifications yet.</li>
            )}
            {visible.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => markRead(n.id)}
                  className={`w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    n.read
                      ? 'text-gray-600 dark:text-gray-400 font-normal'
                      : 'font-semibold text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {!n.read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                    )}
                    <p className="truncate">{n.title}</p>
                  </div>
                  <p className="mt-0.5 truncate text-xs font-normal text-gray-500 dark:text-gray-400">
                    {n.message}
                  </p>
                </button>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2 text-xs">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="disabled:opacity-40"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
