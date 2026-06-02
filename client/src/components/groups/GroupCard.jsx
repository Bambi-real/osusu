import { memo } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { formatCurrency } from '../../utils/helpers';

const frequencyLabel = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
};

const topBorderColor = {
  FORMING: 'border-t-4 border-t-gray-300',
  ACTIVE: 'border-t-4 border-t-green-500',
  COMPLETED: 'border-t-4 border-t-blue-500',
  CANCELLED: 'border-t-4 border-t-red-300',
};

function GroupCard({ group, isOrganiser, className = '' }) {
  const borderClass = topBorderColor[group.status] || topBorderColor.FORMING;

  const isCancelled = group.status === 'CANCELLED';

  const cardClassName = `group relative block bg-white ${borderClass} overflow-hidden shadow-sm rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 min-w-0 ${isCancelled ? 'opacity-60 border-t-gray-300' : ''} ${className}`;

  return (
    <Link
      to={`/groups/${group.id}`}
      className={cardClassName}
    >
      {isCancelled && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]"
               style={{
                 backgroundImage: `repeating-linear-gradient(-45deg, #000 0px, #000 1px, transparent 1px, transparent 8px)`
               }}
          />
        </div>
      )}
      <div className="p-4 sm:p-5 flex flex-col h-full justify-between gap-3">
        <div className="flex items-start justify-between gap-2">
          <Badge status={group.status} />
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${group.frequency === 'DAILY' ? 'bg-purple-100 text-purple-700' : group.frequency === 'WEEKLY' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
            {frequencyLabel[group.frequency] || group.frequency}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
            {group.name}
          </h3>
          {isOrganiser && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Organiser
            </span>
          )}
        </div>

        <p className={`text-sm mb-4 leading-relaxed line-clamp-2 ${group.description ? 'text-gray-500' : 'text-gray-300 italic'}`}>
          {group.description || 'No description provided'}
        </p>

        <hr className="border-t border-gray-100" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-green-700 whitespace-nowrap">
              {formatCurrency(group.contribution_amount)}
            </p>
            <p className="text-xs text-gray-400">per {frequencyLabel[group.frequency]?.toLowerCase()} cycle</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">
              #{group.payout_order}
            </p>
            <p className="text-xs text-gray-400">
              payout draw
            </p>
          </div>
        </div>
        {group.status === 'COMPLETED' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <span>🎉</span>
              All cycles completed
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

export default memo(GroupCard);
