const dotColor = { positive: "bg-green-500", negative: "bg-red-500", neutral: "bg-gray-400" };

export default function ArticleList({ articles }) {
  return (
    <div className="bg-white rounded-lg border p-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Recent Headlines ({articles.length})
      </h3>
      <ul className="space-y-3">
        {articles.map((a, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${dotColor[a.sentiment_label] || dotColor.neutral}`} />
            <a href={a.url} target="_blank" rel="noreferrer" className="text-sm text-gray-700 hover:text-blue-600 hover:underline">
              {a.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}