'use client';

import type { CategoryNode } from '@/lib/categories';
import { useState } from 'react';

const MAX_VISIBLE = 8;

const Chevron = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

function useHover() {
  const [open, setOpen] = useState(false);
  const handlers = {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null))
        setOpen(false);
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    },
  };
  return { open, handlers };
}

const panel =
  'absolute z-30 min-w-56 border border-black/10 bg-background py-2 shadow-lg dark:border-white/15';
const row =
  'block px-4 py-2 text-sm hover:bg-black/5 hover:text-accent dark:hover:bg-white/10';

/* ---------- Desktop ---------- */

function FlatList({ nodes, depth }: { nodes: CategoryNode[]; depth: number }) {
  return (
    <ul>
      {nodes.map((n) => (
        <li key={n.id}>
          <a
            href={`/category/${n.handle}`}
            style={{ paddingLeft: 16 + depth * 14 }}
            className="block py-1.5 pr-4 text-[13px] text-black/70 hover:text-accent dark:text-white/70"
          >
            {n.name}
          </a>
          {n.children.length > 0 && (
            <FlatList nodes={n.children} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

function PanelItem({
  node,
  level,
  flip,
}: {
  node: CategoryNode;
  level: 1 | 2;
  flip: boolean;
}) {
  const { open, handlers } = useHover();
  const has = node.children.length > 0;

  if (level === 2) {
    return (
      <li>
        <a href={`/category/${node.handle}`} className={row}>
          {node.name}
        </a>
        {has && <FlatList nodes={node.children} depth={1} />}
      </li>
    );
  }

  return (
    <li className="relative" {...handlers}>
      <a
        href={`/category/${node.handle}`}
        className={`${row} flex items-center justify-between gap-6`}
      >
        {node.name}
        {has && <Chevron className={flip ? 'rotate-90' : '-rotate-90'} />}
      </a>
      {has && open && (
        <ul className={`${panel} top-0 ${flip ? 'right-full' : 'left-full'}`}>
          {node.children.map((c) => (
            <PanelItem key={c.id} node={c} level={2} flip={flip} />
          ))}
        </ul>
      )}
    </li>
  );
}

function TopItem({ node, flip }: { node: CategoryNode; flip: boolean }) {
  const { open, handlers } = useHover();
  const has = node.children.length > 0;
  const base =
    'flex items-center gap-1 whitespace-nowrap px-3 py-3 text-sm font-medium hover:text-accent';

  return (
    <li className="relative" {...handlers}>
      {node.handle ? (
        <a href={`/category/${node.handle}`} className={base}>
          {node.name}
          {has && <Chevron />}
        </a>
      ) : (
        <span tabIndex={0} className={`${base} cursor-default`}>
          {node.name}
          {has && <Chevron />}
        </span>
      )}
      {has && open && (
        <ul className={`${panel} top-full ${flip ? 'right-0' : 'left-0'}`}>
          {node.children.map((c) => (
            <PanelItem key={c.id} node={c} level={1} flip={flip} />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ---------- Mobile ---------- */

export function MobileItem({ node, depth }: { node: CategoryNode; depth: number }) {
  const [open, setOpen] = useState(false);
  const has = node.children.length > 0;

  return (
    <li>
      <div className="flex items-center" style={{ paddingLeft: depth * 16 }}>
        <a
          href={`/category/${node.handle}`}
          className="flex-1 py-3 text-sm font-medium"
        >
          {node.name}
        </a>
        {has && (
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`Toggle ${node.name}`}
            className="flex h-10 w-10 items-center justify-center"
          >
            <Chevron className={open ? 'rotate-180' : ''} />
          </button>
        )}
      </div>
      {has && open && (
        <ul>
          {node.children.map((c) => (
            <MobileItem key={c.id} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ---------- Bar ---------- */

export default function CategoryBarClient({ tree }: { tree: CategoryNode[] }) {
  const visible = tree.slice(0, MAX_VISIBLE);
  const rest = tree.slice(MAX_VISIBLE);
  const items: CategoryNode[] = rest.length
    ? [...visible, { id: '__more', name: 'More', handle: null, children: rest }]
    : visible;

  return (
    <div className="hidden border-b border-black/10 bg-background dark:border-white/15 lg:block">
      <nav
        aria-label="Categories"
        className="mx-auto hidden max-w-7xl px-4 sm:px-6 lg:block"
      >
        <ul className="flex items-center">
          {items.map((n, i) => (
            <TopItem key={n.id} node={n} flip={i >= 4} />
          ))}
        </ul>
      </nav>
    </div>
  );
}
