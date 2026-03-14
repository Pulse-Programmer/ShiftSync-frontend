import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { ShiftResponse } from '../../hooks/api/useShifts';
import { ShiftCard } from './ShiftCard';
import { getWeekDays, formatDate, getDateInTimezone } from '../../utils/date';
import { DateTime } from 'luxon';

interface WeekViewProps {
  weekStart: string;
  shifts: ShiftResponse[];
  timezone: string;
  isManager: boolean;
  onAddShift: (date: string) => void;
  onAssignShift: (shift: ShiftResponse) => void;
  onEditShift: (shift: ShiftResponse) => void;
  onDeleteShift: (shift: ShiftResponse) => void;
  onUnassign: (shiftId: string, userId: string) => void;
}

export function WeekView({
  weekStart,
  shifts,
  timezone,
  isManager,
  onAddShift,
  onAssignShift,
  onEditShift,
  onDeleteShift,
  onUnassign,
}: WeekViewProps) {
  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const today = DateTime.now().setZone(timezone).toISODate();

  // Group shifts by date (in location timezone)
  const shiftsByDate = useMemo(() => {
    const map: Record<string, ShiftResponse[]> = {};
    for (const day of days) {
      map[day.toISODate()!] = [];
    }
    for (const shift of shifts) {
      const date = getDateInTimezone(shift.start_time, timezone);
      if (map[date]) {
        map[date].push(shift);
      }
    }
    // Sort each day's shifts by start time
    for (const date of Object.keys(map)) {
      map[date].sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    return map;
  }, [shifts, days, timezone]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
      {days.map((day) => {
        const dateStr = day.toISODate()!;
        const dayShifts = shiftsByDate[dateStr] ?? [];
        const isToday = dateStr === today;

        return (
          <div
            key={dateStr}
            className={`min-h-[120px] rounded-xl border p-3 flex flex-col
                       ${isToday
                         ? 'border-primary/40 bg-primary/5'
                         : 'border-border bg-surface'
                       }`}
          >
            {/* Day header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider
                              ${isToday ? 'text-primary' : 'text-text-secondary'}`}>
                  {formatDate(day, 'EEE')}
                </p>
                <p className={`text-lg font-bold font-display
                              ${isToday ? 'text-primary' : 'text-text'}`}>
                  {day.day}
                </p>
              </div>
              {isManager && (
                <button
                  onClick={() => onAddShift(dateStr)}
                  className="p-1 rounded-lg text-text-secondary hover:text-primary
                             hover:bg-primary/10 transition-colors"
                  title="Add shift"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>

            {/* Shifts */}
            <div className="space-y-2 flex-1 animate-stagger">
              {dayShifts.map((shift) => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  timezone={timezone}
                  isManager={isManager}
                  onAssign={onAssignShift}
                  onEdit={onEditShift}
                  onDelete={onDeleteShift}
                  onUnassign={onUnassign}
                />
              ))}
            </div>

            {dayShifts.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-text-secondary/50">No shifts</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
