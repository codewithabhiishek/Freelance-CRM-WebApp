import { useEffect, useRef } from 'react';
import {
  Bell, Building2, CheckCheck, ChevronDown, FileBarChart, Mail, Menu, Plus,
  RefreshCw, Search, Settings, SquareKanban, UserPlus, CheckSquare, Briefcase,
} from 'lucide-react';
import { useStore } from '../store';
import type { View } from '../store';
import { Avatar, Dropdown, ChevronBtn } from './ui';

const META: Record<View, { title: string; sub: string }> = {
  dashboard: { title: 'Revenue Command', sub: 'Pipeline health and today’s priorities at a glance' },
  contacts: { title: 'Contacts', sub: 'Every relationship across your book of business' },
  pipeline: { title: 'Deal Pipeline', sub: 'Drag deals between stages to update forecasts' },
  tasks: { title: 'Tasks', sub: 'Follow-ups, calls and admin — nothing slips' },
  companies: { title: 'Companies', sub: 'Accounts, health and open revenue by organization' },
  analytics: { title: 'Analytics', sub: 'Performance trends for the whole revenue org' },
  settings: { title: 'Settings', sub: 'Workspace, profile and data controls' },
};

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const { view, setView, query, setQuery, notifs, markAllRead, readNotif, openComposer, profile, toast, resetAll } = useStore();
  const searchRef = useRef<HTMLInputElement>(null);
  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const meta = META[view];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3 md:px-7">
        <button className="rounded-lg border border-line bg-card p-2 text-ink-500 lg:hidden" onClick={onMenu} aria-label="Open menu">
          <Menu size={17} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl leading-tight font-bold tracking-tight text-ink-900 md:text-[22px]">{meta.title}</h1>
          <p className="hidden truncate text-xs text-ink-400 sm:block">{meta.sub}</p>
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-300" />
          <input
            ref={searchRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && query.trim()) setView('contacts'); }}
            placeholder="Search contacts, companies…"
            className="w-[250px] rounded-lg border border-line bg-card py-2 pr-14 pl-9 text-[13px] transition placeholder:text-ink-300 focus:w-[300px] lg:w-[280px]"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] text-ink-400">⌘K</kbd>
        </div>

        {/* Quick create */}
        <Dropdown
          width={224}
          button={open => (
            <button className="btn-acc flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold">
              <Plus size={15} strokeWidth={2.6} /> <span className="hidden sm:inline">New</span>
              <ChevronBtn open={open} />
            </button>
          )}
        >
          {close => (
            <div className="p-1.5">
              {[
                { icon: UserPlus, label: 'New contact', sub: 'Add a person', fn: () => openComposer({ kind: 'contact' }) },
                { icon: Briefcase, label: 'New deal', sub: 'Add to pipeline', fn: () => openComposer({ kind: 'deal' }) },
                { icon: CheckSquare, label: 'New task', sub: 'Schedule follow-up', fn: () => openComposer({ kind: 'task' }) },
              ].map(it => (
                <button key={it.label} onClick={() => { it.fn(); close(); }} className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-black/[0.04]">
                  <span className="acc-soft flex h-8 w-8 items-center justify-center rounded-lg"><it.icon size={15} /></span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-semibold text-ink-900">{it.label}</span>
                    <span className="block text-[11px] text-ink-400">{it.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </Dropdown>

        {/* Notifications */}
        <Dropdown
          width={330}
          button={open => (
            <button className={`relative rounded-lg border bg-card p-2 transition hover:shadow-soft ${open ? 'border-[var(--acc)] acc-text' : 'border-line text-ink-500'}`} aria-label="Notifications">
              <Bell size={17} />
              {unread > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brass-500 font-mono text-[9.5px] font-bold text-white">{unread}</span>
                  <span className="absolute -top-1 -right-1 h-4 w-4 animate-[ping2_1.8s_ease-out_infinite] rounded-full bg-brass-500/60" />
                </>
              )}
            </button>
          )}
        >
          {close => (
            <div>
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                <span className="font-display text-sm font-semibold text-ink-900">Notifications</span>
                <button onClick={() => { markAllRead(); close(); }} className="flex items-center gap-1 text-[11px] font-semibold acc-text transition hover:opacity-70">
                  <CheckCheck size={13} /> Mark all read
                </button>
              </div>
              <div className="max-h-[320px] overflow-y-auto p-1.5">
                {notifs.map(n => (
                  <button
                    key={n.id}
                    onClick={() => { if (!n.read) readNotif(n.id); }}
                    className={`flex w-full gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition ${n.read ? 'opacity-60 hover:opacity-90' : 'bg-[var(--acc-soft)]/50 hover:bg-[var(--acc-soft)]/80'}`}
                    title={n.read ? undefined : 'Mark as read'}
                  >
                    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${n.kind === 'deal' ? 'acc-soft' : n.kind === 'task' ? 'bg-brass-100 text-brass-700' : 'bg-slatesoft text-slate2'}`}>
                      {n.kind === 'deal' ? <SquareKanban size={13} /> : n.kind === 'task' ? <CheckSquare size={13} /> : n.kind === 'contact' ? <Mail size={13} /> : <FileBarChart size={13} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12.5px] leading-snug text-ink-800">{n.text}</span>
                      <span className="font-mono text-[10.5px] text-ink-300">{n.time}</span>
                    </span>
                    {!n.read && <span className="acc-dot mt-1.5 ml-auto h-1.5 w-1.5 shrink-0 rounded-full" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Dropdown>

        {/* Account */}
        <Dropdown
          width={230}
          button={() => (
            <button className="flex items-center gap-2 rounded-lg border border-line bg-card py-1 pr-2 pl-1 transition hover:shadow-soft">
              <Avatar name={profile.name} size={30} />
              <ChevronDown size={14} className="text-ink-400" />
            </button>
          )}
        >
          {close => (
            <div className="p-1.5">
              <div className="border-b border-line px-2.5 pt-1 pb-2.5">
                <div className="text-[13px] font-bold text-ink-900">{profile.name}</div>
                <div className="truncate text-[11px] text-ink-400">{profile.email}</div>
              </div>
              {[
                { icon: Settings, label: 'Workspace settings', fn: () => setView('settings') },
                { icon: Building2, label: 'Switch workspace', fn: () => toast('You have one workspace on this plan', 'info') },
                { icon: RefreshCw, label: 'Reset demo data', fn: () => { resetAll(); } },
              ].map(it => (
                <button key={it.label} onClick={() => { it.fn(); close(); }} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-ink-700 transition hover:bg-black/[0.04]">
                  <it.icon size={15} className="text-ink-400" /> {it.label}
                </button>
              ))}
            </div>
          )}
        </Dropdown>
      </div>

      {/* Mobile search */}
      <div className="relative border-t border-line/70 px-4 pb-2.5 md:hidden">
        <Search size={14} className="pointer-events-none absolute top-1/2 left-7 -translate-y-[calc(50%+5px)] text-ink-300" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && query.trim()) setView('contacts'); }}
          placeholder="Search contacts, companies…"
          className="w-full rounded-lg border border-line bg-card py-2 pr-3 pl-8 text-[13px] transition placeholder:text-ink-300"
        />
      </div>
    </header>
  );
}
