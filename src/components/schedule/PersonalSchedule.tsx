import { useMemo } from 'react';
import { useUserSchedule } from '../../hooks/api/useShifts';
import { useAuth } from '../../hooks/useAuth';
import { formatInTimezone, shiftDurationHours, getWeekStart, getWeekDays } from '../../utils/date';
import { DateTime } from 'luxon';
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface PersonalScheduleProps {
  weekStart: string;
  onWeekChange: (weekStart: string) => void;
}

export function PersonalSchedule({ weekStart, onWeekChange }: PersonalScheduleProps) {
  const { user } = useAuth();
  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const endDate = days[6].plus({ days: 1 }).toISODate()!;

  const { data: shifts, isLoading } = useUserSchedule(
    user?.id ?? null,
    weekStart,
    endDate,
  );

  const today = DateTime.now().toISODate();

  // Group by date
  const shiftsByDate = useMemo(() => {
    const map: Record<string, typeof shifts> = {};
    if (!shifts) return map;
    for (const shift of shifts) {
      // Use the shift's own timezone
      const tz = (shift as unknown as { location_timezone?: string }).location_timezone
        ?? (shift as unknown as { timezone?: string }).timezone
        ?? 'UTC';
      const date = DateTime.fromISO(shift.start_time, { zone: 'utc' })
        .setZone(tz)
        .toISODate()!;
      if (!map[date]) map[date] = [];
      map[date]!.push(shift);
    }
    return map;
  }, [shifts]);

  const weekLabel = `${days[0].toFormat('MMM d')} – ${days[6].toFormat('MMM d, yyyy')}`;
  const isCurrentWeek = weekStart === getWeekStart();

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onWeekChange(days[0].minus({ weeks: 1 }).toISODate()!)}
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-text-secondary"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-text">{weekLabel}</p>
          {isCurrentWeek && (
            <p className="text-xs text-primary">This week</p>
          )}
        </div>
        <button
          onClick={() => onWeekChange(days[0].plus({ weeks: 1 }).toISODate()!)}
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors text-text-secondary"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Day list — mobile optimized */}
      {!isLoading && (
        <div className="space-y-3 animate-stagger">
          {days.map((day) => {
            const dateStr = day.toISODate()!;
            const dayShifts = shiftsByDate[dateStr] ?? [];
            const isToday = dateStr === today;
            const isPast = dateStr < (today ?? '');

            return (
              <div
                key={dateStr}
                className={`rounded-xl border overflow-hidden
                           ${isToday ? 'border-primary/40' : 'border-border'}
                           ${isPast ? 'opacity-60' : ''}`}
              >
                {/* Day header */}
                <div className={`px-4 py-2 flex items-center justify-between
                                ${isToday ? 'bg-primary/10' : 'bg-surface-alt'}`}>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold
                                  ${isToday ? 'text-primary' : 'text-text'}`}>
                      {day.toFormat('EEEE')}
                    </p>
                    <p className="text-xs text-text-secondary">{day.toFormat('MMM d')}</p>
                  </div>
                  {isToday && (
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </div>

                {/* Shifts */}
                {dayShifts.length === 0 ? (
                  <div className="px-4 py-6 bg-surface text-center">
                    <p className="text-xs text-text-secondary/60">Day off</p>
                  </div>
                ) : (
                  <div className="bg-surface divide-y divide-border">
                    {dayShifts.map((shift) => {
                      const tz = (shift as unknown as { location_timezone?: string }).location_timezone
                        ?? (shift as unknown as { timezone?: string }).timezone
                        ?? 'UTC';
                      return (
                        <div key={shift.id} className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-primary" />
                              <span className="text-sm font-semibold text-text">
                                {formatInTimezone(shift.start_time, tz)} – {formatInTimezone(shift.end_time, tz)}
                              </span>
                            </div>
                            <span className="text-xs text-text-secondary">
                              {shiftDurationHours(shift.start_time, shift.end_time).toFixed(1)}h
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-text-secondary">
                            {(shift as unknown as { location_name?: string }).location_name && (
                              <span className="flex items-center gap-1">
                                <MapPin size={10} />
                                {(shift as unknown as { location_name?: string }).location_name}
                              </span>
                            )}
                            {shift.skill_name && (
                              <span className="flex items-center gap-1">
                                <Calendar size={10} />
                                <span className="capitalize">{shift.skill_name}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Weekly summary */}
      {shifts && shifts.length > 0 && (
        <div className="p-4 bg-surface-alt rounded-xl border border-border-light">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
            Week Total
          </p>
          <p className="text-2xl font-display font-bold text-text">
            {shifts.reduce((sum, s) => sum + shiftDurationHours(s.start_time, s.end_time), 0).toFixed(1)}
            <span className="text-sm font-normal text-text-secondary ml-1">hours</span>
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            {shifts.length} shift{shifts.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
