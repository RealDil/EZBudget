import { useState, useRef } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import CategoryDetailSheet from './CategoryDetailSheet';

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function CategoryCard({ category }) {
  const { thisMonthByCategory, limits, ytdNetByCategory } = useBudget();
  const [showDetail, setShowDetail] = useState(false);
  const pressTimer = useRef(null);
  const didLongPress = useRef(false);

  const spent  = thisMonthByCategory[category.id] || 0;
  const limit  = limits[category.id] || category.defaultLimit;
  const pct    = limit > 0 ? (spent / limit) * 100 : 0;
  const ytdNet = ytdNetByCategory[category.id] ?? 0;

  const barColor =
    pct >= 100 ? 'bg-ios-red' :
    pct >= 80  ? 'bg-ios-yellow' :
    'bg-ios-green';

  const showAlert = pct >= 80 && pct < 100;
  const showOver  = pct >= 100;

  function startPress() {
    didLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setShowDetail(true);
    }, 500);
  }

  function cancelPress() {
    clearTimeout(pressTimer.current);
  }

  function handleClick() {
    if (didLongPress.current) return; // long press already handled
    // Short tap — do nothing (or could open detail too)
  }

  return (
    <>
      <div
        className="bg-white rounded-2xl p-4 shadow-sm select-none cursor-pointer active:opacity-80 transition-opacity"
        onPointerDown={startPress}
        onPointerUp={cancelPress}
        onPointerLeave={cancelPress}
        onClick={handleClick}
      >
        {/* Row 1: name + badge */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />
            <span className="font-semibold text-gray-900 text-base">{category.label}</span>
          </div>
          <div className="flex items-center gap-2">
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
            <span className="text-ios-gray">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 opacity-30">
                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
              </svg>
            </span>
          </div>
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

      {showDetail && (
        <CategoryDetailSheet
          category={category}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
