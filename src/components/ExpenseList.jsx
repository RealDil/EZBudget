import { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { CATEGORIES } from '../constants';

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

function timeLabel(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function ExpenseList() {
  const { thisMonthExpenses, deleteExpense } = useBudget();
  const [deleting, setDeleting] = useState(null);

  const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

  async function handleDelete(id) {
    setDeleting(id);
    try {
      await deleteExpense(id);
    } finally {
      setDeleting(null);
    }
  }

  if (!thisMonthExpenses.length) {
    return (
      <div className="text-center py-10 text-ios-gray text-sm">
        No expenses this month yet.
        <br/>Tap <strong>+</strong> to add one.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {thisMonthExpenses.map((expense, i) => {
        const cat = catMap[expense.category] || { label: expense.category, color: '#8E8E93' };
        const isLast = i === thisMonthExpenses.length - 1;
        return (
          <div
            key={expense.id}
            className={`bg-white flex items-center px-4 py-3 gap-3 ${!isLast ? 'border-b border-gray-100' : ''}`}
          >
            {/* Color dot */}
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.color }}
            />

            {/* Category + who added */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{cat.label}</p>
              <p className="text-xs text-ios-gray">{expense.userName} · {timeLabel(expense.timestamp)}</p>
            </div>

            {/* Amount */}
            <span className="font-semibold text-gray-900 text-sm flex-shrink-0">
              {fmt(expense.amount)}
            </span>

            {/* Delete */}
            <button
              onClick={() => handleDelete(expense.id)}
              disabled={deleting === expense.id}
              className="ml-1 w-7 h-7 rounded-full flex items-center justify-center text-ios-gray active:text-ios-red transition-colors flex-shrink-0"
              aria-label="Delete expense"
            >
              {deleting === expense.id ? (
                <div className="w-4 h-4 rounded-full border-2 border-ios-gray border-t-transparent animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
