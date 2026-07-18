export default function BriefCard({ brief }) {
  return (
    <div className="bg-white rounded-lg border p-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Market Brief
      </h3>
      <p className="text-gray-800 leading-relaxed">{brief}</p>
    </div>
  );
}