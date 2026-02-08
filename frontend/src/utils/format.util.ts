const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'];

export const formatSize = (bytes: number | null): string => {
  if (!bytes) return '-';
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, index);
  return `${size.toFixed(1)} ${SIZE_UNITS[index] || 'TB'}`;
};

export function timeAgo(timestamp: number): string {
  const now: number = Date.now();

  const secondAgo = Math.floor((now - timestamp * 1000) / 1000);

  const MINUTE = 60;
  const HOUR = 60 * 60;
  const DAY = 60 * 60 * 24;
  const WEEK = 60 * 60 * 24 * 7;
  const MONTH = 60 * 60 * 24 * 30;
  const YEAR = 60 * 60 * 24 * 365;

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (secondAgo < MINUTE) {
    return rtf.format(-secondAgo, 'second');
  } else if (secondAgo < HOUR) {
    return rtf.format(-Math.floor(secondAgo / MINUTE), 'minute');
  } else if (secondAgo < DAY) {
    return rtf.format(-Math.floor(secondAgo / HOUR), 'hour');
  } else if (secondAgo < WEEK) {
    return rtf.format(-Math.floor(secondAgo / DAY), 'day');
  } else if (secondAgo < MONTH) {
    return rtf.format(-Math.floor(secondAgo / WEEK), 'week');
  } else if (secondAgo < YEAR) {
    return rtf.format(-Math.floor(secondAgo / MONTH), 'month');
  } else {
    return rtf.format(-Math.floor(secondAgo / YEAR), 'year');
  }
}
export const getPathFromURL = (prefix: string = '/tree'): string => {
  const pathname = window.location.pathname;
  const rawPath = pathname.startsWith(prefix)
    ? pathname.slice(prefix.length)
    : pathname;
  return decodeURIComponent(rawPath).replace(/(^\/+|\/+$)/g, '') || '';
};
