import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../api/admin';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function AdminGroups() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [groups, setGroups]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [pagination, setPagination] = useState(null);
  const [page, setPage]             = useState(1);

  useEffect(() => { document.title = 'Groups — Osusu Admin'; }, []);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await adminApi.getGroups(params);
      setGroups(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setError('Failed to load groups.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return (
    <AdminLayout>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
          {pagination && (
            <p className="text-sm text-gray-400 mt-0.5">{pagination.total} groups</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            const value = e.target.value;
            setStatusFilter(value);
            setPage(1);
            if (value) {
              setSearchParams({ status: value });
            } else {
              setSearchParams({});
            }
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Statuses</option>
          <option value="FORMING">Forming</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadGroups} className="text-xs font-medium underline hover:no-underline">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Group Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Organiser</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Frequency</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Members</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">No groups found.</td>
                </tr>
              ) : (
                groups.map(group => (
                  <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{group.name}</td>
                    <td className="px-4 py-3 text-gray-500">{group.profiles?.full_name || '—'}</td>
                    <td className="px-4 py-3"><Badge status={group.frequency} /></td>
                    <td className="px-4 py-3 text-gray-700">{formatCurrency(group.contribution_amount)}</td>
                    <td className="px-4 py-3 text-gray-500">{group.member_count}</td>
                    <td className="px-4 py-3"><Badge status={group.status} /></td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(group.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/groups/${group.id}`} className="text-xs font-medium text-green-600 hover:text-green-700">View →</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-xs text-gray-400">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </AdminLayout>
  );
}
