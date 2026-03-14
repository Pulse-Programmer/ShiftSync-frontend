import { ThemeProvider } from './themes/ThemeProvider';
import { ThemeSwitcher } from './components/ui/ThemeSwitcher';
import { useTheme } from './hooks/useTheme';
import { Clock, Users, ArrowLeftRight, BarChart3 } from 'lucide-react';

function ThemeShowcase() {
  const { theme } = useTheme();

  const colorSwatches = [
    { label: 'Primary', cls: 'bg-primary' },
    { label: 'Success', cls: 'bg-success' },
    { label: 'Warning', cls: 'bg-warning' },
    { label: 'Error', cls: 'bg-error' },
  ];

  const featureCards = [
    { icon: Clock, title: 'Shift Scheduling', desc: 'Multi-location week view with constraint validation' },
    { icon: Users, title: 'Staff Management', desc: 'Skills, certifications, and availability' },
    { icon: ArrowLeftRight, title: 'Swap Requests', desc: 'Shift swaps and drop coverage workflows' },
    { icon: BarChart3, title: 'Analytics', desc: 'Fairness scoring and overtime tracking' },
  ];

  return (
    <div className="min-h-screen bg-bg text-text font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Clock size={16} className="text-text-inverse" />
            </div>
            <h1 className="text-lg font-display font-bold text-text tracking-tight">
              ShiftSync
            </h1>
          </div>
          <ThemeSwitcher />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero */}
        <section className="mb-12 sm:mb-16 animate-stagger">
          <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-2">
            Theme Engine Active
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-text leading-tight mb-4">
            {theme.name}
          </h2>
          <p className="text-text-secondary text-base sm:text-lg max-w-2xl">
            {theme.description}. Switch themes above to see design tokens
            update across all components in real time.
          </p>
        </section>

        {/* Color Palette */}
        <section className="mb-12 sm:mb-16">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Color Tokens
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-stagger">
            {colorSwatches.map((s) => (
              <div key={s.label} className="group">
                <div
                  className={`${s.cls} h-16 sm:h-20 rounded-xl shadow card-hover`}
                />
                <p className="mt-2 text-xs font-medium text-text-secondary">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="group">
              <div className="bg-accent-1 h-10 rounded-lg" />
              <p className="mt-1 text-xs text-text-secondary">Accent 1</p>
            </div>
            <div className="group">
              <div className="bg-accent-2 h-10 rounded-lg" />
              <p className="mt-1 text-xs text-text-secondary">Accent 2</p>
            </div>
            <div className="group">
              <div className="bg-accent-3 h-10 rounded-lg" />
              <p className="mt-1 text-xs text-text-secondary">Accent 3</p>
            </div>
            <div className="group">
              <div className="bg-accent-4 h-10 rounded-lg" />
              <p className="mt-1 text-xs text-text-secondary">Accent 4</p>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="mb-12 sm:mb-16">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Component Preview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-stagger">
            {featureCards.map((card) => (
              <div
                key={card.title}
                className="p-5 bg-surface rounded-xl border border-border card-hover"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <card.icon size={20} className="text-primary" />
                </div>
                <h4 className="font-display font-semibold text-text mb-1">{card.title}</h4>
                <p className="text-sm text-text-secondary leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Typography & Surface Demo */}
        <section className="mb-12 sm:mb-16">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Surfaces & Typography
          </h3>
          <div className="p-6 bg-surface rounded-xl border border-border space-y-6">
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-primary text-text-inverse rounded-lg font-medium text-sm press-effect hover:bg-primary-hover transition-colors duration-fast">
                Primary Action
              </button>
              <button className="px-4 py-2 bg-surface-alt text-text rounded-lg font-medium text-sm border border-border press-effect hover:bg-surface-hover transition-colors duration-fast">
                Secondary
              </button>
              <button className="px-4 py-2 text-primary font-medium text-sm press-effect hover:bg-primary/10 rounded-lg transition-colors duration-fast">
                Text Button
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-success/15 text-success text-xs font-semibold rounded-full">
                Published
              </span>
              <span className="px-2.5 py-1 bg-warning/15 text-warning text-xs font-semibold rounded-full">
                Draft
              </span>
              <span className="px-2.5 py-1 bg-error/15 text-error text-xs font-semibold rounded-full">
                Overtime
              </span>
              <span className="px-2.5 py-1 bg-info/15 text-info text-xs font-semibold rounded-full">
                Pending
              </span>
            </div>

            <div className="p-4 bg-surface-alt rounded-lg border border-border-light">
              <p className="font-display text-text font-semibold text-base mb-1">
                Nested surface — alt background
              </p>
              <p className="text-sm text-text-secondary">
                The <code className="font-mono text-xs bg-bg px-1.5 py-0.5 rounded">surface-alt</code> token
                provides depth for nested panels and sidebars.
              </p>
            </div>
          </div>
        </section>

        {/* Motion Demo */}
        <section className="mb-12 sm:mb-16">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Motion & Interaction
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-stagger">
            <div className="p-5 bg-surface rounded-xl border border-border card-hover cursor-pointer">
              <p className="text-sm font-semibold text-text">Hover Lift</p>
              <p className="text-xs text-text-secondary mt-1">Cards elevate on hover with spring easing</p>
            </div>
            <button className="p-5 bg-surface rounded-xl border border-border press-effect text-left">
              <p className="text-sm font-semibold text-text">Press Scale</p>
              <p className="text-xs text-text-secondary mt-1">Click to see tactile press feedback</p>
            </button>
            <div className="p-5 bg-surface rounded-xl border border-border relative overflow-hidden">
              <p className="text-sm font-semibold text-text">Badge Pulse</p>
              <p className="text-xs text-text-secondary mt-1">Notification indicators breathe gently</p>
              <span className="absolute top-3 right-3 w-3 h-3 bg-error rounded-full animate-badge" />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-border">
          <p className="text-xs text-text-secondary">
            ShiftSync Theme Engine — Phase F1 Complete
          </p>
        </footer>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemeShowcase />
    </ThemeProvider>
  );
}

export default App;
