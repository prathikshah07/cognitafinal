import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, LogIn, UserPlus, Zap, Shield } from 'lucide-react';
import { supabaseClient as supabase } from '../lib/supabaseClient';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Sign in user
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setSuccess('✅ NEURAL LINK ESTABLISHED! Accessing dashboard...');
        }
      } else {
        // Sign up user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName || email.split('@')[0],
            },
          },
        });
        if (error) throw error;

        if (data.user) {
          if (data.user.email_confirmed_at) {
            setSuccess('🎉 ACCOUNT CREATED! Neural interface active.');
          } else {
            setSuccess('📧 Check your email to complete neural synchronization.');
            setIsLogin(true);
          }
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.message?.includes('Invalid login credentials')) {
        setError('❌ AUTHENTICATION FAILED: Invalid credentials detected.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('⚠️ NEURAL SYNC INCOMPLETE: Please confirm your email address.');
      } else if (err.message?.includes('User already registered')) {
        setError('🔍 USER EXISTS: Please use sign in protocol.');
        setIsLogin(true);
      } else {
        setError(`🚨 SYSTEM ERROR: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccess(null);
    setEmail('');
    setPassword('');
    setDisplayName('');
  };

  const handleInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      {/* ... animated particles and other decorative elements ... */}

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="cyber-glass p-6 rounded-2xl cyber-border-glow">
                <Zap className="w-12 h-12 text-cyan-400 animate-cyber-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center animate-cyber-glow">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>

          {/* Titles */}
          <h1 className="neon-text text-5xl font-cyber font-bold mb-4 tracking-wider">COGNITA</h1>
          <p className="text-cyan-300 text-lg font-cyber mb-2 tracking-wide">NEURAL ACADEMIC INTERFACE</p>
          <p className="text-gray-400 text-sm font-mono">Advanced AI-Powered Student Companion System</p>
        </div>

        {/* Auth Card */}
        <div className="cyber-glass rounded-2xl p-8 cyber-border space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 cyber-glass rounded-lg">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg font-cyber font-semibold transition-all duration-300 ${
                isLogin
                  ? 'cyber-button text-cyan-400 border-cyan-400'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4" />
                ACCESS
              </div>
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg font-cyber font-semibold transition-all duration-300 ${
                !isLogin
                  ? 'cyber-button-secondary text-purple-400 border-purple-400'
                  : 'text-gray-400 hover:text-purple-400 hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" />
                REGISTER
              </div>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-sm font-cyber text-cyan-300 uppercase tracking-wide">
                  User Designation
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={handleInputChange(setDisplayName)}
                    className="cyber-input w-full pl-10 pr-4 py-3"
                    placeholder="Enter your codename"
                  />
                </div>
                <p className="text-xs text-gray-500 font-mono">Optional • Auto-generated from email if empty</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-cyber text-cyan-300 uppercase tracking-wide">Neural ID</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={handleInputChange(setEmail)}
                  className="cyber-input w-full pl-10 pr-4 py-3"
                  placeholder="user@neural.net"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-cyber text-cyan-300 uppercase tracking-wide">Access Code</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  className="cyber-input w-full pl-10 pr-12 py-3"
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isLogin && (
                <p className="text-xs text-gray-500 font-mono">Minimum 6 characters • Enhanced encryption protocol</p>
              )}
            </div>

            {success && (
              <div className="cyber-glass p-4 border border-green-500/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 animate-pulse"></div>
                  <p className="text-green-300 text-sm font-mono">{success}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="cyber-glass p-4 border border-red-500/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 animate-pulse"></div>
                  <p className="text-red-300 text-sm font-mono">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-cyber font-bold text-lg uppercase tracking-wide transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                isLogin
                  ? 'cyber-button text-cyan-400 border-cyan-400 hover:shadow-cyber'
                  : 'cyber-button-secondary text-purple-400 border-purple-400'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-mono">{isLogin ? 'AUTHENTICATING...' : 'INITIALIZING...'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  {isLogin ? (
                    <>
                      <LogIn className="w-5 h-5" />
                      NEURAL LINK
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      ACTIVATE ACCOUNT
                    </>
                  )}
                </div>
              )}
            </button>
          </form>

          <div className="text-center pt-4 border-t border-gray-700/50">
            <button
              onClick={toggleMode}
              className="text-cyan-400 hover:text-purple-400 font-cyber text-sm transition-colors tracking-wide"
            >
              {isLogin ? 'NEED ACCESS? → INITIALIZE NEW ACCOUNT' : 'HAVE ACCESS? → NEURAL LINK LOGIN'}
            </button>
          </div>
        </div>

        <div className="cyber-glass rounded-xl p-4 text-center cyber-border">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-cyber text-sm">SECURE • ENCRYPTED • QUANTUM-SAFE</span>
          </div>
          <p className="text-gray-400 text-xs font-mono">
            Advanced biometric authentication • Neural pattern recognition enabled
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 font-mono mb-4">🎯 SYSTEM CAPABILITIES</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 font-mono">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
              Neural Study Tracking
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
              Quantum Habit Analysis
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-pink-400 rounded-full animate-pulse"></div>
              AI Financial Optimization
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
              Mood Vector Processing
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
