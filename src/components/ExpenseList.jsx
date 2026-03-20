import { useState, useRef } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { CATEGORIES } from '../constants';
import ExpenseDetailSheet from './ExpenseDetailSheet';

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}
function timeLabel(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function ExpenseList() {
  const { thisMonthExpenses, deleteExpense, categories } = useBudget();
  const catList = categories || CATEGORIES;
  const catMap = Object.fromEntries(catList.map((c) => [c.id, c]));

  const [deleting, setDeleting]   = useState(null);
  const [selected, setSelected]   = useState(null); // expense to edit note
  const pressTimer = useRef(null);
  const didLongPress = useRef(false);

  async function handleDelete(id) {
    setDeleting(id);
    try { await deleteExpense(id); } finally { setDeleting(null); }
  }

  function startPress(expense) {
    didLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setSelected(expense);
    }, 500);
  }
  function cancelPress() { clearTimeout(pressTimer.current); }

  if (!thisMonthExpenses.length) {
    return (
      <div className="text-center py-10 text-ios-gray text-sm">
        No expenses this month yet.
        <br/>Tap <strong>+</strong> to add one.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-0">
        {thisMonthExpenses.map((expense, i) => {
          const cat = catMap[expense.category] || { label: expense.category, color: '#8E8E93' };
          const isLast = i === thisMonthExpenses.length - 1;
          return (
            <div
              key={expense.id}
              className={`bg-white flex items-center px-4 py-3 gap-3 select-none ${!isLast ? 'border-b border-gray-100' : ''}`}
              onPointerDown={() => startPress(expense)}
              onPointerUp={cancelPress}
              onPointerLeave={cancelPress}
            >
              {/* Color dot */}
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />

              {/* Category + who + note */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {cat.label}
                  {expense.note && (
                    <span className="font-normal text-ios-gray italic"> · {expense.note}</span>
                  )}
                </p>
                <p className="text-xs text-ios-gray">
                  {expense.userName} · {timeLabel(expense.timestamp)}
                  {!expense.note && <span className="text-gray-300 italic"> · hold to add note</span>}
                </p>
              </div>

              {/* Amount */}
              <span className="font-semibold text-gray-900 text-sm flex-shrink-0">{fmt(expense.amount)}</span>

              {/* Delete */}
              <button
                onClick={(e) => { e.stopPropagation(); if (!didLongPress.current) handleDelete(expense.id); }}
                onPointerDown={(e) => e.stopPropagation()}
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

      {selected && (
        <ExpenseDetailSheet expense={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
