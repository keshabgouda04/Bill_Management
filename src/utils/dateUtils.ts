/**
 * Global Date & Time Formatting Utilities
 */

/**
 * Formats a date string or timestamp into a relative time-ago string
 * (e.g. "Just now", "5m ago", "2h ago", "Yesterday", "18 Aug").
 */
export function formatTimeAgo(dateString?: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

/**
 * Formats a date string into standard display format (e.g. "18 Aug 2026").
 */
export function formatDate(date?: string | null): string {
  if (!date) return '-';

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '-';

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
