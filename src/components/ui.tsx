import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Check, CheckCircle2, ChevronDown, Info, X } from 'lucide-react';
import { AVATAR_HUES, fmtFull, initials } from '../data';
import { useStore } from '../store';

/* ---------- Avatar ---------- */
export function Avatar({ name, hue = 0, size = 36, className = '' }: { name: string; hue?: number; size?: number; className?: string }) {
  const bg = AVATAR_HUES[hue % AVATAR_HUES.length];
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-white select-none ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, ${bg}, ${bg}cc)` }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

/* ---------- Badge ---------- */
export function Badge({ soft, text, children, dot }: { soft: string; text: string; children: ReactNode; dot?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap" style={{ background: soft, color: text }}>
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: text }} />}
      {children}
    </span>
  );
}

/* ---------- CountUp ---------- */
export function CountUp({ to, prefix = '', suffix = '', decimals = 0, dur = 950, className = '' }: { to: number; prefix?: string; suffix?: string; decimals?: number; dur?: number; className?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setVal(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, dur]);
  return <span className={`tabular ${className}`}>{prefix}{val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

/* ---------- Delta ---------- */
export function Delta({ v }: { v: number }) {
  const up = v >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 font-mono text-[11px] font-semibold ${up ? 'text-ok' : 'text-bad'}`}>
      {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {Math.abs(v).toFixed(1)}%
    </span>
  );
}

/* ---------- Sparkline ---------- */
export function Sparkline({ values, color = 'var(--acc)', w = 96, h = 30 }: { values: number[]; color?: string; w?: number; h?: number }) {
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - 3 - ((v - min) / span) * (h - 6)}`).join(' ');
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity={0.12} className="fade-late" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" pathLength={1} className="draw-path" />
      <circle cx={w} cy={h - 3 - ((values[values.length - 1] - min) / span) * (h - 6)} r={2.6} fill={color} className="fade-late" />
    </svg>
  );
}

/* ---------- AreaChart with hover ---------- */
export function AreaChart({ values, labels, target, color = 'var(--acc)', h = 230 }: { values: number[]; labels: string[]; target?: number; color?: string; h?: number }) {
  const [idx, setIdx] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const W = 640, P = 14, H = h;
  const min = 0, max = Math.max(...values, target ?? 0) * 1.15;
  const x = (i: number) => P + (i * (W - P * 2)) / (values.length - 1);
  const y = (v: number) => H - 34 - ((v - min) / (max - min)) * (H - 34 - P);
  const dLine = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const dArea = `${dLine} L${x(values.length - 1)},${H - 34} L${x(0)},${H - 34} Z`;

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - P) / (W - P * 2)) * (values.length - 1));
    setIdx(Math.max(0, Math.min(values.length - 1, i)));
  };

  return (
    <div ref={ref} className="relative" onMouseMove={onMove} onMouseLeave={() => setIdx(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        {[0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1={P} x2={W - P} y1={y(max * f)} y2={y(max * f)} stroke="#e3e6e0" strokeDasharray="3 5" />
        ))}
        {target !== undefined && (
          <g>
            <line x1={P} x2={W - P} y1={y(target)} y2={y(target)} stroke="#d99a2b" strokeWidth={1.5} strokeDasharray="6 5" />
            <text x={W - P} y={y(target) - 6} textAnchor="end" fontSize={10} className="font-mono" style={{ fontFamily: 'var(--font-mono)' }} fill="#b47f22">target {target}k</text>
          </g>
        )}
        <path d={dArea} fill={color} opacity={0.1} className="fade-late" />
        <path d={dLine} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" pathLength={1} className="draw-path" />
        {values.map((v, i) => (
          <text key={labels[i]} x={x(i)} y={H - 14} textAnchor="middle" fontSize={10} className="font-mono" style={{ fontFamily: 'var(--font-mono)' }} fill={idx === i ? '#141b17' : '#9aa79e'} fontWeight={idx === i ? 700 : 400}>
            {labels[i]}
          </text>
        ))}
        {idx !== null && (
          <g>
            <line x1={x(idx)} x2={x(idx)} y1={P} y2={H - 34} stroke={color} strokeOpacity={0.25} />
            <circle cx={x(idx)} cy={y(values[idx])} r={4.5} fill="#fff" stroke={color} strokeWidth={2.5} />
          </g>
        )}
      </svg>
      {idx !== null && (
        <div
          className="pointer-events-none absolute top-1 anim-fade rounded-lg border border-line bg-card px-3 py-1.5 shadow-pop"
          style={{ left: `${(x(idx) / W) * 100}%`, transform: `translateX(${idx > values.length / 2 ? '-110%' : '10%'})` }}
        >
          <div className="font-mono text-[11px] text-ink-400">{labels[idx]}</div>
          <div className="font-mono text-sm font-bold text-ink-900">{fmtFull(values[idx] * 1000)}</div>
        </div>
      )}
    </div>
  );
}

/* ---------- Donut ---------- */
export function Donut({ pct, size = 108, color = 'var(--acc)', label }: { pct: number; size?: number; color?: string; label: string }) {
  const r = size / 2 - 9, c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e9ece7" strokeWidth={10} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c} style={{ animation: `drawDonut 1.1s 0.2s cubic-bezier(0.22,1,0.36,1) forwards`, ['--dn' as never]: `${c * (1 - pct / 100)}` }} />
        <style>{`@keyframes drawDonut { to { stroke-dashoffset: var(--dn); } }`}</style>
      </svg>
      <div className="absolute text-center">
        <div className="font-mono text-xl font-bold text-ink-900">{pct}%</div>
        <div className="text-[10px] font-semibold tracking-wider text-ink-400 uppercase">{label}</div>
      </div>
    </div>
  );
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, children, footer, w = 520 }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; footer?: ReactNode; w?: number }) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-[9vh]">
      <div className="anim-fade fixed inset-0 bg-night/55 backdrop-blur-[2px]" onClick={onClose} />
      <div className="anim-scale relative w-full rounded-xl border border-line bg-card shadow-pop" style={{ maxWidth: w }}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-display text-lg font-semibold tracking-tight text-ink-900">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1.5 text-ink-400 transition hover:bg-paper hover:text-ink-900" aria-label="Close">
            <X size={17} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-line bg-paper/60 px-5 py-3.5 rounded-b-xl">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Drawer ---------- */
export function Drawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="anim-fade absolute inset-0 bg-night/45 backdrop-blur-[2px]" onClick={onClose} />
      <div className="anim-drawer absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col border-l border-line bg-card shadow-pop">
        {children}
      </div>
    </div>
  );
}

/* ---------- Dropdown ---------- */
export function Dropdown({ button, children, align = 'right', width = 260 }: { button: (open: boolean) => ReactNode; children: ReactNode | ((close: () => void) => ReactNode); align?: 'left' | 'right'; width?: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{button(open)}</div>
      {open && (
        <div className={`anim-scale absolute z-40 mt-2 overflow-hidden rounded-xl border border-line bg-card shadow-pop ${align === 'right' ? 'right-0' : 'left-0'}`} style={{ width, maxWidth: 'calc(100vw - 24px)' }}>
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  );
}

/* ---------- Form fields ---------- */
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold tracking-wider text-ink-500 uppercase">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-bad">{hint}</span>}
    </label>
  );
}

export const inputCls = 'w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 transition focus:border-[var(--acc)]';

/* ---------- EmptyState ---------- */
export function EmptyState({ icon, title, sub, action }: { icon: ReactNode; title: string; sub: string; action?: ReactNode }) {
  return (
    <div className="anim-fade flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="acc-soft flex h-12 w-12 items-center justify-center rounded-xl">{icon}</div>
      <div className="font-display text-base font-semibold text-ink-900">{title}</div>
      <div className="max-w-xs text-sm text-ink-400">{sub}</div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/* ---------- Switch ---------- */
export function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      role="switch" aria-checked={on}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${on ? 'acc-bar' : 'bg-ink-200'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

/* ---------- Checkbox ---------- */
export function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onChange(); }}
      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-all duration-150 ${checked ? 'acc-bar border-transparent' : 'border-ink-200 bg-card hover:border-[var(--acc)]'}`}
      aria-label="Toggle done"
    >
      {checked && <Check size={12} strokeWidth={3.5} className="anim-pop text-white" />}
    </button>
  );
}

/* ---------- ToastHost ---------- */
export function ToastHost() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed right-5 bottom-5 z-[70] flex w-[320px] flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className="anim-toast pointer-events-auto flex items-center gap-2.5 rounded-xl border border-line bg-night px-3.5 py-3 text-sm font-medium text-paper shadow-pop">
          {t.kind === 'success' && <CheckCircle2 size={17} className="shrink-0 acc-text" />}
          {t.kind === 'info' && <Info size={17} className="shrink-0 text-brass-400" />}
          {t.kind === 'danger' && <AlertTriangle size={17} className="shrink-0 text-bad" />}
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => dismissToast(t.id)} className="text-ink-400 transition hover:text-paper" aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------- Card wrapper ---------- */
export function Card({ title, sub, action, children, className = '', pad = true, delay = 0 }: { title?: ReactNode; sub?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; pad?: boolean; delay?: number }) {
  return (
    <section className={`reveal rounded-xl border border-line bg-card shadow-soft ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div>
            <h3 className="font-display text-[15px] font-semibold tracking-tight text-ink-900">{title}</h3>
            {sub && <p className="text-xs text-ink-400">{sub}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={pad ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

/* ---------- Ghost icon button ---------- */
export function GhostBtn({ children, onClick, title, danger }: { children: ReactNode; onClick?: () => void; title?: string; danger?: boolean }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick?.(); }} title={title}
      className={`rounded-lg border border-line bg-card p-2 transition hover:shadow-soft active:scale-95 ${danger ? 'text-ink-400 hover:border-bad/40 hover:bg-badsoft hover:text-bad' : 'text-ink-500 acc-border-hover acc-text-hover'}`}
    >
      {children}
    </button>
  );
}

export function ChevronBtn({ open }: { open: boolean }) {
  return <ChevronDown size={15} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />;
}
