import { useState, type FormEvent } from 'react';
import { authClient } from '@/lib/auth-client';
import { getSafeCallbackURL } from '@/lib/auth-redirect';

type AuthFormProps = {
  mode: 'sign-in' | 'sign-up';
  callbackURL: string;
  allowSignUp: boolean;
  githubEnabled: boolean;
};

export function AuthForm({
  mode,
  callbackURL,
  allowSignUp,
  githubEnabled
}: AuthFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const safeCallbackURL = getSafeCallbackURL(callbackURL);
  const isSignUp = mode === 'sign-up';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const result = isSignUp
        ? await authClient.signUp.email({
            name,
            email,
            password,
            callbackURL: safeCallbackURL
          })
        : await authClient.signIn.email({
            email,
            password,
            callbackURL: safeCallbackURL
          });

      if (result.error) {
        setError(result.error.message || 'Authentication failed.');
        return;
      }

      window.location.assign(safeCallbackURL);
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsPending(false);
    }
  }

  async function handleGithubSignIn() {
    setError(null);
    setIsPending(true);

    try {
      const result = await authClient.signIn.social({
        provider: 'github',
        callbackURL: safeCallbackURL
      });

      if (result?.error) {
        setError(result.error.message || 'GitHub sign in failed.');
        setIsPending(false);
      }
    } catch {
      setError('GitHub sign in failed. Please try again.');
      setIsPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white/90 p-6 shadow-lg backdrop-blur-sm">
      <form className="space-y-5" onSubmit={handleSubmit}>
        {isSignUp && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
        </button>
      </form>

      {githubEnabled && !isSignUp && (
        <>
          <div className="my-5 flex items-center gap-3 text-sm text-gray-500">
            <span className="h-px flex-1 bg-gray-200" />
            or
            <span className="h-px flex-1 bg-gray-200" />
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={handleGithubSignIn}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sign in with GitHub
          </button>
        </>
      )}

      <p className="mt-5 text-center text-sm text-gray-600">
        {isSignUp ? (
          <a className="font-medium text-blue-600 hover:text-blue-700" href={`/sign-in?callbackURL=${encodeURIComponent(safeCallbackURL)}`}>
            Already have an account? Sign in
          </a>
        ) : allowSignUp ? (
          <a className="font-medium text-blue-600 hover:text-blue-700" href={`/sign-up?callbackURL=${encodeURIComponent(safeCallbackURL)}`}>
            Create an account
          </a>
        ) : null}
      </p>
    </div>
  );
}

export default AuthForm;
