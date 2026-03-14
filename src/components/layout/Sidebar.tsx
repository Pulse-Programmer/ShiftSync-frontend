import { NavLink } from 'react-router-dom';
import {
  Calendar,
  Users,
  ArrowLeftRight,
  Clock,
  BarChart3,
  FileText,
  Mail,
  Settings,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../api/types';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Calendar;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { to: '/schedule', label: 'Schedule', icon: Calendar, roles: ['admin', 'manager', 'staff'] },
  { to: '/staff', label: 'Staff', icon: Users, roles: ['admin', 'manager'] },
  { to: '/swaps', label: 'Swaps', icon: ArrowLeftRight, roles: ['admin', 'manager', 'staff'] },
  { to: '/overtime', label: 'Overtime', icon: Clock, roles: ['admin', 'manager'] },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'manager'] },
  { to: '/on-duty', label: 'On Duty', icon: MapPin, roles: ['admin', 'manager'] },
  { to: '/invitations', label: 'Invitations', icon: Mail, roles: ['admin', 'manager'] },
  { to: '/audit', label: 'Audit Log', icon: FileText, roles: ['admin'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'manager', 'staff'] },
];

export function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const filtered = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="hidden md:flex md:w-56 lg:w-60 flex-col bg-surface-alt border-r border-border shrink-0">
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {filtered.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
               transition-colors duration-fast ease-theme
               ${isActive
                 ? 'bg-primary/10 text-primary'
                 : 'text-text-secondary hover:text-text hover:bg-surface-hover'
               }`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-text truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-text-secondary capitalize">{user.role}</p>
        </div>
      </div>
    </aside>
  );
}

/** Mobile bottom tab bar — visible on small screens */
export function MobileNav() {
  const { user } = useAuth();
  if (!user) return null;

  const mobileItems: NavItem[] = user.role === 'staff'
    ? [
        { to: '/schedule', label: 'Schedule', icon: Calendar, roles: ['staff'] },
        { to: '/swaps', label: 'Swaps', icon: ArrowLeftRight, roles: ['staff'] },
        { to: '/settings', label: 'Settings', icon: Settings, roles: ['staff'] },
      ]
    : [
        { to: '/schedule', label: 'Schedule', icon: Calendar, roles: ['admin', 'manager'] },
        { to: '/staff', label: 'Staff', icon: Users, roles: ['admin', 'manager'] },
        { to: '/swaps', label: 'Swaps', icon: ArrowLeftRight, roles: ['admin', 'manager'] },
        { to: '/settings', label: 'More', icon: Settings, roles: ['admin', 'manager'] },
      ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-border
                    flex items-center justify-around py-1 safe-bottom">
      {mobileItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium
             transition-colors duration-fast
             ${isActive ? 'text-primary' : 'text-text-secondary'}`
          }
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
