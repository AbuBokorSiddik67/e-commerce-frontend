// src/components/account/AuthForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { login, register } from '@/lib/auth-actions';
import { TRACK_PATH } from '@/lib/routes';

const field =
  'h-11 w-full rounded-lg border border-black/20 bg-transparent px-3 text-sm outline-none focus:border-accent dark:border-white/25';

const Labeled = ({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) => (
  <label className="flex flex-col gap-1.5 text-sm font-medium">
    <span>
      {label}
      {optional && (
        <span className="ml-1 font-normal text-black/50 dark:text-white/50">
          (optional)
        </span>
      )}
    </span>
    {children}
  </label>
);

export default function AuthForm({
  mode,
  next,
}: {
  mode: 'login' | 'register';
  next?: string;
}) {
  const [f, setF] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
  });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    start(async () => {
      try {
        const r =
          mode === 'login'
            ? await login({ email: f.email, password: f.password, next })
            : await register({ ...f, next });
        if (r && r.ok === false) setError(r.error);
      } catch {
        setError('Something went wrong. Please try again.');
      }
    });
  };

  const q = next ? `?next=${encodeURIComponent(next)}` : '';
  const isLogin = mode === 'login';

  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 dark:border-white/15 dark:bg-[#171b22]">
      <h1 className="font-head text-2xl font-bold">
        {isLogin ? 'Log in' : 'Create account'}
      </h1>
      <p className="mt-1 text-sm text-black/60 dark:text-white/60">
        {isLogin
          ? 'Welcome back. Track orders and check out faster.'
          : 'Save your details and follow your orders.'}
      </p>

      <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
        {!isLogin && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="First name">
              <input
                className={field}
                required
                autoComplete="given-name"
                value={f.firstName}
                onChange={set('firstName')}
              />
            </Labeled>
            <Labeled label="Last name" optional>
              <input
                className={field}
                autoComplete="family-name"
                value={f.lastName}
                onChange={set('lastName')}
              />
            </Labeled>
          </div>
        )}

        <Labeled label="Email">
          <input
            className={field}
            required
            type="email"
            autoComplete="email"
            value={f.email}
            onChange={set('email')}
          />
        </Labeled>

        {!isLogin && (
          <Labeled label="Mobile number" optional>
            <input
              className={field}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="01XXXXXXXXX"
              value={f.phone}
              onChange={set('phone')}
            />
          </Labeled>
        )}

        <Labeled label="Password">
          <div className="relative">
            <input
              className={`${field} pr-16`}
              required
              minLength={isLogin ? undefined : 8}
              type={show ? 'text' : 'password'}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={f.password}
              onChange={set('password')}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-black/60 dark:text-white/60"
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
          {!isLogin && (
            <span className="text-xs font-normal text-black/50 dark:text-white/50">
              At least 8 characters.
            </span>
          )}
        </Labeled>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-sale/10 p-3 text-sm font-medium text-sale"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-lg bg-brand text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm">
        {isLogin ? 'New here? ' : 'Already have an account? '}
        <a
          href={`${isLogin ? '/register' : '/login'}${q}`}
          className="font-semibold text-accent hover:underline"
        >
          {isLogin ? 'Create an account' : 'Log in'}
        </a>
      </p>
      <p className="mt-2 text-center text-sm">
        <a
          href={TRACK_PATH}
          className="text-black/60 hover:text-accent dark:text-white/60"
        >
          Track an order without logging in →
        </a>
      </p>
    </div>
  );
}
