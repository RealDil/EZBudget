import { useState, useEffect } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { PRESET_COLORS } from '../constants';

function fmt(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}
function timeLabel(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function CategoryDetailSheet({ category, onClose }) {
  const { thisMonthExpenses, deleteExpense, updateCategory, deleteCategory } = useBudget();

  const [visible, setVisible]         = useState(false);
  const [editing, setEditing]         = useState(false);
  const [label, setLabel]             = useState(category.label);
  const [color, setColor]             = useState(category.color);
  const [limit, setLimit]             = useState(String(category.defaultLimit || 0));
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 300);
  }

  const expenses = thisMonthExpenses.filter((e) => e.category === category.id);

  async function handleSave() {
    if (!label.trim()) return;
    setSaving(true);
    try {
      await updateCategory(category.id, {
        label: label.trim(),
        color,
        limit: parseFloat(limit) || 0,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteExpense(id) {
    setDeleting(id);
    try { await deleteExpense(id); } finally { setDeleting(null); }
  }

  async function handleDeleteCategory() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await deleteCategory(category.id);
    handleClose();
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
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl flex flex-col transition-transform duration-300 ease-out"
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          maxHeight: '85vh',
          paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        }}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center px-5 py-3 flex-shrink-0">
          <span className="w-3 h-3 rounded-full mr-3 flex-shrink-0" style={{ backgroundColor: editing ? color : category.color }} />
          <span className="font-bold text-lg text-gray-900 flex-1">{category.label}</span>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="w-8 h-8 flex items-center justify-center text-ios-gray active:text-ios-blue mr-1"
              aria-label="Edit category"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-ios-gray active:text-ios-blue"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="px-5 pb-3 border-b border-gray-100 flex-shrink-0">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-ios-gray uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:border-ios-blue"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ios-gray uppercase tracking-wider">Monthly Limit</label>
                <div className="flex items-center mt-1 px-3 py-2 rounded-xl border border-gray-200 focus-within:border-ios-blue">
                  <span className="text-ios-gray mr-1">$</span>
                  <input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
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
                      className="w-9 h-9 rounded-full flex items-center justify-center"
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
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setEditing(false); setLabel(category.label); setColor(category.color); setLimit(String(category.defaultLimit || 0)); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-ios-blue text-white text-sm font-semibold disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expense list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <p className="text-xs font-semibold text-ios-gray uppercase tracking-wider mb-2">
            This Month · {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
          </p>
          {expenses.length === 0 ? (
            <p className="text-sm text-ios-gray text-center py-6">No expenses this month.</p>
          ) : (
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              {expenses.map((e, i) => (
                <div
                  key={e.id}
                  className={`flex items-center px-4 py-3 gap-3 bg-gray-50 ${i < expenses.length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{e.userName}</p>
                    <p className="text-xs text-ios-gray">{timeLabel(e.timestamp)}</p>
                  </div>
                  <span className="font-semibold text-gray-900 text-sm">{fmt(e.amount)}</span>
                  <button
                    onClick={() => handleDeleteExpense(e.id)}
                    disabled={deleting === e.id}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-ios-gray active:text-ios-red"
                  >
                    {deleting === e.id ? (
                      <div className="w-4 h-4 rounded-full border-2 border-ios-gray border-t-transparent animate-spin" />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete category */}
        <div className="px-5 pt-2 flex-shrink-0">
          <button
            onClick={handleDeleteCategory}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
              confirmDelete ? 'bg-ios-red text-white' : 'bg-red-50 text-ios-red'
            }`}
          >
            {confirmDelete ? 'Tap again to confirm delete' : 'Delete Category'}
          </button>
        </div>
      </div>
    </>
  );
}
