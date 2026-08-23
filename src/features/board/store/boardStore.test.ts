import { beforeEach, describe, expect, it } from 'vitest';
import { useBoardStore } from './boardStore';
import type { Task } from '@/types';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id ?? 1,
    title: 'Test task',
    description: '',
    status: 'backlog',
    priority: 'medium',
    assigneeId: 1,
    dueDate: '2026-08-30',
    sprintId: 3,
    order: 0,
    createdAt: new Date().toISOString(),
    completedAt: null,
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('boardStore', () => {
  beforeEach(() => {
    useBoardStore.setState({ tasks: [] });
  });

  it('seeds tasks only once via setTasks', () => {
    const { setTasks } = useBoardStore.getState();
    setTasks([makeTask({ id: 1 })]);
    setTasks([makeTask({ id: 2 })]); // should be ignored, store already seeded
    expect(useBoardStore.getState().tasks).toHaveLength(1);
    expect(useBoardStore.getState().tasks[0]?.id).toBe(1);
  });

  it('adds a task locally', () => {
    useBoardStore.getState().addTaskLocal(makeTask({ id: 5, title: 'New task' }));
    const tasks = useBoardStore.getState().tasks;
    expect(tasks).toHaveLength(1);
    expect(tasks[0]?.title).toBe('New task');
  });

  it('moves a task between columns and reindexes order', () => {
    useBoardStore.setState({
      tasks: [
        makeTask({ id: 1, status: 'backlog', order: 0 }),
        makeTask({ id: 2, status: 'backlog', order: 1 }),
        makeTask({ id: 3, status: 'in-progress', order: 0 }),
      ],
    });

    useBoardStore.getState().moveTask(1, 'in-progress', 0);

    const { tasksByStatus } = useBoardStore.getState();
    expect(tasksByStatus('backlog')).toHaveLength(1);
    expect(tasksByStatus('backlog')[0]?.id).toBe(2);

    const inProgress = tasksByStatus('in-progress');
    expect(inProgress).toHaveLength(2);
    expect(inProgress[0]?.id).toBe(1);
    expect(inProgress.map((t) => t.order)).toEqual([0, 1]);
  });

  it('reorders tasks within the same column', () => {
    useBoardStore.setState({
      tasks: [
        makeTask({ id: 1, status: 'backlog', order: 0 }),
        makeTask({ id: 2, status: 'backlog', order: 1 }),
        makeTask({ id: 3, status: 'backlog', order: 2 }),
      ],
    });

    useBoardStore.getState().reorderWithinColumn('backlog', 0, 2);

    const order = useBoardStore.getState().tasksByStatus('backlog').map((t) => t.id);
    expect(order).toEqual([2, 3, 1]);
  });

  it('deletes a task locally', () => {
    useBoardStore.setState({ tasks: [makeTask({ id: 1 }), makeTask({ id: 2 })] });
    useBoardStore.getState().removeTaskLocal(1);
    expect(useBoardStore.getState().tasks.map((t) => t.id)).toEqual([2]);
  });
});
