import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../api/axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function MyContributionsPage() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    document.title = 'My Contribution History — OsusuApp';
    fetchMyContributions();
  }, []);

  const fetchMyContributions = async () => {
    try {
      const res = await api.get('/contributions/my');
      setContributions(res.data.data || []);
    } catch {
      setError('Failed to load contributions.');
    } finally {
      setLoading(false);
    }
  };

  const totalContributed = contributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);

  const grouped = contributions.reduce((acc, c) => {
    const groupName = c.group?.name || c.groups?.name || 'Unknown Group';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(c);
    return acc;
  }, {});

  const sortedGroupNames = Object.keys(grouped).sort();

  const toggleGroup = (name) => {
    setExpandedGroups(prev => ({ ...prev, [name]: !prev[name] }));
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <span className="text-4xl mb-4">⚠️</span>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium px-4 py-2.5 rounded-lg transition-all">
            Try Again
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="page-enter space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Contribution History</h1>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Total Contributed</p>
          <p className="text-3xl font-bold text-green-600 mt-1 whitespace-nowrap">
            {formatCurrency(totalContributed)}
          </p>
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No contributions yet</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Your contribution history will appear here once your organiser records your first payment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedGroupNames.map(groupName => {
              const contribs = grouped[groupName];
              const sortedContribs = [...contribs].sort((a, b) => new Date(b.paid_at || b.created_at) - new Date(a.paid_at || a.created_at));
              const groupTotal = contribs.reduce((s, c) => s + Number(c.amount || 0), 0);
              const isOpen = expandedGroups[groupName] !== false;

              return (
                <div key={groupName} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => toggleGroup(groupName)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{groupName}</h3>
                        <p className="text-xs text-gray-400">{contribs.length} contribution{contribs.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-700 whitespace-nowrap">{formatCurrency(groupTotal)}</span>
                  </button>

                  {isOpen && (
                    <div className="overflow-x-auto border-t border-gray-100">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Cycle</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Note</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {sortedContribs.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                Cycle {c.cycle?.cycle_number || c.cycles?.cycle_number || '-'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                {c.paid_at ? formatDate(c.paid_at) : '-'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-green-700 text-right">
                                {formatCurrency(c.amount)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
                                {c.note || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
