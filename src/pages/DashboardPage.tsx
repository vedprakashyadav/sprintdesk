import { useMemo } from 'react';
import { useTasksQuery, useSprintsQuery, useUsersQuery } from '@/features/board/hooks/useBoardQueries';
import { useBoardStore } from '@/features/board/store/boardStore';
import { Skeleton } from '@/components/ui/Skeleton';
import { DataTable } from '@/components/ui/DataTable';
import type { Task, TaskStatus } from '@/types';

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
};

const PRIORITY_BADGES: Record<Task['priority'], string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
};

export default function DashboardPage() {
  const tasksQuery = useTasksQuery();
  const sprintsQuery = useSprintsQuery();
  const usersQuery = useUsersQuery();
  const storeTasks = useBoardStore((s) => s.tasks);

  const tasks = useMemo(
    () => (storeTasks.length > 0 ? storeTasks : tasksQuery.data ?? []),
    [storeTasks, tasksQuery.data],
  );

  const usersById = useMemo(
    () => new Map((usersQuery.data ?? []).map((u) => [u.id, u])),
    [usersQuery.data],
  );

  const counts = useMemo(
    () =>
      (Object.keys(STATUS_LABELS) as TaskStatus[]).map((status) => ({
        status,
        count: tasks.filter((t) => t.status === status).length,
      })),
    [tasks],
  );

  const activeSprint = sprintsQuery.data?.at(-1);
  const recentTasks = useMemo(() => tasks.slice(0, 8), [tasks]);

  const columns = [
    {
      header: 'Title',
      key: 'title',
      accessor: (row: Task) => <span className="font-medium text-gray-900 dark:text-gray-100">{row.title}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      accessor: (row: Task) => (
        <span className="capitalize text-gray-700 dark:text-gray-300">{STATUS_LABELS[row.status]}</span>
      ),
    },
    {
      header: 'Priority',
      key: 'priority',
      accessor: (row: Task) => (
        <span
          className={`inline-block rounded px-2 py-0.5 text-xs font-semibold capitalize ${PRIORITY_BADGES[row.priority]}`}
        >
          {row.priority}
        </span>
      ),
    },
    {
      header: 'Assignee',
      key: 'assignee',
      accessor: (row: Task) => {
        const user = usersById.get(row.assigneeId);
        return user ? (
          <div className="flex items-center gap-2">
            <img src={user.avatar} alt="" className="h-5 w-5 rounded-full" />
            <span className="text-xs text-gray-600 dark:text-gray-300">{user.name}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-400">Unassigned</span>
        );
      },
    },
    {
      header: 'Due Date',
      key: 'dueDate',
      accessor: (row: Task) => <span className="text-xs text-gray-500 dark:text-gray-400">{row.dueDate}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
        {activeSprint && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activeSprint.name} · {activeSprint.startDate} – {activeSprint.endDate}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tasksQuery.isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
          : counts.map(({ status, count }) => (
              <div
                key={status}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <p className="text-sm font-medium text-gray-500 dark:text-gray-300">{STATUS_LABELS[status]}</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{count}</p>
              </div>
            ))}
      </div>

      {tasksQuery.isError && (
        <p role="alert" className="text-sm text-red-600">
          Failed to load tasks. Please try again.
        </p>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Sprint Tasks</h2>
        {tasksQuery.isLoading ? (
          <Skeleton className="h-48 w-full rounded-lg" />
        ) : (
          <DataTable columns={columns} data={recentTasks} getRowId={(r) => r.id} />
        )}
      </div>
    </div>
  );
}
