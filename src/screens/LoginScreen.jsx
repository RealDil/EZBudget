import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const { login, error } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch {
      // error displayed via context
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ios-bg flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-3xl bg-ios-green flex items-center justify-center shadow-sm">
          <span className="text-white text-4xl font-bold">$</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Family Budget</h1>
        <p className="text-ios-gray text-sm">Dillon &amp; Madeline</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className="w-full px-4 py-3.5 text-base outline-none border-b border-gray-100"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="w-full px-4 py-3.5 text-base outline-none"
          />
        </div>

        {error && (
          <p className="text-ios-red text-sm text-center px-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-ios-blue text-white text-base font-semibold active:opacity-80 transition-opacity disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="text-center text-ios-gray text-xs mt-2">
          Contact Dillon to create or reset accounts.
        </p>
      </form>
    </div>
  );
}
