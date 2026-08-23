import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useToast } from './useToast';
import { useToastStore } from './toastStore';

describe('useToast', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    vi.useFakeTimers();
  });

  it('pushes a toast with the correct variant', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.success('Task created');
    });

    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({ message: 'Task created', variant: 'success' });
  });

  it('auto-dismisses after the given duration', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.error('Something failed', 1000);
    });
    expect(useToastStore.getState().toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('does not auto-dismiss when durationMs is 0', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.info('Persistent message', 0);
    });

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(useToastStore.getState().toasts).toHaveLength(1);
  });
});
