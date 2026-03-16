import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Clock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher';
import { ApiError } from '../api/client';

export function AcceptInvitePage() {
  const { user, acceptInvite } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Already logged in — redirect
  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-text-inverse" />
            </div>
            <span className="font-display font-bold text-text text-lg tracking-tight">
              ShiftSync
            </span>
          </div>
          <ThemeSwitcher />
        </div>
        <div className="flex-1 flex items-center justify-center px-4 pb-16">
          <div className="w-full max-w-sm text-center">
            <AlertCircle size={40} className="text-error mx-auto mb-4" />
            <h1 className="text-xl font-display font-bold text-text mb-2">
              Invalid Invitation Link
            </h1>
            <p className="text-sm text-text-secondary mb-6">
              This link is missing a valid invitation token. Please check the link from your email.
            </p>
            <Link
              to="/login"
              className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await acceptInvite(token!, firstName, lastName, password);
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          typeof err.data === 'object' && err.data !== null && 'error' in err.data
            ? String((err.data as Record<string, unknown>).error)
            : 'Unable to accept invitation. It may be expired or already used.',
        );
      } else {
        setError('Unable to connect. Check that the server is running.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Clock size={16} className="text-text-inverse" />
          </div>
          <span className="font-display font-bold text-text text-lg tracking-tight">
            ShiftSync
          </span>
        </div>
        <ThemeSwitcher />
      </div>

      {/* Form — centered */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm animate-stagger">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={22} className="text-success" />
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-text">
                You're invited
              </h1>
            </div>
            <p className="text-text-secondary text-sm">
              Create your account to join the team
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-error/10 border border-error/20 rounded-lg">
                <AlertCircle size={16} className="text-error shrink-0 mt-0.5" />
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-text mb-1.5">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoFocus
                  placeholder="Jane"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg
                             text-text placeholder:text-text-secondary/50
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                             transition-all duration-fast ease-theme font-body text-sm"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-text mb-1.5">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Doe"
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg
                             text-text placeholder:text-text-secondary/50
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                             transition-all duration-fast ease-theme font-body text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">
                Create password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-2.5 pr-10 bg-surface border border-border rounded-lg
                             text-text placeholder:text-text-secondary/50
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                             transition-all duration-fast ease-theme font-body text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary
                             hover:text-text transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-text-inverse rounded-lg font-semibold text-sm
                         hover:bg-primary-hover press-effect
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors duration-fast ease-theme"
            >
              {loading ? 'Creating account...' : 'Create account & sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
