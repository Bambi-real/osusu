import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../api/admin';
import { formatCurrency } from '../../utils/helpers';

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    document.title = 'Admin Overview — Osusu';
    let cancelled = false;
    adminApi.getStats()
      .then(res => { if (!cancelled) setStats(res.data.data); })
      .catch((err) => { if (!cancelled) { setError(err?.response?.data?.error?.message || 'Failed to load stats.'); if (import.meta.env.DEV) console.warn('[AdminDashboard] error:', err?.message); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const statCards = stats ? [
    {
      label:    'Total Users',
      value:    stats.total_users,
      sub:      `${stats.total_organisers} organisers`,
      color:    'bg-blue-50 text-blue-600',
      link:     '/admin/users',
    },
    {
      label:    'Total Groups',
      value:    stats.total_groups,
      sub:      `${stats.active_groups} active · ${stats.forming_groups} forming`,
      color:    'bg-green-50 text-green-600',
      link:     '/admin/groups',
    },
    {
      label:    'Completed Groups',
      value:    stats.completed_groups,
      sub:      `${stats.cancelled_groups} cancelled`,
      color:    'bg-indigo-50 text-indigo-600',
      link:     '/admin/groups?status=COMPLETED',
    },
    {
      label:    'Total Contributions',
      value:    stats.total_contributions,
      sub:      `${stats.total_payouts_completed} payouts completed`,
      color:    'bg-amber-50 text-amber-600',
      link:     null,
    },
    {
      label:    'Total Amount Tracked',
      value:    formatCurrency(stats.total_amount_contributed),
      sub:      'Across all groups',
      color:    'bg-green-50 text-green-700',
      link:     null,
      large:    true,
    },
    {
      label:    'Total Memberships',
      value:    stats.total_memberships,
      sub:      'Group-member relationships',
      color:    'bg-purple-50 text-purple-600',
      link:     null,
    },
  ] : [];

  if (loading) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-28 animate-pulse" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Live statistics across all Osusu groups and members.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {statCards.map(({ label, value, sub, link, large }) => {
          const card = (
            <div className={`
              bg-white rounded-xl border border-gray-200 p-5
              ${link ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''}
              transition-all duration-200 h-full
            `}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
              <p className={`font-bold text-gray-900 mb-1 ${large ? 'text-xl' : 'text-3xl'}`}>{value}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          );
          return link ? (
            <Link key={label} to={link}>{card}</Link>
          ) : (
            <div key={label}>{card}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/admin/users"
              className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:shadow-md transition-all group">
          <div>
            <p className="font-semibold text-gray-900">Manage Users</p>
            <p className="text-sm text-gray-400 mt-0.5">View all registered members and organisers</p>
          </div>
          <svg className="w-5 h-5 text-gray-300 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link to="/admin/groups"
              className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between hover:shadow-md transition-all group">
          <div>
            <p className="font-semibold text-gray-900">Manage Groups</p>
            <p className="text-sm text-gray-400 mt-0.5">View all osusu groups and their status</p>
          </div>
          <svg className="w-5 h-5 text-gray-300 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

    </AdminLayout>
  );
}
