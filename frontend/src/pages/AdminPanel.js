import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = [
    { label: 'Total Users', value: '1,234', icon: '👥', color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Crops', value: '456', icon: '🌾', color: 'bg-green-100 text-green-600' },
    { label: 'Transactions', value: '$12,890', icon: '💰', color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Platform Health', value: '99.9%', icon: '✨', color: 'bg-purple-100 text-purple-600' },
  ];

  // Reusable action buttons for crop rows (standard SVG icons)
  const ActionButtons = () => (
    <div className="flex items-center gap-2">
      <button
        title="Approve"
        className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 bg-white text-green-600 shadow-sm hover:bg-slate-50 transition-colors duration-150 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-green-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </button>
      <button
        title="Edit"
        className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 transition-colors duration-150 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M4 20l4-1 9-9-3.536-3.536-9 9L4 20z" />
        </svg>
      </button>
      <button
        title="View"
        className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 transition-colors duration-150 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </button>
      <button
        title="Delete"
        className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 bg-white text-red-500 shadow-sm hover:bg-slate-50 transition-colors duration-150 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-red-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold text-primary-900 dark:text-primary-400">Admin Control Center</h1>
          <button className="btn-secondary">Refresh</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-card dark:bg-slate-800 dark:border dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted dark:text-slate-400 text-sm mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-3 px-6 font-semibold transition-all duration-200 border-b-2 ${
                activeTab === 'dashboard'
                  ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-3 px-6 font-semibold transition-all duration-200 border-b-2 ${
                activeTab === 'users'
                  ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              👥 Users
            </button>
            <button
              onClick={() => setActiveTab('crops')}
              className={`py-3 px-6 font-semibold transition-all duration-200 border-b-2 ${
                activeTab === 'crops'
                  ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              🌾 Crops
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-6 font-semibold transition-all duration-200 border-b-2 ${
                activeTab === 'settings'
                  ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>

        <div className="card-lg dark:bg-slate-800 dark:border dark:border-slate-700">
          {activeTab === 'dashboard' && (
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">System Overview</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Platform Performance</p>
                    <p className="text-slate-600 dark:text-slate-400">All systems operational. No active alerts.</p>
                  </div>
                  <span className="badge badge-success">Good</span>
                </div>
                <div className="divider"></div>
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Database Status</p>
                    <p className="text-slate-600 dark:text-slate-400">MongoDB connection stable. 45GB used.</p>
                  </div>
                  <span className="badge badge-success">Connected</span>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">User Management</h3>
                <Link to="/login" className="btn-primary">Add User</Link>
              </div>
              <p className="text-slate-600 dark:text-slate-400">View and manage all registered users and their permissions.</p>
            </div>
          )}
          {activeTab === 'crops' && (
            <div>
              <div className="mb-6">
                <input 
                  type="text" 
                  placeholder="Search by crop, farmer, location..." 
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
              
              <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center">
                <select className="w-full md:w-auto px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Inactive</option>
                </select>
                <select className="w-full md:w-auto px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white">
                  <option>All Categories</option>
                  <option>Vegetables</option>
                  <option>Grains</option>
                  <option>Fruits</option>
                </select>
                <button className="btn-primary w-full md:w-auto">+ Add Listing</button>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Crop Listings Management</h3>
              
              
              
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg scrollbar scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-800">
                <table className="w-full text-sm text-slate-600 dark:text-slate-400 min-w-max">
                  <thead className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left">Crop</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Price ↓</th>
                      <th className="px-4 py-3 text-left">Qty (kg) ↓</th>
                      <th className="px-4 py-3 text-left">Farmer</th>
                      <th className="px-4 py-3 text-left">Location</th>
                      <th className="px-4 py-3 text-left">Listed</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="text-2xl">🌾</span><div><p className="font-semibold text-slate-900 dark:text-slate-100">Basmati Rice</p><p className="text-xs text-slate-500 dark:text-slate-400">CRP-001</p></div><span className="badge badge-sm bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">Organic</span></div></td>
                      <td className="px-4 py-3">Grain</td>
                      <td className="px-4 py-3"><span className="badge badge-success">Active</span></td>
                      <td className="px-4 py-3">$2.40 /kg</td>
                      <td className="px-4 py-3">5,200</td>
                      <td className="px-4 py-3"><span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded font-semibold text-xs">RP</span> R. Perera</td>
                      <td className="px-4 py-3">🗺️ Polonnaruwa</td>
                      <td className="px-4 py-3">May 12</td>
                      <td className="px-4 py-3"><ActionButtons /></td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="text-2xl">🧅</span><div><p className="font-semibold text-slate-900 dark:text-slate-100">Red Onion</p><p className="text-xs text-slate-500 dark:text-slate-400">CRP-002</p></div></div></td>
                      <td className="px-4 py-3">Vegetable</td>
                      <td className="px-4 py-3"><span className="badge badge-success">Active</span></td>
                      <td className="px-4 py-3">$1.10 /kg</td>
                      <td className="px-4 py-3">3,100</td>
                      <td className="px-4 py-3"><span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 px-2 py-1 rounded font-semibold text-xs">AS</span> A. Silva</td>
                      <td className="px-4 py-3">🗺️ Dambulla</td>
                      <td className="px-4 py-3">May 14</td>
                      <td className="px-4 py-3"><ActionButtons /></td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="text-2xl">🌶️</span><div><p className="font-semibold text-slate-900 dark:text-slate-100">Cinnamon</p><p className="text-xs text-slate-500 dark:text-slate-400">CRP-003</p></div><span className="badge badge-sm bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">Organic</span></div></td>
                      <td className="px-4 py-3">Spice</td>
                      <td className="px-4 py-3"><span className="badge badge-warning">Pending</span></td>
                      <td className="px-4 py-3">$18.50 /kg</td>
                      <td className="px-4 py-3">420</td>
                      <td className="px-4 py-3"><span className="bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-200 px-2 py-1 rounded font-semibold text-xs">NF</span> N. Fernando</td>
                      <td className="px-4 py-3">🗺️ Matale</td>
                      <td className="px-4 py-3">May 15</td>
                      <td className="px-4 py-3"><ActionButtons /></td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="text-2xl">🍍</span><div><p className="font-semibold text-slate-900 dark:text-slate-100">Pineapple</p><p className="text-xs text-slate-500 dark:text-slate-400">CRP-004</p></div></div></td>
                      <td className="px-4 py-3">Fruit</td>
                      <td className="px-4 py-3"><span className="badge badge-success">Active</span></td>
                      <td className="px-4 py-3">$0.85 /kg</td>
                      <td className="px-4 py-3">8,700</td>
                      <td className="px-4 py-3"><span className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 px-2 py-1 rounded font-semibold text-xs">SW</span> S. Wickrama</td>
                      <td className="px-4 py-3">🗺️ Kurunegala</td>
                      <td className="px-4 py-3">May 10</td>
                      <td className="px-4 py-3"><ActionButtons /></td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="text-2xl">🫑</span><div><p className="font-semibold text-slate-900 dark:text-slate-100">Black Pepper</p><p className="text-xs text-slate-500 dark:text-slate-400">CRP-005</p></div></div></td>
                      <td className="px-4 py-3">Spice</td>
                      <td className="px-4 py-3"><span className="badge bg-slate-400 text-slate-100">Inactive</span></td>
                      <td className="px-4 py-3">$9.20 /kg</td>
                      <td className="px-4 py-3">210</td>
                      <td className="px-4 py-3"><span className="bg-slate-500 dark:bg-slate-400 text-slate-100 dark:text-slate-900 px-2 py-1 rounded font-semibold text-xs">KJ</span> K. Jayawarde</td>
                      <td className="px-4 py-3">🗺️ Kandy</td>
                      <td className="px-4 py-3">Apr 28</td>
                      <td className="px-4 py-3"><ActionButtons /></td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="text-2xl">🥭</span><div><p className="font-semibold text-slate-900 dark:text-slate-100">Mango</p><p className="text-xs text-slate-500 dark:text-slate-400">CRP-006</p></div><span className="badge badge-sm bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">Organic</span></div></td>
                      <td className="px-4 py-3">Fruit</td>
                      <td className="px-4 py-3"><span className="badge badge-success">Active</span></td>
                      <td className="px-4 py-3">$1.65 /kg</td>
                      <td className="px-4 py-3">6,400</td>
                      <td className="px-4 py-3"><span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 px-2 py-1 rounded font-semibold text-xs">DB</span> D. Bandara</td>
                      <td className="px-4 py-3">🗺️ Gampola</td>
                      <td className="px-4 py-3">May 13</td>
                      <td className="px-4 py-3"><ActionButtons /></td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="text-2xl">🌽</span><div><p className="font-semibold text-slate-900 dark:text-slate-100">Maize</p><p className="text-xs text-slate-500 dark:text-slate-400">CRP-007</p></div></div></td>
                      <td className="px-4 py-3">Grain</td>
                      <td className="px-4 py-3"><span className="badge badge-warning">Pending</span></td>
                      <td className="px-4 py-3">$0.55 /kg</td>
                      <td className="px-4 py-3">12,000</td>
                      <td className="px-4 py-3"><span className="bg-slate-600 dark:bg-slate-500 text-white px-2 py-1 rounded font-semibold text-xs">LR</span> L. Rathnayak</td>
                      <td className="px-4 py-3">🗺️ Anuradhapura</td>
                      <td className="px-4 py-3">May 16</td>
                      <td className="px-4 py-3"><ActionButtons /></td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="text-2xl">🥬</span><div><p className="font-semibold text-slate-900 dark:text-slate-100">Bitter Gourd</p><p className="text-xs text-slate-500 dark:text-slate-400">CRP-008</p></div><span className="badge badge-sm bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">Organic</span></div></td>
                      <td className="px-4 py-3">Vegetable</td>
                      <td className="px-4 py-3"><span className="badge badge-success">Active</span></td>
                      <td className="px-4 py-3">$0.90 /kg</td>
                      <td className="px-4 py-3">1,800</td>
                      <td className="px-4 py-3"><span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-2 py-1 rounded font-semibold text-xs">MK</span> M. Kumara</td>
                      <td className="px-4 py-3">🗺️ Colombo</td>
                      <td className="px-4 py-3">May 11</td>
                      <td className="px-4 py-3"><ActionButtons /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">System Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="form-label dark:text-slate-300">Platform Name</label>
                  <input type="text" defaultValue="FarmTrust" className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
                <div>
                  <label className="form-label dark:text-slate-300">Commission Rate (%)</label>
                  <input type="number" defaultValue="5" className="input-field dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
                <button className="btn-primary w-full md:w-auto">Save Settings</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;