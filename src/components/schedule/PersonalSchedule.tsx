import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserSchedule } from '../../hooks/api/useShifts';
import { useAuth } from '../../hooks/useAuth';
import { formatInTimezone, shiftDurationHours, getWeekStart, getWeekDays } from '../../utils/date';
import { DateTime } from 'luxon';
import { MapPin, Clock, ChevronLeft, ChevronRight, LogIn, ArrowLeftRight } from 'lucide-react';

interface PersonalScheduleProps {
  weekStart: string;
  onWeekChange: (weekStart: string) => void;
}

export function PersonalSchedule({ weekStart, onWeekChange }: PersonalScheduleProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const endDate = days[6].plus({ days: 1 }).toISODate()!;

  const { data: shifts, isLoading } = useUserSchedule(
    user?.id ?? null,
    weekStart,
    endDate,
  );

  const today = DateTime.now().toISODate();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Use today if within this week, otherwise first day
  const activeDate = selectedDate ?? (
    days.some((d) => d.toISODate() === today) ? today : days[0].toISODate()!
  );

  // Group by date
  const shiftsByDate = useMemo(() => {
    const map: Record<string, typeof shifts> = {};
    if (!shifts) return map;
    for (const shift of shifts) {
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

  const activeShifts = shiftsByDate[activeDate!] ?? [];
  const weekLabel = `${days[0].toFormat('MMM d')} – ${days[6].toFormat('MMM d')}`;
  const isCurrentWeek = weekStart === getWeekStart();

  const totalWeekHours = useMemo(() => {
    if (!shifts) return 0;
    return shifts.reduce((sum, s) => sum + shiftDurationHours(s.start_time, s.end_time), 0);
  }, [shifts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-text">
          Upcoming Shifts
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={() => onWeekChange(days[0].minus({ weeks: 1 }).toISODate()!)}
            className="p-1 rounded hover:bg-surface-hover transition-colors text-text-secondary"
          >
            <ChevronLeft size={16} />
          </button>
          <p className="text-primary font-medium text-sm">{weekLabel}</p>
          <button
            onClick={() => onWeekChange(days[0].plus({ weeks: 1 }).toISODate()!)}
            className="p-1 rounded hover:bg-surface-hover transition-colors text-text-secondary"
          >
            <ChevronRight size={16} />
          </button>
          {!isCurrentWeek && (
            <button
              onClick={() => { onWeekChange(getWeekStart()); setSelectedDate(null); }}
              className="text-xs font-medium text-primary border border-primary/20 px-2 py-0.5 rounded
                         hover:bg-primary/5 transition-colors"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Date Tabs */}
      <div className="flex border-b border-border overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {days.map((day) => {
          const dateStr = day.toISODate()!;
          const isActive = dateStr === activeDate;
          const isToday = dateStr === today;
          const hasShifts = (shiftsByDate[dateStr]?.length ?? 0) > 0;

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex flex-col items-center justify-center pb-3 pt-2 px-3 sm:px-4
                         whitespace-nowrap border-b-2 transition-colors min-w-0
                         ${isActive
                           ? 'border-primary text-primary'
                           : 'border-transparent text-text-secondary hover:text-text'
                         }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {isToday ? 'Today' : day.toFormat('EEE')}
              </span>
              <span className="text-base font-extrabold">{day.toFormat('d MMM')}</span>
              {hasShifts && !isActive && (
                <span className="w-1 h-1 rounded-full bg-primary mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Shift Cards for selected day */}
      {!isLoading && (
        <div className="space-y-4">
          {activeShifts.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-xl border border-border">
              <Clock size={32} className="mx-auto text-text-secondary/30 mb-3" />
              <p className="text-sm font-medium text-text-secondary">No shifts scheduled</p>
              <p className="text-xs text-text-secondary/60 mt-1">
                {DateTime.fromISO(activeDate!).toFormat('EEEE, MMMM d')}
              </p>
            </div>
          ) : (
            activeShifts.map((shift) => {
              const tz = (shift as unknown as { location_timezone?: string }).location_timezone
                ?? (shift as unknown as { timezone?: string }).timezone
                ?? 'UTC';
              const locationName = (shift as unknown as { location_name?: string }).location_name;
              const startLocal = formatInTimezone(shift.start_time, tz);
              const endLocal = formatInTimezone(shift.end_time, tz);
              const hours = shiftDurationHours(shift.start_time, shift.end_time);
              const isToday = activeDate === today;

              // Determine if shift is happening now
              const now = DateTime.now();
              const shiftStart = DateTime.fromISO(shift.start_time);
              const shiftEnd = DateTime.fromISO(shift.end_time);
              const isOngoing = now >= shiftStart && now <= shiftEnd;
              const isUpcoming = now < shiftStart && activeDate === today;

              return (
                <div
                  key={shift.id}
                  className={`bg-surface p-5 rounded-xl border shadow-sm
                             transition-shadow hover:shadow-md
                             ${isOngoing ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border'}`}
                >
                  {/* Top row: skill icon + name + status */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-lg">
                        <Clock size={18} />
                      </div>
                      <div>
                        <h3 className="text-text font-bold text-base leading-tight">
                          {shift.skill_name
                            ? shift.skill_name.charAt(0).toUpperCase() + shift.skill_name.slice(1)
                            : 'Shift'}
                        </h3>
                        {locationName && (
                          <p className="text-text-secondary text-sm mt-0.5 flex items-center gap-1">
                            <MapPin size={10} />
                            {locationName}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded
                      ${isOngoing
                        ? 'bg-success/10 text-success'
                        : isUpcoming
                          ? 'bg-primary/10 text-primary'
                          : 'bg-surface-alt text-text-secondary'
                      }`}>
                      {isOngoing ? 'In Progress' : isUpcoming ? 'Upcoming' : 'Confirmed'}
                    </span>
                  </div>

                  {/* Times */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50 mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">
                        Shift Start
                      </p>
                      <p className="text-text font-extrabold text-xl">{startLocal}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">
                        Shift End
                      </p>
                      <p className="text-text font-extrabold text-xl">{endLocal}</p>
                    </div>
                  </div>

                  {/* Duration badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-medium text-text-secondary">
                      Duration: {hours.toFixed(1)} hours
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    {isToday && (isUpcoming || isOngoing) && (
                      <button className="flex-1 py-2.5 bg-primary text-text-inverse rounded-lg
                                        font-bold text-sm hover:bg-primary-hover transition-colors
                                        flex items-center justify-center gap-2 press-effect">
                        <LogIn size={14} />
                        {isOngoing ? 'Clock Out' : 'Clock In'}
                      </button>
                    )}
                    <button
                      onClick={() => navigate('/swaps')}
                      className="px-4 py-2.5 border border-border text-text rounded-lg
                                font-bold text-sm hover:bg-surface-hover transition-colors
                                flex items-center justify-center gap-2 press-effect"
                    >
                      <ArrowLeftRight size={14} />
                      Swap Request
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Weekly summary */}
      {shifts && shifts.length > 0 && (
        <div className="p-4 bg-surface-alt rounded-xl border border-border">
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">
            Week Total
          </p>
          <p className="text-2xl font-display font-extrabold text-text">
            {totalWeekHours.toFixed(1)}
            <span className="text-sm font-normal text-text-secondary ml-1">hours</span>
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            {shifts.length} shift{shifts.length !== 1 ? 's' : ''} this week
          </p>
        </div>
      )}
    </div>
  );
}
