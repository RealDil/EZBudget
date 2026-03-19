import { CATEGORIES } from '../constants';

const PAD = { top: 12, right: 8, bottom: 32, left: 40 };

function fmt(n) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}

// Simple SVG bar chart — no external library needed
export function CategoryBarChart({ data, limits }) {
  // data: { [catId]: amount }
  const items = CATEGORIES.map((cat) => ({
    ...cat,
    spent: data[cat.id] || 0,
    limit: limits[cat.id] || cat.defaultLimit,
  }));

  const maxVal = Math.max(...items.map((i) => Math.max(i.spent, i.limit)), 1);
  const W = 320;
  const H = 180;
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const barW   = Math.floor(chartW / items.length) - 10;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Y-axis labels */}
      {[0, 0.5, 1].map((frac) => {
        const y = PAD.top + chartH * (1 - frac);
        return (
          <g key={frac}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
              stroke="#E5E7EB" strokeWidth="1" />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end"
              fontSize="9" fill="#8E8E93">
              {fmt(maxVal * frac)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {items.map((item, i) => {
        const x = PAD.left + i * (chartW / items.length) + 5;
        const spentH = (item.spent / maxVal) * chartH;
        const limitH = (item.limit / maxVal) * chartH;
        const pct    = item.limit > 0 ? item.spent / item.limit : 0;
        const color  = pct >= 1 ? '#FF3B30' : pct >= 0.8 ? '#FFCC00' : item.color;

        return (
          <g key={item.id}>
            {/* Budget outline bar */}
            <rect
              x={x} y={PAD.top + chartH - limitH}
              width={barW} height={limitH}
              rx="4" fill={`${item.color}22`}
              stroke={item.color} strokeWidth="1.5" strokeDasharray="3 2"
            />
            {/* Spent bar */}
            <rect
              x={x} y={PAD.top + chartH - spentH}
              width={barW} height={Math.max(spentH, 2)}
              rx="4" fill={color}
            />
            {/* Label */}
            <text
              x={x + barW / 2} y={H - PAD.bottom + 14}
              textAnchor="middle" fontSize="9" fill="#374151" fontWeight="600"
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function MonthComparisonChart({ months, getExpensesForMonth }) {
  // months: [{ year, month, label }]
  const totals = months.map(({ year, month, label }) => {
    const exps = getExpensesForMonth(year, month);
    const total = exps.reduce((s, e) => s + e.amount, 0);
    const byCategory = Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]));
    exps.forEach((e) => { if (byCategory[e.category] !== undefined) byCategory[e.category] += e.amount; });
    return { label, total, byCategory };
  });

  const maxVal = Math.max(...totals.map((t) => t.total), 1);
  const W = 320;
  const H = 180;
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const groupW = chartW / totals.length;
  const barW   = Math.min(groupW * 0.5, 50);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 0.5, 1].map((frac) => {
        const y = PAD.top + chartH * (1 - frac);
        return (
          <g key={frac}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
              stroke="#E5E7EB" strokeWidth="1" />
            <text x={PAD.left - 4} y={y + 4} textAnchor="end"
              fontSize="9" fill="#8E8E93">
              {fmt(maxVal * frac)}
            </text>
          </g>
        );
      })}

      {totals.map(({ label, total, byCategory }, gi) => {
        const x    = PAD.left + gi * groupW + (groupW - barW) / 2;
        const barH = (total / maxVal) * chartH;
        let stackY = PAD.top + chartH;

        return (
          <g key={label}>
            {/* Stacked segments */}
            {CATEGORIES.map((cat) => {
              const segH = (byCategory[cat.id] / maxVal) * chartH;
              if (segH < 1) return null;
              stackY -= segH;
              const sy = stackY;
              return (
                <rect key={cat.id} x={x} y={sy} width={barW} height={segH}
                  fill={cat.color} rx={cat.id === CATEGORIES[0].id ? 4 : 0}/>
              );
            })}
            <text x={x + barW / 2} y={H - PAD.bottom + 14}
              textAnchor="middle" fontSize="9" fill="#374151">
              {label.split(' ')[0]}
            </text>
            <text x={x + barW / 2} y={PAD.top + chartH - barH - 4}
              textAnchor="middle" fontSize="8" fill="#6B7280">
              {fmt(total)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
