import React, { useState, useEffect } from 'react';
import { 
  Users, Wheat, Banknote, ShieldCheck, LayoutDashboard, Settings, RefreshCw 
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Default (loading) state — null values trigger the skeleton loader in the UI.
// Shape mirrors the API response: GET /api/admin/metrics → { data: { ... } }
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_METRICS = {
  totalUsers:     null,
  activeCrops:    null,
  transactions:   null,
  platformHealth: null,
};

// Ordered card definitions — icon/label/color are static; values come from state.
const METRIC_CARDS = [
  { key: 'totalUsers',     label: 'Total Users',     icon: <Users className="w-6 h-6" />, color: 'bg-blue-100   text-blue-600'   },
  { key: 'activeCrops',    label: 'Active Crops',    icon: <Wheat className="w-6 h-6" />, color: 'bg-green-100  text-green-600'  },
  { key: 'transactions',   label: 'Transactions',    icon: <Banknote className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600' },
  { key: 'platformHealth', label: 'Platform Health', icon: <ShieldCheck className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600' },
];

const RECENT_ACTIVITY = [
  { id: 1,    event: 'New Farmer Registered',         actor: 'Ravi Kumar',         time: '2 min ago',  status: 'success' },
  { id: 2,    event: "Crop 'Tomato' Listed",           actor: 'Priya Sharma',       time: '14 min ago', status: 'info'    },
  { id: 3,    event: 'Transaction #1024 Completed',   actor: 'System',             time: '31 min ago', status: 'success' },
  { id: 4,    event: 'New Buyer Account Activated',   actor: 'Arjun Mehta',        time: '1 hr ago',   status: 'info'    },
  { id: 5,    event: 'Failed Login Attempt Blocked',  actor: 'unknown@test.com',   time: '2 hr ago',   status: 'warning' },
];

const STATUS_STYLES = {
  success: 'bg-green-100  text-green-700  dark:bg-green-900/40  dark:text-green-300',
  info:    'bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
};

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar nav items
// ─────────────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',  icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'users',     label: 'Users',      icon: <Users className="w-5 h-5" /> },
  { id: 'crops',     label: 'Crops',      icon: <Wheat className="w-5 h-5" /> },
  { id: 'settings',  label: 'Settings',   icon: <Settings className="w-5 h-5" /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// AdminPanel Component
// ─────────────────────────────────────────────────────────────────────────────
const AdminPanel = () => {
  const [activeTab,    setActiveTab]    = useState('dashboard');
  const [metrics,      setMetrics]      = useState(DEFAULT_METRICS);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed]  = useState(null);

  // ── Data fetching — secured with the JWT token stored on login ───────────
  const fetchSystemMetrics = async () => {
    setMetricsLoading(true);
    try {
      // Token was written to localStorage by Login.js after a successful sign-in.
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:5000/api/admin/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // The backend auth middleware reads from 'x-auth-token'
          'x-auth-token': token || '',
        },
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.msg || `HTTP ${res.status}`);
      }

      const json = await res.json();
      // API returns: { success: true, data: { totalUsers, activeCrops, transactions, platformHealth } }
      setMetrics(json.data);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('[AdminPanel] fetchSystemMetrics error:', err.message);
      // Keep whatever metrics were previously loaded; don't blank the UI.
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemMetrics();
  }, []);

  const handleRefresh = () => {
    fetchSystemMetrics();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Sub-views
  // ─────────────────────────────────────────────────────────────────────────
  const DashboardView = () => (
    <div>
      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {METRIC_CARDS.map(card => (
          <div key={card.key} className="glass-card dark:bg-slate-800 dark:border dark:border-slate-700/50 hover:-translate-y-0.5 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{card.label}</p>
                {metricsLoading || metrics[card.key] === null ? (
                  <div className="h-7 w-20 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{metrics[card.key]}</p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${card.color}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Overview card */}
      <div className="card-lg dark:bg-slate-800 dark:border dark:border-slate-700 mb-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">System Overview</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Platform Performance</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm">All systems operational. No active alerts.</p>
            </div>
            <span className="badge badge-success ml-4">Good</span>
          </div>
          <div className="divider dark:border-slate-700"></div>
          <div className="flex items-start">
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Database Status</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm">MySQL connection stable. 45 GB used.</p>
            </div>
            <span className="badge badge-success ml-4">Connected</span>
          </div>
        </div>
      </div>

      {/* ── Recent Platform Activity ────────────────────────────────────── */}
      <div className="card-lg dark:bg-slate-800 dark:border dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Recent Platform Activity</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Last 24 hours</span>
        </div>

        {/* Table wrapper */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/60 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 w-8">#</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Event</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Actor</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Time</th>
                <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {RECENT_ACTIVITY.map((item, idx) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors duration-150"
                >
                  <td className="px-4 py-3 text-slate-400 dark:text-slate-500 font-mono">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{item.event}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.actor}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{item.time}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge text-xs capitalize ${STATUS_STYLES[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const UsersView = () => (
    <div className="card-lg dark:bg-slate-800 dark:border dark:border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">User Management</h3>
        <button className="btn-primary">Add User</button>
      </div>
      <p className="text-slate-600 dark:text-slate-400">
        View and manage all registered users and their permissions.
      </p>
    </div>
  );

  const CropsView = () => (
    <div className="card-lg dark:bg-slate-800 dark:border dark:border-slate-700">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Crop Listings Management</h3>
      <p className="text-slate-600 dark:text-slate-400">Review and manage all crop listings on the platform.</p>
    </div>
  );

  const SettingsView = () => (
    <div className="card-lg dark:bg-slate-800 dark:border dark:border-slate-700">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">System Settings</h3>
      <div className="space-y-6">
        <div>
          <label className="form-label dark:text-slate-300">Platform Name</label>
          <input type="text" defaultValue="FarmTrust" className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
        </div>
        <div>
          <label className="form-label dark:text-slate-300">Commission Rate (%)</label>
          <input type="number" defaultValue="5" className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
        </div>
        <button className="btn-primary">Save Settings</button>
      </div>
    </div>
  );

  const VIEW_MAP = {
    dashboard: <DashboardView />,
    users:     <UsersView />,
    crops:     <CropsView />,
    settings:  <SettingsView />,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex">

      {/* ── Left Sidebar ───────────────────────────────────────────────── */}
      <aside className="w-64 min-h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-sm flex-shrink-0">
        {/* Sidebar brand strip */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Admin Console
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                  transition-all duration-200 text-left overflow-hidden
                  ${isActive
                    ? 'bg-primary-50/50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-600 dark:bg-primary-400 rounded-r-md" />
                )}
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            FarmTrust v1.0<br />
            {lastRefreshed && <span>Updated {lastRefreshed}</span>}
          </p>
        </div>
      </aside>

      {/* ── Main Content Area ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-primary-900 dark:text-primary-400 leading-tight">
              Admin Control Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
              {activeTab === 'dashboard' ? 'System overview & recent activity' : `${activeTab} management`}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={metricsLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${metricsLoading ? 'animate-spin' : ''}`} />
            {metricsLoading ? 'Refreshing…' : 'Refresh Data'}
          </button>
        </div>

        <div className="flex-1 px-8 py-8">
          {/* ── Active view — stat cards live inside DashboardView only ──── */}
          {VIEW_MAP[activeTab]}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;