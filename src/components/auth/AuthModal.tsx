import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { authService } from '../../services/authService';
import { SEED_USERS } from '../../mock/seedData';
import { useToast } from '../common/Toast';
import { LogIn, UserPlus, KeyRound, CheckCircle, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { showToast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }
    setLoading(true);
    const result = await authService.login(email, password);
    setLoading(false);
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast(`Welcome back, ${result.user?.full_name}!`, 'success');
      onClose();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      showToast('Please fill out all registration fields.', 'error');
      return;
    }
    setLoading(true);
    const result = await authService.signUp(fullName, email, password);
    setLoading(false);
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast(`Account created! Welcome to FindIt, ${result.user?.full_name}.`, 'success');
      onClose();
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address.', 'error');
      return;
    }
    setResetSent(true);
    showToast(`Password reset link sent to ${email}`, 'info');
  };

  const handleQuickDemoLogin = (userId: string) => {
    const user = authService.switchDemoUser(userId);
    if (user) {
      showToast(`Logged in as demo user: ${user.full_name}`, 'success');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E8F5EC] text-[#238B57] mb-3">
          {mode === 'login' && <LogIn className="w-6 h-6" />}
          {mode === 'signup' && <UserPlus className="w-6 h-6" />}
          {mode === 'forgot' && <KeyRound className="w-6 h-6" />}
        </div>
        <h2 className="text-2xl font-bold text-[#202B25]">
          {mode === 'login' && 'Welcome to FindIt'}
          {mode === 'signup' && 'Create Your Account'}
          {mode === 'forgot' && 'Reset Password'}
        </h2>
        <p className="text-sm text-[#78847D] mt-1">
          {mode === 'login' && 'Sign in to manage reports, claims, and messages.'}
          {mode === 'signup' && 'Join thousands helping reconnect lost belongings.'}
          {mode === 'forgot' && 'Enter your email to receive recovery instructions.'}
        </p>
      </div>

      {mode === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#238B57]/30 focus:border-[#238B57] text-sm text-[#202B25] transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-xs text-[#238B57] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#238B57]/30 focus:border-[#238B57] text-sm text-[#202B25] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#238B57] hover:bg-[#1b6d44] text-white rounded-xl font-medium text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center text-xs text-[#78847D] pt-2">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="text-[#238B57] font-semibold hover:underline"
            >
              Sign up
            </button>
          </div>
        </form>
      )}

      {mode === 'signup' && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#238B57]/30 focus:border-[#238B57] text-sm text-[#202B25] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#238B57]/30 focus:border-[#238B57] text-sm text-[#202B25] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#238B57]/30 focus:border-[#238B57] text-sm text-[#202B25] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#238B57] hover:bg-[#1b6d44] text-white rounded-xl font-medium text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="text-center text-xs text-[#78847D] pt-2">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-[#238B57] font-semibold hover:underline"
            >
              Sign in
            </button>
          </div>
        </form>
      )}

      {mode === 'forgot' && (
        <div className="space-y-4">
          {resetSent ? (
            <div className="text-center py-4 bg-[#E8F5EC] rounded-xl p-4">
              <CheckCircle className="w-8 h-8 text-[#238B57] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#202B25]">Reset instructions dispatched!</p>
              <p className="text-xs text-[#78847D] mt-1">Check your inbox ({email}) for a reset link.</p>
              <button
                onClick={() => {
                  setResetSent(false);
                  setMode('login');
                }}
                className="mt-4 text-xs font-semibold text-[#238B57] hover:underline block mx-auto"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202B25] uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#238B57]/30 focus:border-[#238B57] text-sm text-[#202B25] transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#238B57] hover:bg-[#1b6d44] text-white rounded-xl font-medium text-sm transition-colors shadow-sm cursor-pointer"
              >
                Send Reset Link
              </button>
              <div className="text-center text-xs text-[#78847D]">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#238B57] hover:underline"
                >
                  Return to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Demo Switcher Quick Access */}
      <div className="mt-6 pt-5 border-t border-[#E8F5EC]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-[#78847D] uppercase tracking-wider">
            Quick Demo Login
          </p>
          <span className="text-[10px] bg-[#E8F5EC] text-[#238B57] font-medium px-2 py-0.5 rounded-full">
            1-Click Testing
          </span>
        </div>
        <div className="space-y-1.5">
          {SEED_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => handleQuickDemoLogin(user.id)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl bg-[#F9FBF9] hover:bg-[#E8F5EC] text-[#202B25] border border-gray-200 hover:border-[#238B57]/30 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div>
                  <span className="font-medium text-[#202B25]">{user.full_name}</span>
                  <span className="text-[#78847D] block text-[11px]">
                    {user.id === 'user-alex'
                      ? 'Finder (Found Sony Headphones)'
                      : user.id === 'user-sarah'
                      ? 'Claimant (Lost Backpack & Claims Headphones)'
                      : 'Finder (Found BMW Keys)'}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#238B57]" />
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

