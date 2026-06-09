import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../api/admin';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function AdminGroupDetail() {
  const { id } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    document.title = 'Group Detail — Osusu Admin';
    let cancelled = false;
    adminApi.getGroup(id)
      .then(res => { if (!cancelled) setData(res.data.data); })
      .catch((err) => { if (!cancelled) { setError(err?.response?.data?.error?.message || 'Group not found.'); if (import.meta.env.DEV) console.warn('[AdminGroupDetail] error:', err?.message); } })
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
        <p className="text-red-500 text-sm">{error || 'Group not found.'}</p>
      </AdminLayout>
    );
  }

  const { group, members, cycles, totalCollected, contributionCount } = data;
  const organiser = group.profiles;

  return (
    <AdminLayout>

      <div className="mb-6 flex items-center justify-between">
        <Link to="/admin/groups" className="text-xs text-gray-400 hover:text-green-600 transition-colors">← Back to Groups</Link>
        <Link
          to={`/groups/${group.id}`}
          className="text-xs font-medium text-green-600 hover:text-green-700 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-50 transition-colors"
        >
          View as Member →
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
              <Badge status={group.status} />
            </div>
            <p className="text-sm text-gray-400">{group.description || 'No description'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Organiser</span>
            <p className="font-medium text-gray-900">{organiser?.full_name || '—'}</p>
          </div>
          <div>
            <span className="text-gray-400">Frequency</span>
            <p className="font-medium text-gray-900"><Badge status={group.frequency} /></p>
          </div>
          <div>
            <span className="text-gray-400">Amount</span>
            <p className="font-medium text-gray-900">{formatCurrency(group.contribution_amount)}</p>
          </div>
          <div>
            <span className="text-gray-400">Start Date</span>
            <p className="font-medium text-gray-900">{formatDate(group.start_date)}</p>
          </div>
          <div>
            <span className="text-gray-400">Max Members</span>
            <p className="font-medium text-gray-900">{group.max_members}</p>
          </div>
          <div>
            <span className="text-gray-400">Invite Code</span>
            <p className="font-medium text-gray-900 font-mono">{group.invite_code || '—'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Members</p>
          <p className="text-3xl font-bold text-gray-900">{members.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Collected</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Contributions</p>
          <p className="text-3xl font-bold text-gray-900">{contributionCount}</p>
        </div>
      </div>

      {members.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Members</h2>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Payout Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{m.profiles?.full_name}</td>
                  <td className="px-4 py-3 text-gray-500">{m.profiles?.phone || '—'}</td>
                  <td className="px-4 py-3"><Badge status={m.profiles?.role} /></td>
                  <td className="px-4 py-3 text-gray-500">{m.payout_order}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(m.joined_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {cycles.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Cycles</h2>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cycle</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Recipient</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Expected</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Collected</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cycles.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">#{c.cycle_number}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(c.due_date)}</td>
                  <td className="px-4 py-3 text-gray-700">{c.profiles?.full_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{formatCurrency(c.total_expected)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatCurrency(c.total_collected || 0)}</td>
                  <td className="px-4 py-3"><Badge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
