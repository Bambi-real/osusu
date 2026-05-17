import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../api/axios';

export default function MyContributionsPage() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMyContributions() {
      try {
        const res = await api.get('/contributions/my');
        setContributions(res.data.data || []);
      } catch (err) {
        setError('Failed to load contributions.');
      } finally {
        setLoading(false);
      }
    }
    fetchMyContributions();
    document.title = "My Contributions — OsusuApp";
  }, []);

  const totalContributed = contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">My History</h1>
        <p className="text-gray-500 mt-2">View your payment history across all groups.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Contributed</h2>
          <p className="text-4xl font-extrabold text-green-600 mt-1">D {totalContributed.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading your history...</div>
      ) : error ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>
      ) : contributions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">You haven't made any contributions yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto relative">
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden"></div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cycle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Paid</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contributions.map((c) => (
                  <tr key={c.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.group?.name || c.groups?.name || 'Unknown Group'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Cycle {c.cycle?.cycle_number || c.cycles?.cycle_number || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">D {Number(c.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {c.paid_at ? new Date(c.paid_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
