export function FullScreenLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-white dark:bg-gray-950"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"
        aria-hidden="true"
      />
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
