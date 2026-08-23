import { mockDataSource } from '@/api/mockDataSource';
import type { Comment, Sprint, Task, User } from '@/types';

// Service layer: the only thing the query hooks talk to. Swapping the mock
// data source for a real REST/GraphQL backend means changing the bodies of
// these functions only — the hooks and UI above are unaffected.
export const boardApi = {
  getTasks: (): Promise<Task[]> => mockDataSource.getTasks(),
  getUsers: (): Promise<User[]> => mockDataSource.getUsers(),
  getSprints: (): Promise<Sprint[]> => mockDataSource.getSprints(),
  getComments: (taskId: number): Promise<Comment[]> => mockDataSource.getCommentsByTask(taskId),

  createTask: (input: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>): Promise<Task> =>
    mockDataSource.createTask(input),

  updateTask: (id: number, patch: Partial<Task>): Promise<Task> => mockDataSource.updateTask(id, patch),

  deleteTask: (id: number): Promise<void> => mockDataSource.deleteTask(id),

  addComment: (input: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> =>
    mockDataSource.addComment(input),
};
