import { AlertTriangle, Clock, TrendingUp, User } from 'lucide-react';
import type { WeeklyOvertimeEntry } from '../../hooks/api/useOvertime';

interface OvertimeTableProps {
  data: WeeklyOvertimeEntry[];
  onSelectUser: (userId: string) => void;
}

const statusColors: Record<string, string> = {
  normal: 'text-success',
  warning: 'text-warning',
  overtime: 'text-error',
};

const statusBg: Record<string, string> = {
  normal: 'bg-success/10',
  warning: 'bg-warning/10',
  overtime: 'bg-error/10',
};

export function OvertimeTable({ data, onSelectUser }: OvertimeTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock size={32} className="text-text-secondary/30 mx-auto mb-3" />
        <p className="text-sm text-text-secondary">No staff data for this week</p>
      </div>
    );
  }

  const overtimeCount = data.filter((d) => d.status === 'overtime').length;
  const warningCount = data.filter((d) => d.status === 'warning').length;
  const totalOvertimeHours = data.reduce((sum, d) => sum + d.overtime_hours, 0);

  return (
    <div>
      {/* Summary bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg border border-border">
          <User size={12} className="text-text-secondary" />
          <span className="text-xs text-text-secondary">{data.length} staff</span>
        </div>
        {overtimeCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-error/10 rounded-lg border border-error/20">
            <AlertTriangle size={12} className="text-error" />
            <span className="text-xs text-error font-semibold">
              {overtimeCount} in overtime ({totalOvertimeHours.toFixed(1)}h OT)
            </span>
          </div>
        )}
        {warningCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-warning/10 rounded-lg border border-warning/20">
            <TrendingUp size={12} className="text-warning" />
            <span className="text-xs text-warning font-semibold">
              {warningCount} approaching 40h
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-alt border-b border-border">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Staff
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Hours
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider hidden sm:table-cell">
                Days
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider hidden sm:table-cell">
                OT Hours
              </th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((entry) => (
              <tr
                key={entry.id}
                onClick={() => onSelectUser(entry.id)}
                className="bg-surface hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <div>
                    <span className="font-medium text-text">
                      {entry.first_name} {entry.last_name}
                    </span>
                    {entry.desired_weekly_hours && (
                      <span className="text-xs text-text-secondary ml-1.5">
                        (wants {entry.desired_weekly_hours}h)
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-semibold ${statusColors[entry.status]}`}>
                    {entry.total_hours.toFixed(1)}h
                  </span>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className={`text-text-secondary ${entry.days_worked >= 6 ? 'text-warning font-semibold' : ''}`}>
                    {entry.days_worked}
                    {entry.days_worked >= 6 && (
                      <span className="text-warning ml-1" title="6+ consecutive days">!</span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  {entry.overtime_hours > 0 ? (
                    <span className="text-error font-semibold">+{entry.overtime_hours.toFixed(1)}h</span>
                  ) : (
                    <span className="text-text-secondary">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusBg[entry.status]} ${statusColors[entry.status]}`}>
                    {entry.status === 'overtime' ? 'Overtime' : entry.status === 'warning' ? 'Warning' : 'OK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hours bar visualization (mobile-friendly) */}
      <div className="mt-4 space-y-2 sm:hidden">
        {data.map((entry) => (
          <div key={entry.id} onClick={() => onSelectUser(entry.id)} className="cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-text">
                {entry.first_name} {entry.last_name[0]}.
              </span>
              <span className={`text-xs font-semibold ${statusColors[entry.status]}`}>
                {entry.total_hours.toFixed(1)}h
              </span>
            </div>
            <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  entry.status === 'overtime' ? 'bg-error' :
                  entry.status === 'warning' ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${Math.min((entry.total_hours / 50) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
