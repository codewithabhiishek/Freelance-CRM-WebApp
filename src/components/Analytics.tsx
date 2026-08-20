import { useMemo, useState } from 'react';
import { Award, CalendarClock, LineChart, Target, UserPlus } from 'lucide-react';
import { MONTHS, REVENUE, REVENUE_TARGET, STAGES, TEAM, WEEK_ACTIVITY, WEEK_DAYS, fmtK } from '../data';
import { useStore } from '../store';
import { Avatar, Card, CountUp, Donut } from './ui';

export default function Analytics() {
  const { deals, contacts } = useStore();
  const [barHover, setBarHover] = useState<number | null>(null);

  const ytd = REVENUE.reduce((s, v) => s + v, 0);
  const maxRev = Math.max(...REVENUE);
  const won = deals.filter(d => d.stage === 'Won');
  const winRate = Math.round((won.length / Math.max(1, deals.length)) * 100);
  const avgDeal = Math.round(deals.reduce((s, d) => s + d.value, 0) / Math.max(1, deals.length));
  const leads = contacts.filter(c => c.status === 'Lead').length;

  const funnel = useMemo(() => STAGES.map((s, i) => ({
    stage: s,
    count: deals.filter(d => STAGES.indexOf(d.stage) >= i).length,
  })), [deals]);
  const funnelMax = Math.max(...funnel.map(f => f.count), 1);

  const maxWeek = Math.max(...WEEK_ACTIVITY);
  const leaderboard = [...TEAM].sort((a, b) => b.closed - a.closed);
  const maxClosed = leaderboard[0]?.closed ?? 1;

  return (
    <div className="space-y-5">
      {/* Headline stats */}
      <div className="reveal grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-card shadow-soft xl:grid-cols-4">
        {[
          { icon: LineChart, label: 'Revenue YTD', value: ytd, prefix: '$', suffix: 'k', note: '+18.2% vs last year' },
          { icon: Target, label: 'Avg deal size', value: avgDeal, prefix: '$', note: `${deals.length} deals in system` },
          { icon: CalendarClock, label: 'Avg sales cycle', value: 34, suffix: ' days', note: '−6 days this quarter' },
          { icon: UserPlus, label: 'Open leads', value: leads, note: 'awaiting first touch' },
        ].map((k, i) => (
          <div key={k.label} className={`p-5 ${
            i === 1 ? 'border-l border-line'
            : i === 2 ? 'border-t border-line xl:border-t-0 xl:border-l'
            : i === 3 ? 'border-t border-l border-line xl:border-t-0' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold tracking-wider text-ink-400 uppercase">{k.label}</span>
              <span className="acc-soft flex h-7 w-7 items-center justify-center rounded-lg"><k.icon size={13} /></span>
            </div>
            <div className="mt-1.5 font-mono text-[24px] leading-none font-bold tracking-tight text-ink-900">
              <CountUp to={k.value} prefix={k.prefix ?? ''} suffix={k.suffix ?? ''} />
            </div>
            <div className="mt-1 text-[11px] text-ink-400">{k.note}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Revenue bars */}
        <Card className="xl:col-span-7" title="Revenue by month" sub={`Target ${REVENUE_TARGET}k · hover for detail`} delay={80}
          action={<span className="font-mono text-[11px] text-ink-400">FY total <span className="font-bold text-ink-900">${ytd}k</span></span>}>
          <div className="flex h-[240px] items-end gap-[6px]">
            {REVENUE.map((v, i) => {
              const above = v >= REVENUE_TARGET;
              return (
                <div key={MONTHS[i]} className="group relative flex h-full flex-1 flex-col items-center justify-end" onMouseEnter={() => setBarHover(i)} onMouseLeave={() => setBarHover(null)}>
                  {barHover === i && (
                    <div className="anim-fade absolute -top-1 z-10 -translate-y-full rounded-lg border border-line bg-night px-2.5 py-1.5 text-center shadow-pop">
                      <div className="font-mono text-[12px] font-bold text-paper">${v}k</div>
                      <div className={`font-mono text-[9.5px] ${above ? 'acc-text' : 'text-brass-400'}`}>{above ? 'above' : 'below'} target</div>
                    </div>
                  )}
                  <div
                    className={`anim-grow-y w-full max-w-[38px] rounded-t-md transition-all duration-200 ${barHover === i ? 'opacity-100' : 'opacity-85'} ${above ? 'acc-bar' : 'bg-brass-400'}`}
                    style={{ height: `${(v / maxRev) * 100}%`, animationDelay: `${i * 45}ms` }}
                  />
                  <span className={`mt-1.5 font-mono text-[9.5px] ${barHover === i ? 'font-bold text-ink-900' : 'text-ink-300'}`}>{MONTHS[i][0]}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-4 border-t border-line pt-3 font-mono text-[10.5px] text-ink-400">
            <span className="flex items-center gap-1.5"><span className="acc-dot h-2 w-2 rounded-sm" /> Above target</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-brass-400" /> Below target</span>
          </div>
        </Card>

        {/* Funnel */}
        <Card className="xl:col-span-5" title="Stage conversion funnel" sub="Deals that reached each stage" delay={140}>
          <ul className="space-y-3">
            {funnel.map((f, i) => (
              <li key={f.stage}>
                <div className="mb-1 flex justify-between text-[12.5px]">
                  <span className="font-semibold text-ink-700">{f.stage}</span>
                  <span className="font-mono font-bold text-ink-900">{f.count} <span className="text-ink-300">· {Math.round((f.count / funnelMax) * 100)}%</span></span>
                </div>
                <div className="h-7 overflow-hidden rounded-lg bg-paper">
                  <div
                    className="anim-grow-x flex h-full items-center rounded-lg pl-2.5"
                    style={{
                      width: `${Math.max(12, (f.count / funnelMax) * 100)}%`,
                      background: `color-mix(in srgb, var(--acc) ${100 - i * 18}%, var(--acc-soft))`,
                      animationDelay: `${0.15 + i * 0.09}s`
                    }}
                  >
                    <span className="font-mono text-[10px] font-bold whitespace-nowrap text-white drop-shadow-sm">{f.count} deals</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-center gap-6 border-t border-line pt-4">
            <Donut pct={winRate} size={92} color="var(--acc)" label="Win rate" />
            <div className="space-y-1.5 text-[12.5px] text-ink-600">
              <p><span className="font-mono font-bold text-ink-900">{won.length}</span> closed-won this period</p>
              <p><span className="font-mono font-bold text-ink-900">{fmtK(won.reduce((s, d) => s + d.value, 0))}</span> won revenue</p>
              <p className="text-[11.5px] text-ink-400">Top source: outbound (38%)</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Leaderboard */}
        <Card className="xl:col-span-7" title="Team leaderboard" sub="Closed revenue vs. quota" delay={200}
          action={<span className="acc-soft flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10.5px] font-bold"><Award size={11} /> Q1 standings</span>} pad={false}>
          <ul>
            {leaderboard.map((m, i) => {
              const qPct = Math.min(100, Math.round((m.closed / m.quota) * 100));
              return (
                <li key={m.name} className="row-hover flex items-center gap-3.5 border-b border-line px-5 py-3.5 last:border-0">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold ${i === 0 ? 'bg-brass-100 text-brass-700' : 'bg-paper text-ink-400'}`}>{i + 1}</span>
                  <Avatar name={m.name} hue={m.hue} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[13.5px] font-bold text-ink-900">{m.name}</span>
                      <span className="font-mono text-[12.5px] font-bold text-ink-900">{fmtK(m.closed)} <span className="text-[10.5px] font-medium text-ink-300">/ {fmtK(m.quota)}</span></span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-ink-400">{m.role}</div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper">
                      <div className={`anim-grow-x h-full rounded-full ${qPct >= 75 ? 'acc-bar' : qPct >= 50 ? 'bg-brass-400' : 'bg-bad'}`} style={{ width: `${qPct}%`, animationDelay: `${0.2 + i * 0.08}s` }} />
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-md px-2 py-1 font-mono text-[11px] font-bold ${qPct >= 75 ? 'bg-oksoft text-ok' : qPct >= 50 ? 'bg-warnsoft text-warn' : 'bg-badsoft text-bad'}`}>{qPct}%</span>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Activity heat */}
        <Card className="xl:col-span-5" title="Activity rhythm" sub="Logged touches by weekday" delay={260}>
          <div className="space-y-2">
            {WEEK_ACTIVITY.map((v, i) => (
              <div key={WEEK_DAYS[i]} className="flex items-center gap-3">
                <span className="w-9 font-mono text-[10.5px] font-semibold text-ink-400">{WEEK_DAYS[i]}</span>
                <div className="flex flex-1 gap-[3px]">
                  {Array.from({ length: 14 }).map((_, cell) => {
                    const on = cell < Math.round((v / maxWeek) * 14);
                    return <span key={cell} className={`anim-pop h-5 flex-1 rounded-[4px] ${on ? 'acc-bar' : 'bg-paper'}`} style={{ opacity: on ? 0.35 + (cell / 14) * 0.65 : 1, animationDelay: `${i * 60 + cell * 22}ms` }} />;
                  })}
                </div>
                <span className="w-8 text-right font-mono text-[11px] font-bold text-ink-700">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-paper/70 px-3.5 py-3 text-[12px] leading-relaxed text-ink-500">
            <strong className="text-ink-800">Insight:</strong> Thursdays convert 1.8× better than other days — cluster demos and proposal walks there.
          </div>
        </Card>
      </div>
    </div>
  );
}
