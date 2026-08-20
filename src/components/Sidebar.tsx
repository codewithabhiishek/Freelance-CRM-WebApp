import { BarChart3, Building2, CheckSquare, LayoutDashboard, Settings, Users, X, SquareKanban, ChevronsUpDown } from 'lucide-react';
import { fmtK } from '../data';
import { useStore } from '../store';
import type { View } from '../store';
import { Avatar } from './ui';

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="14" fill="#113d33" />
      <ellipse cx="16" cy="16" rx="6.5" ry="14" fill="none" stroke="#e0a33b" strokeWidth="2" />
      <line x1="2.5" y1="16" x2="29.5" y2="16" stroke="#f2f4f1" strokeWidth="1.6" />
      <circle cx="23.5" cy="8.5" r="2" fill="#e0a33b" />
    </svg>
  );
}

const NAV: { section: string; items: { id: View; label: string; icon: typeof Users }[] }[] = [
  {
    section: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'contacts', label: 'Contacts', icon: Users },
      { id: 'pipeline', label: 'Pipeline', icon: SquareKanban },
      { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    ],
  },
  {
    section: 'Intelligence',
    items: [
      { id: 'companies', label: 'Companies', icon: Building2 },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    section: 'System',
    items: [{ id: 'settings', label: 'Settings', icon: Settings }],
  },
];

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const { view, setView, contacts, deals, tasks, profile } = useStore();

  const counts: Partial<Record<View, number>> = {
    contacts: contacts.length,
    pipeline: deals.filter(d => d.stage !== 'Won').length,
    tasks: tasks.filter(t => !t.done && t.due.startsWith('Today')).length,
  };

  const openValue = deals.filter(d => d.stage !== 'Won').reduce((s, d) => s + d.value, 0);
  const goal = 1_200_000;
  const pct = Math.min(100, Math.round((openValue / goal) * 100));

  const go = (v: View) => { setView(v); onClose(); };

  return (
    <>
      {mobileOpen && <div className="anim-fade fixed inset-0 z-40 bg-night/60 lg:hidden" onClick={onClose} />}
      <aside
        className={`dark-scroll fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-nightline bg-night text-paper transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <LogoMark />
          <div className="flex-1 leading-tight">
            <div className="font-display text-[17px] font-bold tracking-tight text-white">Meridian</div>
            <div className="font-mono text-[10px] font-medium tracking-[0.22em] text-nighttext uppercase">Client CRM</div>
          </div>
          <button className="rounded-md p-1 text-nighttext transition hover:bg-night3 hover:text-white lg:hidden" onClick={onClose} aria-label="Close menu">
            <X size={17} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {NAV.map(sec => (
            <div key={sec.section} className="mt-4 first:mt-1">
              <div className="px-2.5 pb-1.5 font-mono text-[10px] font-semibold tracking-[0.18em] text-nighttext/70 uppercase">{sec.section}</div>
              <ul className="space-y-0.5">
                {sec.items.map(item => {
                  const active = view === item.id;
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => go(item.id)}
                        className={`nav-item group relative flex w-full items-center gap-3 rounded-lg px-2.5 py-[9px] text-left text-[13.5px] font-medium ${
                          active ? 'bg-night3 text-white' : 'text-nighttext hover:bg-night2 hover:text-paper'
                        }`}
                      >
                        {active && <span className="acc-dot absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full" />}
                        <Icon size={17} className={active ? 'acc-text' : 'text-nighttext transition group-hover:text-paper'} strokeWidth={active ? 2.2 : 1.9} />
                        <span className="flex-1">{item.label}</span>
                        {counts[item.id] !== undefined && counts[item.id]! > 0 && (
                          <span className={`rounded-md px-1.5 py-0.5 font-mono text-[10.5px] font-semibold tabular ${active ? 'acc-soft' : 'bg-night3 text-nighttext'}`}>
                            {counts[item.id]}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Goal widget */}
        <div className="mx-3 mb-3 rounded-xl border border-nightline bg-night2 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-paper/80 uppercase">Q1 pipeline goal</span>
            <span className="font-mono text-[11px] font-semibold text-brass-400">{pct}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-night3">
            <div className="acc-bar anim-grow-x h-full rounded-full" style={{ width: `${pct}%`, animationDelay: '0.3s' }} />
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono text-[11px]">
            <span className="font-semibold text-white">{fmtK(openValue)}</span>
            <span className="text-nighttext">of {fmtK(goal)}</span>
          </div>
        </div>

        {/* User */}
        <button onClick={() => go('settings')} className="nav-item mx-3 mb-4 flex items-center gap-2.5 rounded-xl border border-nightline bg-night2 p-2.5 text-left transition hover:bg-night3">
          <Avatar name={profile.name} size={32} />
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[13px] font-semibold text-white">{profile.name}</span>
            <span className="block truncate text-[11px] text-nighttext">{profile.role}</span>
          </span>
          <ChevronsUpDown size={14} className="text-nighttext" />
        </button>
      </aside>
    </>
  );
}
