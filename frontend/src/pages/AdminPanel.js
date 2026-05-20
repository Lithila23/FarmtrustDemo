import React, { useState, useEffect } from 'react';
import { 
  Users, Wheat, Banknote, ShieldCheck, LayoutDashboard, Settings, RefreshCw,
  Edit, Trash2, Search, X, UserPlus
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

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    status: 'active'
  });
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    status: 'active'
  });

  const fetchSystemMetrics = async () => {
    setMetricsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || '',
        },
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.msg || `HTTP ${res.status}`);
      }

      const json = await res.json();
      setMetrics(json.data);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('[AdminPanel] fetchSystemMetrics error:', err.message);
    } finally {
      setMetricsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || '',
        },
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.msg || `HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
      } else {
        throw new Error(json.msg || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('[AdminPanel] fetchUsers error:', err.message);
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemMetrics();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleRefresh = () => {
    fetchSystemMetrics();
    if (activeTab === 'users') {
      fetchUsers();
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) {
      alert('Please fill out all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || '',
        },
        body: JSON.stringify(newUserForm)
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.msg || 'Failed to create user');
      }
      setIsAddModalOpen(false);
      setNewUserForm({ name: '', email: '', password: '', role: 'buyer', status: 'active' });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUserClick = (user) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status
    });
    setIsEditModalOpen(true);
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editUserForm.name || !editUserForm.email) {
      alert('Please fill out all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: editUserForm.name,
        email: editUserForm.email,
        role: editUserForm.role,
        status: editUserForm.status
      };
      if (editUserForm.password) {
        payload.password = editUserForm.password;
      }
      const res = await fetch(`http://localhost:5000/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || '',
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.msg || 'Failed to update user');
      }
      setIsEditModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteUserConfirm = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token || '',
        }
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.msg || 'Failed to delete user');
      }
      setIsDeleteConfirmOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
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

  const UsersView = () => {
    const filteredUsers = users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });

    return (
      <div className="space-y-6">
        {/* ── Search & Filter Controls ── */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-750 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Roles</option>
              <option value="farmer">Farmers</option>
              <option value="buyer">Buyers</option>
              <option value="admin">Admins</option>
            </select>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-750 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* ── Table Container ── */}
        <div className="card-lg dark:bg-slate-800 dark:border dark:border-slate-700 p-0 overflow-hidden shadow-md">
          {usersLoading ? (
            <div className="p-8 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Fetching registered users...</p>
            </div>
          ) : usersError ? (
            <div className="p-8 text-center">
              <p className="text-red-500 dark:text-red-400 font-semibold mb-2">Error loading users</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{usersError}</p>
              <button onClick={fetchUsers} className="btn-primary">Try Again</button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-base font-semibold mb-1">No users found</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-700/60 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-300 font-semibold">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Registered Date</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredUsers.map((u) => {
                    const initials = u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    
                    // Role badge color scheme
                    let roleBadgeColor = "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
                    if (u.role === 'farmer') {
                      roleBadgeColor = "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
                    } else if (u.role === 'buyer') {
                      roleBadgeColor = "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
                    }

                    // Status badge color scheme
                    const statusBadgeColor = u.status === 'active'
                      ? "bg-green-100 text-green-850 dark:bg-green-900/40 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs shadow-inner">
                              {initials}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${roleBadgeColor}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${statusBadgeColor}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                          {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditUserClick(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700/50 transition-all"
                              title="Edit User Details"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(u)}
                              className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-355 dark:hover:bg-red-950/30 transition-all"
                              title="Remove User Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

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

      {/* ── Modal: Add User ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden animate-slideUp">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600 animate-pulse" />
                Add New User
              </h4>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Platform Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="farmer">Farmer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Account Status</label>
                  <select
                    value={newUserForm.status}
                    onChange={(e) => setNewUserForm({ ...newUserForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-750 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit User ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden animate-slideUp">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Edit className="w-5 h-5 text-emerald-600 animate-pulse" />
                Edit User Details
              </h4>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Reset Password (Optional)</label>
                <input
                  type="password"
                  value={editUserForm.password}
                  onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Platform Role</label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="farmer">Farmer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Account Status</label>
                  <select
                    value={editUserForm.status}
                    onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-755 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Confirm Delete User ── */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm overflow-hidden animate-slideUp">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto text-xl animate-bounce">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Delete User Account?</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Are you sure you want to delete the account for <strong className="text-slate-800 dark:text-slate-200">{userToDelete?.name}</strong>? This action is permanent and cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUserConfirm}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;