import { useMemo } from 'react';
import { useTasksQuery, useSprintsQuery } from '@/features/board/hooks/useBoardQueries';
import { useBoardStore } from '@/features/board/store/boardStore';
import type { TaskStatus } from '@/types';

const STATUS_ORDER: TaskStatus[] = ['backlog', 'in-progress', 'review', 'done'];
const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
};

export function useAnalyticsData() {
  const tasksQuery = useTasksQuery();
  const sprintsQuery = useSprintsQuery();
  const storeTasks = useBoardStore((s) => s.tasks);

  const tasks = useMemo(
    () => (storeTasks.length > 0 ? storeTasks : tasksQuery.data ?? []),
    [storeTasks, tasksQuery.data],
  );
  const sprints = useMemo(() => sprintsQuery.data ?? [], [sprintsQuery.data]);

  const velocity = useMemo(
    () =>
      sprints.map((sprint) => ({
        sprint: sprint.name,
        completed: tasks.filter((t) => t.sprintId === sprint.id && t.status === 'done').length,
      })),
    [tasks, sprints],
  );

  const statusDistribution = useMemo(
    () =>
      STATUS_ORDER.map((status) => ({
        status: STATUS_LABELS[status],
        count: tasks.filter((t) => t.status === status).length,
      })),
    [tasks],
  );

  const priorityBreakdown = useMemo(
    () =>
      STATUS_ORDER.map((status) => {
        const inColumn = tasks.filter((t) => t.status === status);
        return {
          status: STATUS_LABELS[status],
          high: inColumn.filter((t) => t.priority === 'high').length,
          medium: inColumn.filter((t) => t.priority === 'medium').length,
          low: inColumn.filter((t) => t.priority === 'low').length,
        };
      }),
    [tasks],
  );

  const completionTrend = useMemo(() => {
    const byDate = new Map<string, number>();
    tasks
      .filter((t) => t.completedAt)
      .forEach((t) => {
        const date = t.completedAt!.slice(0, 10);
        byDate.set(date, (byDate.get(date) ?? 0) + 1);
      });
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, completed: count }));
  }, [tasks]);

  return {
    isLoading: tasksQuery.isLoading || sprintsQuery.isLoading,
    velocity,
    statusDistribution,
    priorityBreakdown,
    completionTrend,
  };
}
