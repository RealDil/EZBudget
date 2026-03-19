import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBudget } from '../contexts/BudgetContext';
import { CATEGORIES } from '../constants';

export default function AddExpenseSheet({ onClose }) {
  const { user, firstName } = useAuth();
  const { addExpense } = useBudget();

  // Auto-select category based on first name
  const autoCategory =
    firstName.toLowerCase() === 'dillon'   ? 'dillon' :
    firstName.toLowerCase() === 'madeline' ? 'madeline' :
    'diningOut';

  const [amount,   setAmount]   = useState('');
  const [category, setCategory] = useState(autoCategory);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const inputRef = useRef(null);

  // Slide-in animation
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  async function handleAdd() {
    const val = parseFloat(amount);
    if (!val || val <= 0) { setError('Enter a valid amount.'); return; }
    setSaving(true);
    setError('');
    try {
      await addExpense({
        amount: val,
        category,
        userId: user.uid,
        userName: firstName || user.email.split('@')[0],
      });
      handleClose();
    } catch (err) {
      setError('Failed to save. Try again.');
      setSaving(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') handleClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl px-6 pt-3 pb-10 transition-transform duration-300 ease-out`}
        style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)', paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom))' }}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

        <h2 className="text-xl font-bold text-gray-900 mb-6">Add Expense</h2>

        {/* Amount input — big and prominent */}
        <div className="flex items-center justify-center bg-gray-50 rounded-2xl py-5 mb-5">
          <span className="text-4xl font-light text-gray-400 mr-1">$</span>
          <input
            ref={inputRef}
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            className="text-5xl font-semibold text-gray-900 bg-transparent outline-none w-48 text-center placeholder:text-gray-300"
          />
        </div>

        {/* Category selector */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`py-3 rounded-xl font-medium text-sm border-2 transition-all ${
                  active
                    ? 'text-white border-transparent'
                    : 'bg-white border-gray-200 text-gray-700'
                }`}
                style={active ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {error && <p className="text-ios-red text-sm text-center mb-3">{error}</p>}

        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-ios-blue text-white text-lg font-semibold active:opacity-80 transition-opacity disabled:opacity-60"
        >
          {saving ? 'Adding…' : 'Add Expense'}
        </button>
      </div>
    </>
  );
}
