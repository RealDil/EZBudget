import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { login, signup, error } = useAuth();
  const [mode, setMode]           = useState('signin'); // 'signin' | 'signup'
  const [firstName, setFirstName] = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading]     = useState(false);

  function switchMode(m) {
    setMode(m);
    setLocalError('');
    setFirstName(''); setEmail(''); setPassword(''); setConfirm('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError('');

    if (mode === 'signup') {
      if (!firstName.trim()) { setLocalError('Enter your first name.'); return; }
      if (password !== confirm) { setLocalError('Passwords do not match.'); return; }
      if (password.length < 6) { setLocalError('Password must be at least 6 characters.'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await login(email.trim(), password);
      } else {
        await signup(firstName.trim(), email.trim(), password);
      }
    } catch {
      // error shown via context or localError
    } finally {
      setLoading(false);
    }
  }

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-ios-bg flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-3xl bg-ios-green flex items-center justify-center shadow-sm">
          <span className="text-white text-4xl font-bold">$</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Family Budget</h1>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-gray-200 rounded-xl p-1 mb-6 w-full max-w-sm">
        <button
          onClick={() => switchMode('signin')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            mode === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-ios-gray'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => switchMode('signup')}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-ios-gray'
          }`}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
              className="w-full px-4 py-3.5 text-base outline-none border-b border-gray-100"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className={`w-full px-4 py-3.5 text-base outline-none border-b border-gray-100`}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
            className={`w-full px-4 py-3.5 text-base outline-none ${mode === 'signup' ? 'border-b border-gray-100' : ''}`}
          />
          {mode === 'signup' && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
              className="w-full px-4 py-3.5 text-base outline-none"
            />
          )}
        </div>

        {displayError && (
          <p className="text-ios-red text-sm text-center px-2">{displayError}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-ios-blue text-white text-base font-semibold active:opacity-80 transition-opacity disabled:opacity-60"
        >
          {loading
            ? (mode === 'signin' ? 'Signing in…' : 'Creating account…')
            : (mode === 'signin' ? 'Sign In' : 'Create Account')}
        </button>

        {mode === 'signup' && (
          <p className="text-center text-ios-gray text-xs mt-1">
            After signing in you can link with family members to share your budget.
          </p>
        )}
      </form>
    </div>
  );
}
