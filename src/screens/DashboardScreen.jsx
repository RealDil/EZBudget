import { useBudget }      from '../contexts/BudgetContext';
import CategoryCard       from '../components/CategoryCard';
import ExpenseList        from '../components/ExpenseList';
import { CATEGORIES }     from '../constants';

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function DashboardScreen() {
  const {
    loading,
    totalSpentThisMonth,
    totalBudget,
    totalYTDNet,
    monthsElapsed,
  } = useBudget();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-ios-blue border-t-transparent animate-spin" />
      </div>
    );
  }

  const totalPct = totalBudget > 0 ? (totalSpentThisMonth / totalBudget) * 100 : 0;
  const barColor =
    totalPct >= 100 ? 'bg-ios-red' :
    totalPct >= 80  ? 'bg-ios-yellow' :
    'bg-ios-green';

  return (
    <div className="px-4 pt-4 space-y-3">
      {/* Category cards */}
      {CATEGORIES.map((cat) => (
        <CategoryCard key={cat.id} category={cat} />
      ))}

      {/* Total summary card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-sm text-ios-gray">
            {fmt(totalSpentThisMonth)} of {fmt(totalBudget)}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(totalPct, 100)}%` }}
          />
        </div>
        <div className={`text-xs font-medium ${totalYTDNet >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
          YTD: {totalYTDNet >= 0
            ? `+${fmt(totalYTDNet)} ahead`
            : `-${fmt(Math.abs(totalYTDNet))} over`}
          {' '}across all categories
        </div>
      </div>

      {/* Expense list */}
      <div className="mt-2">
        <h2 className="text-xs font-semibold text-ios-gray uppercase tracking-wider px-1 mb-2">
          This Month
        </h2>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <ExpenseList />
        </div>
      </div>
    </div>
  );
}
