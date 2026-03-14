import { Clock, MapPin, User } from 'lucide-react';
import { formatInTimezone, shiftDurationHours } from '../../utils/date';
import type { AvailableShiftResponse } from '../../hooks/api/useSwaps';

interface AvailableShiftCardProps {
  shift: AvailableShiftResponse;
  onPickup: (swapRequestId: string) => void;
  isPending: boolean;
}

export function AvailableShiftCard({ shift, onPickup, isPending }: AvailableShiftCardProps) {
  const duration = shiftDurationHours(shift.start_time, shift.end_time);

  return (
    <div className="p-4 bg-surface rounded-xl border border-border card-hover">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-semibold text-text">
            {formatInTimezone(shift.start_time, shift.timezone, 'EEE, MMM d')}
          </p>
          <p className="text-xs text-text-secondary">
            {formatInTimezone(shift.start_time, shift.timezone)} –{' '}
            {formatInTimezone(shift.end_time, shift.timezone)}
            <span className="ml-1.5">({duration.toFixed(1)}h)</span>
          </p>
        </div>
        <button
          onClick={() => onPickup(shift.swap_request_id)}
          disabled={isPending}
          className="px-3 py-1.5 bg-primary text-text-inverse rounded-lg text-xs font-semibold
                     hover:bg-primary-hover disabled:opacity-50 transition-colors press-effect"
        >
          {isPending ? 'Picking up...' : 'Pick Up'}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <MapPin size={12} />
          {shift.location_name}
        </span>
        {shift.skill_name && (
          <span className="capitalize flex items-center gap-1">
            <Clock size={12} />
            {shift.skill_name}
          </span>
        )}
        <span className="flex items-center gap-1">
          <User size={12} />
          Dropped by {shift.requester_first} {shift.requester_last[0]}.
        </span>
      </div>

      {shift.requester_reason && (
        <p className="text-xs text-text-secondary italic mt-2">
          &ldquo;{shift.requester_reason}&rdquo;
        </p>
      )}

      {shift.expires_at && (
        <p className="text-xs text-warning mt-2">
          Expires {formatInTimezone(shift.expires_at, shift.timezone, 'EEE MMM d, h:mm a')}
        </p>
      )}
    </div>
  );
}
