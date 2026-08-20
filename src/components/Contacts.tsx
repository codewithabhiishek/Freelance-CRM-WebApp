import { useMemo, useState } from 'react';
import { ArrowDownUp, Building2, Mail, MapPin, Pencil, Phone, Star, Trash2, UserPlus, Users, Wallet, X } from 'lucide-react';
import { CONTACT_STATUS, fmtFull, initials } from '../data';
import type { Contact, Deal } from '../data';
import { useStore } from '../store';
import { Avatar, Badge, Drawer, EmptyState, GhostBtn, Modal, inputCls } from './ui';

type SortKey = 'name' | 'value' | 'recent';

/* "2h ago" / "3d ago" / "1w ago" → hours, so recency sorts correctly */
const touchRank = (s: string): number => {
  const m = s.match(/(\d+)\s*(h|d|w)/i);
  if (!m) return 0; // "Just now" sorts first
  const n = Number(m[1]);
  const u = m[2]!.toLowerCase();
  return u === 'h' ? n : u === 'd' ? n * 24 : n * 168;
};

export default function Contacts() {
  const { contacts, deals, query, setQuery, toggleFav, deleteContact, openComposer } = useStore();
  const [status, setStatus] = useState<'All' | Contact['status']>('All');
  const [sort, setSort] = useState<SortKey>('value');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState<Contact | null>(null);

  const selected = useMemo(() => contacts.find(c => c.id === selectedId) ?? null, [contacts, selectedId]);
  const selDeals = useMemo(() => (selected ? deals.filter(d => d.company === selected.company) : []), [deals, selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = contacts.filter(c =>
      (status === 'All' || c.status === status) &&
      (!q || [c.name, c.company, c.email, c.location, c.tags.join(' ')].join(' ').toLowerCase().includes(q))
    );
    list = [...list].sort((a, b) =>
      sort === 'name' ? a.name.localeCompare(b.name)
      : sort === 'recent' ? touchRank(a.lastTouch) - touchRank(b.lastTouch)
      : b.value - a.value
    );
    return list;
  }, [contacts, query, status, sort]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="reveal flex flex-wrap items-center gap-2.5">
        <div className="flex flex-wrap gap-1.5">
          {(['All', 'Lead', 'Customer', 'At Risk', 'Partner'] as const).map(s => {
            const n = s === 'All' ? contacts.length : contacts.filter(c => c.status === s).length;
            const on = status === s;
            return (
              <button key={s} onClick={() => setStatus(s)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12.5px] font-semibold transition active:scale-95 ${on ? 'acc-soft border-transparent' : 'border-line bg-card text-ink-500 acc-border-hover'}`}>
                {s} <span className={`rounded px-1 font-mono text-[10.5px] ${on ? 'opacity-70' : 'bg-paper text-ink-400'}`}>{n}</span>
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setSort(s => (s === 'value' ? 'name' : s === 'name' ? 'recent' : 'value'))}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-[12.5px] font-semibold text-ink-500 transition acc-border-hover active:scale-95">
            <ArrowDownUp size={13} />
            {sort === 'value' ? 'By value' : sort === 'name' ? 'By name' : 'By recency'}
          </button>
          <button onClick={() => openComposer({ kind: 'contact' })} className="btn-acc flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold">
            <UserPlus size={14} /> Add contact
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="reveal overflow-hidden rounded-xl border border-line bg-card shadow-soft" style={{ animationDelay: '80ms' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={20} />}
            title="No contacts match"
            sub={query ? `Nothing found for “${query}”. Try a different search or clear filters.` : 'Try clearing the status filter, or add your first contact.'}
            action={query
              ? <button onClick={() => setQuery('')} className="rounded-lg border border-line bg-card px-3 py-1.5 text-[12.5px] font-semibold text-ink-600 transition hover:bg-paper">Clear search</button>
              : <button onClick={() => openComposer({ kind: 'contact' })} className="btn-acc rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold">Add contact</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-line bg-paper/70 text-[10.5px] font-bold tracking-[0.12em] text-ink-400 uppercase">
                  <th className="w-10 px-4 py-2.5" />
                  <th className="px-2 py-2.5">Contact</th>
                  <th className="px-2 py-2.5">Company</th>
                  <th className="px-2 py-2.5">Status</th>
                  <th className="px-2 py-2.5 text-right">Deal value</th>
                  <th className="px-2 py-2.5">Owner</th>
                  <th className="px-2 py-2.5">Last touch</th>
                  <th className="w-24 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} className="row-hover reveal group cursor-pointer border-b border-line last:border-0" style={{ animationDelay: `${100 + i * 35}ms` }} onClick={() => setSelectedId(c.id)}>
                    <td className="px-4 py-3">
                      <button
                        onClick={e => { e.stopPropagation(); toggleFav(c.id); }}
                        className={`transition active:scale-75 ${c.fav ? 'text-brass-500' : 'text-ink-200 hover:text-brass-400'}`}
                        aria-label="Toggle favorite"
                      >
                        <Star size={16} fill={c.fav ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} hue={c.hue} size={34} />
                        <div className="min-w-0">
                          <div className="truncate text-[13.5px] font-bold text-ink-900">{c.name}</div>
                          <div className="truncate font-mono text-[11px] text-ink-400">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="text-[13px] font-semibold text-ink-700">{c.company}</div>
                      <div className="text-[11px] text-ink-400">{c.title}</div>
                    </td>
                    <td className="px-2 py-3">
                      <Badge soft={CONTACT_STATUS[c.status].soft} text={CONTACT_STATUS[c.status].text} dot>{c.status}</Badge>
                    </td>
                    <td className="px-2 py-3 text-right font-mono text-[13px] font-bold text-ink-900">{fmtFull(c.value)}</td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={c.owner} size={22} hue={c.owner.length % 8} />
                        <span className="hidden text-[12.5px] text-ink-600 xl:inline">{c.owner.split(' ')[0]}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 font-mono text-[11.5px] text-ink-400">{c.lastTouch}</td>
                    <td className="px-4 py-3">
                      <div className="row-actions flex justify-end gap-1.5">
                        <GhostBtn title="Edit" onClick={() => openComposer({ kind: 'contact', contact: c })}><Pencil size={13} /></GhostBtn>
                        <GhostBtn title="Delete" danger onClick={() => setConfirmDel(c)}><Trash2 size={13} /></GhostBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 border-t border-line bg-paper/60 px-4 py-2.5 font-mono text-[11px] text-ink-400">
          <span>{filtered.length} of {contacts.length} contacts</span>
          <span>Total value {fmtFull(filtered.reduce((s, c) => s + c.value, 0))}</span>
        </div>
      </div>

      {/* Detail drawer — keyed so per-contact state stays isolated, live-derived so edits reflect instantly */}
      {selected && (
        <ContactDrawer
          key={selected.id}
          contact={selected}
          linked={selDeals}
          onClose={() => setSelectedId(null)}
          onEdit={() => openComposer({ kind: 'contact', contact: selected })}
        />
      )}

      {/* Delete confirm */}
      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} w={400} title="Delete contact?"
        footer={<>
          <button onClick={() => setConfirmDel(null)} className="rounded-lg border border-line bg-card px-4 py-2 text-[13px] font-semibold text-ink-500 transition hover:bg-paper">Keep</button>
          <button onClick={() => { if (confirmDel) { if (selectedId === confirmDel.id) setSelectedId(null); deleteContact(confirmDel.id); } setConfirmDel(null); }} className="rounded-lg bg-bad px-4 py-2 text-[13px] font-semibold text-white transition hover:brightness-110 active:scale-95">Delete permanently</button>
        </>}>
        <p className="text-sm leading-relaxed text-ink-600">
          <strong className="text-ink-900">{confirmDel?.name}</strong> ({confirmDel?.company}) will be removed from the workspace. Linked deals stay in the pipeline. This can’t be undone.
        </p>
      </Modal>
    </div>
  );
}

/* ---------------- Detail drawer (module-level: stable identity, no remount while typing) ---------------- */
function ContactDrawer({ contact, linked, onClose, onEdit }: { contact: Contact; linked: Deal[]; onClose: () => void; onEdit: () => void }) {
  const { updateContact, openComposer, toast } = useStore();
  const [notes, setNotes] = useState(contact.notes);
  const meta = CONTACT_STATUS[contact.status];

  return (
    <Drawer open onClose={onClose}>
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <span className="font-mono text-[11px] font-semibold tracking-[0.16em] text-ink-400 uppercase">Contact record</span>
        <div className="flex gap-1.5">
          <GhostBtn title="Edit" onClick={onEdit}><Pencil size={13} /></GhostBtn>
          <GhostBtn title="Close" onClick={onClose}><X size={13} /></GhostBtn>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-line bg-gradient-to-b from-[var(--acc-soft)]/50 to-card px-5 pt-5 pb-4">
          <div className="flex items-center gap-4">
            <Avatar name={contact.name} hue={contact.hue} size={56} />
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold tracking-tight text-ink-900">{contact.name}</h2>
              <p className="text-[13px] text-ink-500">{contact.title} · <span className="font-semibold text-ink-700">{contact.company}</span></p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Badge soft={meta.soft} text={meta.text} dot>{contact.status}</Badge>
                {contact.tags.map(t => <Badge key={t} soft="#eceeeb" text="#54635b">{t}</Badge>)}
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button onClick={() => { navigator.clipboard?.writeText(contact.email).catch(() => {}); toast('Email copied to clipboard', 'info'); }} className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-card py-2 text-[12px] font-semibold text-ink-600 transition acc-border-hover acc-text-hover active:scale-95"><Mail size={13} /> Email</button>
            <button onClick={() => { navigator.clipboard?.writeText(contact.phone).catch(() => {}); toast('Phone copied to clipboard', 'info'); }} className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-card py-2 text-[12px] font-semibold text-ink-600 transition acc-border-hover acc-text-hover active:scale-95"><Phone size={13} /> Call</button>
            <button onClick={() => openComposer({ kind: 'task', hint: contact.company })} className="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-card py-2 text-[12px] font-semibold text-ink-600 transition acc-border-hover acc-text-hover active:scale-95"><UserPlus size={13} /> Task</button>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
            {[
              { icon: Mail, label: 'Email', value: contact.email },
              { icon: Phone, label: 'Phone', value: contact.phone },
              { icon: MapPin, label: 'Location', value: contact.location },
              { icon: Users, label: 'Owner', value: contact.owner },
              { icon: Wallet, label: 'Deal value', value: fmtFull(contact.value) },
              { icon: Building2, label: 'Last touch', value: contact.lastTouch },
            ].map(it => (
              <div key={it.label} className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-wider text-ink-400 uppercase"><it.icon size={11} /> {it.label}</div>
                <div className="mt-0.5 font-semibold break-words text-ink-800">{it.value}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-ink-400 uppercase">Private notes</span>
              <button
                onClick={() => updateContact({ ...contact, notes })}
                disabled={notes === contact.notes}
                className="btn-acc rounded-md px-2.5 py-1 text-[11px] font-bold disabled:cursor-default disabled:opacity-40"
              >
                Save note
              </button>
            </div>
            <textarea
              value={notes} onChange={e => setNotes(e.target.value)} rows={4}
              placeholder="Context, preferences, next steps…"
              className="w-full resize-none rounded-lg border border-line bg-paper/60 px-3 py-2.5 text-[13px] leading-relaxed transition focus:bg-card"
            />
          </div>

          <div>
            <span className="text-[11px] font-bold tracking-wider text-ink-400 uppercase">Linked deals · {linked.length}</span>
            <ul className="mt-2 space-y-2">
              {linked.length === 0 && <li className="rounded-lg border border-dashed border-linedark px-3 py-3 text-[12.5px] text-ink-400">No deals linked to {contact.company} yet.</li>}
              {linked.map(d => (
                <li key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-paper/50 px-3 py-2.5 transition acc-border-hover">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold text-ink-800">{d.title}</div>
                    <div className="font-mono text-[10.5px] text-ink-400">{d.stage} · {d.prob}% · closes {d.close}</div>
                  </div>
                  <span className="shrink-0 font-mono text-[13px] font-bold acc-text">{fmtFull(d.value)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-paper/70 px-3 py-2.5 font-mono text-[11px] text-ink-400">
            Record ID {contact.id.toUpperCase()} · {initials(contact.name)}-{contact.hue}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
