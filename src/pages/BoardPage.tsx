import { useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  useTasksQuery,
  useUsersQuery,
  useSprintsQuery,
  useUpdateTaskMutation,
} from '@/features/board/hooks/useBoardQueries';
import { useBoardStore } from '@/features/board/store/boardStore';
import { BoardColumn } from '@/features/board/components/BoardColumn';
import { TaskDrawer } from '@/features/board/components/TaskDrawer';
import { CreateTaskModal } from '@/features/board/components/CreateTaskModal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { Task, TaskStatus } from '@/types';

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'backlog', title: 'Backlog' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'review', title: 'Review' },
  { status: 'done', title: 'Done' },
];

export default function BoardPage() {
  const tasksQuery = useTasksQuery();
  const usersQuery = useUsersQuery();
  const sprintsQuery = useSprintsQuery();
  const updateTask = useUpdateTaskMutation();

  const tasksByStatus = useBoardStore((s) => s.tasksByStatus);
  const moveTask = useBoardStore((s) => s.moveTask);
  const reorderWithinColumn = useBoardStore((s) => s.reorderWithinColumn);
  const allTasks = useBoardStore((s) => s.tasks);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<'all' | Task['priority']>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<'all' | string>('all');
  const [lastMove, setLastMove] = useState<{
    taskId: number;
    fromStatus: TaskStatus;
    fromIndex: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const usersById = useMemo(
    () => new Map((usersQuery.data ?? []).map((u) => [u.id, u])),
    [usersQuery.data],
  );

  const latestSprintId = sprintsQuery.data?.at(-1)?.id ?? 3;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeTaskItem = allTasks.find((t) => t.id === active.id);
    if (!activeTaskItem) return;

    const overIsColumn = COLUMNS.some((c) => c.status === over.id);
    const targetStatus = overIsColumn ? (over.id as TaskStatus) : allTasks.find((t) => t.id === over.id)?.status;
    if (!targetStatus) return;

    const column = tasksByStatus(activeTaskItem.status);
    const fromIndex = column.findIndex((t) => t.id === active.id);

    if (targetStatus === activeTaskItem.status) {
      const toIndex = overIsColumn ? column.length - 1 : column.findIndex((t) => t.id === over.id);
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        setLastMove({ taskId: activeTaskItem.id, fromStatus: activeTaskItem.status, fromIndex });
        reorderWithinColumn(targetStatus, fromIndex, toIndex);
      }
      return;
    }

    const destColumn = tasksByStatus(targetStatus);
    const toIndex = overIsColumn ? destColumn.length : destColumn.findIndex((t) => t.id === over.id);
    setLastMove({ taskId: activeTaskItem.id, fromStatus: activeTaskItem.status, fromIndex });
    moveTask(active.id as number, targetStatus, toIndex === -1 ? destColumn.length : toIndex);
    updateTask.mutate({ id: active.id as number, patch: { status: targetStatus } });
  }

  function handleUndo() {
    if (!lastMove) return;
    const { taskId, fromStatus, fromIndex } = lastMove;
    moveTask(taskId, fromStatus, fromIndex);
    updateTask.mutate({ id: taskId, patch: { status: fromStatus } });
    setLastMove(null);
  }

  const getFilteredTasksForStatus = (status: TaskStatus) => {
    let list = tasksByStatus(status);
    if (priorityFilter !== 'all') {
      list = list.filter((t) => t.priority === priorityFilter);
    }
    if (assigneeFilter !== 'all') {
      list = list.filter((t) => t.assigneeId === Number(assigneeFilter));
    }
    return list;
  };

  const userOptions = useMemo(
    () => [
      { value: 'all', label: 'All Assignees' },
      ...(usersQuery.data ?? []).map((u) => ({ value: String(u.id), label: u.name })),
    ],
    [usersQuery.data],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Sprint Board</h1>
        <div className="flex items-center gap-2">
          {lastMove && (
            <Button variant="ghost" size="sm" onClick={handleUndo}>
              ↩ Undo move
            </Button>
          )}
          <Button onClick={() => setIsCreateOpen(true)}>+ New task</Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Filters:</span>
        <div className="w-40">
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | Task['priority'])}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'high', label: 'High Priority' },
              { value: 'medium', label: 'Medium Priority' },
              { value: 'low', label: 'Low Priority' },
            ]}
          />
        </div>
        <div className="w-48">
          <Select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            options={userOptions}
          />
        </div>
        {(priorityFilter !== 'all' || assigneeFilter !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setPriorityFilter('all');
              setAssigneeFilter('all');
            }}
            className="text-xs font-medium text-brand-600 dark:text-emerald-400 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {tasksQuery.isError && (
        <p role="alert" className="text-sm text-red-600">
          Failed to load tasks. Please refresh the page.
        </p>
      )}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {COLUMNS.map((col) => (
            <BoardColumn
              key={col.status}
              status={col.status}
              title={col.title}
              tasks={getFilteredTasksForStatus(col.status)}
              usersById={usersById}
              isLoading={tasksQuery.isLoading}
              onOpenTask={setActiveTask}
            />
          ))}
        </div>
      </DndContext>

      <TaskDrawer task={activeTask} usersById={usersById} onClose={() => setActiveTask(null)} />

      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        users={usersQuery.data ?? []}
        currentSprintId={latestSprintId}
      />
    </div>
  );
}
