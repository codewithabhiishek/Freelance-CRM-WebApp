import { useMemo, useState } from 'react';
import { CalendarPlus, CheckCheck, ListTodo, Mail, MonitorPlay, PhoneCall, StickyNote, Trash2, Users } from 'lucide-react';
import type { Task, TaskType } from '../data';
import { useStore } from '../store';
import { Checkbox, EmptyState, GhostBtn, inputCls } from './ui';

const TYPE_META: Record<TaskType, { icon: typeof Mail; soft: string; text: string }> = {
  call: { icon: PhoneCall, soft: '#e2f2e9', text: '#17724a' },
  email: { icon: Mail, soft: '#e6ecf5', text: '#48628a' },
  meeting: { icon: Users, soft: '#f7ebcd', text: '#96651a' },
  demo: { icon: MonitorPlay, soft: '#f6e4d8', text: '#9a5220' },
  admin: { icon: StickyNote, soft: '#eceeeb', text: '#54635b' },
};

type Filter = 'all' | 'today' | 'overdue' | 'done';

export default function Tasks() {
  const { tasks, toggleTask, deleteTask, addTask } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [draft, setDraft] = useState({ title: '', type: 'call' as TaskType, due: 'Today · 17:00', priority: 'Medium' as Task['priority'], linked: '' });

  const isOverdue = (t: Task) => !t.done && /yesterday|ago|Mar 1[0-2]/i.test(t.due);
  const isToday = (t: Task) => !t.done && t.due.toLowerCase().startsWith('today');

  const filtered = useMemo(() => {
    switch (filter) {
      case 'today': return tasks.filter(isToday);
      case 'overdue': return tasks.filter(isOverdue);
      case 'done': return tasks.filter(t => t.done);
      default: return tasks;
    }
  }, [tasks, filter]);

  const doneCount = tasks.filter(t => t.done).length;
  const pct = Math.round((doneCount / Math.max(1, tasks.length)) * 100);

  const groups: { label: string; items: Task[]; accent?: boolean }[] = filter === 'all'
    ? [
        { label: 'Overdue', items: filtered.filter(isOverdue), accent: true },
        { label: 'Today', items: filtered.filter(isToday) },
        { label: 'Upcoming', items: filtered.filter(t => !t.done && !isToday(t) && !isOverdue(t)) },
        { label: 'Completed', items: filtered.filter(t => t.done) },
      ]
    : [{ label: '', items: filtered }];

  const submit = () => {
    if (!draft.title.trim()) return;
    addTask({ title: draft.title.trim(), type: draft.type, due: draft.due, priority: draft.priority, done: false, linked: draft.linked || '—' });
    setDraft(d => ({ ...d, title: '' }));
  };

  const filters: { id: Filter; label: string; n: number }[] = [
    { id: 'all', label: 'All', n: tasks.length },
    { id: 'today', label: 'Today', n: tasks.filter(isToday).length },
    { id: 'overdue', label: 'Overdue', n: tasks.filter(isOverdue).length },
    { id: 'done', label: 'Done', n: doneCount },
  ];

  return (
    <div className="mx-auto max-w-[880px] space-y-4">
      {/* Progress + filters */}
      <div className="reveal rounded-xl border border-line bg-card p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="acc-soft flex h-9 w-9 items-center justify-center rounded-lg"><CheckCheck size={16} /></span>
            <div>
              <div className="font-mono text-[15px] font-bold text-ink-900">{doneCount}<span className="text-ink-300">/{tasks.length}</span> done</div>
              <div className="text-[11px] text-ink-400">{pct}% of your list is clear</div>
            </div>
          </div>
          <div className="mx-2 hidden h-8 w-px bg-line sm:block" />
          <div className="min-w-[140px] flex-1">
            <div className="h-2 overflow-hidden rounded-full bg-paper">
              <div className="acc-bar anim-grow-x h-full rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="flex gap-1.5">
            {filters.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition active:scale-95 ${filter === f.id ? 'acc-soft border-transparent' : 'border-line bg-card text-ink-500 acc-border-hover'}`}>
                {f.label} <span className="font-mono text-[10px] opacity-70">{f.n}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick add */}
      <div className="reveal flex flex-wrap items-center gap-2 rounded-xl border border-line bg-card p-3 shadow-soft" style={{ animationDelay: '70ms' }}>
        <input
          value={draft.title}
          onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Add a task and press Enter…"
          className={`${inputCls} min-w-[200px] flex-1 border-transparent bg-paper/70 focus:bg-card`}
        />
        <select value={draft.type} onChange={e => setDraft(d => ({ ...d, type: e.target.value as TaskType }))} className="rounded-lg border border-line bg-card px-2.5 py-2 text-[12.5px] font-semibold text-ink-600">
          {(Object.keys(TYPE_META) as TaskType[]).map(t => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
        </select>
        <select value={draft.priority} onChange={e => setDraft(d => ({ ...d, priority: e.target.value as Task['priority'] }))} className="rounded-lg border border-line bg-card px-2.5 py-2 text-[12.5px] font-semibold text-ink-600">
          {(['High', 'Medium', 'Low'] as const).map(p => <option key={p}>{p}</option>)}
        </select>
        <input value={draft.due} onChange={e => setDraft(d => ({ ...d, due: e.target.value }))} className="w-[130px] rounded-lg border border-line bg-card px-2.5 py-2 text-[12.5px] font-semibold text-ink-600" />
        <button onClick={submit} className="btn-acc flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-semibold"><CalendarPlus size={14} /> Add</button>
      </div>

      {/* Groups */}
      {groups.filter(g => g.items.length > 0).map((g, gi) => (
        <div key={g.label || 'single'} className="reveal" style={{ animationDelay: `${120 + gi * 60}ms` }}>
          {g.label && (
            <div className="mb-1.5 flex items-center gap-2 px-1">
              <span className={`text-[11px] font-bold tracking-[0.14em] uppercase ${g.accent ? 'text-bad' : 'text-ink-400'}`}>{g.label}</span>
              <span className="rounded bg-card px-1.5 font-mono text-[10.5px] text-ink-400 shadow-soft">{g.items.length}</span>
              <span className="h-px flex-1 bg-line" />
            </div>
          )}
          <div className="overflow-hidden rounded-xl border border-line bg-card shadow-soft">
            <ul>
              {g.items.map((t, i) => {
                const tm = TYPE_META[t.type];
                const Icon = tm.icon;
                const overdue = isOverdue(t);
                return (
                  <li key={t.id} className={`row-hover reveal group flex cursor-pointer items-center gap-3 border-b border-line px-4 py-3 last:border-0 ${t.done ? 'opacity-55' : ''}`} style={{ animationDelay: `${i * 40}ms` }} onClick={() => toggleTask(t.id)}>
                    <Checkbox checked={t.done} onChange={() => toggleTask(t.id)} />
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: tm.soft, color: tm.text }}><Icon size={14} /></span>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-[13.5px] font-semibold text-ink-800 ${t.done ? 'line-through' : ''}`}>{t.title}</p>
                      <p className="font-mono text-[10.5px] text-ink-400">{t.due} · {t.linked}</p>
                    </div>
                    <span className={`hidden rounded-md px-2 py-0.5 font-mono text-[10.5px] font-bold sm:inline ${t.priority === 'High' ? 'bg-badsoft text-bad' : t.priority === 'Medium' ? 'bg-warnsoft text-warn' : 'bg-paper text-ink-400'}`}>{t.priority}</span>
                    {overdue && <span className="rounded-md bg-badsoft px-2 py-0.5 font-mono text-[10.5px] font-bold text-bad">late</span>}
                    <span className="row-actions"><GhostBtn title="Delete" danger onClick={() => deleteTask(t.id)}><Trash2 size={13} /></GhostBtn></span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="rounded-xl border border-line bg-card shadow-soft">
          <EmptyState icon={<ListTodo size={20} />} title={filter === 'done' ? 'Nothing completed yet' : 'No tasks here'} sub={filter === 'overdue' ? 'Nothing is late — keep the streak going.' : 'Add a follow-up above and it will show up here.'} />
        </div>
      )}
    </div>
  );
}
