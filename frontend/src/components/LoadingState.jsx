export default function LoadingState() {
  const shimmer = { background: "var(--bg-surface)", border: "1px solid var(--border-hairline)" };
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid md:grid-cols-2 gap-5">
        <div className="h-40 rounded-lg" style={shimmer} />
        <div className="h-40 rounded-lg" style={shimmer} />
      </div>
      <div className="h-24 rounded-lg" style={shimmer} />
      <div className="h-56 rounded-lg" style={shimmer} />
    </div>
  );
}