import { useState, useEffect } from 'react';
import { Bell, LogOut, Clock, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import type { Location } from '../../api/types';
import { api } from '../../api/client';

interface HeaderProps {
  selectedLocationId: string | null;
  onLocationChange: (id: string) => void;
}

export function Header({ selectedLocationId, onLocationChange }: HeaderProps) {
  const { user, locations, logout } = useAuth();
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      api.get<Location[]>('/locations').then(setAllLocations).catch(() => {});
    }
  }, [user?.role]);

  const displayLocations = user?.role === 'admin'
    ? allLocations
    : (locations ?? []);

  // Auto-select first location
  useEffect(() => {
    if (!selectedLocationId && displayLocations.length > 0) {
      onLocationChange(displayLocations[0].id);
    }
  }, [selectedLocationId, displayLocations, onLocationChange]);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 sm:px-5 h-14">
        {/* Left: Logo (mobile) + location selector */}
        <div className="flex items-center gap-3">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Clock size={14} className="text-text-inverse" />
            </div>
          </div>

          {/* Location selector — managers/admins who manage schedules */}
          {user.role !== 'staff' && displayLocations.length > 0 && (
            <div className="relative">
              <select
                value={selectedLocationId ?? ''}
                onChange={(e) => onLocationChange(e.target.value)}
                className="appearance-none bg-transparent pr-7 pl-2 py-1.5
                           text-sm font-semibold text-text
                           border border-transparent rounded-lg
                           hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary/20
                           cursor-pointer transition-colors duration-fast"
              >
                {displayLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            </div>
          )}

          {/* Staff sees their name */}
          {user.role === 'staff' && (
            <span className="text-sm font-semibold text-text">
              My Schedule
            </span>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />

          <button
            className="relative p-2 rounded-lg text-text-secondary hover:text-text
                       hover:bg-surface-hover transition-colors duration-fast"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg
                         hover:bg-surface-hover transition-colors duration-fast"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <ChevronDown size={14} className="text-text-secondary hidden sm:block" />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 py-1 bg-surface border border-border
                                rounded-xl shadow-lg z-50 animate-in">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-text truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-text-secondary">{user.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error
                               hover:bg-surface-hover transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
