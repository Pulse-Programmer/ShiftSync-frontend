import { X, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { formatInTimezone } from '../../utils/date';
import { useUserWeeklyDetail } from '../../hooks/api/useOvertime';

interface StaffDetailModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  weekStart: string;
  staffName: string;
}

export function StaffDetailModal({
  open,
  onClose,
  userId,
  weekStart,
  staffName,
}: StaffDetailModalProps) {
  const { data, isLoading } = useUserWeeklyDetail(open ? userId : null, weekStart);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[85vh] bg-surface rounded-t-2xl sm:rounded-2xl border border-border shadow-lg overflow-hidden flex flex-col animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-display font-bold text-text">{staffName}</h2>
            <p className="text-xs text-text-secondary">Weekly breakdown · {weekStart}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-hover text-text-secondary">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {data && (
            <>
              {/* Summary */}
              <div className="flex gap-3 mb-5">
                <div className="flex-1 p-3 bg-surface-alt rounded-xl text-center">
                  <p className={`text-xl font-bold ${
                    data.totalHours >= 40 ? 'text-error' :
                    data.totalHours >= 35 ? 'text-warning' : 'text-success'
                  }`}>
                    {data.totalHours.toFixed(1)}h
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">Total Hours</p>
                </div>
                <div className="flex-1 p-3 bg-surface-alt rounded-xl text-center">
                  <p className={`text-xl font-bold ${data.overtimeHours > 0 ? 'text-error' : 'text-text-secondary'}`}>
                    {data.overtimeHours > 0 ? `+${data.overtimeHours.toFixed(1)}h` : '—'}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">Overtime</p>
                </div>
                <div className="flex-1 p-3 bg-surface-alt rounded-xl text-center">
                  <p className="text-xl font-bold text-text">{data.shifts.length}</p>
                  <p className="text-xs text-text-secondary mt-0.5">Shifts</p>
                </div>
              </div>

              {/* Shift list */}
              {data.shifts.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-6">No shifts this week</p>
              ) : (
                <div className="space-y-2">
                  {data.shifts.map((shift) => (
                    <div
                      key={shift.id}
                      className={`p-3 rounded-xl border ${
                        shift.pushes_past_40
                          ? 'border-error/30 bg-error/5'
                          : shift.pushes_past_35
                          ? 'border-warning/30 bg-warning/5'
                          : 'border-border bg-surface'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text">
                            {formatInTimezone(shift.start_time, shift.timezone, 'EEE, MMM d')}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {formatInTimezone(shift.start_time, shift.timezone)} –{' '}
                              {formatInTimezone(shift.end_time, shift.timezone)}
                              <span className="ml-1">({shift.hours}h)</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={10} />
                              {shift.location_name}
                            </span>
                          </div>
                          {shift.skill_name && (
                            <span className="inline-block text-xs capitalize text-text-secondary mt-1">
                              {shift.skill_name}
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-semibold ${
                            shift.running_total >= 40 ? 'text-error' :
                            shift.running_total >= 35 ? 'text-warning' : 'text-text'
                          }`}>
                            {shift.running_total}h
                          </p>
                          <p className="text-[10px] text-text-secondary">cumulative</p>
                        </div>
                      </div>

                      {(shift.pushes_past_35 || shift.pushes_past_40) && (
                        <div className={`flex items-center gap-1.5 mt-2 text-xs font-medium ${
                          shift.pushes_past_40 ? 'text-error' : 'text-warning'
                        }`}>
                          <AlertTriangle size={10} />
                          {shift.pushes_past_40
                            ? 'This shift pushes past 40h overtime threshold'
                            : 'This shift pushes past 35h warning threshold'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Progress bar */}
              <div className="mt-5 p-3 bg-surface-alt rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-text-secondary">Weekly progress</span>
                  <span className="text-xs font-semibold text-text">
                    {data.totalHours.toFixed(1)} / 40h
                  </span>
                </div>
                <div className="h-3 bg-bg rounded-full overflow-hidden relative">
                  {/* 35h marker */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-warning/50"
                    style={{ left: `${(35 / 50) * 100}%` }}
                  />
                  {/* 40h marker */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-error/50"
                    style={{ left: `${(40 / 50) * 100}%` }}
                  />
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      data.totalHours >= 40 ? 'bg-error' :
                      data.totalHours >= 35 ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${Math.min((data.totalHours / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
