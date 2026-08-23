import { useState, type FormEvent } from 'react';
import {
  useCommentsQuery,
  useAddCommentMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from '@/features/board/hooks/useBoardQueries';
import { useBoardStore } from '@/features/board/store/boardStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useToast } from '@/components/feedback/useToast';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { Task, User } from '@/types';

interface TaskDrawerProps {
  task: Task | null;
  usersById: Map<number, User>;
  onClose: () => void;
}

export function TaskDrawer({ task, usersById, onClose }: TaskDrawerProps) {
  const [comment, setComment] = useState('');
  const commentsQuery = useCommentsQuery(task?.id ?? null);
  const addComment = useAddCommentMutation(task?.id ?? -1);
  const updateTask = useUpdateTaskMutation();
  const deleteTask = useDeleteTaskMutation();
  const updateTaskLocal = useBoardStore((s) => s.updateTaskLocal);
  const removeTaskLocal = useBoardStore((s) => s.removeTaskLocal);
  const currentUser = useAuthStore((s) => s.user);
  const toast = useToast();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!task) return null;

  function handlePriorityChange(priority: Task['priority']) {
    if (!task) return;
    updateTaskLocal(task.id, { priority });
    updateTask.mutate({ id: task.id, patch: { priority } });
  }

  function handleAddComment(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim() || !task || !currentUser) return;
    addComment.mutate(
      { taskId: task.id, authorId: currentUser.id, message: comment.trim() },
      { onSuccess: () => setComment('') },
    );
  }

  function handleDelete() {
    if (!task) return;
    removeTaskLocal(task.id);
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        toast.success('Task deleted');
        onClose();
      },
    });
  }

  const assignee = usersById.get(task.assigneeId);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
      <aside
        role="dialog"
        aria-label={`Task details: ${task.title}`}
        className="flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto bg-white p-6 shadow-xl dark:bg-gray-900"
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{task.title}</h2>
          <button type="button" onClick={onClose} aria-label="Close task details" className="text-gray-500">
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>

        <div className="flex items-center gap-3 text-sm text-gray-500">
          {assignee && (
            <span className="flex items-center gap-2">
              <img src={assignee.avatar} alt="" className="h-6 w-6 rounded-full" />
              {assignee.name}
            </span>
          )}
          <span>Due {task.dueDate}</span>
        </div>

        <Select
          label="Priority"
          value={task.priority}
          onChange={(e) => handlePriorityChange(e.target.value as Task['priority'])}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
        />

        <div className="mt-2 flex-1">
          <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Comments</h3>
          <ul className="flex flex-col gap-3">
            {commentsQuery.data?.map((c) => (
              <li key={c.id} className="rounded-lg bg-gray-50 p-2 text-sm dark:bg-gray-800">
                <p className="text-gray-800 dark:text-gray-100">{c.message}</p>
                <p className="mt-1 text-xs text-gray-400">{usersById.get(c.authorId)?.name ?? 'Unknown'}</p>
              </li>
            ))}
            {commentsQuery.data?.length === 0 && (
              <p className="text-sm text-gray-400">No comments yet.</p>
            )}
          </ul>

          <form onSubmit={handleAddComment} className="mt-3 flex gap-2">
            <label htmlFor="new-comment" className="sr-only">
              Add a comment
            </label>
            <input
              id="new-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950"
            />
            <Button type="submit" size="sm" isLoading={addComment.isPending}>
              Post
            </Button>
          </form>
        </div>

        <div className="mt-auto border-t border-gray-100 pt-4 dark:border-gray-800">
          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <p className="flex-1 text-sm text-gray-600 dark:text-gray-300">Delete this task permanently?</p>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete} isLoading={deleteTask.isPending}>
                Delete
              </Button>
            </div>
          ) : (
            <Button variant="danger" size="sm" onClick={() => setConfirmingDelete(true)}>
              Delete task
            </Button>
          )}
        </div>
      </aside>
    </div>
  );
}
