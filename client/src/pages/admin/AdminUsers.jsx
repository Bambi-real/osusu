import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminApi } from '../../api/admin';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/helpers';

export default function AdminUsers() {
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage]             = useState(1);

  useEffect(() => { document.title = 'Users — Osusu Admin'; }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getUsers({
        page,
        limit: 20,
        search: search.trim(),
      });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(loadUsers, 300);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  return (
    <AdminLayout>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          {pagination && (
            <p className="text-sm text-gray-400 mt-0.5">{pagination.total} registered users</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name..."
          className="w-full sm:max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadUsers} className="text-xs font-medium underline hover:no-underline">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">
                    {search ? 'No users match your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700 flex-shrink-0">
                          {user.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.phone}</td>
                    <td className="px-4 py-3"><Badge status={user.role} /></td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/users/${user.id}`} className="text-xs font-medium text-green-600 hover:text-green-700">View →</Link>
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
