export const boardKeys = {
  all: ['board'] as const,
  tasks: () => [...boardKeys.all, 'tasks'] as const,
  users: () => [...boardKeys.all, 'users'] as const,
  sprints: () => [...boardKeys.all, 'sprints'] as const,
  comments: (taskId: number) => [...boardKeys.all, 'comments', taskId] as const,
};
