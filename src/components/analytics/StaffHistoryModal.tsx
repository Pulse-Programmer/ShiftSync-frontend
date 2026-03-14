import { X, Clock, MapPin, Star } from 'lucide-react';
import { formatInTimezone } from '../../utils/date';
import { useStaffHistory } from '../../hooks/api/useAnalytics';

interface StaffHistoryModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  staffName: string;
  startDate: string;
  endDate: string;
}

export function StaffHistoryModal({
  open,
  onClose,
  userId,
  staffName,
  startDate,
  endDate,
}: StaffHistoryModalProps) {
  const { data, isLoading } = useStaffHistory(open ? userId : null, startDate, endDate);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[85vh] bg-surface rounded-t-2xl sm:rounded-2xl border border-border shadow-lg overflow-hidden flex flex-col animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-display font-bold text-text">{staffName}</h2>
            <p className="text-xs text-text-secondary">
              Shift history · {startDate} to {endDate}
            </p>
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
                  <p className="text-xl font-bold text-text">{data.totalShifts}</p>
                  <p className="text-xs text-text-secondary mt-0.5">Shifts</p>
                </div>
                <div className="flex-1 p-3 bg-surface-alt rounded-xl text-center">
                  <p className="text-xl font-bold text-text">{data.totalHours}h</p>
                  <p className="text-xs text-text-secondary mt-0.5">Total Hours</p>
                </div>
                <div className="flex-1 p-3 bg-surface-alt rounded-xl text-center">
                  <p className="text-xl font-bold text-primary">{data.premiumShifts}</p>
                  <p className="text-xs text-text-secondary mt-0.5">Premium</p>
                </div>
              </div>

              {/* Shift list */}
              {data.shifts.length === 0 ? (
                <p className="text-sm text-text-secondary text-center py-6">
                  No shifts in this period
                </p>
              ) : (
                <div className="space-y-2">
                  {data.shifts.map((shift) => (
                    <div
                      key={shift.id}
                      className={`p-3 rounded-xl border ${
                        shift.is_premium
                          ? 'border-primary/20 bg-primary/5'
                          : 'border-border bg-surface'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-text">
                              {formatInTimezone(shift.start_time, shift.timezone, 'EEE, MMM d')}
                            </p>
                            {shift.is_premium && (
                              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                <Star size={8} /> Premium
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {formatInTimezone(shift.start_time, shift.timezone)} –{' '}
                              {formatInTimezone(shift.end_time, shift.timezone)}
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
                        <span className="text-sm font-semibold text-text shrink-0">
                          {shift.hours}h
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
