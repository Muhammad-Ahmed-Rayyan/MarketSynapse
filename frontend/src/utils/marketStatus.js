// US market hours (NYSE/NASDAQ): 9:30–16:00 ET, Mon–Fri.
// Approximated using UTC offset; doesn't account for DST switch day itself,
// which is an acceptable simplification for a status indicator.
export function isMarketOpen() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();
  const day = now.getUTCDay(); // 0 = Sunday

  if (day === 0 || day === 6) return false;

  // ET is UTC-4 (EDT, most of the year) — 9:30 ET = 13:30 UTC, 16:00 ET = 20:00 UTC
  const minutesUTC = utcHour * 60 + utcMinute;
  return minutesUTC >= 13 * 60 + 30 && minutesUTC < 20 * 60;
}

export function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}