export default function LoadingState() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-3">
        <div className="h-7 w-32 bg-gray-200 rounded-full" />
        <div className="h-7 w-40 bg-gray-200 rounded-full" />
      </div>
      <div className="h-24 bg-gray-200 rounded-lg" />
      <div className="h-40 bg-gray-200 rounded-lg" />
      <div className="h-32 bg-gray-200 rounded-lg" />
    </div>
  );
}