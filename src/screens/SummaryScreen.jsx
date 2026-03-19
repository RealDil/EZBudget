import { useBudget } from '../contexts/BudgetContext';
import { CATEGORIES } from '../constants';
import { CategoryBarChart, MonthComparisonChart } from '../components/BarChart';

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function SummaryScreen() {
  const {
    loading,
    thisMonthByCategory,
    limits,
    ytdByCategory,
    ytdBudgetByCategory,
    ytdNetByCategory,
    getLastNMonths,
    getExpensesForMonth,
    currentYear,
    currentMonth,
    monthsElapsed,
  } = useBudget();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-ios-blue border-t-transparent animate-spin" />
      </div>
    );
  }

  const lastThree = getLastNMonths(3);
  const currentMonthLabel = new Date(currentYear, currentMonth)
    .toLocaleString('default', { month: 'long' });

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">

      {/* ── This Month Bar Chart ─────────────────────────────────────── */}
      <section className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-1">{currentMonthLabel} Spending</h2>
        <p className="text-xs text-ios-gray mb-3">
          Solid bar = spent · dashed outline = budget
        </p>
        <CategoryBarChart data={thisMonthByCategory} limits={limits} />
        {/* Category legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-xs text-ios-gray">{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Month-over-Month ─────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-1">Last 3 Months</h2>
        <p className="text-xs text-ios-gray mb-3">Total spending by month (stacked by category)</p>
        <MonthComparisonChart months={lastThree} getExpensesForMonth={getExpensesForMonth} />
      </section>

      {/* ── YTD Table ────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Year-to-Date</h2>
          <p className="text-xs text-ios-gray mt-0.5">
            {monthsElapsed} month{monthsElapsed !== 1 ? 's' : ''} elapsed in {currentYear}
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-2 text-xs font-medium text-ios-gray uppercase tracking-wide">Category</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-ios-gray uppercase tracking-wide">Budget</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-ios-gray uppercase tracking-wide">Spent</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-ios-gray uppercase tracking-wide">Net</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORIES.map((cat, i) => {
              const net    = ytdNetByCategory[cat.id] ?? 0;
              const isLast = i === CATEGORIES.length - 1;
              return (
                <tr key={cat.id} className={!isLast ? 'border-b border-gray-50' : ''}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-medium text-gray-900">{cat.label}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right text-ios-gray">
                    {fmt(ytdBudgetByCategory[cat.id] || 0)}
                  </td>
                  <td className="px-3 py-3 text-right text-gray-900">
                    {fmt(ytdByCategory[cat.id] || 0)}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${net >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                    {net >= 0 ? `+${fmt(net)}` : `-${fmt(Math.abs(net))}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t border-gray-200">
              <td className="px-4 py-3 font-semibold text-gray-900">Total</td>
              <td className="px-3 py-3 text-right font-semibold text-ios-gray">
                {fmt(CATEGORIES.reduce((s, c) => s + (ytdBudgetByCategory[c.id] || 0), 0))}
              </td>
              <td className="px-3 py-3 text-right font-semibold text-gray-900">
                {fmt(CATEGORIES.reduce((s, c) => s + (ytdByCategory[c.id] || 0), 0))}
              </td>
              <td className={`px-4 py-3 text-right font-bold ${
                CATEGORIES.reduce((s, c) => s + (ytdNetByCategory[c.id] || 0), 0) >= 0
                  ? 'text-ios-green' : 'text-ios-red'
              }`}>
                {(() => {
                  const net = CATEGORIES.reduce((s, c) => s + (ytdNetByCategory[c.id] || 0), 0);
                  return net >= 0 ? `+${fmt(net)}` : `-${fmt(Math.abs(net))}`;
                })()}
              </td>
            </tr>
          </tfoot>
        </table>
      </section>
    </div>
  );
}
