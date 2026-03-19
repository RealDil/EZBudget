import { useState, useEffect } from 'react';
import { useBudget }   from '../contexts/BudgetContext';
import { useAuth }     from '../contexts/AuthContext';
import { CATEGORIES }  from '../constants';

export default function SettingsScreen() {
  const { limits, updateLimits } = useBudget();
  const { user, logout, firstName } = useAuth();
  const [values,  setValues]  = useState({});
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    setValues(
      Object.fromEntries(CATEGORIES.map((c) => [c.id, limits[c.id] ?? c.defaultLimit]))
    );
  }, [limits]);

  function handleChange(id, val) {
    setValues((prev) => ({ ...prev, [id]: val }));
    setSaved(false);
  }

  async function handleSave() {
    const parsed = {};
    for (const cat of CATEGORIES) {
      const n = parseFloat(values[cat.id]);
      if (isNaN(n) || n < 0) { setError(`Enter a valid amount for ${cat.label}.`); return; }
      parsed[cat.id] = n;
    }
    setSaving(true);
    setError('');
    try {
      await updateLimits(parsed);
      setSaved(true);
    } catch {
      setError('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  }

  const totalBudget = CATEGORIES.reduce((s, c) => s + (parseFloat(values[c.id]) || 0), 0);

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">

      {/* Account */}
      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Account</h2>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">{firstName}</p>
            <p className="text-xs text-ios-gray mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-ios-red text-sm font-medium"
          >
            Sign Out
          </button>
        </div>
      </section>

      {/* Budget limits */}
      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Monthly Budget Limits</h2>
          <p className="text-xs text-ios-gray mt-0.5">
            Changes apply immediately and update YTD calculations.
          </p>
        </div>

        {CATEGORIES.map((cat, i) => {
          const isLast = i === CATEGORIES.length - 1;
          return (
            <div
              key={cat.id}
              className={`flex items-center px-4 py-3 gap-3 ${!isLast ? 'border-b border-gray-100' : ''}`}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <label className="flex-1 font-medium text-gray-900">{cat.label}</label>
              <div className="flex items-center gap-1 bg-gray-50 rounded-xl px-3 py-1.5">
                <span className="text-ios-gray text-sm">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={values[cat.id] ?? ''}
                  onChange={(e) => handleChange(cat.id, e.target.value)}
                  className="w-16 text-right text-gray-900 font-medium text-sm bg-transparent outline-none"
                />
              </div>
            </div>
          );
        })}

        {/* Total row */}
        <div className="flex items-center px-4 py-3 bg-gray-50 border-t border-gray-200">
          <span className="flex-1 font-semibold text-gray-900">Total</span>
          <span className="font-semibold text-gray-900">
            ${totalBudget.toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo
          </span>
        </div>
      </section>

      {error && <p className="text-ios-red text-sm text-center">{error}</p>}
      {saved && <p className="text-ios-green text-sm text-center">Limits saved!</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 rounded-2xl bg-ios-blue text-white text-base font-semibold active:opacity-80 transition-opacity disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save Changes'}
      </button>

      {/* Firestore rules reminder */}
      <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3">
          <h2 className="font-semibold text-gray-900 mb-1">Firebase Setup Notes</h2>
          <p className="text-xs text-ios-gray leading-relaxed">
            Firestore Security Rules should allow any authenticated user to read/write all documents.
            Set them in the Firebase Console under Firestore → Rules.
          </p>
        </div>
      </section>
    </div>
  );
}
