// src/components/account/ProfileForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { updateProfile } from '@/lib/auth-actions';

const field =
  'h-11 w-full rounded-lg border border-black/20 bg-transparent px-3 text-sm outline-none focus:border-accent dark:border-white/25';

export default function ProfileForm({
  initial,
}: {
  initial: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
}) {
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const set =
    (k: 'firstName' | 'lastName' | 'phone') =>
    (e: { target: { value: string } }) =>
      setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    start(async () => {
      try {
        const r = await updateProfile({
          firstName: f.firstName,
          lastName: f.lastName,
          phone: f.phone,
        });
        setMsg(
          r.ok ? { ok: true, text: 'Saved.' } : { ok: false, text: r.error },
        );
      } catch {
        setMsg({ ok: false, text: 'Something went wrong. Please try again.' });
      }
    });
  };

  return (
    <form
      onSubmit={submit}
      className="grid gap-4 rounded-xl border border-black/10 bg-white p-5 sm:grid-cols-2 dark:border-white/15 dark:bg-[#171b22]"
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        First name
        <input
          className={field}
          required
          value={f.firstName}
          onChange={set('firstName')}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Last name
        <input
          className={field}
          value={f.lastName}
          onChange={set('lastName')}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Mobile number
        <input
          className={field}
          type="tel"
          inputMode="tel"
          placeholder="01XXXXXXXXX"
          value={f.phone}
          onChange={set('phone')}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Email
        <input className={`${field} opacity-60`} value={f.email} readOnly />
      </label>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-lg bg-brand px-6 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {pending ? 'Saving...' : 'Save changes'}
        </button>
        {msg && (
          <span
            role="status"
            className={`text-sm font-medium ${msg.ok ? 'text-accent' : 'text-sale'}`}
          >
            {msg.text}
          </span>
        )}
      </div>
    </form>
  );
}
