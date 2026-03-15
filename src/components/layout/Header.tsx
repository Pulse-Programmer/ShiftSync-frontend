import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, Clock, ChevronDown, LayoutDashboard, BarChart3, FileText, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { NotificationBell } from '../notifications/NotificationBell';
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

  // Auto-select first location, or reset if stored ID is no longer valid
  useEffect(() => {
    if (displayLocations.length === 0) return;
    if (!selectedLocationId || !displayLocations.some((l) => l.id === selectedLocationId)) {
      onLocationChange(displayLocations[0].id);
    }
  }, [selectedLocationId, displayLocations, onLocationChange]);

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 sm:px-6 h-14">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Clock size={14} className="text-text-inverse" />
            </div>
            <h1 className="text-sm font-extrabold tracking-tight text-text hidden sm:block">
              ShiftSync
              {isAdmin && (
                <span className="font-normal text-text-secondary ml-1">Corporate</span>
              )}
            </h1>
          </div>

          {/* Admin top nav */}
          {isAdmin && (
            <nav className="hidden md:flex items-center gap-1">
              {[
                { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
                { to: '/analytics', label: 'Analytics', icon: BarChart3 },
                { to: '/overtime', label: 'Compliance', icon: Shield },
                { to: '/audit', label: 'Audit Log', icon: FileText },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                     uppercase tracking-wider transition-colors
                     ${isActive
                       ? 'text-primary bg-primary/10'
                       : 'text-text-secondary hover:text-text hover:bg-surface-hover'
                     }`
                  }
                >
                  <item.icon size={14} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Manager/Staff: location selector */}
          {!isAdmin && user.role !== 'staff' && displayLocations.length > 0 && (
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

          {/* Staff label */}
          {user.role === 'staff' && (
            <span className="text-sm font-semibold text-text">
              My Schedule
            </span>
          )}
        </div>

        {/* Right: Admin location selector + actions */}
        <div className="flex items-center gap-2">
          {/* Admin: location selector in header (for pages that need it) */}
          {isAdmin && displayLocations.length > 0 && (
            <div className="relative hidden lg:block">
              <select
                value={selectedLocationId ?? ''}
                onChange={(e) => onLocationChange(e.target.value)}
                className="appearance-none bg-surface-hover pr-7 pl-3 py-1.5
                           text-xs font-medium text-text
                           border border-border rounded-lg
                           hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary/20
                           cursor-pointer transition-colors duration-fast"
              >
                {displayLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            </div>
          )}

          <ThemeSwitcher />

          <NotificationBell />

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
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5">
                      {user.role}
                    </p>
                  </div>

                  {/* Admin-specific quick links */}
                  {isAdmin && (
                    <div className="border-b border-border py-1">
                      <NavLink
                        to="/schedule"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary
                                   hover:bg-surface-hover transition-colors"
                      >
                        Schedule
                      </NavLink>
                      <NavLink
                        to="/staff"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary
                                   hover:bg-surface-hover transition-colors"
                      >
                        Staff Directory
                      </NavLink>
                      <NavLink
                        to="/on-duty"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary
                                   hover:bg-surface-hover transition-colors"
                      >
                        On Duty Now
                      </NavLink>
                      <NavLink
                        to="/invitations"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary
                                   hover:bg-surface-hover transition-colors"
                      >
                        Invitations
                      </NavLink>
                      <NavLink
                        to="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary
                                   hover:bg-surface-hover transition-colors"
                      >
                        Settings
                      </NavLink>
                    </div>
                  )}

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
