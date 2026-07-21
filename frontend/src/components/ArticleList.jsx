const dotColor = {
  positive: "var(--signal-positive)",
  negative: "var(--signal-negative)",
  neutral: "var(--text-tertiary)",
};

export default function ArticleList({ articles }) {
  return (
    <div
      className="rounded-lg p-5 md:p-6"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)" }}
    >
      <p
        className="font-mono text-xs tracking-widest uppercase mb-4"
        style={{ color: "var(--text-tertiary)" }}
      >
        Headlines · {articles.length}
      </p>
      <ul>
        {articles.map((a, i) => (
          <li
            key={i}
            className="flex items-start gap-3 py-2.5"
            style={{
              borderTop: i === 0 ? "none" : "1px solid var(--border-hairline)",
            }}
          >
            <span
              className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: dotColor[a.sentiment_label] || dotColor.neutral }}
            />
            <a  href={a.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm leading-snug transition"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-secondary)")}
            >
              {a.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}