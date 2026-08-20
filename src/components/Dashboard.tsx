import { ArrowRight, Briefcase, Download, Flame, Mail, MessageSquare, PhoneCall, SquareKanban, StickyNote, Target, UserPlus, Wallet, Percent } from 'lucide-react';
import { MONTHS, REVENUE, REVENUE_TARGET, STAGES, STAGE_META, fmtK } from '../data';
import type { Activity } from '../data';
import { useStore } from '../store';
import { AreaChart, Avatar, Card, Checkbox, CountUp, Delta, Donut, Sparkline } from './ui';

const KIND_ICON: Record<Activity['kind'], typeof Mail> = {
  deal: SquareKanban, contact: UserPlus, task: Target, mail: Mail, call: PhoneCall, note: StickyNote,
};

export default function Dashboard() {
  const { profile, deals, tasks, activities, contacts, setView, toggleTask, openComposer, toast } = useStore();

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const open = deals.filter(d => d.stage !== 'Won');
  const pipelineValue = open.reduce((s, d) => s + d.value, 0);
  const weighted = open.reduce((s, d) => s + d.value * d.prob / 100, 0);
  const ytdRevenue = REVENUE.reduce((s, v) => s + v, 0) * 1000;
  const won = deals.filter(d => d.stage === 'Won');
  const winRate = Math.round((won.length / Math.max(1, deals.length)) * 100);
  const leads = contacts.filter(c => c.status === 'Lead').length;

  const stageRows = STAGES.filter(s => s !== 'Won').map(s => {
    const list = deals.filter(d => d.stage === s);
    return { stage: s, count: list.length, total: list.reduce((a, d) => a + d.value, 0) };
  });
  const maxStage = Math.max(...stageRows.map(r => r.total), 1);

  const upcoming = tasks.filter(t => !t.done).slice(0, 5);
  const hot = [...open].sort((a, b) => b.value * b.prob - a.value * a.prob).slice(0, 5);

  const exportReport = () => {
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        summary: { openPipeline: pipelineValue, weightedForecast: Math.round(weighted), revenueYTD: ytdRevenue, winRate },
        contacts, deals, tasks,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meridian-report-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast('Report downloaded as JSON');
    } catch {
      toast('Export failed — try again', 'danger');
    }
  };

  const kpis = [
    { label: 'Open pipeline', value: pipelineValue, prefix: '$', spark: [42, 48, 45, 58, 62, 71, 78], delta: 12.4, icon: Wallet },
    { label: 'Revenue · YTD', value: ytdRevenue, prefix: '$', spark: REVENUE.slice(0, 9), delta: 8.1, icon: Briefcase },
    { label: 'Weighted forecast', value: weighted, prefix: '$', spark: [30, 34, 33, 41, 47, 52, 58], delta: 5.7, icon: Target },
    { label: 'Win rate', value: winRate, suffix: '%', spark: [18, 22, 19, 26, 24, 31, winRate], delta: -2.3, icon: Percent },
  ];

  return (
    <div className="space-y-5">
      {/* Greeting row */}
      <div className="reveal flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-ink-400 uppercase">{today}</p>
          <h2 className="mt-1 font-display text-[26px] leading-tight font-bold tracking-tight text-ink-900">
            {greet}, {profile.name.split(' ')[0]} <span className="text-ink-300">—</span> <span className="acc-text">{leads} leads</span> need touches.
          </h2>
        </div>
        <div className="flex gap-2">
          <button onClick={exportReport} className="flex items-center gap-2 rounded-lg border border-line bg-card px-3.5 py-2 text-[13px] font-semibold text-ink-700 transition acc-border-hover hover:shadow-soft active:scale-95">
            <Download size={15} /> Export report
          </button>
          <button onClick={() => setView('pipeline')} className="btn-acc flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-semibold">
            Open pipeline <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="reveal grid grid-cols-1 overflow-hidden rounded-xl border border-line bg-card shadow-soft sm:grid-cols-2 xl:grid-cols-4" style={{ animationDelay: '60ms' }}>
        {kpis.map((k, i) => (
          <div key={k.label} className={`group relative p-5 transition hover:bg-black/[0.02] ${
            i === 1 ? 'border-t border-line sm:border-t-0 sm:border-l'
            : i === 2 ? 'border-t border-line xl:border-t-0 xl:border-l'
            : i === 3 ? 'border-t border-line sm:border-l xl:border-t-0' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-ink-400 uppercase">{k.label}</span>
              <span className="acc-soft flex h-7 w-7 items-center justify-center rounded-lg opacity-80 transition group-hover:scale-110"><k.icon size={14} /></span>
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div>
                <div className="font-mono text-[26px] leading-none font-bold tracking-tight text-ink-900">
                  <CountUp to={k.value} prefix={k.prefix ?? ''} suffix={k.suffix ?? ''} />
                </div>
                <div className="mt-1.5"><Delta v={k.delta} /></div>
              </div>
              <Sparkline values={k.spark} color={i === 3 ? 'var(--warn)' : 'var(--acc)'} />
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card
          className="xl:col-span-8" title="Revenue performance" sub="Monthly recognized revenue vs. target" delay={120}
          action={
            <div className="flex items-center gap-4 font-mono text-[11px] text-ink-400">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full acc-dot" /> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-brass-500" /> Target {REVENUE_TARGET}k</span>
            </div>
          }
        >
          <AreaChart values={REVENUE} labels={MONTHS} target={REVENUE_TARGET} color="var(--acc)" />
        </Card>

        <div className="space-y-5 xl:col-span-4">
          <Card title="Pipeline by stage" sub="Open value distribution" delay={180} action={<button onClick={() => setView('pipeline')} className="acc-text text-xs font-bold transition hover:opacity-70">View board →</button>}>
            <ul className="space-y-3.5">
              {stageRows.map((r, i) => (
                <li key={r.stage}>
                  <div className="mb-1 flex items-baseline justify-between text-[12.5px]">
                    <span className="flex items-center gap-2 font-semibold text-ink-700">
                      <span className="h-2 w-2 rounded-full" style={{ background: STAGE_META[r.stage].dot }} />
                      {r.stage}
                      <span className="rounded bg-paper px-1.5 font-mono text-[10.5px] text-ink-400">{r.count}</span>
                    </span>
                    <span className="font-mono font-bold text-ink-900">{fmtK(r.total)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-paper">
                    <div className="anim-grow-x h-full rounded-full" style={{ width: `${Math.max(4, (r.total / maxStage) * 100)}%`, background: STAGE_META[r.stage].dot, animationDelay: `${0.2 + i * 0.08}s` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card delay={240} pad={false}>
            <div className="flex items-center gap-5 p-5">
              <Donut pct={winRate} color="var(--acc)" label="Win rate" />
              <div className="space-y-2 text-[13px]">
                <div className="flex items-center gap-2 text-ink-700"><span className="h-2 w-2 rounded-full bg-ok" /> {won.length} deals won · {fmtK(won.reduce((s, d) => s + d.value, 0))}</div>
                <div className="flex items-center gap-2 text-ink-700"><span className="h-2 w-2 rounded-full bg-ink-200" /> {open.length} still open</div>
                <div className="flex items-center gap-2 text-ink-400"><Flame size={13} className="text-brass-600" /> Best month: Dec · $103k</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Card
          title="Priority tasks" sub="Pending actions requiring attention" delay={300}
          action={<button onClick={() => setView('tasks')} className="acc-text text-xs font-bold transition hover:opacity-70">View all ({tasks.length}) →</button>}
          className="lg:col-span-1"
        >
          {upcoming.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-400">All tasks completed · nicely done</p>
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.map(t => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <Checkbox checked={t.done} onChange={() => toggleTask(t.id)} />
                    <div>
                      <span className={`text-[13px] font-medium ${t.done ? 'text-ink-400 line-through' : 'text-ink-800'}`}>{t.title}</span>
                      <span className="block font-mono text-[10.5px] text-ink-400">{t.due} · {t.linked}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10.5px] font-bold ${
                    t.priority === 'High' ? 'bg-badsoft text-bad' : t.priority === 'Medium' ? 'bg-warnsoft text-warn' : 'bg-paper text-ink-400'
                  }`}>
                    {t.priority}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="High-value deals" sub="Sorted by pipeline impact" delay={350}
          action={<button onClick={() => setView('pipeline')} className="acc-text text-xs font-bold transition hover:opacity-70">All deals →</button>}
          className="lg:col-span-1"
        >
          <ul className="divide-y divide-line">
            {hot.map(d => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-ink-900">{d.title}</span>
                  <span className="text-[11px] text-ink-400">{d.company} · {d.stage}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[13px] font-bold text-ink-900">{fmtK(d.value)}</span>
                  <span className="block font-mono text-[10.5px] text-ink-400">{d.prob}% prob</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="Live activity" sub="Latest across the workspace" delay={400} pad={false}
          className="lg:col-span-2 xl:col-span-1"
        >
          <ul className="max-h-[340px] overflow-y-auto">
            {activities.slice(0, 8).map((a, i) => {
              const Icon = KIND_ICON[a.kind];
              return (
                <li key={a.id} className="relative flex gap-3 border-b border-line px-4 py-3 last:border-0">
                  {i < 7 && <span className="absolute top-[38px] left-[27px] h-[calc(100%-30px)] w-px bg-line" />}
                  <span className="acc-soft z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"><Icon size={14} /></span>
                  <div className="min-w-0">
                    <p className="text-[12.5px] leading-snug text-ink-700">{a.text}</p>
                    <span className="font-mono text-[10.5px] text-ink-300">{a.time}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* Quick create strip */}
      <div className="reveal flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-linedark bg-card/60 px-4 py-3" style={{ animationDelay: '460ms' }}>
        <span className="mr-1 text-[12px] font-bold tracking-wider text-ink-400 uppercase">Quick add</span>
        {[
          { label: 'Contact', icon: UserPlus, kind: 'contact' as const },
          { label: 'Deal', icon: Briefcase, kind: 'deal' as const },
          { label: 'Task', icon: Target, kind: 'task' as const },
        ].map(q => (
          <button key={q.kind} onClick={() => openComposer({ kind: q.kind })} className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-[12.5px] font-semibold text-ink-600 transition acc-border-hover acc-text-hover hover:shadow-soft active:scale-95">
            <q.icon size={13} className="acc-text" /> {q.label}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-ink-300"><MessageSquare size={12} /> Changes sync to this browser automatically</span>
      </div>
    </div>
  );
}
