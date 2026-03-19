import { useBudget } from '../contexts/BudgetContext';

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function CategoryCard({ category }) {
  const { thisMonthByCategory, limits, ytdNetByCategory } = useBudget();

  const spent  = thisMonthByCategory[category.id] || 0;
  const limit  = limits[category.id] || category.defaultLimit;
  const pct    = limit > 0 ? (spent / limit) * 100 : 0;
  const ytdNet = ytdNetByCategory[category.id] ?? 0;

  // Progress bar color
  const barColor =
    pct >= 100 ? 'bg-ios-red' :
    pct >= 80  ? 'bg-ios-yellow' :
    'bg-ios-green';

  // Alert: within 20% of limit (80–99%)
  const showAlert = pct >= 80 && pct < 100;
  const showOver  = pct >= 100;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* Row 1: name + badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <span className="font-semibold text-gray-900 text-base">{category.label}</span>
        </div>
        {showOver && (
          <span className="text-xs font-semibold text-white bg-ios-red px-2 py-0.5 rounded-full">
            Over
          </span>
        )}
        {showAlert && (
          <span className="text-xs font-semibold text-white bg-ios-yellow px-2 py-0.5 rounded-full">
            ⚠ Near limit
          </span>
        )}
      </div>

      {/* Row 2: amount */}
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-gray-900 font-medium text-sm">
          {fmt(spent)} <span className="text-ios-gray font-normal">of {fmt(limit)}</span>
        </span>
        <span className="text-xs text-ios-gray">{Math.round(pct)}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      {/* YTD net */}
      <div className={`text-xs font-medium ${ytdNet >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
        {ytdNet >= 0
          ? `+${fmt(ytdNet)} ahead this year`
          : `-${fmt(Math.abs(ytdNet))} over this year`}
      </div>
    </div>
  );
}
