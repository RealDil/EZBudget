import { useState, useEffect, useRef } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { CATEGORIES } from '../constants';

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}
function dateLabel(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function ExpenseDetailSheet({ expense, onClose }) {
  const { updateExpense, categories } = useBudget();
  const catList = categories || CATEGORIES;

  const [visible, setVisible] = useState(false);
  const [note, setNote]       = useState(expense.note || '');
  const [saving, setSaving]   = useState(false);
  const textRef = useRef(null);

  const cat = catList.find((c) => c.id === expense.category) || { label: expense.category, color: '#8E8E93' };

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  useEffect(() => {
    const t = setTimeout(() => textRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateExpense(expense.id, { note: note.trim() });
      handleClose();
    } catch {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl px-6 pt-3 transition-transform duration-300 ease-out"
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />

        {/* Expense summary */}
        <div className="flex items-center gap-3 mb-5 bg-gray-50 rounded-2xl px-4 py-3">
          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">{cat.label}</p>
            <p className="text-sm text-gray-700">{expense.userName}</p>
            {expense.userEmail && (
              <p className="text-xs text-ios-gray italic">{expense.userEmail}</p>
            )}
            <p className="text-xs text-ios-gray mt-0.5">{dateLabel(expense.timestamp)}</p>
          </div>
          <span className="font-bold text-gray-900 text-lg">{fmt(expense.amount)}</span>
        </div>

        {/* Note input */}
        <label className="text-xs font-semibold text-ios-gray uppercase tracking-wider mb-2 block">
          What was this for? <span className="font-normal normal-case">(optional)</span>
        </label>
        <textarea
          ref={textRef}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Dinner at Chipotle, Target run, Soccer cleats…"
          rows={3}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none focus:border-ios-blue resize-none"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleClose}
            className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3.5 rounded-2xl bg-ios-blue text-white text-sm font-semibold disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </>
  );
}
