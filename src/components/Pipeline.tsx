import { useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import { Briefcase, CalendarDays, Pencil, Plus, TrendingUp, Trash2, Wallet } from 'lucide-react';
import { STAGES, STAGE_META, fmtK } from '../data';
import type { Deal, Stage } from '../data';
import { useStore } from '../store';
import { Avatar, Badge, Field, Modal, inputCls } from './ui';

export default function Pipeline() {
  const { deals, moveDeal, openComposer, updateDeal, deleteDeal } = useStore();
  const [hoverCol, setHoverCol] = useState<Stage | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Deal | null>(null);

  const open = deals.filter(d => d.stage !== 'Won');
  const totalOpen = open.reduce((s, d) => s + d.value, 0);
  const weighted = open.reduce((s, d) => s + d.value * d.prob / 100, 0);
  const avg = open.length ? totalOpen / open.length : 0;

  const byStage = useMemo(() => {
    const m = new Map<Stage, Deal[]>();
    STAGES.forEach(s => m.set(s, []));
    deals.forEach(d => m.get(d.stage)?.push(d));
    m.forEach(list => list.sort((a, b) => b.value - a.value));
    return m;
  }, [deals]);

  const onDrop = (e: DragEvent, stage: Stage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) moveDeal(id, stage);
    setHoverCol(null); setDragId(null);
  };

  return (
    <div className="space-y-4">
      {/* Forecast strip */}
      <div className="reveal grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: Wallet, label: 'Open pipeline', value: fmtK(totalOpen), note: `${open.length} active deals` },
          { icon: TrendingUp, label: 'Weighted forecast', value: fmtK(Math.round(weighted)), note: 'value × probability' },
          { icon: Briefcase, label: 'Average deal size', value: fmtK(Math.round(avg)), note: 'across open stages' },
        ].map((s, i) => (
          <div key={s.label} className="reveal flex items-center gap-3.5 rounded-xl border border-line bg-card p-4 shadow-soft" style={{ animationDelay: `${i * 70}ms` }}>
            <span className="acc-soft flex h-10 w-10 items-center justify-center rounded-xl"><s.icon size={17} /></span>
            <div>
              <div className="text-[10.5px] font-bold tracking-wider text-ink-400 uppercase">{s.label}</div>
              <div className="font-mono text-lg leading-tight font-bold text-ink-900">{s.value}</div>
              <div className="text-[11px] text-ink-400">{s.note}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Board */}
      <div className="reveal flex gap-3.5 overflow-x-auto pb-3" style={{ animationDelay: '140ms' }}>
        {STAGES.map(stage => {
          const list = byStage.get(stage) ?? [];
          const total = list.reduce((s, d) => s + d.value, 0);
          const meta = STAGE_META[stage];
          const isWon = stage === 'Won';
          return (
            <div
              key={stage}
              onDragOver={e => { e.preventDefault(); setHoverCol(stage); }}
              onDragLeave={() => setHoverCol(c => (c === stage ? null : c))}
              onDrop={e => onDrop(e, stage)}
              className={`flex w-[268px] shrink-0 flex-col rounded-xl border transition-all duration-200 ${isWon ? 'border-[var(--acc)]/30 bg-[var(--acc-soft)]/40' : 'border-line bg-paper/70'} ${hoverCol === stage ? 'acc-ring border-transparent' : ''}`}
            >
              <div className="flex items-center gap-2 px-3.5 pt-3.5 pb-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.dot }} />
                <span className="font-display text-[13.5px] font-bold tracking-tight text-ink-800">{stage}</span>
                <span className="rounded-md bg-card px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-ink-400 shadow-soft">{list.length}</span>
                <span className="ml-auto font-mono text-[11.5px] font-bold text-ink-700">{fmtK(total)}</span>
              </div>

              <div className="flex-1 space-y-2.5 overflow-y-auto px-2.5 py-1.5" style={{ maxHeight: 'calc(100vh - 330px)', minHeight: 120 }}>
                {list.map(d => (
                  <div
                    key={d.id}
                    draggable
                    onDragStart={e => { e.dataTransfer.setData('text/plain', d.id); e.dataTransfer.effectAllowed = 'move'; setDragId(d.id); }}
                    onDragEnd={() => { setDragId(null); setHoverCol(null); }}
                    onClick={() => setEditing(d)}
                    className={`deal-card rounded-xl border border-line bg-card p-3.5 ${dragId === d.id ? 'deal-dragging' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-[13.5px] leading-snug font-bold text-ink-900">{d.title}</h4>
                      <Pencil size={12} className="mt-0.5 shrink-0 text-ink-200 transition group-hover:text-ink-400" />
                    </div>
                    <div className="mt-0.5 text-[11.5px] text-ink-400">{d.company}</div>
                    <div className="mt-2.5 flex items-baseline justify-between">
                      <span className="font-mono text-[15px] font-bold tracking-tight text-ink-900">{fmtK(d.value)}</span>
                      <span className="font-mono text-[10.5px] font-semibold" style={{ color: meta.text }}>{d.prob}%</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-paper">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.prob}%`, background: meta.dot }} />
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
                      <div className="flex items-center gap-1.5">
                        <Avatar name={d.owner} size={20} hue={d.owner.length % 8} />
                        <span className="text-[11px] font-semibold text-ink-500">{d.owner.split(' ')[0]}</span>
                      </div>
                      <span className="flex items-center gap-1 font-mono text-[10.5px] text-ink-400"><CalendarDays size={11} /> {d.close}</span>
                    </div>
                  </div>
                ))}
                {list.length === 0 && (
                  <div className={`rounded-xl border border-dashed px-3 py-6 text-center text-[11.5px] ${hoverCol === stage ? 'border-[var(--acc)] acc-text' : 'border-linedark text-ink-300'}`}>
                    {hoverCol === stage ? 'Release to move here' : 'Drop a deal here'}
                  </div>
                )}
              </div>

              <button
                onClick={() => openComposer({ kind: 'deal', hint: stage })}
                className="m-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-linedark py-2 text-[12px] font-semibold text-ink-400 transition acc-border-hover hover:bg-card acc-text-hover"
              >
                <Plus size={13} /> Add deal
              </button>
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editing && (
        <Modal open onClose={() => setEditing(null)} w={460} title="Deal details"
          footer={<>
            <button onClick={() => { deleteDeal(editing.id); setEditing(null); }} className="mr-auto flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-2 text-[12.5px] font-semibold text-bad transition hover:bg-badsoft active:scale-95">
              <Trash2 size={13} /> Delete
            </button>
            <button onClick={() => setEditing(null)} className="rounded-lg border border-line bg-card px-4 py-2 text-[13px] font-semibold text-ink-500 transition hover:bg-paper">Close</button>
            <button onClick={() => { updateDeal(editing); setEditing(null); }} className="btn-acc rounded-lg px-4 py-2 text-[13px] font-semibold">Save</button>
          </>}>
          <div className="space-y-3.5">
            <Field label="Deal name"><input className={inputCls} value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Value ($ USD)"><input className={inputCls} type="number" value={editing.value} onChange={e => setEditing({ ...editing, value: Number(e.target.value) || 0 })} /></Field>
              <Field label="Expected close"><input className={inputCls} value={editing.close} onChange={e => setEditing({ ...editing, close: e.target.value })} /></Field>
              <Field label="Stage">
                <select className={inputCls} value={editing.stage} onChange={e => setEditing({ ...editing, stage: e.target.value as Stage, prob: e.target.value === 'Won' ? 100 : editing.prob })}>
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Probability (%)"><input className={inputCls} type="number" min={0} max={100} value={editing.prob} onChange={e => setEditing({ ...editing, prob: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })} /></Field>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-paper/70 px-3 py-2.5">
              <span className="text-[11px] font-bold tracking-wider text-ink-400 uppercase">Weighted value</span>
              <span className="font-mono text-[14px] font-bold acc-text">{fmtK(Math.round(editing.value * editing.prob / 100))}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge soft={STAGE_META[editing.stage].soft} text={STAGE_META[editing.stage].text} dot>{editing.stage}</Badge>
              <span className="text-[12px] text-ink-400">{editing.contact} · {editing.company}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
