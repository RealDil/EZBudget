import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const tabs = [
  {
    id: 'dashboard',
    label: 'Budget',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <rect x="3" y="3" width="7" height="7" rx="1.5"
          fill={active ? '#007AFF' : 'none'}
          stroke={active ? '#007AFF' : '#8E8E93'} strokeWidth="1.8"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"
          fill={active ? '#007AFF' : 'none'}
          stroke={active ? '#007AFF' : '#8E8E93'} strokeWidth="1.8"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"
          fill={active ? '#007AFF' : 'none'}
          stroke={active ? '#007AFF' : '#8E8E93'} strokeWidth="1.8"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"
          fill={active ? '#007AFF' : 'none'}
          stroke={active ? '#007AFF' : '#8E8E93'} strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    id: 'summary',
    label: 'Reports',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <rect x="3" y="12" width="4" height="9" rx="1"
          fill={active ? '#007AFF' : '#8E8E93'}/>
        <rect x="10" y="7" width="4" height="14" rx="1"
          fill={active ? '#007AFF' : '#8E8E93'}/>
        <rect x="17" y="3" width="4" height="18" rx="1"
          fill={active ? '#007AFF' : '#8E8E93'}/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
        <circle cx="12" cy="12" r="3"
          stroke={active ? '#007AFF' : '#8E8E93'} strokeWidth="1.8"/>
        <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          stroke={active ? '#007AFF' : '#8E8E93'} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function Layout({ children, tab, onTabChange, onAddExpense }) {
  const { firstName, logout, pendingInvites, acceptLinkRequest, declineLinkRequest } = useAuth();
  const [dismissedInvites, setDismissedInvites] = useState([]);

  const visibleInvites = (pendingInvites || []).filter((inv) => !dismissedInvites.includes(inv.id));

  async function handleAccept(inv) {
    await acceptLinkRequest(inv.id, inv.fromUid);
    setDismissedInvites((d) => [...d, inv.id]);
  }
  async function handleDecline(inv) {
    await declineLinkRequest(inv.id);
    setDismissedInvites((d) => [...d, inv.id]);
  }
  const now = new Date();
  const monthLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col h-full bg-ios-bg">
      {/* Header */}
      <header className="bg-white px-5 pt-14 pb-4 border-b border-gray-100 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium text-ios-gray uppercase tracking-wider">Family Budget</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{monthLabel}</h1>
        </div>
        <button
          onClick={logout}
          className="text-sm text-ios-blue font-medium pb-1"
        >
          Sign Out
        </button>
      </header>

      {/* Pending link invites */}
      {visibleInvites.map((inv) => (
        <div key={inv.id} className="bg-ios-blue px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {inv.fromName} wants to link budgets with you
            </p>
            <p className="text-blue-100 text-xs truncate">{inv.fromEmail}</p>
          </div>
          <button
            onClick={() => handleDecline(inv)}
            className="text-blue-100 text-sm font-medium px-2"
          >
            Decline
          </button>
          <button
            onClick={() => handleAccept(inv)}
            className="bg-white text-ios-blue text-sm font-semibold px-3 py-1.5 rounded-lg"
          >
            Accept
          </button>
        </div>
      ))}

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto pb-32">
        {children}
      </main>

      {/* FAB — Add Expense */}
      <button
        onClick={onAddExpense}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-ios-blue shadow-lg flex items-center justify-center z-30 active:scale-95 transition-transform"
        aria-label="Add expense"
        style={{ boxShadow: '0 4px 20px rgba(0,122,255,0.4)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
          <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-20"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className="flex-1 flex flex-col items-center py-2 gap-0.5"
            >
              {t.icon(active)}
              <span className={`text-xs font-medium ${active ? 'text-ios-blue' : 'text-ios-gray'}`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
