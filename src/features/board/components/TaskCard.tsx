import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, User } from '@/types';

const PRIORITY_STYLES: Record<Task['priority'], string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

interface TaskCardProps {
  task: Task;
  assignee: User | undefined;
  onOpen: (task: Task) => void;
}

export function TaskCard({ task, assignee, onOpen }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(task)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen(task);
      }}
      aria-label={`Open task: ${task.title}`}
      className="cursor-grab flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm
        transition-shadow hover:shadow-md active:cursor-grabbing
        dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Due {task.dueDate}</span>
        {assignee && (
          <img
            src={assignee.avatar}
            alt={assignee.name}
            title={assignee.name}
            className="h-6 w-6 rounded-full"
          />
        )}
      </div>
    </div>
  );
}
