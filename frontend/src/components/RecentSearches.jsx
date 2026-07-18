export default function RecentSearches({ recent, onSelect }) {
  if (recent.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-6 flex-wrap">
      <span className="text-xs text-gray-400">Recent:</span>
      {recent.map((t) => (
        <button
          key={t}
          onClick={() => onSelect(t)}
          className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition"
        >
          {t}
        </button>
      ))}
    </div>
  );
}