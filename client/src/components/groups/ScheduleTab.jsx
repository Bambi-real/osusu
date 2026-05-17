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
    fetchSchedule();
  }, [groupId]);

  const fetchSchedule = async () => {
    try {
      const res = await api.get(`/groups/${groupId}/schedule`);
      setCycles(res.data.data);
    } catch {
      setError('Failed to load schedule.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 pt-4">
        <p className="text-xs text-gray-400 italic mb-3">🎲 Payout order was randomly assigned when the group started.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cycle</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipient</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pot Size</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Collected</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cycles.map((cycle) => {
              const isCollecting = cycle.status === 'COLLECTING';
              const isPaidOut = cycle.status === 'PAID_OUT';
              
              const isTodayCycle = new Date(cycle.due_date).toDateString() === new Date().toDateString();
              
              let rowClass = "border-b border-gray-100 transition-colors";
              if (isTodayCycle) rowClass += " bg-blue-50";
              else if (isCollecting) rowClass += " bg-amber-50";
              else if (isPaidOut) rowClass += " bg-green-50";
              else rowClass += " hover:bg-gray-50";
              
              const initials = cycle.payoutUser?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

              return (
                <tr key={cycle.id} className={rowClass}>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${isCollecting ? 'bg-amber-100 text-amber-800' : isPaidOut ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                        {cycle.cycle_number}
                      </div>
                      {isCollecting && <span className="ml-2 text-xs font-bold text-amber-600 uppercase tracking-wide">Current</span>}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {formatDateWithDay(cycle.due_date)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs mr-3">
                        {initials}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{cycle.payoutUser.full_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatCurrency(cycle.total_expected)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm">
                    <p className={`text-sm font-semibold ${cycle.total_collected === cycle.total_expected ? 'text-green-700' : 'text-gray-900'}`}>
                      {formatCurrency(cycle.total_collected)}
                    </p>
                    <p className="text-xs text-gray-400">
                      of {formatCurrency(cycle.total_expected)}
                    </p>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {cycle.status === 'COLLECTING' && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                      )}
                      <Badge status={cycle.status} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
