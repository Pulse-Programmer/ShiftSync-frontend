import { useMemo } from 'react';
import {
  Users,
  TrendingUp,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';
import { useLocations } from '../hooks/api/useLocations';
import { useUsers } from '../hooks/api/useUsers';
import { useSwapRequests } from '../hooks/api/useSwaps';
import { getWeekStart } from '../utils/date';
import { DateTime } from 'luxon';
import { AdminOvertimeSummary } from '../components/admin/AdminOvertimeSummary';
import { AdminFairnessGrid } from '../components/admin/AdminFairnessGrid';
import { AdminAlerts } from '../components/admin/AdminAlerts';

export function AdminDashboardPage() {
  const { data: locations } = useLocations();
  const { data: users } = useUsers();
  const { data: pendingSwaps } = useSwapRequests({ status: 'pending_manager' });

  const weekStart = useMemo(() => getWeekStart(), []);
  const weekLabel = useMemo(() => {
    const start = DateTime.fromISO(weekStart);
    return `${start.toFormat('MMM d')} - ${start.plus({ days: 6 }).toFormat('MMM d, yyyy')}`;
  }, [weekStart]);

  const stats = useMemo(() => {
    const activeStaff = users?.filter((u) => u.is_active && u.role === 'staff').length ?? 0;
    const totalUsers = users?.filter((u) => u.is_active).length ?? 0;
    const locationCount = locations?.length ?? 0;
    const pendingApprovals = pendingSwaps?.length ?? 0;

    return { activeStaff, totalUsers, locationCount, pendingApprovals };
  }, [users, locations, pendingSwaps]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-bold text-primary uppercase tracking-[0.3em] mb-2">
            System Status: Operational
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-text">
            Global Oversight
          </h1>
          <p className="text-text-secondary mt-2 font-medium text-sm">
            Monitoring {stats.locationCount} active locations. Week of {weekLabel}.
          </p>
        </div>
        <div className="flex gap-1">
          <div className="bg-primary text-text-inverse p-4 flex flex-col justify-between w-28 h-28">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Locations</span>
            <span className="text-3xl font-extrabold leading-none">
              {String(stats.locationCount).padStart(2, '0')}
            </span>
          </div>
          <div className="bg-surface border border-border p-4 flex flex-col justify-between w-28 h-28">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Pending</span>
            <span className={`text-3xl font-extrabold leading-none ${stats.pendingApprovals > 0 ? 'text-warning' : 'text-text'}`}>
              {String(stats.pendingApprovals).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border mb-8">
        <KpiCard
          icon={Users}
          label="Total Workforce"
          value={stats.totalUsers.toLocaleString()}
          sub={`${stats.activeStaff} active staff`}
        />
        <KpiCard
          icon={TrendingUp}
          label="Avg. Fairness Index"
          value="—"
          sub="Per-location below"
        />
        <KpiCard
          icon={ShieldCheck}
          label="Labor Compliance"
          value="—"
          sub="Constraint checks active"
        />
        <KpiCard
          icon={DollarSign}
          label="Net Overtime Cost"
          value="—"
          sub="Per-location below"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Alerts + Overtime */}
        <div className="lg:col-span-8 space-y-6">
          <AdminAlerts
            pendingApprovals={stats.pendingApprovals}
            locations={locations ?? []}
          />
          <AdminOvertimeSummary
            locations={locations ?? []}
            weekStart={weekStart}
          />
        </div>

        {/* Right: Fairness per location */}
        <div className="lg:col-span-4">
          <AdminFairnessGrid
            locations={locations ?? []}
            weekStart={weekStart}
          />
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  sub: string;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="bg-surface p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={14} className="text-text-secondary" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{label}</p>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-text">{value}</span>
        {trend && (
          <span className={`text-xs font-bold ${trend.positive ? 'text-success' : 'text-error'}`}>
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-[10px] text-text-secondary mt-2 uppercase">{sub}</p>
    </div>
  );
}
