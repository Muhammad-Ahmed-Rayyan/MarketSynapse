const styles = {
  positive: "bg-green-100 text-green-800 border-green-300",
  negative: "bg-red-100 text-red-800 border-red-300",
  neutral: "bg-gray-100 text-gray-800 border-gray-300",
};

export default function SentimentBadge({ label, score }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${styles[label] || styles.neutral}`}>
      {label} ({score >= 0 ? "+" : ""}{score.toFixed(2)})
    </span>
  );
}