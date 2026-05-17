export function formatCurrency(amount) {
  return `D ${Number(amount).toLocaleString('en-GM', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} GMD`;
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatDateWithDay(dateString) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatRelativeDate(dateString) {
  const diff = Math.round((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff === 0)  return 'Today';
  if (diff === 1)  return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 0)   return `In ${diff} days`;
  return `${Math.abs(diff)} days ago`;
}
