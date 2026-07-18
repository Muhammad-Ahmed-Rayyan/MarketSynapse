const styles = {
  aligned: { color: "bg-green-100 text-green-800", text: "Sentiment matches price" },
  diverged: { color: "bg-amber-100 text-amber-800", text: "Sentiment diverged from price" },
  mixed: { color: "bg-gray-100 text-gray-800", text: "Mixed signal" },
};

export default function AlignmentBadge({ alignment }) {
  const style = styles[alignment] || styles.mixed;
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${style.color}`}>
      {style.text}
    </span>
  );
}