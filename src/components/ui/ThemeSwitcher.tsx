import { useState, useRef, useEffect } from 'react';
import { Palette, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export function ThemeSwitcher() {
  const { theme, themes, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface
                   border border-border text-text-secondary
                   hover:bg-surface-hover hover:text-text
                   transition-all duration-normal ease-theme"
        aria-label="Switch theme"
      >
        <Palette size={16} />
        <span className="text-sm font-medium hidden sm:inline">{theme.name}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-fast ease-theme ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 py-2
                     bg-surface border border-border rounded-xl shadow-lg
                     z-50 animate-in"
        >
          <p className="px-4 py-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Appearance
          </p>
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3
                         hover:bg-surface-hover transition-colors duration-fast ease-theme
                         ${t.id === theme.id ? 'text-primary' : 'text-text'}`}
            >
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: t.tokens.colors.background,
                  borderColor: t.tokens.colors.primary,
                }}
              >
                {t.id === theme.id && (
                  <Check size={10} style={{ color: t.tokens.colors.primary }} />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-text-secondary">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
