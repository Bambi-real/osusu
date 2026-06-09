import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatCurrency, formatDateWithDay } from '../../utils/helpers';
import Badge from '../common/Badge';
import Spinner from '../common/Spinner';

export default function ScheduleTab({ groupId }) {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const res = await api.get(`/groups/${groupId}/schedule`);
        if (!cancelled) setCycles(res.data.data);
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.error?.message || 'Failed to load schedule.');
          if (import.meta.env.DEV) console.warn('[ScheduleTab] loadData error:', err?.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [groupId]);

  if (loading) return <Spinner />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 pt-4">
        <p className="text-xs text-gray-400 italic mb-3">🎲 Payout order was randomly assigned when the group started.</p>
      </div>
      <div className="relative">
        <div className="absolute right-0 top-0 bottom-0 w-8
                        bg-gradient-to-l from-white to-transparent
                        pointer-events-none z-10
                        sm:hidden" />
        <div className="overflow-x-auto -mx-4 px-4
                        sm:mx-0 sm:px-0
                        scrollbar-hide">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-3 text-xs
                               font-semibold text-gray-500
                               uppercase tracking-wide
                               whitespace-nowrap">
                  Cycle
                </th>
                <th className="text-left py-3 px-3 text-xs
                               font-semibold text-gray-500
                               uppercase tracking-wide
                               whitespace-nowrap">
                  Due Date
                </th>
                <th className="text-left py-3 px-3 text-xs
                               font-semibold text-gray-500
                               uppercase tracking-wide
                               whitespace-nowrap">
                  Recipient
                </th>
                <th className="text-right py-3 px-3 text-xs
                               font-semibold text-gray-500
                               uppercase tracking-wide
                               whitespace-nowrap">
                  Pot Size
                </th>
                <th className="text-right py-3 px-3 text-xs
                               font-semibold text-gray-500
                               uppercase tracking-wide
                               whitespace-nowrap">
                  Collected
                </th>
                <th className="text-center py-3 px-3 text-xs
                               font-semibold text-gray-500
                               uppercase tracking-wide
                               whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {cycles.map((cycle) => {
                const isCollecting = cycle.status === 'COLLECTING';
                const isPaidOut = cycle.status === 'PAID_OUT';
                const isTodayCycle = new Date(cycle.due_date).toDateString() === new Date().toDateString();

                let rowClass = "border-b border-gray-50 transition-colors";
                if (isTodayCycle) rowClass += " bg-blue-50";
                else if (isCollecting) rowClass += " bg-amber-50";
                else if (isPaidOut) rowClass += " bg-green-50";
                else rowClass += " hover:bg-gray-50";

                const recipientInitial = cycle.payoutUser?.full_name?.charAt(0)?.toUpperCase() || '?';
                const recipientName = cycle.payoutUser?.full_name || '—';

                return (
                  <tr key={cycle.id} className={rowClass}>
                    <td className="py-3 px-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center
                        justify-center text-sm font-bold
                        ${isCollecting ? 'bg-amber-100 text-amber-800' : isPaidOut ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}
                      `}>
                        {cycle.cycle_number}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-gray-700">
                      {formatDateWithDay(cycle.due_date)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-green-700">
                          {recipientInitial}
                        </div>
                        <span className="text-gray-900 font-medium truncate max-w-[100px] sm:max-w-none">
                          {recipientName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap font-medium text-gray-900">
                      {formatCurrency(cycle.total_expected)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <p className="font-semibold text-green-700 whitespace-nowrap">
                        {formatCurrency(cycle.total_collected)}
                      </p>
                      <p className="text-xs text-gray-400 whitespace-nowrap">
                        of {formatCurrency(cycle.total_expected)}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge status={cycle.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
