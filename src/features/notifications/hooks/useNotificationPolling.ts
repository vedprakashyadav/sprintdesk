import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { jsonPlaceholderClient } from '@/lib/jsonPlaceholderClient';
import { useNotificationStore } from '@/features/notifications/store/notificationStore';
import { useToast } from '@/components/feedback/useToast';
import type { AppNotification } from '@/types';

const POLL_INTERVAL_MS = Number(import.meta.env.VITE_NOTIFICATIONS_POLL_INTERVAL_MS ?? 15000);

interface PlaceholderPost {
  id: number;
  title: string;
}

function toNotification(post: PlaceholderPost): AppNotification {
  return {
    id: post.id,
    title: 'New activity',
    message: post.title,
    type: 'task',
    read: false,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Polls JSONPlaceholder and treats new post ids as new notifications,
 * per the assignment brief. Pauses while the tab is hidden.
 */
export function useNotificationPolling(isPanelOpen: boolean) {
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);
  const addFromPoll = useNotificationStore((s) => s.addFromPoll);
  const toast = useToast();

  useEffect(() => {
    const handleVisibility = () => setIsTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useQuery({
    queryKey: ['notifications', 'poll'],
    queryFn: async () => {
      const { data } = await jsonPlaceholderClient.get<PlaceholderPost[]>('/posts', {
        params: { _limit: 5 },
      });
      const mapped = data.map(toNotification);
      const added = addFromPoll(mapped);

      if (added.length > 0 && !isPanelOpen) {
        toast.info(
          added.length === 1
            ? added[0]?.message ?? 'New notification'
            : `${added.length} new notifications`,
        );
      }
      return mapped;
    },
    refetchInterval: isTabVisible ? POLL_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
  });
}
