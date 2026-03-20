import { useState, useEffect } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { PRESET_COLORS } from '../constants';

export default function AddCategorySheet({ onClose }) {
  const { addCategory } = useBudget();

  const [visible, setVisible] = useState(false);
  const [label, setLabel]     = useState('');
  const [color, setColor]     = useState(PRESET_COLORS[0]);
  const [limit, setLimit]     = useState('');
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  async function handleAdd() {
    if (!label.trim()) { setError('Enter a category name.'); return; }
    const l = parseFloat(limit);
    if (!l || l <= 0) { setError('Enter a valid monthly limit.'); return; }
    setSaving(true);
    setError('');
    try {
      await addCategory({ label: label.trim(), color, limit: l });
      handleClose();
    } catch (err) {
      setError('Failed to save. Try again.');
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
        <h2 className="text-xl font-bold text-gray-900 mb-5">New Category</h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ios-gray uppercase tracking-wider">Name</label>
            <input
              type="text"
              placeholder="e.g. Groceries"
              value={label}
              onChange={(e) => { setLabel(e.target.value); setError(''); }}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-ios-blue"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ios-gray uppercase tracking-wider">Monthly Limit</label>
            <div className="flex items-center mt-1 px-3 py-2.5 rounded-xl border border-gray-200 focus-within:border-ios-blue">
              <span className="text-ios-gray mr-1">$</span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={limit}
                onChange={(e) => { setLimit(e.target.value); setError(''); }}
                className="flex-1 text-sm font-medium outline-none bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ios-gray uppercase tracking-wider">Color</label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                      <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-ios-red text-sm text-center mt-3">{error}</p>}

        <button
          onClick={handleAdd}
          disabled={saving}
          className="w-full mt-5 py-4 rounded-2xl bg-ios-blue text-white text-lg font-semibold active:opacity-80 transition-opacity disabled:opacity-60"
        >
          {saving ? 'Adding…' : 'Add Category'}
        </button>
      </div>
    </>
  );
}
