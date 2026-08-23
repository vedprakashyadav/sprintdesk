import { useCallback } from 'react';
import { useToastStore, type ToastVariant } from './toastStore';

/**
 * Reusable toast hook. Auto-dismisses after `durationMs`.
 * Kept intentionally decoupled from any single feature so it can be reused
 * for board actions, auth errors, or notification alerts alike.
 */
export function useToast() {
  const push = useToastStore((s) => s.push);
  const dismiss = useToastStore((s) => s.dismiss);

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info', durationMs = 4000) => {
      const id = push(message, variant);
      if (durationMs > 0) {
        setTimeout(() => dismiss(id), durationMs);
      }
      return id;
    },
    [push, dismiss],
  );

  return {
    show,
    success: (message: string, durationMs?: number) => show(message, 'success', durationMs),
    error: (message: string, durationMs?: number) => show(message, 'error', durationMs),
    info: (message: string, durationMs?: number) => show(message, 'info', durationMs),
    dismiss,
  };
}
