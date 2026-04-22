export default function Badge({ status }) {
  const colors = {
    FORMING: 'bg-gray-100 text-gray-800',
    ACTIVE: 'bg-emerald-100 text-emerald-800',
    PAID: 'bg-emerald-100 text-emerald-800',
    PAID_OUT: 'bg-emerald-100 text-emerald-800',
    COLLECTING: 'bg-amber-100 text-amber-800',
    PENDING: 'bg-gray-100 text-gray-800',
    UNPAID: 'bg-gray-100 text-gray-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    WEEKLY: 'bg-indigo-100 text-indigo-800',
    MONTHLY: 'bg-purple-100 text-purple-800'
  };

  const className = colors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {status}
    </span>
  );
}
