import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Activity, Contact, Deal, Notif, Stage, Task,
  seedActivities, seedContacts, seedDeals, seedNotifs, seedTasks, uid,
} from './data';

export type View = 'dashboard' | 'contacts' | 'pipeline' | 'tasks' | 'companies' | 'analytics' | 'settings';
export type ComposerKind = 'contact' | 'deal' | 'task';
export interface ComposerState { kind: ComposerKind; contact?: Contact; deal?: Deal; task?: Task; hint?: string; }
export interface Toast { id: string; msg: string; kind: 'success' | 'info' | 'danger'; }

interface Store {
  view: View; setView: (v: View) => void;
  composer: ComposerState | null; openComposer: (c: ComposerState) => void; closeComposer: () => void;
  query: string; setQuery: (q: string) => void;
  accentId: string; setAccentId: (id: string) => void;
  profile: { name: string; email: string; role: string }; setProfile: (p: { name: string; email: string; role: string }) => void;

  contacts: Contact[]; deals: Deal[]; tasks: Task[]; activities: Activity[]; notifs: Notif[]; toasts: Toast[];

  addContact: (c: Omit<Contact, 'id'>) => void;
  updateContact: (c: Contact) => void;
  deleteContact: (id: string) => void;
  toggleFav: (id: string) => void;

  addDeal: (d: Omit<Deal, 'id'>) => void;
  updateDeal: (d: Deal) => void;
  deleteDeal: (id: string) => void;
  moveDeal: (id: string, stage: Stage) => void;

  addTask: (t: Omit<Task, 'id'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  markAllRead: () => void;
  readNotif: (id: string) => void;
  toast: (msg: string, kind?: Toast['kind']) => void;
  dismissToast: (id: string) => void;
  resetAll: () => void;
}

const Ctx = createContext<Store | null>(null);
const LS_KEY = 'meridian-crm-v1';

interface Persisted {
  contacts: Contact[]; deals: Deal[]; tasks: Task[];
  accentId: string; profile: { name: string; email: string; role: string };
}

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as Persisted;
  } catch { /* ignore */ }
  return null;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const saved = useMemo(loadPersisted, []);

  const [view, setView] = useState<View>('dashboard');
  const [composer, setComposer] = useState<ComposerState | null>(null);
  const [query, setQuery] = useState('');
  const [accentId, setAccentId] = useState(saved?.accentId ?? 'pine');
  const [profile, setProfile] = useState(saved?.profile ?? { name: 'Amara Chen', email: 'amara@meridian.io', role: 'Enterprise Account Executive' });

  const [contacts, setContacts] = useState<Contact[]>(saved?.contacts ?? seedContacts);
  const [deals, setDeals] = useState<Deal[]>(saved?.deals ?? seedDeals);
  const [tasks, setTasks] = useState<Task[]>(saved?.tasks ?? seedTasks);
  const [activities, setActivities] = useState<Activity[]>(seedActivities);
  const [notifs, setNotifs] = useState<Notif[]>(seedNotifs);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ contacts, deals, tasks, accentId, profile } satisfies Persisted));
    } catch { /* ignore */ }
  }, [contacts, deals, tasks, accentId, profile]);

  const dismissToast = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), []);

  const toast = useCallback((msg: string, kind: Toast['kind'] = 'success') => {
    const id = uid();
    setToasts(t => [...t.slice(-2), { id, msg, kind }]);
    window.setTimeout(() => dismissToast(id), 3800);
  }, [dismissToast]);

  const log = useCallback((kind: Activity['kind'], text: string) => {
    setActivities(a => [{ id: uid(), kind, text, time: 'Just now' }, ...a].slice(0, 30));
  }, []);

  /* ----- contacts ----- */
  const addContact = useCallback((c: Omit<Contact, 'id'>) => {
    setContacts(list => [{ ...c, id: uid() }, ...list]);
    log('contact', `New contact added: ${c.name} (${c.company}).`);
    toast(`${c.name} added to contacts`);
  }, [log, toast]);

  const updateContact = useCallback((c: Contact) => {
    setContacts(list => list.map(x => (x.id === c.id ? c : x)));
    log('contact', `${c.name}'s record was updated.`);
    toast('Contact updated');
  }, [log, toast]);

  const deleteContact = useCallback((id: string) => {
    const target = contacts.find(x => x.id === id);
    setContacts(list => list.filter(x => x.id !== id));
    if (target) log('contact', `${target.name} removed from contacts.`);
    toast('Contact deleted', 'danger');
  }, [contacts, log, toast]);

  const toggleFav = useCallback((id: string) => {
    setContacts(list => list.map(x => (x.id === id ? { ...x, fav: !x.fav } : x)));
  }, []);

  /* ----- deals ----- */
  const addDeal = useCallback((d: Omit<Deal, 'id'>) => {
    setDeals(list => [{ ...d, id: uid() }, ...list]);
    log('deal', `Deal created: “${d.title}” — ${d.company}.`);
    toast(`Deal “${d.title}” created`);
  }, [log, toast]);

  const updateDeal = useCallback((d: Deal) => {
    setDeals(list => list.map(x => (x.id === d.id ? d : x)));
    log('deal', `Deal updated: “${d.title}”.`);
    toast('Deal updated');
  }, [log, toast]);

  const deleteDeal = useCallback((id: string) => {
    setDeals(list => list.filter(x => x.id !== id));
    toast('Deal deleted', 'danger');
  }, [toast]);

  const moveDeal = useCallback((id: string, stage: Stage) => {
    const target = deals.find(x => x.id === id);
    if (!target || target.stage === stage) return;
    setDeals(list => list.map(x => (x.id === id ? { ...x, stage, prob: stage === 'Won' ? 100 : x.prob } : x)));
    log('deal', `“${target.title}” moved to ${stage}.`);
    toast(`Moved to ${stage}`, stage === 'Won' ? 'success' : 'info');
  }, [deals, log, toast]);

  /* ----- tasks ----- */
  const addTask = useCallback((t: Omit<Task, 'id'>) => {
    setTasks(list => [{ ...t, id: uid() }, ...list]);
    log('task', `Task added: ${t.title}.`);
    toast('Task added');
  }, [log, toast]);

  const toggleTask = useCallback((id: string) => {
    const target = tasks.find(x => x.id === id);
    setTasks(list => list.map(x => (x.id === id ? { ...x, done: !x.done } : x)));
    if (target && !target.done) log('task', `Completed: ${target.title}.`);
  }, [tasks, log]);

  const readNotif = useCallback((id: string) => {
    setNotifs(n => n.map(x => (x.id === id ? { ...x, read: true } : x)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(list => list.filter(x => x.id !== id));
  }, []);

  const markAllRead = useCallback(() => setNotifs(n => n.map(x => ({ ...x, read: true }))), []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setContacts(seedContacts); setDeals(seedDeals); setTasks(seedTasks);
    setActivities(seedActivities); setNotifs(seedNotifs);
    setAccentId('pine');
    setProfile({ name: 'Amara Chen', email: 'amara@meridian.io', role: 'Enterprise Account Executive' });
    toast('Workspace reset to demo data', 'info');
  }, [toast]);

  const value: Store = {
    view, setView, composer, openComposer: setComposer, closeComposer: () => setComposer(null),
    query, setQuery, accentId, setAccentId, profile, setProfile,
    contacts, deals, tasks, activities, notifs, toasts,
    addContact, updateContact, deleteContact, toggleFav,
    addDeal, updateDeal, deleteDeal, moveDeal,
    addTask, toggleTask, deleteTask,
    markAllRead, readNotif, toast, dismissToast, resetAll,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used within StoreProvider');
  return s;
}
