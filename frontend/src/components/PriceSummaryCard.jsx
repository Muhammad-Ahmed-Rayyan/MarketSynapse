export default function PriceSummaryCard({ price }) {
  const isUp = price.change_pct >= 0;
  return (
    <div className="bg-white rounded-lg border p-4">
      <p className="text-sm text-gray-500">{price.ticker} Current Price</p>
      <p className="text-3xl font-bold">${price.current_price}</p>
      <p className={`text-sm font-medium ${isUp ? "text-green-600" : "text-red-600"}`}>
        {isUp ? "▲" : "▼"} {Math.abs(price.change_pct)}% over {price.period_days}d
      </p>
    </div>
  );
}