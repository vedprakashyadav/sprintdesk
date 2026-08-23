/**
 * Data Source Layer
 * ------------------
 * This is the *only* file in the app that knows mock-data.json exists.
 * It simulates a backend response (including artificial latency) so the
 * service layer above it can be swapped to call a real REST API later
 * without touching any UI code.
 *
 * UI Components -> Hooks / Query Layer -> API / Service Layer -> (this file) -> mock-data.json
 */
import raw from '@/data/mock-data.json';
import type { AppNotification, Comment, Sprint, Task, User } from '@/types';

interface MockDatabase {
  users: User[];
  sprints: Sprint[];
  tasks: Task[];
  comments: Comment[];
  notifications: AppNotification[];
}

// In-memory mutable copy so create/update/delete operations behave like a
// real backend for the lifetime of the session (page refresh resets it,
// since the persisted source of truth for board *state* is Zustand, not this file).
const db: MockDatabase = structuredClone(raw as unknown as MockDatabase);

const LATENCY_MS = 350;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const mockDataSource = {
  async getUsers(): Promise<User[]> {
    return delay(db.users);
  },

  async getSprints(): Promise<Sprint[]> {
    return delay(db.sprints);
  },

  async getTasks(): Promise<Task[]> {
    // "Fetch the first 30 tasks" per the brief.
    return delay(db.tasks.slice(0, 30));
  },

  async getTaskById(id: number): Promise<Task | undefined> {
    return delay(db.tasks.find((t) => t.id === id));
  },

  async createTask(input: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>): Promise<Task> {
    const nextId = Math.max(...db.tasks.map((t) => t.id)) + 1;
    const now = new Date().toISOString();
    const task: Task = { ...input, id: nextId, createdAt: now, updatedAt: now, completedAt: null };
    db.tasks.push(task);
    return delay(task);
  },

  async updateTask(id: number, patch: Partial<Task>): Promise<Task> {
    const idx = db.tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Task ${id} not found`);
    const current = db.tasks[idx]!;
    const updated: Task = { ...current, ...patch, updatedAt: new Date().toISOString() };
    db.tasks[idx] = updated;
    return delay(updated);
  },

  async deleteTask(id: number): Promise<void> {
    db.tasks = db.tasks.filter((t) => t.id !== id);
    return delay(undefined);
  },

  async getCommentsByTask(taskId: number): Promise<Comment[]> {
    return delay(db.comments.filter((c) => c.taskId === taskId));
  },

  async addComment(input: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
    const nextId = Math.max(0, ...db.comments.map((c) => c.id)) + 1;
    const comment: Comment = { ...input, id: nextId, createdAt: new Date().toISOString() };
    db.comments.push(comment);
    return delay(comment);
  },

  async getInitialNotifications(): Promise<AppNotification[]> {
    return delay(db.notifications);
  },
};
