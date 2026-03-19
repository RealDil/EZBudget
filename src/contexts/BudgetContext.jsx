import { createContext, useContext, useState, useEffect } from 'react';
import {
  collection, query, where, orderBy,
  onSnapshot, addDoc, deleteDoc,
  doc, setDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { CATEGORIES, DEFAULT_LIMITS } from '../constants';

const BudgetContext = createContext(null);

export function BudgetProvider({ children }) {
  const [allYearExpenses, setAllYearExpenses] = useState([]);
  const [limits, setLimits]                   = useState(DEFAULT_LIMITS);
  const [loading, setLoading]                 = useState(true);

  const now          = new Date();
  const currentYear  = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const monthsElapsed = currentMonth + 1; // Jan=1, Apr=4, Dec=12

  useEffect(() => {
    // ── Expenses listener: all expenses from Jan 1 of this year ──────────────
    const startOfYear = new Date(currentYear, 0, 1);
    const q = query(
      collection(db, 'expenses'),
      where('timestamp', '>=', Timestamp.fromDate(startOfYear)),
      orderBy('timestamp', 'desc')
    );

    const unsubExpenses = onSnapshot(q, (snap) => {
      setAllYearExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error('[expenses]', err.message);
      setLoading(false);
    });

    // ── Settings listener ─────────────────────────────────────────────────────
    const settingsRef = doc(db, 'settings', 'budget');
    const unsubSettings = onSnapshot(settingsRef, (snap) => {
      if (snap.exists()) {
        setLimits(snap.data().limits);
      } else {
        setDoc(settingsRef, { limits: DEFAULT_LIMITS });
      }
    });

    return () => {
      unsubExpenses();
      unsubSettings();
    };
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────

  // Expenses this calendar month
  const thisMonthExpenses = allYearExpenses.filter((e) => {
    if (!e.timestamp) return false;
    const d = e.timestamp.toDate();
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  // Spending per category (this month and YTD)
  const thisMonthByCategory = {};
  const ytdByCategory       = {};
  CATEGORIES.forEach((cat) => {
    thisMonthByCategory[cat.id] = 0;
    ytdByCategory[cat.id]       = 0;
  });

  thisMonthExpenses.forEach((e) => {
    if (thisMonthByCategory[e.category] !== undefined)
      thisMonthByCategory[e.category] += e.amount;
  });

  allYearExpenses.forEach((e) => {
    if (ytdByCategory[e.category] !== undefined)
      ytdByCategory[e.category] += e.amount;
  });

  // YTD budget and net per category
  const ytdBudgetByCategory = {};
  const ytdNetByCategory    = {};
  CATEGORIES.forEach((cat) => {
    ytdBudgetByCategory[cat.id] = (limits[cat.id] || 0) * monthsElapsed;
    ytdNetByCategory[cat.id]    = ytdBudgetByCategory[cat.id] - ytdByCategory[cat.id];
  });

  // Overall totals
  const totalBudget        = CATEGORIES.reduce((s, c) => s + (limits[c.id] || 0), 0);
  const totalSpentThisMonth = Object.values(thisMonthByCategory).reduce((a, b) => a + b, 0);
  const totalYTDBudget     = totalBudget * monthsElapsed;
  const totalYTDSpent      = Object.values(ytdByCategory).reduce((a, b) => a + b, 0);
  const totalYTDNet        = totalYTDBudget - totalYTDSpent;

  // ── Helpers for Summary screen ──────────────────────────────────────────────

  // Returns the last N months as { year, month (0-indexed), label }
  function getLastNMonths(n) {
    const result = [];
    for (let i = n - 1; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m < 0) { m += 12; y -= 1; }
      const label = new Date(y, m).toLocaleString('default', { month: 'short' });
      result.push({ year: y, month: m, label: `${label} ${y}` });
    }
    return result;
  }

  function getExpensesForMonth(year, month) {
    return allYearExpenses.filter((e) => {
      if (!e.timestamp) return false;
      const d = e.timestamp.toDate();
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async function addExpense({ amount, category, userId, userName }) {
    await addDoc(collection(db, 'expenses'), {
      amount: parseFloat(amount),
      category,
      userId,
      userName,
      timestamp: Timestamp.now(),
    });
  }

  async function deleteExpense(id) {
    await deleteDoc(doc(db, 'expenses', id));
  }

  async function updateLimits(newLimits) {
    await setDoc(doc(db, 'settings', 'budget'), { limits: newLimits });
  }

  return (
    <BudgetContext.Provider
      value={{
        loading,
        allYearExpenses,
        thisMonthExpenses,
        limits,
        currentYear,
        currentMonth,
        monthsElapsed,
        thisMonthByCategory,
        ytdByCategory,
        ytdBudgetByCategory,
        ytdNetByCategory,
        totalBudget,
        totalSpentThisMonth,
        totalYTDBudget,
        totalYTDSpent,
        totalYTDNet,
        addExpense,
        deleteExpense,
        updateLimits,
        getLastNMonths,
        getExpensesForMonth,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  return useContext(BudgetContext);
}
