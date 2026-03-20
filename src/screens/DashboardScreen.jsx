import { useState } from 'react';
import { useBudget }      from '../contexts/BudgetContext';
import CategoryCard       from '../components/CategoryCard';
import ExpenseList        from '../components/ExpenseList';
import AddCategorySheet   from '../components/AddCategorySheet';

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export default function DashboardScreen() {
  const {
    loading,
    categories,
    totalSpentThisMonth,
    totalBudget,
    totalYTDNet,
  } = useBudget();

  const [showAddCategory, setShowAddCategory] = useState(false);

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
      {categories.map((cat) => (
        <CategoryCard key={cat.id} category={cat} />
      ))}

      {/* Add category button */}
      <button
        onClick={() => setShowAddCategory(true)}
        className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-ios-gray text-sm font-semibold flex items-center justify-center gap-2 active:opacity-60 transition-opacity"
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        Add Category
      </button>

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

      {showAddCategory && (
        <AddCategorySheet onClose={() => setShowAddCategory(false)} />
      )}
    </div>
  );
}
