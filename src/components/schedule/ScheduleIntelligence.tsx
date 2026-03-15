import { useMemo } from 'react';
import { AlertTriangle, Clock, Users, Lightbulb } from 'lucide-react';
import { useWeeklyOvertime } from '../../hooks/api/useOvertime';
import type { ShiftResponse } from '../../hooks/api/useShifts';
import { shiftDurationHours } from '../../utils/date';

interface ScheduleIntelligenceProps {
  locationId: string;
  weekStart: string;
  shifts: ShiftResponse[];
  scheduleStatus: 'draft' | 'published' | null;
}

export function ScheduleIntelligence({
  locationId,
  weekStart,
  shifts,
  scheduleStatus,
}: ScheduleIntelligenceProps) {
  const { data: overtimeData } = useWeeklyOvertime(locationId, weekStart);

  // Calculate labor metrics from shifts
  const laborMetrics = useMemo(() => {
    let totalHours = 0;
    let assignedSlots = 0;
    let totalSlots = 0;

    for (const shift of shifts) {
      const hours = shiftDurationHours(shift.start_time, shift.end_time);
      const assigned = shift.assignments.filter((a) => a.status === 'assigned').length;
      totalHours += hours * assigned;
      assignedSlots += assigned;
      totalSlots += shift.headcount_needed;
    }

    return { totalHours, assignedSlots, totalSlots };
  }, [shifts]);

  // Find violations from overtime data
  const violations = useMemo(() => {
    if (!overtimeData) return [];
    const items: { name: string; message: string; severity: 'warning' | 'error' }[] = [];

    for (const entry of overtimeData) {
      if (entry.status === 'overtime') {
        items.push({
          name: `${entry.first_name} ${entry.last_name}`,
          message: `${entry.total_hours.toFixed(1)}h (${entry.overtime_hours.toFixed(1)}h overtime)`,
          severity: 'error',
        });
      } else if (entry.status === 'warning') {
        items.push({
          name: `${entry.first_name} ${entry.last_name}`,
          message: `${entry.total_hours.toFixed(1)}h (approaching limit)`,
          severity: 'warning',
        });
      }
    }

    // Check understaffed shifts
    for (const shift of shifts) {
      const assigned = shift.assignments.filter((a) => a.status === 'assigned').length;
      if (assigned < shift.headcount_needed) {
        const gap = shift.headcount_needed - assigned;
        items.push({
          name: `${shift.skill_name ?? 'Shift'}`,
          message: `Understaffed by ${gap} (${assigned}/${shift.headcount_needed})`,
          severity: 'warning',
        });
      }
    }

    return items;
  }, [overtimeData, shifts]);

  // Generate suggestions
  const suggestions = useMemo(() => {
    const tips: string[] = [];

    const overtimeStaff = overtimeData?.filter((e) => e.status === 'overtime') ?? [];
    const normalStaff = overtimeData?.filter((e) => e.status === 'normal' && e.total_hours < 30) ?? [];

    if (overtimeStaff.length > 0 && normalStaff.length > 0) {
      tips.push(
        `Consider redistributing shifts from ${overtimeStaff[0].first_name} to ${normalStaff[0].first_name} (${normalStaff[0].total_hours.toFixed(0)}h scheduled) to reduce overtime.`,
      );
    }

    if (scheduleStatus === 'draft') {
      tips.push('Review constraint violations before publishing this schedule.');
    }

    const fillRate = laborMetrics.totalSlots > 0
      ? (laborMetrics.assignedSlots / laborMetrics.totalSlots) * 100
      : 0;
    if (fillRate < 80 && laborMetrics.totalSlots > 0) {
      tips.push(
        `Coverage is at ${fillRate.toFixed(0)}%. Consider assigning more staff before publishing.`,
      );
    }

    return tips;
  }, [overtimeData, laborMetrics, scheduleStatus]);

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b border-border pb-2">
        Schedule Intelligence
      </h3>

      {/* Labor Cost / Hours Summary */}
      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
        <div className="flex items-center gap-2 mb-2">
          <Clock size={12} className="text-text-secondary" />
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
            Weekly Labor Hours
          </p>
        </div>
        <p className="text-2xl font-extrabold text-primary">
          {laborMetrics.totalHours.toFixed(0)}h
        </p>
        <div className="w-full bg-primary/10 h-1 mt-2 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-500"
            style={{
              width: `${Math.min((laborMetrics.assignedSlots / Math.max(laborMetrics.totalSlots, 1)) * 100, 100)}%`,
            }}
          />
        </div>
        <p className="text-[10px] text-text-secondary mt-1">
          {laborMetrics.assignedSlots}/{laborMetrics.totalSlots} slots filled
        </p>
      </div>

      {/* Constraint Violations */}
      <div className={`rounded-lg p-4 border ${
        violations.length > 0
          ? 'bg-warning/5 border-warning/20'
          : 'bg-success/5 border-success/20'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={12} className={violations.length > 0 ? 'text-warning' : 'text-success'} />
          <p className={`text-[10px] font-bold uppercase tracking-wider ${
            violations.length > 0 ? 'text-warning' : 'text-success'
          }`}>
            {violations.length > 0
              ? `${violations.length} Issue${violations.length !== 1 ? 's' : ''} Found`
              : 'No Issues'}
          </p>
        </div>

        {violations.length > 0 && (
          <ul className="mt-2 space-y-2">
            {violations.slice(0, 5).map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-text">
                <span className={`mt-0.5 shrink-0 ${v.severity === 'error' ? 'text-error' : 'text-warning'}`}>
                  <AlertTriangle size={12} />
                </span>
                <span>
                  <span className="font-bold">{v.name}:</span> {v.message}
                </span>
              </li>
            ))}
            {violations.length > 5 && (
              <li className="text-[10px] text-text-secondary">
                +{violations.length - 5} more issues
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Manager Assistant / Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-4 bg-surface-alt rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={12} className="text-primary" />
            <p className="text-xs font-bold text-text">Suggestions</p>
          </div>
          <div className="space-y-2">
            {suggestions.map((tip, i) => (
              <p key={i} className="text-[11px] text-text-secondary leading-relaxed">
                {tip}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
