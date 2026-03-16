import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Clock, Eye, EyeOff, AlertCircle, BookOpen, Github } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher';
import { ApiError } from '../api/client';

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Already logged in — redirect
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';
  if (user) {
    navigate(from, { replace: true });
    return null;
  }
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
      return;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(typeof err.data === 'object' && err.data !== null && 'error' in err.data
          ? String((err.data as Record<string, unknown>).error)
          : 'Invalid email or password');
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

      {/* Login form — centered */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm animate-stagger">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-text mb-2">
              Welcome back
            </h1>
            <p className="text-text-secondary text-sm">
              Sign in to manage your schedules
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-error/10 border border-error/20 rounded-lg">
                <AlertCircle size={16} className="text-error shrink-0 mt-0.5" />
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-lg
                           text-text placeholder:text-text-secondary/50
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                           transition-all duration-fast ease-theme font-body text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-text-secondary mb-3">Quick access (demo)</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Admin', email: 'admin@coastaleats.com', pw: 'CoastalAdmin@2026' },
                { label: 'Manager', email: 'manager.downtown@coastaleats.com', pw: 'CoastalMgr@2026' },
                { label: 'Staff', email: 'sarah.johnson@coastaleats.com', pw: 'CoastalStaff@2026' },
                { label: 'Multi-loc', email: 'mike.chen@coastaleats.com', pw: 'CoastalStaff@2026' },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => { setEmail(d.email); setPassword(d.pw); }}
                  className="px-3 py-2 text-xs font-medium text-text-secondary bg-surface-alt
                             border border-border-light rounded-lg
                             hover:bg-surface-hover hover:text-text
                             transition-colors duration-fast press-effect text-left"
                >
                  <span className="block font-semibold text-text">{d.label}</span>
                  <span className="truncate block">{d.email.split('@')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              to="/docs"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover transition-colors font-medium"
            >
              <BookOpen size={14} />
              Documentation
            </Link>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Pulse-Programmer/ShiftSync-backend"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text transition-colors"
              >
                <Github size={13} />
                Backend
              </a>
              <span className="text-border">|</span>
              <a
                href="https://github.com/Pulse-Programmer/ShiftSync-frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text transition-colors"
              >
                <Github size={13} />
                Frontend
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
