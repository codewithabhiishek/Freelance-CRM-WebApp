import { useState } from 'react';
import { Briefcase, CheckSquare, UserPlus } from 'lucide-react';
import { CONTACT_STATUS, STAGES, TEAM } from '../data';
import type { Contact, ContactStatus, Deal, Stage, Task, TaskType } from '../data';
import { useStore } from '../store';
import { Field, Modal, inputCls } from './ui';

export default function Composer() {
  const { composer, closeComposer } = useStore();
  if (!composer) return null;
  return (
    <>
      {composer.kind === 'contact' && <ContactForm existing={composer.contact} />}
      {composer.kind === 'deal' && <DealForm existing={composer.deal} hint={composer.hint} />}
      {composer.kind === 'task' && <TaskForm existing={composer.task} hint={composer.hint} />}
    </>
  );
}

/* ---------------- Contact ---------------- */
function ContactForm({ existing }: { existing?: Contact }) {
  const { addContact, updateContact, closeComposer, contacts } = useStore();
  const [f, setF] = useState({
    name: existing?.name ?? '', title: existing?.title ?? '', company: existing?.company ?? '',
    email: existing?.email ?? '', phone: existing?.phone ?? '', status: existing?.status ?? 'Lead' as ContactStatus,
    value: existing?.value?.toString() ?? '', location: existing?.location ?? '',
    tags: existing?.tags.join(', ') ?? '', owner: existing?.owner ?? TEAM[0].name,
  });
  const [err, setErr] = useState<{ name?: string; email?: string }>({});

  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const submit = () => {
    const e: typeof err = {};
    if (!f.name.trim()) e.name = 'Name is required';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = 'Enter a valid email';
    setErr(e);
    if (Object.keys(e).length) return;
    const payload = {
      name: f.name.trim(), title: f.title.trim() || '—', company: f.company.trim() || 'Independent',
      email: f.email.trim(), phone: f.phone.trim() || '—', status: f.status,
      value: Number(f.value) || 0, location: f.location.trim() || '—',
      tags: f.tags.split(',').map(t => t.trim()).filter(Boolean),
      lastTouch: 'Just now', fav: existing?.fav ?? false, hue: existing?.hue ?? (contacts.length % 8),
      notes: existing?.notes ?? '', owner: f.owner,
    };
    if (existing) updateContact({ ...payload, id: existing.id });
    else addContact(payload);
    closeComposer();
  };

  return (
    <Modal open onClose={closeComposer} w={560} title={<span className="flex items-center gap-2"><UserPlus size={17} className="acc-text" />{existing ? 'Edit contact' : 'New contact'}</span>}
      footer={<>
        <button onClick={closeComposer} className="rounded-lg border border-line bg-card px-4 py-2 text-[13px] font-semibold text-ink-500 transition hover:bg-paper">Cancel</button>
        <button onClick={submit} className="btn-acc rounded-lg px-4 py-2 text-[13px] font-semibold">{existing ? 'Save changes' : 'Create contact'}</button>
      </>}>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="Full name" hint={err.name}><input className={inputCls} value={f.name} onChange={e => set('name', e.target.value)} placeholder="Jordan Reyes" autoFocus /></Field>
        <Field label="Job title"><input className={inputCls} value={f.title} onChange={e => set('title', e.target.value)} placeholder="Head of Growth" /></Field>
        <Field label="Company"><input className={inputCls} value={f.company} onChange={e => set('company', e.target.value)} placeholder="Acme Systems" list="companies-list" /></Field>
        <datalist id="companies-list">
          {Array.from(new Set(contacts.map(c => c.company))).map(c => <option key={c} value={c} />)}
        </datalist>
        <Field label="Email" hint={err.email}><input className={inputCls} value={f.email} onChange={e => set('email', e.target.value)} placeholder="jordan@acme.com" /></Field>
        <Field label="Phone"><input className={inputCls} value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 (555) 000-0000" /></Field>
        <Field label="Location"><input className={inputCls} value={f.location} onChange={e => set('location', e.target.value)} placeholder="Austin, US" /></Field>
        <Field label="Status">
          <select className={inputCls} value={f.status} onChange={e => set('status', e.target.value)}>
            {(Object.keys(CONTACT_STATUS) as ContactStatus[]).map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Deal value ($ USD)"><input className={inputCls} type="number" min={0} value={f.value} onChange={e => set('value', e.target.value)} placeholder="50000" /></Field>
        <Field label="Owner">
          <select className={inputCls} value={f.owner} onChange={e => set('owner', e.target.value)}>
            {TEAM.map(t => <option key={t.name}>{t.name}</option>)}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Tags (comma separated)"><input className={inputCls} value={f.tags} onChange={e => set('tags', e.target.value)} placeholder="Enterprise, Renewal Q3" /></Field>
        </div>
      </div>
    </Modal>
  );
}

/* ---------------- Deal ---------------- */
function DealForm({ existing, hint }: { existing?: Deal; hint?: string }) {
  const { addDeal, updateDeal, closeComposer, contacts } = useStore();
  const hintStage = STAGES.includes(hint as Stage) ? (hint as Stage) : 'New Lead';
  const [f, setF] = useState({
    title: existing?.title ?? '', company: existing?.company ?? '', contact: existing?.contact ?? '',
    value: existing?.value?.toString() ?? '', stage: existing?.stage ?? hintStage,
    prob: existing?.prob?.toString() ?? '15', close: existing?.close ?? 'Apr 30', owner: existing?.owner ?? TEAM[0].name,
  });
  const [err, setErr] = useState<{ title?: string; value?: string }>({});
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const submit = () => {
    const e: typeof err = {};
    if (!f.title.trim()) e.title = 'Deal name is required';
    if (!f.value || Number(f.value) <= 0) e.value = 'Enter a value above 0';
    setErr(e);
    if (Object.keys(e).length) return;
    const payload = {
      title: f.title.trim(), company: f.company.trim() || '—', contact: f.contact || '—',
      value: Number(f.value), stage: f.stage, prob: f.stage === 'Won' ? 100 : Math.min(95, Number(f.prob) || 10),
      close: f.close, owner: f.owner,
    };
    if (existing) updateDeal({ ...payload, id: existing.id });
    else addDeal(payload);
    closeComposer();
  };

  return (
    <Modal open onClose={closeComposer} w={560} title={<span className="flex items-center gap-2"><Briefcase size={17} className="acc-text" />{existing ? 'Edit deal' : 'New deal'}</span>}
      footer={<>
        <button onClick={closeComposer} className="rounded-lg border border-line bg-card px-4 py-2 text-[13px] font-semibold text-ink-500 transition hover:bg-paper">Cancel</button>
        <button onClick={submit} className="btn-acc rounded-lg px-4 py-2 text-[13px] font-semibold">{existing ? 'Save changes' : 'Create deal'}</button>
      </>}>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Deal name" hint={err.title}><input className={inputCls} value={f.title} onChange={e => set('title', e.target.value)} placeholder="Platform license — 3yr" autoFocus /></Field>
        </div>
        <Field label="Company"><input className={inputCls} value={f.company} onChange={e => set('company', e.target.value)} placeholder="Acme Systems" /></Field>
        <Field label="Primary contact">
          <select className={inputCls} value={f.contact} onChange={e => set('contact', e.target.value)}>
            <option value="">Select…</option>
            {contacts.map(c => <option key={c.id} value={c.name}>{c.name} — {c.company}</option>)}
          </select>
        </Field>
        <Field label="Value ($ USD)" hint={err.value}><input className={inputCls} type="number" min={0} value={f.value} onChange={e => set('value', e.target.value)} placeholder="75000" /></Field>
        <Field label="Stage">
          <select className={inputCls} value={f.stage} onChange={e => set('stage', e.target.value)}>
            {STAGES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Win probability (%)"><input className={inputCls} type="number" min={0} max={100} value={f.prob} onChange={e => set('prob', e.target.value)} /></Field>
        <Field label="Expected close"><input className={inputCls} value={f.close} onChange={e => set('close', e.target.value)} placeholder="Apr 30" /></Field>
        <Field label="Owner">
          <select className={inputCls} value={f.owner} onChange={e => set('owner', e.target.value)}>
            {TEAM.map(t => <option key={t.name}>{t.name}</option>)}
          </select>
        </Field>
      </div>
    </Modal>
  );
}

/* ---------------- Task ---------------- */
function TaskForm({ existing, hint }: { existing?: Task; hint?: string }) {
  const { addTask, closeComposer, contacts } = useStore();
  const [f, setF] = useState({
    title: existing?.title ?? '', type: existing?.type ?? 'call' as TaskType,
    due: existing?.due ?? 'Tomorrow · 10:00', priority: existing?.priority ?? 'Medium' as Task['priority'],
    linked: existing?.linked ?? hint ?? '',
  });
  const [err, setErr] = useState('');
  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  const submit = () => {
    if (!f.title.trim()) { setErr('Give the task a name'); return; }
    addTask({ title: f.title.trim(), type: f.type, due: f.due, priority: f.priority, done: false, linked: f.linked || '—' });
    closeComposer();
  };

  return (
    <Modal open onClose={closeComposer} w={480} title={<span className="flex items-center gap-2"><CheckSquare size={17} className="acc-text" />New task</span>}
      footer={<>
        <button onClick={closeComposer} className="rounded-lg border border-line bg-card px-4 py-2 text-[13px] font-semibold text-ink-500 transition hover:bg-paper">Cancel</button>
        <button onClick={submit} className="btn-acc rounded-lg px-4 py-2 text-[13px] font-semibold">Add task</button>
      </>}>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Task" hint={err}><input className={inputCls} value={f.title} onChange={e => set('title', e.target.value)} placeholder="Follow up on proposal" autoFocus /></Field>
        </div>
        <Field label="Type">
          <select className={inputCls} value={f.type} onChange={e => set('type', e.target.value)}>
            {(['call', 'email', 'meeting', 'demo', 'admin'] as TaskType[]).map(t => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
          </select>
        </Field>
        <Field label="Priority">
          <select className={inputCls} value={f.priority} onChange={e => set('priority', e.target.value)}>
            {(['High', 'Medium', 'Low'] as const).map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Due"><input className={inputCls} value={f.due} onChange={e => set('due', e.target.value)} placeholder="Tomorrow · 10:00" /></Field>
        <Field label="Link to account">
          <select className={inputCls} value={f.linked} onChange={e => set('linked', e.target.value)}>
            <option value="">None</option>
            {Array.from(new Set(contacts.map(c => c.company))).map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>
    </Modal>
  );
}
