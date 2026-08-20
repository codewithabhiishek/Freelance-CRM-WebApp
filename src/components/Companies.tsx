import { useState } from 'react';
import { Building2, Globe2, HeartPulse, TrendingUp, Wallet } from 'lucide-react';
import { CONTACT_STATUS, fmtFull, fmtK, seedCompanies } from '../data';
import type { Company } from '../data';
import { useStore } from '../store';
import { Avatar, Badge, Modal } from './ui';

export default function Companies() {
  const { contacts, deals } = useStore();
  const [selected, setSelected] = useState<Company | null>(null);

  const companies = seedCompanies;
  const totalValue = companies.reduce((s, c) => s + c.value, 0);
  const avgHealth = Math.round(companies.reduce((s, c) => s + c.health, 0) / companies.length);

  const selContacts = selected ? contacts.filter(c => c.company === selected.name) : [];
  const selDeals = selected ? deals.filter(d => d.company === selected.name) : [];

  const statusMeta = { Active: { soft: '#e2f2e9', text: '#17724a' }, Prospect: { soft: '#e6ecf5', text: '#48628a' }, Dormant: { soft: '#eceeeb', text: '#74827a' } };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="reveal grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: Building2, label: 'Accounts', value: `${companies.length}`, note: '3 industries covered' },
          { icon: Wallet, label: 'Account revenue', value: fmtK(totalValue), note: 'lifetime value booked' },
          { icon: HeartPulse, label: 'Average health', value: `${avgHealth}/100`, note: 'usage, sentiment, support' },
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

      {/* Table */}
      <div className="reveal overflow-hidden rounded-xl border border-line bg-card shadow-soft" style={{ animationDelay: '120ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-line bg-paper/70 text-[10.5px] font-bold tracking-[0.12em] text-ink-400 uppercase">
                <th className="px-5 py-2.5">Company</th>
                <th className="px-2 py-2.5">Region</th>
                <th className="px-2 py-2.5">Size</th>
                <th className="px-2 py-2.5 text-right">Contacts</th>
                <th className="px-2 py-2.5 text-right">Open value</th>
                <th className="px-2 py-2.5">Health</th>
                <th className="px-2 py-2.5">Status</th>
                <th className="px-5 py-2.5 text-right">Customer since</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c, i) => {
                const nContacts = contacts.filter(x => x.company === c.name).length;
                const openVal = deals.filter(d => d.company === c.name && d.stage !== 'Won').reduce((s, d) => s + d.value, 0);
                const hColor = c.health >= 75 ? '#1f8a5b' : c.health >= 50 ? '#b47417' : '#c04a3e';
                return (
                  <tr key={c.id} className="row-hover reveal cursor-pointer border-b border-line last:border-0" style={{ animationDelay: `${140 + i * 40}ms` }} onClick={() => setSelected(c)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="acc-soft flex h-9 w-9 items-center justify-center rounded-lg font-display text-[13px] font-bold">{c.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
                        <div>
                          <div className="text-[13.5px] font-bold text-ink-900">{c.name}</div>
                          <div className="text-[11px] text-ink-400">{c.industry}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3.5 text-[12.5px] text-ink-600"><span className="flex items-center gap-1.5"><Globe2 size={12} className="text-ink-300" />{c.region}</span></td>
                    <td className="px-2 py-3.5 font-mono text-[12px] text-ink-600">{c.employees}</td>
                    <td className="px-2 py-3.5 text-right font-mono text-[12.5px] font-semibold text-ink-800">{nContacts || c.contacts}</td>
                    <td className="px-2 py-3.5 text-right font-mono text-[13px] font-bold text-ink-900">{fmtFull(openVal || c.value)}</td>
                    <td className="px-2 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-paper">
                          <div className="anim-grow-x h-full rounded-full" style={{ width: `${c.health}%`, background: hColor, animationDelay: `${0.2 + i * 0.05}s` }} />
                        </div>
                        <span className="font-mono text-[11px] font-semibold" style={{ color: hColor }}>{c.health}</span>
                      </div>
                    </td>
                    <td className="px-2 py-3.5"><Badge soft={statusMeta[c.status].soft} text={statusMeta[c.status].text} dot>{c.status}</Badge></td>
                    <td className="px-5 py-3.5 text-right font-mono text-[11.5px] text-ink-400">{c.since}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <Modal open onClose={() => setSelected(null)} w={620} title={selected.name}
          footer={<button onClick={() => setSelected(null)} className="btn-acc rounded-lg px-4 py-2 text-[13px] font-semibold">Done</button>}>
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge soft={statusMeta[selected.status].soft} text={statusMeta[selected.status].text} dot>{selected.status}</Badge>
              <Badge soft="#eceeeb" text="#54635b">{selected.industry}</Badge>
              <Badge soft="#eceeeb" text="#54635b">{selected.region}</Badge>
              <span className="ml-auto flex items-center gap-1.5 font-mono text-[12px] text-ink-500"><HeartPulse size={13} /> health {selected.health}/100</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Open value', value: fmtFull(selDeals.filter(d => d.stage !== 'Won').reduce((s, d) => s + d.value, 0)) },
                { label: 'Contacts', value: `${selContacts.length}` },
                { label: 'Open deals', value: `${selDeals.filter(d => d.stage !== 'Won').length}` },
                { label: 'Employees', value: selected.employees },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-paper/70 px-3 py-2.5">
                  <div className="text-[10px] font-bold tracking-wider text-ink-400 uppercase">{s.label}</div>
                  <div className="mt-0.5 font-mono text-[14px] font-bold text-ink-900">{s.value}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-2 text-[11px] font-bold tracking-wider text-ink-400 uppercase">People at {selected.name}</div>
              <ul className="space-y-1.5">
                {selContacts.length === 0 && <li className="text-[12.5px] text-ink-400">No contacts linked yet — add one from the Contacts view.</li>}
                {selContacts.map(c => (
                  <li key={c.id} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2 transition acc-border-hover">
                    <Avatar name={c.name} hue={c.hue} size={28} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-bold text-ink-800">{c.name}</div>
                      <div className="truncate text-[11px] text-ink-400">{c.title} · {c.email}</div>
                    </div>
                    <Badge soft={CONTACT_STATUS[c.status].soft} text={CONTACT_STATUS[c.status].text}>{c.status}</Badge>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="mb-2 text-[11px] font-bold tracking-wider text-ink-400 uppercase">Deals</div>
              <ul className="space-y-1.5">
                {selDeals.length === 0 && <li className="text-[12.5px] text-ink-400">No deals in the pipeline for this account.</li>}
                {selDeals.map(d => (
                  <li key={d.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
                    <div>
                      <div className="text-[13px] font-bold text-ink-800">{d.title}</div>
                      <div className="font-mono text-[10.5px] text-ink-400">{d.stage} · {d.prob}% · closes {d.close}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[13px] font-bold text-ink-900">{fmtFull(d.value)}</div>
                      {d.stage === 'Won' && <span className="flex items-center justify-end gap-1 font-mono text-[10px] font-bold text-ok"><TrendingUp size={10} /> closed</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
