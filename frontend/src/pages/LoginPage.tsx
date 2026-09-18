import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegisterMode) {
        const farmId = `FARM-${Math.floor(Math.random() * 10000)}`;
        const systemId = `WG-${Math.floor(Math.random() * 1000000)}`;
        await register(email, password, name, farmName, phone, farmId, systemId);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-8">
      <div className="max-w-md w-full space-y-6 bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-3">
            <Lock className="h-6 w-6 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">WildGuard AI</h2>
          <p className="mt-1 text-xs text-slate-400 font-bold uppercase tracking-wider">
            {isRegisterMode ? 'Deploy New Sentinel Account' : 'Command Center Access'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2.5 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <p className="text-xs font-semibold">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            {isRegisterMode && (
              <>
                <div>
                  <label className="text-xs font-black text-slate-400 block mb-1 uppercase tracking-tight">Sentinel Officer Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="Krishna Kumar"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-400 block mb-1 uppercase tracking-tight">Farm Estate Name</label>
                    <input
                      type="text"
                      required
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      placeholder="Greenwood Orchards"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 block mb-1 uppercase tracking-tight">Emergency Phone</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-black text-slate-400 block mb-1 uppercase tracking-tight">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="officer@wildguard.ai"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 block mb-1 uppercase tracking-tight">Security Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2 shadow-lg shadow-emerald-950/20"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : isRegisterMode ? 'Deploy Sentinel Node' : 'Initialize Command Center'}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-700"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">Secure Identity Providers</span>
          <div className="flex-grow border-t border-slate-700"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
          className="w-full bg-slate-900 hover:bg-slate-950 border border-slate-700 hover:border-slate-600 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.83 21.56,11.43 21.35,11.1z" fill="#4285F4" />
              <path d="M12,21c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.57c-0.9,0.6 -2.07,0.97 -3.33,0.97 -2.34,0 -4.33,-1.58 -5.03,-3.7H2.92v2.65C4.4,19.08 8.0,21 12,21z" fill="#34A853" />
              <path d="M6.97,13.6c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7s0.1,-1.16 0.28,-1.7V7.55H2.92C2.3,8.77 1.95,10.14 1.95,11.6s0.35,2.83 0.97,4.05l4.05,-3.1z" fill="#FBBC05" />
              <path d="M12,6.38c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,3.64 14.43,3 12,3 8.0,3 4.4,4.92 2.92,7.55l4.05,3.1C7.67,7.96 9.66,6.38 12,6.38z" fill="#EA4335" />
            </g>
          </svg>
          <span>Continue with Google Cloud SSO</span>
        </button>

        <div className="text-center">
          <button
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold transition-all focus:outline-none"
          >
            {isRegisterMode ? 'Already registered? Authenticate Credentials' : 'New Estate Owner? Create Sentinel Account'}
          </button>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
          <ShieldAlert size={14} className="text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-[10px] text-slate-500 font-medium leading-normal">
            <span className="font-bold text-slate-400 block mb-0.5 uppercase tracking-tighter">Cryptographic Infrastructure</span>
            Encrypted session handshakes via modular Firebase integration with localized full-perimeter multi-camera AI active scanning.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
