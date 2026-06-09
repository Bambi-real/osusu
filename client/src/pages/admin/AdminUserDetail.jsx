import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../api/admin';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    document.title = 'User Detail — Osusu Admin';
    let cancelled = false;
    adminApi.getUser(id)
      .then(res => { if (!cancelled) setData(res.data.data); })
      .catch(() => { if (!cancelled) setError('User not found.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-48" />
          <div className="h-32 bg-gray-100 rounded-xl" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout>
        <p className="text-red-500 text-sm">{error || 'User not found.'}</p>
      </AdminLayout>
    );
  }

  const { profile, memberships, totalContributed, contributionCount } = data;

  return (
    <AdminLayout>

      <div className="mb-6">
        <Link to="/admin/users" className="text-xs text-gray-400 hover:text-green-600 transition-colors">← Back to Users</Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-lg font-bold text-green-700">
            {profile.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{profile.full_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge status={profile.role} />
              <span className="text-xs text-gray-400">Joined {formatDate(profile.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Phone</span>
            <p className="font-medium text-gray-900">{profile.phone || '—'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Groups</p>
          <p className="text-3xl font-bold text-gray-900">{memberships.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Contributed</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalContributed)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Contributions Made</p>
          <p className="text-3xl font-bold text-gray-900">{contributionCount}</p>
        </div>
      </div>

      {memberships.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Group Memberships</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Group</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Frequency</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Payout Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {memberships.map((m, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{m.groups?.name}</td>
                  <td className="px-4 py-3"><Badge status={m.groups?.status} /></td>
                  <td className="px-4 py-3"><Badge status={m.groups?.frequency} /></td>
                  <td className="px-4 py-3 text-gray-700">{formatCurrency(m.groups?.contribution_amount)}</td>
                  <td className="px-4 py-3 text-gray-500">{m.payout_order ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(m.joined_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </AdminLayout>
  );
}
