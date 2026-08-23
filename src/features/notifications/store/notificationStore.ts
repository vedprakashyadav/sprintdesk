import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppNotification } from '@/types';

interface NotificationState {
  notifications: AppNotification[];
  hydrate: (initial: AppNotification[]) => void;
  addFromPoll: (items: AppNotification[]) => AppNotification[]; // returns newly-added items
  markRead: (id: number) => void;
  markAllRead: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      hydrate: (initial) => {
        if (get().notifications.length === 0) set({ notifications: initial });
      },

      addFromPoll: (items) => {
        const existingIds = new Set(get().notifications.map((n) => n.id));
        const newItems = items.filter((n) => !existingIds.has(n.id));
        if (newItems.length > 0) {
          set((state) => ({ notifications: [...newItems, ...state.notifications] }));
        }
        return newItems;
      },

      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllRead: () =>
        set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: 'sprintdesk-notifications' },
  ),
);
