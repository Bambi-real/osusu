import { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import api from '../api/axios';

import BackButton from '../components/common/BackButton';
import Breadcrumb from '../components/common/Breadcrumb';
import { formatCurrency, formatDate } from '../utils/helpers';

export default function MyContributionsPage() {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const loadData = useCallback(async () => {
    try {
      const res = await api.get('/contributions/my');
      setContributions(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'Failed to load contributions.');
      if (import.meta.env.DEV) console.warn('[MyContributions] loadData error:', err?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'My Contribution History — Osusu';

    loadData();

    const handleVisibility = () => {
      if (!document.hidden) loadData();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadData]);

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
        <div className="space-y-4 pt-8">
          <div className="w-48 h-8 bg-gray-200 rounded-lg animate-pulse" />
          {[...Array(3)].map((_, i) => (
            <div key={i}
                 className="bg-white rounded-xl border
                            border-gray-200 p-4 space-y-3">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
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
          <button onClick={loadData} className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium px-4 py-2.5 rounded-lg transition-all">
            Try Again
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="page-enter space-y-8">
        <div className="pt-6">
          <BackButton fallback="/dashboard" />
          <Breadcrumb items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'My History' }
          ]} />
          <h1 className="text-2xl font-bold text-gray-900">My Contribution History</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Total Contributed
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-green-700 whitespace-nowrap">
                {formatCurrency(totalContributed)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Across {Object.keys(grouped).length} group{Object.keys(grouped).length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-2xl flex-shrink-0 flex items-center justify-center">
              <svg aria-hidden="true" className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
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
                      <svg aria-hidden="true"
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
                    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 border-t border-gray-100">
                      <table className="w-full text-sm min-w-[400px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Cycle</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                            <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Note</th>
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
                              <td className="hidden sm:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-400">
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
