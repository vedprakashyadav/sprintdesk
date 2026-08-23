import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useCreateTaskMutation } from '@/features/board/hooks/useBoardQueries';
import { useBoardStore } from '@/features/board/store/boardStore';
import { useToast } from '@/components/feedback/useToast';
import type { Task, User } from '@/types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentSprintId: number;
}

export function CreateTaskModal({ isOpen, onClose, users, currentSprintId }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [assigneeId, setAssigneeId] = useState<string>(String(users[0]?.id ?? ''));
  const [dueDate, setDueDate] = useState('');

  const createTask = useCreateTaskMutation();
  const addTaskLocal = useBoardStore((s) => s.addTaskLocal);
  const toast = useToast();

  function reset() {
    setTitle('');
    setPriority('medium');
    setDueDate('');
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !dueDate) return;

    createTask.mutate(
      {
        title: title.trim(),
        description: '',
        status: 'backlog',
        priority,
        assigneeId: Number(assigneeId),
        dueDate,
        sprintId: currentSprintId,
        order: 0,
      },
      {
        onSuccess: (task) => {
          addTaskLocal(task);
          toast.success('Task created');
          reset();
          onClose();
        },
        onError: () => toast.error('Could not create the task. Please try again.'),
      },
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create task">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task['priority'])}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
        />

        <Select
          label="Assignee"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          options={users.map((u) => ({ value: String(u.id), label: u.name }))}
        />

        <Input
          label="Due date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createTask.isPending}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
