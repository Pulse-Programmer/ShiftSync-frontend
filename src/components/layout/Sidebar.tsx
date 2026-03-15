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
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../api/types';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Calendar;
  roles: UserRole[];
}

const managerNavItems: NavItem[] = [
  { to: '/schedule', label: 'Schedule', icon: Calendar, roles: ['manager'] },
  { to: '/staff', label: 'Staff', icon: Users, roles: ['manager'] },
  { to: '/swaps', label: 'Swaps', icon: ArrowLeftRight, roles: ['manager'] },
  { to: '/overtime', label: 'Overtime', icon: Clock, roles: ['manager'] },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['manager'] },
  { to: '/on-duty', label: 'On Duty', icon: MapPin, roles: ['manager'] },
  { to: '/invitations', label: 'Invitations', icon: Mail, roles: ['manager'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['manager'] },
];

const staffNavItems: NavItem[] = [
  { to: '/schedule', label: 'My Shifts', icon: Calendar, roles: ['staff'] },
  { to: '/swaps', label: 'Swaps', icon: ArrowLeftRight, roles: ['staff'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['staff'] },
];

export function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  // Admin uses top nav — no sidebar
  if (user.role === 'admin') return null;

  const items = user.role === 'staff' ? staffNavItems : managerNavItems;

  return (
    <aside className="hidden md:flex md:w-56 lg:w-60 flex-col bg-surface-alt border-r border-border shrink-0" aria-label="Main navigation">
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto" role="navigation">
        {items.map((item) => (
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
        { to: '/schedule', label: 'Shifts', icon: Calendar, roles: ['staff'] },
        { to: '/swaps', label: 'Swaps', icon: ArrowLeftRight, roles: ['staff'] },
        { to: '/settings', label: 'Settings', icon: Settings, roles: ['staff'] },
      ]
    : user.role === 'admin'
    ? [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
        { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin'] },
        { to: '/overtime', label: 'Compliance', icon: Clock, roles: ['admin'] },
        { to: '/audit', label: 'Audit', icon: FileText, roles: ['admin'] },
      ]
    : [
        { to: '/schedule', label: 'Schedule', icon: Calendar, roles: ['manager'] },
        { to: '/staff', label: 'Staff', icon: Users, roles: ['manager'] },
        { to: '/swaps', label: 'Swaps', icon: ArrowLeftRight, roles: ['manager'] },
        { to: '/settings', label: 'More', icon: Settings, roles: ['manager'] },
      ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-border
                    flex items-center justify-around py-1 safe-bottom"
         role="navigation" aria-label="Mobile navigation">
      {mobileItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
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
