import { useState, useMemo, type FormEvent } from 'react';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const [username, setUsername] = useState('emilys');
  const [password, setPassword] = useState('emilyspass');
  const [rememberMe, setRememberMe] = useState(true);
  const login = useLogin();

  const passwordStrength = useMemo(() => {
    if (!password) return { label: '', color: '', width: 'w-0' };
    if (password.length < 6) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/3' };
    if (password.length < 10) return { label: 'Medium', color: 'bg-amber-500', width: 'w-2/3' };
    return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  }, [password]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    login.mutate({
      username,
      password,
      expiresInMins: rememberMe ? 43200 : 30, // 30 days (43,200 mins) vs standard 30 mins
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="mb-1 text-xl font-semibold text-gray-900 dark:text-gray-100">Sign in to SprintDesk</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Use your DummyJSON credentials.</p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <Input
            label="Username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <div>
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                  <div className={`h-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`} />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{passwordStrength.label}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="rememberMe" className="text-xs text-gray-600 dark:text-gray-300">
              Remember me (30 days persistence)
            </label>
          </div>

          {login.isError && (
            <p role="alert" className="text-sm text-red-600">
              Invalid username or password. Please try again.
            </p>
          )}

          <Button type="submit" isLoading={login.isPending} className="w-full">
            Log in
          </Button>
        </form>
      </div>
    </div>
  );
}
