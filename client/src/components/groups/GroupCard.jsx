import { Link } from 'react-router-dom';
import Badge from '../common/Badge';
import { formatCurrency } from '../../utils/helpers';

export default function GroupCard({ group }) {
  // Determine top border color based on status
  let borderClass = 'border-t-4 border-gray-400';
  if (group.status === 'active') borderClass = 'border-t-4 border-green-500';
  else if (group.status === 'completed') borderClass = 'border-t-4 border-blue-500';

  return (
    <Link 
      to={`/groups/${group.id}`}
      className={`group block bg-white ${borderClass} overflow-hidden shadow-md rounded-[24px] hover:shadow-xl transition-all duration-300`}
    >
      <div className="px-6 py-7 flex flex-col h-full justify-between gap-4">
        {/* Top: name + status right-aligned */}
        <div className="flex justify-between items-center gap-3">
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight line-clamp-1">
            {group.name}
          </h3>
          <Badge status={group.status} className="shrink-0" />
        </div>
        
        {/* Middle: description */}
        <p className="text-sm text-gray-500 line-clamp-2">
          {group.description || 'No description provided.'}
        </p>
        
        {/* Divider */}
        <hr className="border-t border-slate-100/80" />
        
        {/* Bottom row: amount + frequency left, Position/Members right */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-indigo-600">
              {formatCurrency(group.contribution_amount)}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {group.frequency}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-bold text-slate-700">
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400 font-normal">Position</span>
              <span>{group.payout_order}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400 font-normal">Members</span>
              <span>{group.max_members}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
