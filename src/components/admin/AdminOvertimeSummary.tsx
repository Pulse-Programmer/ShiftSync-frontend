import { useWeeklyOvertime } from '../../hooks/api/useOvertime';
import type { Location } from '../../api/types';
import { AlertTriangle, Clock } from 'lucide-react';

interface Props {
  locations: Location[];
  weekStart: string;
}

export function AdminOvertimeSummary({ locations, weekStart }: Props) {
  return (
    <div className="border border-border bg-surface p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-primary" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-text">
            Overtime Overview by Location
          </h3>
        </div>
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
          This Week
        </span>
      </div>

      <div className="space-y-4">
        {locations.map((loc) => (
          <LocationOvertimeRow key={loc.id} location={loc} weekStart={weekStart} />
        ))}
      </div>

      {locations.length === 0 && (
        <p className="text-sm text-text-secondary text-center py-8">No locations found.</p>
      )}
    </div>
  );
}

function LocationOvertimeRow({ location, weekStart }: { location: Location; weekStart: string }) {
  const { data, isLoading } = useWeeklyOvertime(location.id, weekStart);

  const totalHours = data?.reduce((sum, e) => sum + e.total_hours, 0) ?? 0;
  const overtimeStaff = data?.filter((e) => e.status === 'overtime').length ?? 0;
  const warningStaff = data?.filter((e) => e.status === 'warning').length ?? 0;
  const staffCount = data?.length ?? 0;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-text truncate">{location.name}</h4>
          <span className="text-[10px] text-text-secondary uppercase tracking-wider shrink-0">
            {location.timezone.split('/').pop()?.replace('_', ' ')}
          </span>
        </div>
        {isLoading ? (
          <p className="text-xs text-text-secondary mt-1">Loading...</p>
        ) : (
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-text-secondary">
              {staffCount} staff &middot; {Math.round(totalHours)}h total
            </span>
            {overtimeStaff > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-error">
                <AlertTriangle size={10} />
                {overtimeStaff} overtime
              </span>
            )}
            {warningStaff > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-warning">
                <Clock size={10} />
                {warningStaff} near limit
              </span>
            )}
            {overtimeStaff === 0 && warningStaff === 0 && staffCount > 0 && (
              <span className="text-xs font-bold text-success">All clear</span>
            )}
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-lg font-extrabold text-text">{Math.round(totalHours)}h</p>
        <p className="text-[10px] text-text-secondary uppercase">Total</p>
      </div>
    </div>
  );
}
