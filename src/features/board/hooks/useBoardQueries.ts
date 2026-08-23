import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { boardApi } from '@/features/board/api/boardApi';
import { boardKeys } from '@/features/board/api/queryKeys';
import { useBoardStore } from '@/features/board/store/boardStore';
import type { Task } from '@/types';

// Server state (fetching/caching) lives in TanStack Query.
// Column/ordering state derived from it lives in Zustand (see boardStore).

export function useTasksQuery() {
  const setTasks = useBoardStore((s) => s.setTasks);

  return useQuery({
    queryKey: boardKeys.tasks(),
    queryFn: async () => {
      const tasks = await boardApi.getTasks();
      setTasks(tasks); // seed the Zustand board once server state resolves
      return tasks;
    },
    staleTime: 60_000,
  });
}

export function useUsersQuery() {
  return useQuery({ queryKey: boardKeys.users(), queryFn: boardApi.getUsers, staleTime: Infinity });
}

export function useSprintsQuery() {
  return useQuery({ queryKey: boardKeys.sprints(), queryFn: boardApi.getSprints, staleTime: Infinity });
}

export function useCommentsQuery(taskId: number | null) {
  return useQuery({
    queryKey: boardKeys.comments(taskId ?? -1),
    queryFn: () => boardApi.getComments(taskId as number),
    enabled: taskId !== null,
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: boardApi.createTask,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.tasks() });
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<Task> }) => boardApi.updateTask(id, patch),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.tasks() });
    },
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: boardApi.deleteTask,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.tasks() });
    },
  });
}

export function useAddCommentMutation(taskId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: boardApi.addComment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: boardKeys.comments(taskId) });
    },
  });
}
