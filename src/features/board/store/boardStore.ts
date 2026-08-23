import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskStatus } from '@/types';

interface BoardState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  moveTask: (taskId: number, toStatus: TaskStatus, toIndex: number) => void;
  reorderWithinColumn: (status: TaskStatus, fromIndex: number, toIndex: number) => void;
  addTaskLocal: (task: Task) => void;
  removeTaskLocal: (taskId: number) => void;
  updateTaskLocal: (taskId: number, patch: Partial<Task>) => void;
  tasksByStatus: (status: TaskStatus) => Task[];
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      tasks: [],

      // Only seed from the server the first time; once the user has
      // reordered locally, persisted local state wins over refetches.
      setTasks: (tasks) => {
        if (get().tasks.length === 0) set({ tasks });
      },

      moveTask: (taskId, toStatus, toIndex) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          if (!task) return state;

          const withoutTask = state.tasks.filter((t) => t.id !== taskId);
          const destColumn = withoutTask
            .filter((t) => t.status === toStatus)
            .sort((a, b) => a.order - b.order);

          destColumn.splice(toIndex, 0, { ...task, status: toStatus });

          const reindexed = destColumn.map((t, i) => ({ ...t, order: i }));
          const others = withoutTask.filter((t) => t.status !== toStatus);

          return { tasks: [...others, ...reindexed] };
        }),

      reorderWithinColumn: (status, fromIndex, toIndex) =>
        set((state) => {
          const column = state.tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order);
          const [moved] = column.splice(fromIndex, 1);
          if (!moved) return state;
          column.splice(toIndex, 0, moved);
          const reindexed = column.map((t, i) => ({ ...t, order: i }));
          const others = state.tasks.filter((t) => t.status !== status);
          return { tasks: [...others, ...reindexed] };
        }),

      addTaskLocal: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

      removeTaskLocal: (taskId) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) })),

      updateTaskLocal: (taskId, patch) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
        })),

      tasksByStatus: (status) =>
        get()
          .tasks.filter((t) => t.status === status)
          .sort((a, b) => a.order - b.order),
    }),
    { name: 'sprintdesk-board' },
  ),
);
