import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeClasses = (s) => {
    switch (s?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'PENDING':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${getBadgeClasses(
        status
      )}`}
    >
      {status || 'PENDING'}
    </span>
  );
};

export default StatusBadge;
