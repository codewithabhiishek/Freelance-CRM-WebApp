import { useState } from 'react';
import type { CSSProperties } from 'react';
import { ACCENTS } from './data';
import { StoreProvider, useStore } from './store';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import Contacts from './components/Contacts';
import Pipeline from './components/Pipeline';
import Tasks from './components/Tasks';
import Companies from './components/Companies';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import Composer from './components/Composer';
import { ToastHost } from './components/ui';

function Shell() {
  const { view, accentId } = useStore();
  const [mobileNav, setMobileNav] = useState(false);

  const accent = ACCENTS.find(a => a.id === accentId) ?? ACCENTS[0];
  const vars = { '--acc': accent.acc, '--acc-deep': accent.deep, '--acc-soft': accent.soft } as CSSProperties;

  return (
    <div style={vars} className="min-h-full">
      <Sidebar mobileOpen={mobileNav} onClose={() => setMobileNav(false)} />

      <div className="flex min-h-screen flex-col lg:pl-[248px]">
        <Topbar onMenu={() => setMobileNav(true)} />
        <main key={view} className="bg-scene animate-view flex-1 px-4 py-5 md:px-7">
          {view === 'dashboard' && <Dashboard />}
          {view === 'contacts' && <Contacts />}
          {view === 'pipeline' && <Pipeline />}
          {view === 'tasks' && <Tasks />}
          {view === 'companies' && <Companies />}
          {view === 'analytics' && <Analytics />}
          {view === 'settings' && <Settings />}
          <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 pb-1 font-mono text-[10.5px] text-ink-300">
            <span>Meridian CRM · Client intelligence platform</span>
            <span>Workspace synced locally · v2.4.1</span>
          </footer>
        </main>
      </div>

      <Composer />
      <ToastHost />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
