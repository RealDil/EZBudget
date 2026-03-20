import { createContext, useContext, useState, useEffect } from 'react';
import {
  collection, query, where, orderBy,
  onSnapshot, addDoc, deleteDoc, updateDoc,
  doc, setDoc, Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { DEFAULT_CATEGORIES, DEFAULT_LIMITS } from '../constants';

const BudgetContext = createContext(null);

export function BudgetProvider({ children }) {
  const [allYearExpenses, setAllYearExpenses] = useState([]);
  const [limits, setLimits]                   = useState(DEFAULT_LIMITS);
  const [categories, setCategories]           = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading]                 = useState(true);

  const now          = new Date();
  const currentYear  = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // 2026: budget year started in March (index 2). 2027+: full year from January.
  const yearStartMonth = currentYear === 2026 ? 2 : 0;
  const monthsElapsed  = currentMonth - yearStartMonth + 1;

  useEffect(() => {
    // ── Expenses listener: all expenses from start of budget year ─────────────
    const startOfYear = new Date(currentYear, yearStartMonth, 1);
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
        const data = snap.data();
        if (data.limits)     setLimits(data.limits);
        if (data.categories) setCategories(data.categories);
      } else {
        setDoc(settingsRef, { limits: DEFAULT_LIMITS, categories: DEFAULT_CATEGORIES });
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
  categories.forEach((cat) => {
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
  categories.forEach((cat) => {
    ytdBudgetByCategory[cat.id] = (limits[cat.id] || 0) * monthsElapsed;
    ytdNetByCategory[cat.id]    = ytdBudgetByCategory[cat.id] - ytdByCategory[cat.id];
  });

  // Overall totals
  const totalBudget        = categories.reduce((s, c) => s + (limits[c.id] || 0), 0);
  const totalSpentThisMonth = Object.values(thisMonthByCategory).reduce((a, b) => a + b, 0);
  const totalYTDBudget     = totalBudget * monthsElapsed;
  const totalYTDSpent      = Object.values(ytdByCategory).reduce((a, b) => a + b, 0);
  const totalYTDNet        = totalYTDBudget - totalYTDSpent;

  // ── Helpers for Summary screen ──────────────────────────────────────────────

  // Returns the last N months as { year, month (0-indexed), label }
  function getLastNMonths(n) {
    const result = [];
    // Cap n so we don't go before the budget year start
    const maxMonths = monthsElapsed;
    const count = Math.min(n, maxMonths);
    for (let i = count - 1; i >= 0; i--) {
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

  async function addExpense({ amount, category, userId, userName, userEmail }) {
    await addDoc(collection(db, 'expenses'), {
      amount: parseFloat(amount),
      category,
      userId,
      userName,
      userEmail: userEmail || null,
      timestamp: Timestamp.now(),
    });
  }

  async function deleteExpense(id) {
    await deleteDoc(doc(db, 'expenses', id));
  }

  async function updateExpense(id, fields) {
    await updateDoc(doc(db, 'expenses', id), fields);
  }

  const settingsRef = doc(db, 'settings', 'budget');

  async function updateLimits(newLimits) {
    await setDoc(settingsRef, { limits: newLimits }, { merge: true });
  }

  async function updateCategory(id, { label, color, limit }) {
    const updated = categories.map((c) =>
      c.id === id ? { ...c, label, color, defaultLimit: limit } : c
    );
    const newLimits = { ...limits, [id]: limit };
    await setDoc(settingsRef, { categories: updated, limits: newLimits }, { merge: true });
  }

  async function addCategory({ label, color, limit }) {
    const id = label.toLowerCase().replace(/[^a-z0-9]/g, '') + Date.now().toString(36);
    const updated = [...categories, { id, label, color, defaultLimit: limit }];
    const newLimits = { ...limits, [id]: limit };
    await setDoc(settingsRef, { categories: updated, limits: newLimits }, { merge: true });
  }

  async function deleteCategory(id) {
    const updated = categories.filter((c) => c.id !== id);
    await setDoc(settingsRef, { categories: updated }, { merge: true });
  }

  return (
    <BudgetContext.Provider
      value={{
        loading,
        allYearExpenses,
        thisMonthExpenses,
        limits,
        categories,
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
        updateExpense,
        updateLimits,
        updateCategory,
        addCategory,
        deleteCategory,
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
