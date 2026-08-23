import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { TaskCardSkeleton } from '@/components/ui/Skeleton';
import type { Task, TaskStatus, User } from '@/types';

interface BoardColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  usersById: Map<number, User>;
  isLoading: boolean;
  onOpenTask: (task: Task) => void;
}

export function BoardColumn({ status, title, tasks, usersById, isLoading, onOpenTask }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex min-w-[260px] flex-1 flex-col rounded-xl bg-gray-100 p-3 dark:bg-gray-900/60">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex min-h-[120px] flex-1 flex-col gap-2 rounded-lg p-1 transition-colors ${
          isOver ? 'bg-brand-50 dark:bg-gray-800 dark:border-gray-700' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {isLoading
            ? Array.from({ length: 2 }).map((_, i) => <TaskCardSkeleton key={i} />)
            : tasks.map((task) => (
                <TaskCard key={task.id} task={task} assignee={usersById.get(task.assigneeId)} onOpen={onOpenTask} />
              ))}
        </SortableContext>
      </div>
    </div>
  );
}
