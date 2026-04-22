import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatCurrency, formatDate } from '../../utils/helpers';
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
    } catch (err) {
      setError('Failed to load schedule.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
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
              
              let rowClass = "hover:bg-gray-50 transition-colors";
              if (isCollecting) rowClass += " bg-amber-50/40";
              if (isPaidOut) rowClass += " bg-emerald-50/40";
              
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
                    {formatDate(cycle.due_date)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3">
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
                    <span className={cycle.total_collected === cycle.total_expected ? "text-emerald-600 font-bold" : "text-gray-600 font-medium"}>
                      {formatCurrency(cycle.total_collected)}
                    </span>
                    <span className="text-gray-400 text-xs ml-1">/ {formatCurrency(cycle.total_expected)}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <Badge status={cycle.status} />
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
