import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import LoginScreen     from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import SummaryScreen   from './screens/SummaryScreen';
import SettingsScreen  from './screens/SettingsScreen';
import Layout          from './components/Layout';
import AddExpenseSheet from './components/AddExpenseSheet';

export default function App() {
  const { user, loading } = useAuth();
  const [tab, setTab]         = useState('dashboard');
  const [showAdd, setShowAdd] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-ios-bg">
        <div className="w-8 h-8 rounded-full border-2 border-ios-blue border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <>
      <Layout tab={tab} onTabChange={setTab} onAddExpense={() => setShowAdd(true)}>
        {tab === 'dashboard' && <DashboardScreen />}
        {tab === 'summary'   && <SummaryScreen />}
        {tab === 'settings'  && <SettingsScreen />}
      </Layout>

      {showAdd && (
        <AddExpenseSheet onClose={() => setShowAdd(false)} />
      )}
    </>
  );
}
