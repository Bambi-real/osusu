const config = {
  // Group statuses
  FORMING:    { bg: 'bg-gray-100',   text: 'text-gray-600',  label: 'Forming'    },
  ACTIVE:     { bg: 'bg-green-100',  text: 'text-green-700', label: 'Active'     },
  COMPLETED:  { bg: 'bg-blue-100',   text: 'text-blue-700',  label: 'Completed'  },
  CANCELLED:  { bg: 'bg-red-100',    text: 'text-red-600',   label: 'Cancelled'  },

  // Cycle statuses
  PENDING:    { bg: 'bg-gray-100',   text: 'text-gray-500',  label: 'Pending'    },
  COLLECTING: { bg: 'bg-amber-100',  text: 'text-amber-700', label: 'Collecting' },
  PAID_OUT:   { bg: 'bg-green-100',  text: 'text-green-700', label: 'Paid Out'   },

  // Contribution statuses
  PAID:       { bg: 'bg-green-100',  text: 'text-green-700', label: 'Paid'       },
  UNPAID:     { bg: 'bg-gray-100',   text: 'text-gray-500',  label: 'Unpaid'     },

  // Frequency
  DAILY:      { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Daily'     },
  WEEKLY:     { bg: 'bg-blue-100',   text: 'text-blue-700',  label: 'Weekly'     },
  MONTHLY:    { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Monthly'   },

  // Role
  SUPER_ADMIN: { bg: 'bg-red-100',   text: 'text-red-700',   label: 'Super Admin'},
  ORGANISER:  { bg: 'bg-green-50',   text: 'text-green-700', label: 'Organiser'  },
  MEMBER:     { bg: 'bg-gray-100',   text: 'text-gray-500',  label: 'Member'     },
};

export default function Badge({ status, className = '' }) {
  const { bg, text, label } = config[status] ||
    { bg: 'bg-gray-100', text: 'text-gray-500', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${bg} ${text} ${className}`}>
      {label}
    </span>
  );
}
