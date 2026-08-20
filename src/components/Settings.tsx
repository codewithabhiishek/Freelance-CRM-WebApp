import { useState } from 'react';
import { BellRing, Check, Database, Download, Mail, Paintbrush, RefreshCw, UserRound } from 'lucide-react';
import { ACCENTS } from '../data';
import { useStore } from '../store';
import { Avatar, Card, Field, Modal, Switch, inputCls } from './ui';

export default function Settings() {
  const { profile, setProfile, accentId, setAccentId, contacts, deals, tasks, toast, resetAll } = useStore();
  const [f, setF] = useState({ ...profile });
  const [prefs, setPrefs] = useState({ dealStages: true, dailyDigest: true, riskAlerts: true, mentions: false });
  const [confirmReset, setConfirmReset] = useState(false);
  const [preview, setPreview] = useState(false);

  const dirty = f.name !== profile.name || f.email !== profile.email || f.role !== profile.role;

  const saveProfile = () => {
    if (!f.name.trim()) { toast('Name can’t be empty', 'danger'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) { toast('Enter a valid work email', 'danger'); return; }
    setProfile({ name: f.name.trim(), email: f.email.trim(), role: f.role.trim() || profile.role });
    toast('Profile saved');
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), contacts, deals, tasks }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'meridian-workspace.json'; a.click();
    URL.revokeObjectURL(url);
    toast('Workspace exported as JSON');
  };

  return (
    <div className="mx-auto max-w-[920px]">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Profile */}
        <Card title="Profile" sub="How you appear across the workspace" delay={0}>
          <div className="mb-4 flex items-center gap-3.5">
            <Avatar name={f.name || profile.name} size={52} />
            <div>
              <div className="font-display text-[16px] font-bold text-ink-900">{f.name || 'Unnamed'}</div>
              <div className="text-[12px] text-ink-400">Member since 2021 · {deals.length} deals touched</div>
            </div>
          </div>
          <div className="space-y-3.5">
            <Field label="Full name"><input className={inputCls} value={f.name} onChange={e => setF(p => ({ ...p, name: e.target.value }))} /></Field>
            <Field label="Work email"><input className={inputCls} type="email" value={f.email} onChange={e => setF(p => ({ ...p, email: e.target.value }))} /></Field>
            <Field label="Role"><input className={inputCls} value={f.role} onChange={e => setF(p => ({ ...p, role: e.target.value }))} /></Field>
            <button
              onClick={saveProfile}
              disabled={!dirty}
              className="btn-acc flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-semibold disabled:cursor-default disabled:opacity-40"
            >
              <UserRound size={15} /> {dirty ? 'Save changes' : 'Up to date'}
            </button>
          </div>
        </Card>

        <div className="space-y-5">
          {/* Appearance */}
          <Card title="Appearance" sub="Accent color used across the workspace" delay={70}>
            <div className="grid grid-cols-2 gap-2.5">
              {ACCENTS.map(a => {
                const on = accentId === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => { setAccentId(a.id); toast(`Accent set to ${a.name}`, 'info'); }}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition active:scale-[0.98] ${on ? 'border-transparent shadow-soft' : 'border-line acc-border-hover'}`}
                    style={on ? { background: a.soft } : undefined}
                  >
                    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: a.acc }}>
                      {on && <Check size={15} strokeWidth={3} className="anim-pop text-white" />}
                    </span>
                    <span>
                      <span className="block text-[13px] font-bold text-ink-900">{a.name}</span>
                      <span className="font-mono text-[10px] text-ink-400">{a.acc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-3.5 flex items-center gap-2 rounded-lg bg-paper/70 px-3.5 py-2.5">
              <Paintbrush size={14} className="acc-text" />
              <span className="text-[12px] text-ink-500">Buttons, highlights and meters retheme instantly.</span>
              <button onClick={() => setPreview(true)} className="btn-acc ml-auto rounded-md px-2.5 py-1 text-[11px] font-bold">Preview</button>
            </div>
          </Card>

          {/* Notifications */}
          <Card title="Notifications" sub="What lands in your bell" delay={140} pad={false}>
            <ul>
              {[
                { key: 'dealStages' as const, icon: BellRing, label: 'Deal stage changes', sub: 'When any deal moves or closes' },
                { key: 'dailyDigest' as const, icon: Mail, label: 'Daily digest', sub: 'Morning summary at 8:00 local' },
                { key: 'riskAlerts' as const, icon: RefreshCw, label: 'Churn risk alerts', sub: 'Accounts with dropping usage' },
                { key: 'mentions' as const, icon: UserRound, label: 'Mentions', sub: 'When a teammate @mentions you' },
              ].map((n, i) => (
                <li key={n.key} className={`flex items-center gap-3 px-5 py-3.5 ${i > 0 ? 'border-t border-line' : ''}`}>
                  <span className="acc-soft flex h-8 w-8 items-center justify-center rounded-lg"><n.icon size={14} /></span>
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-ink-800">{n.label}</div>
                    <div className="text-[11px] text-ink-400">{n.sub}</div>
                  </div>
                  <Switch on={prefs[n.key]} onChange={v => { setPrefs(p => ({ ...p, [n.key]: v })); toast(`${n.label} ${v ? 'enabled' : 'muted'}`, 'info'); }} />
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Data */}
        <Card className="lg:col-span-2" title="Workspace data" sub="Everything is stored locally in this browser" delay={210}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-line bg-paper/60 px-4 py-3">
              <Database size={17} className="acc-text" />
              <div>
                <div className="font-mono text-[13px] font-bold text-ink-900">{contacts.length} contacts · {deals.length} deals · {tasks.length} tasks</div>
                <div className="text-[11px] text-ink-400">Synced to localStorage under <span className="font-mono">meridian-crm-v1</span></div>
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <button onClick={exportJson} className="flex items-center gap-2 rounded-lg border border-line bg-card px-3.5 py-2 text-[12.5px] font-semibold text-ink-700 transition acc-border-hover hover:shadow-soft active:scale-95">
                <Download size={14} /> Export JSON
              </button>
              <button onClick={() => setConfirmReset(true)} className="flex items-center gap-2 rounded-lg border border-bad/30 bg-badsoft px-3.5 py-2 text-[12.5px] font-semibold text-bad transition hover:brightness-95 active:scale-95">
                <RefreshCw size={14} /> Reset demo data
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* Accent preview */}
      <Modal open={preview} onClose={() => setPreview(false)} w={440} title="Accent preview"
        footer={<button onClick={() => setPreview(false)} className="btn-acc rounded-lg px-4 py-2 text-[13px] font-semibold">Looks good</button>}>
        <div className="space-y-4">
          <p className="text-[12.5px] text-ink-500">
            Currently applied: <strong className="text-ink-800">{ACCENTS.find(a => a.id === accentId)?.name}</strong>. These components pull from the live theme variables.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button className="btn-acc rounded-lg px-3.5 py-2 text-[12.5px] font-semibold">Primary action</button>
            <span className="acc-soft rounded-md px-2.5 py-1 text-[11px] font-bold">Stage badge</span>
            <span className="acc-text text-[12.5px] font-bold">Text link</span>
            <Avatar name={profile.name} size={30} />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-[11px] font-semibold text-ink-400">
              <span>Pipeline goal</span><span className="font-mono">72%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-paper">
              <div className="acc-bar anim-grow-x h-full rounded-full" style={{ width: '72%' }} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-line px-3.5 py-2.5">
            <span className="text-[12.5px] font-semibold text-ink-700">Focus ring &amp; hover states</span>
            <input className={`${inputCls} w-36`} placeholder="Try typing…" />
          </div>
        </div>
      </Modal>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} w={400} title="Reset workspace?"
        footer={<>
          <button onClick={() => setConfirmReset(false)} className="rounded-lg border border-line bg-card px-4 py-2 text-[13px] font-semibold text-ink-500 transition hover:bg-paper">Cancel</button>
          <button onClick={() => { resetAll(); setConfirmReset(false); }} className="rounded-lg bg-bad px-4 py-2 text-[13px] font-semibold text-white transition hover:brightness-110 active:scale-95">Reset everything</button>
        </>}>
        <p className="text-sm leading-relaxed text-ink-600">This discards all local changes — contacts, deals, tasks, profile and theme — and restores the original demo dataset.</p>
      </Modal>
    </div>
  );
}
