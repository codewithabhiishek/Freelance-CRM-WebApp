export type Stage = 'New Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won';
export const STAGES: Stage[] = ['New Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won'];

export const STAGE_META: Record<Stage, { dot: string; soft: string; text: string }> = {
  'New Lead':    { dot: '#74827a', soft: '#eceeeb', text: '#54635b' },
  'Qualified':   { dot: '#48628a', soft: '#e6ecf5', text: '#48628a' },
  'Proposal':    { dot: '#d99a2b', soft: '#f7ebcd', text: '#96651a' },
  'Negotiation': { dot: '#b4652a', soft: '#f6e4d8', text: '#9a5220' },
  'Won':         { dot: '#1f8a5b', soft: '#e2f2e9', text: '#17724a' },
};

export type ContactStatus = 'Lead' | 'Customer' | 'At Risk' | 'Partner';
export const CONTACT_STATUS: Record<ContactStatus, { soft: string; text: string }> = {
  'Lead':     { soft: '#e6ecf5', text: '#48628a' },
  'Customer': { soft: '#e2f2e9', text: '#17724a' },
  'At Risk':  { soft: '#f9e7e4', text: '#b0402f' },
  'Partner':  { soft: '#f7ebcd', text: '#96651a' },
};

export interface Contact {
  id: string; name: string; title: string; company: string;
  email: string; phone: string; status: ContactStatus;
  value: number; tags: string[]; location: string; lastTouch: string;
  fav: boolean; hue: number; notes: string; owner: string;
}

export interface Deal {
  id: string; title: string; company: string; contact: string;
  value: number; stage: Stage; prob: number; close: string; owner: string;
}

export type TaskType = 'call' | 'email' | 'meeting' | 'demo' | 'admin';
export interface Task {
  id: string; title: string; type: TaskType; due: string;
  priority: 'High' | 'Medium' | 'Low'; done: boolean; linked: string;
}

export interface Activity { id: string; kind: 'deal' | 'contact' | 'task' | 'mail' | 'call' | 'note'; text: string; time: string; }

export interface Company {
  id: string; name: string; industry: string; region: string; employees: string;
  health: number; status: 'Active' | 'Prospect' | 'Dormant'; value: number; contacts: number; since: string;
}

export interface Notif { id: string; text: string; time: string; read: boolean; kind: 'deal' | 'task' | 'contact' | 'system'; }

export interface TeamMember { name: string; role: string; hue: number; closed: number; quota: number; }

/* ---------------- helpers ---------------- */
export const uid = () => Math.random().toString(36).slice(2, 10);

export const fmtK = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, '')}M`
  : n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace(/\.0$/, '')}k`
  : `$${n}`;

export const fmtFull = (n: number) => '$' + n.toLocaleString('en-US');
export const initials = (name: string) =>
  name.split(' ').filter(Boolean).map(w => w[0]!.toUpperCase()).slice(0, 2).join('');

export const AVATAR_HUES = ['#175a4a', '#b47f22', '#48628a', '#9a4a5e', '#5b7350', '#7a5a9e', '#2a7d8a', '#a05a2a'];

/* ---------------- accent presets ---------------- */
export interface AccentPreset { id: string; name: string; acc: string; deep: string; soft: string; }
export const ACCENTS: AccentPreset[] = [
  { id: 'pine',  name: 'Meridian Pine', acc: '#175a4a', deep: '#0e3a31', soft: '#dfede7' },
  { id: 'slate', name: 'Harbor Slate',  acc: '#41608c', deep: '#2f4a70', soft: '#e6ecf5' },
  { id: 'wine',  name: 'Cellar Wine',   acc: '#8c3d4e', deep: '#6c2c3b', soft: '#f4e4e7' },
  { id: 'brass', name: 'Foundry Brass', acc: '#a4731d', deep: '#7d5714', soft: '#f7ebcd' },
];

/* ---------------- seed data ---------------- */
export const TEAM: TeamMember[] = [
  { name: 'Amara Chen',  role: 'Enterprise AE',  hue: 0, closed: 412_000, quota: 500_000 },
  { name: 'Diego Ruiz',  role: 'Sales Development', hue: 2, closed: 268_000, quota: 350_000 },
  { name: 'Priya Nair',  role: 'Customer Success', hue: 3, closed: 224_000, quota: 300_000 },
  { name: 'Tom Becker',  role: 'Mid-Market AE',  hue: 1, closed: 186_000, quota: 300_000 },
];

export const seedContacts: Contact[] = [
  { id: 'c1', name: 'Ingrid Halvorsen', title: 'VP Operations', company: 'Halvorsen & Co', email: 'ingrid@halvorsen.co', phone: '+1 (415) 555-0132', status: 'Customer', value: 184_000, tags: ['Enterprise', 'Renewal Q3'], location: 'Oslo, NO', lastTouch: '2h ago', fav: true, hue: 0, notes: 'Prefers quarterly business reviews. Champion for the analytics expansion.', owner: 'Amara Chen' },
  { id: 'c2', name: 'Marcus Webb', title: 'Head of Procurement', company: 'Bluepeak Logistics', email: 'm.webb@bluepeak.io', phone: '+1 (312) 555-0177', status: 'Lead', value: 96_000, tags: ['Inbound', 'Logistics'], location: 'Chicago, US', lastTouch: '1d ago', fav: false, hue: 2, notes: 'Evaluating against Freightos. Needs SSO in the pilot.', owner: 'Diego Ruiz' },
  { id: 'c3', name: 'Sofia Cantara', title: 'Chief Medical Officer', company: 'Cantara Health', email: 'scantara@cantarahealth.com', phone: '+1 (617) 555-0119', status: 'Customer', value: 240_000, tags: ['Enterprise', 'Healthcare'], location: 'Boston, US', lastTouch: '5h ago', fav: true, hue: 3, notes: 'Compliance review passed in January. Expanding to 3 new clinics.', owner: 'Amara Chen' },
  { id: 'c4', name: 'Jonas Lindqvist', title: 'Plant Director', company: 'Osprey Manufacturing', email: 'j.lindqvist@ospreymfg.com', phone: '+46 8 555 0143', status: 'At Risk', value: 128_000, tags: ['Renewal Q4', 'Manufacturing'], location: 'Malmö, SE', lastTouch: '9d ago', fav: false, hue: 1, notes: 'Unhappy with onboarding timeline. Priya scheduled an exec sync.', owner: 'Priya Nair' },
  { id: 'c5', name: 'Elena Vasquez', title: 'Managing Partner', company: 'Fieldstone Capital', email: 'evasquez@fieldstone.vc', phone: '+1 (212) 555-0161', status: 'Customer', value: 152_000, tags: ['Finance', 'Expansion'], location: 'New York, US', lastTouch: '3h ago', fav: false, hue: 6, notes: 'Wants portfolio-wide licensing. Legal reviewing MSA.', owner: 'Tom Becker' },
  { id: 'c6', name: 'Kenji Morita', title: 'CTO', company: 'Vela Robotics', email: 'kenji@velarobotics.jp', phone: '+81 3 5555 0128', status: 'Lead', value: 74_000, tags: ['R&D', 'Pilot'], location: 'Tokyo, JP', lastTouch: '2d ago', fav: false, hue: 4, notes: 'Asked for API rate-limit documentation and sandbox keys.', owner: 'Diego Ruiz' },
  { id: 'c7', name: 'Charlotte Birch', title: 'COO', company: 'Bright & Birch Retail', email: 'cbirch@brightbirch.com', phone: '+44 20 5555 0186', status: 'Partner', value: 210_000, tags: ['Reseller', 'Retail'], location: 'London, UK', lastTouch: '1w ago', fav: true, hue: 5, notes: 'Co-selling agreement renewed. Joint webinar planned for next month.', owner: 'Tom Becker' },
  { id: 'c8', name: 'Omar Haddad', title: 'Director of IT', company: 'Cantara Health', email: 'o.haddad@cantarahealth.com', phone: '+1 (617) 555-0142', status: 'Customer', value: 240_000, tags: ['Technical', 'Healthcare'], location: 'Boston, US', lastTouch: '6d ago', fav: false, hue: 2, notes: 'Owns the integration roadmap. Slack Connect channel active.', owner: 'Priya Nair' },
  { id: 'c9', name: 'Astrid Nyberg', title: 'CFO', company: 'Halvorsen & Co', email: 'astrid@halvorsen.co', phone: '+47 22 55 55 01', status: 'Customer', value: 184_000, tags: ['Economic Buyer'], location: 'Oslo, NO', lastTouch: '2w ago', fav: false, hue: 7, notes: 'Final signatory. Prefers one-pagers over slide decks.', owner: 'Amara Chen' },
  { id: 'c10', name: 'Rafael Ortiz', title: 'Fleet Manager', company: 'Bluepeak Logistics', email: 'r.ortiz@bluepeak.io', phone: '+1 (312) 555-0195', status: 'Lead', value: 96_000, tags: ['Operations'], location: 'Chicago, US', lastTouch: '4d ago', fav: false, hue: 0, notes: 'Day-to-day evaluator. Demo went well — follow up with ROI sheet.', owner: 'Diego Ruiz' },
  { id: 'c11', name: 'Maja Kowalska', title: 'Head of Digital', company: 'Bright & Birch Retail', email: 'mkowalska@brightbirch.com', phone: '+44 20 5555 0170', status: 'Partner', value: 210_000, tags: ['E-commerce'], location: 'London, UK', lastTouch: '3d ago', fav: false, hue: 3, notes: 'Leading the storefront integration. Wants staged rollout.', owner: 'Tom Becker' },
  { id: 'c12', name: 'Henrik Dahl', title: 'Supply Chain Lead', company: 'Osprey Manufacturing', email: 'h.dahl@ospreymfg.com', phone: '+46 8 555 0102', status: 'At Risk', value: 128_000, tags: ['Churn Watch'], location: 'Malmö, SE', lastTouch: '12d ago', fav: false, hue: 6, notes: 'Usage dropped 22% MoM. Triggered the save-play sequence.', owner: 'Priya Nair' },
];

export const seedDeals: Deal[] = [
  { id: 'd1', title: 'Platform license — 3yr', company: 'Bluepeak Logistics', contact: 'Marcus Webb', value: 96_000, stage: 'Proposal', prob: 55, close: 'Mar 28', owner: 'Diego Ruiz' },
  { id: 'd2', title: 'Analytics expansion pack', company: 'Halvorsen & Co', contact: 'Ingrid Halvorsen', value: 64_000, stage: 'Negotiation', prob: 75, close: 'Mar 14', owner: 'Amara Chen' },
  { id: 'd3', title: 'Clinic network rollout', company: 'Cantara Health', contact: 'Sofia Cantara', value: 240_000, stage: 'Negotiation', prob: 80, close: 'Mar 21', owner: 'Amara Chen' },
  { id: 'd4', title: 'Pilot — fleet telemetry', company: 'Vela Robotics', contact: 'Kenji Morita', value: 28_000, stage: 'Qualified', prob: 35, close: 'Apr 11', owner: 'Diego Ruiz' },
  { id: 'd5', title: 'Portfolio licensing', company: 'Fieldstone Capital', contact: 'Elena Vasquez', value: 152_000, stage: 'Proposal', prob: 50, close: 'Apr 04', owner: 'Tom Becker' },
  { id: 'd6', title: 'Renewal + seats uplift', company: 'Osprey Manufacturing', contact: 'Jonas Lindqvist', value: 128_000, stage: 'Qualified', prob: 30, close: 'Apr 30', owner: 'Priya Nair' },
  { id: 'd7', title: 'Co-sell accelerator', company: 'Bright & Birch Retail', contact: 'Charlotte Birch', value: 86_000, stage: 'New Lead', prob: 15, close: 'May 09', owner: 'Tom Becker' },
  { id: 'd8', title: 'Onboarding & training', company: 'Cantara Health', contact: 'Omar Haddad', value: 42_000, stage: 'Won', prob: 100, close: 'Feb 26', owner: 'Priya Nair' },
  { id: 'd9', title: 'Data warehouse connector', company: 'Fieldstone Capital', contact: 'Elena Vasquez', value: 38_000, stage: 'New Lead', prob: 10, close: 'May 22', owner: 'Diego Ruiz' },
  { id: 'd10', title: 'Enterprise security review', company: 'Halvorsen & Co', contact: 'Astrid Nyberg', value: 118_000, stage: 'Won', prob: 100, close: 'Feb 12', owner: 'Amara Chen' },
  { id: 'd11', title: 'Storefront integration', company: 'Bright & Birch Retail', contact: 'Maja Kowalska', value: 74_000, stage: 'Proposal', prob: 45, close: 'Apr 18', owner: 'Tom Becker' },
];

export const seedTasks: Task[] = [
  { id: 't1', title: 'Discovery call with Marcus Webb', type: 'call', due: 'Today · 10:30', priority: 'High', done: false, linked: 'Bluepeak Logistics' },
  { id: 't2', title: 'Send revised MSA to Fieldstone legal', type: 'email', due: 'Today · 13:00', priority: 'High', done: false, linked: 'Fieldstone Capital' },
  { id: 't3', title: 'QBR deck for Halvorsen & Co', type: 'admin', due: 'Today · 16:45', priority: 'Medium', done: false, linked: 'Halvorsen & Co' },
  { id: 't4', title: 'Exec sync — Osprey save play', type: 'meeting', due: 'Tomorrow · 09:00', priority: 'High', done: false, linked: 'Osprey Manufacturing' },
  { id: 't5', title: 'Product demo for Vela Robotics team', type: 'demo', due: 'Yesterday · 14:30', priority: 'Medium', done: false, linked: 'Vela Robotics' },
  { id: 't6', title: 'Follow up on Cantara security questionnaire', type: 'email', due: 'Mar 14 · 11:00', priority: 'Medium', done: false, linked: 'Cantara Health' },
  { id: 't7', title: 'Draft co-sell one-pager with Birch', type: 'admin', due: 'Mar 15 · 15:00', priority: 'Low', done: false, linked: 'Bright & Birch Retail' },
  { id: 't8', title: 'Log notes from Fieldstone discovery', type: 'admin', due: 'Today · 09:15', priority: 'Low', done: true, linked: 'Fieldstone Capital' },
  { id: 't9', title: 'Intro call — Rafael Ortiz (fleet ops)', type: 'call', due: 'Mar 11 · 10:00', priority: 'Medium', done: true, linked: 'Bluepeak Logistics' },
];

export const seedCompanies: Company[] = [
  { id: 'co1', name: 'Halvorsen & Co', industry: 'Professional Services', region: 'Norway', employees: '480', health: 88, status: 'Active', value: 302_000, contacts: 2, since: '2021' },
  { id: 'co2', name: 'Cantara Health', industry: 'Healthcare', region: 'United States', employees: '1,240', health: 92, status: 'Active', value: 282_000, contacts: 2, since: '2020' },
  { id: 'co3', name: 'Bluepeak Logistics', industry: 'Logistics', region: 'United States', employees: '2,100', health: 64, status: 'Prospect', value: 96_000, contacts: 2, since: '2024' },
  { id: 'co4', name: 'Fieldstone Capital', industry: 'Financial Services', region: 'United States', employees: '160', health: 77, status: 'Active', value: 190_000, contacts: 1, since: '2022' },
  { id: 'co5', name: 'Osprey Manufacturing', industry: 'Manufacturing', region: 'Sweden', employees: '3,400', health: 41, status: 'Active', value: 128_000, contacts: 2, since: '2019' },
  { id: 'co6', name: 'Bright & Birch Retail', industry: 'Retail', region: 'United Kingdom', employees: '890', health: 83, status: 'Active', value: 160_000, contacts: 2, since: '2021' },
  { id: 'co7', name: 'Vela Robotics', industry: 'Robotics & AI', region: 'Japan', employees: '75', health: 58, status: 'Prospect', value: 28_000, contacts: 1, since: '2025' },
];

export const seedActivities: Activity[] = [
  { id: 'a1', kind: 'deal', text: 'Amara moved “Clinic network rollout” to Negotiation — $240k at 80%.', time: '18m ago' },
  { id: 'a2', kind: 'mail', text: 'Proposal v2 sent to Marcus Webb at Bluepeak Logistics.', time: '1h ago' },
  { id: 'a3', kind: 'contact', text: 'New lead captured from webinar: Kenji Morita, Vela Robotics.', time: '3h ago' },
  { id: 'a4', kind: 'call', text: 'Diego completed intro call with Rafael Ortiz — next step: ROI sheet.', time: '5h ago' },
  { id: 'a5', kind: 'task', text: 'Priya closed “Onboarding & training” — Won, $42k.', time: 'Yesterday' },
  { id: 'a6', kind: 'note', text: 'Churn-watch note added on Osprey Manufacturing (usage −22% MoM).', time: 'Yesterday' },
  { id: 'a7', kind: 'deal', text: 'Tom created “Storefront integration” — $74k, Proposal stage.', time: '2d ago' },
  { id: 'a8', kind: 'contact', text: 'Charlotte Birch upgraded to Partner tier after co-sell renewal.', time: '3d ago' },
];

export const seedNotifs: Notif[] = [
  { id: 'n1', text: '“Clinic network rollout” advanced to Negotiation.', time: '18m ago', read: false, kind: 'deal' },
  { id: 'n2', text: 'Osprey renewal flagged At Risk — usage down 22%.', time: '2h ago', read: false, kind: 'system' },
  { id: 'n3', text: 'Diego logged a call with Bluepeak Logistics.', time: '5h ago', read: false, kind: 'contact' },
  { id: 'n4', text: 'Task due today: send revised MSA to Fieldstone.', time: '8h ago', read: true, kind: 'task' },
];

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const REVENUE = [48, 54, 61, 58, 67, 74, 71, 83, 88, 86, 94, 103]; // in $k
export const REVENUE_TARGET = 78;

export const WEEK_ACTIVITY = [42, 61, 74, 68, 83, 51, 29]; // Mon–Sun
export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
