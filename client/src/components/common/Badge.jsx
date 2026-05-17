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
    CANCELLED: 'bg-red-100 text-red-600',
    DAILY: 'bg-purple-100 text-purple-700',
    WEEKLY: 'bg-blue-100 text-blue-700',
    MONTHLY: 'bg-green-100 text-green-700'
  };

  const statusLabels = {
    FORMING: 'Forming',
    ACTIVE: 'Active',
    PAID: 'Paid',
    PAID_OUT: 'Paid Out',
    COLLECTING: 'Collecting',
    PENDING: 'Pending',
    UNPAID: 'Unpaid',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };

  const className = colors[status] || 'bg-gray-100 text-gray-800';
  const label = statusLabels[status] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
