import { Users, MoreVertical, UserPlus, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';
import type { ShiftResponse } from '../../hooks/api/useShifts';
import { formatInTimezone, shiftDurationHours } from '../../utils/date';

interface ShiftCardProps {
  shift: ShiftResponse;
  timezone: string;
  isManager: boolean;
  onAssign?: (shift: ShiftResponse) => void;
  onEdit?: (shift: ShiftResponse) => void;
  onDelete?: (shift: ShiftResponse) => void;
  onUnassign?: (shiftId: string, userId: string) => void;
}

const skillColors: Record<number, string> = {
  0: 'bg-accent-1/15 border-accent-1/30 text-accent-1',
  1: 'bg-accent-2/15 border-accent-2/30 text-accent-2',
  2: 'bg-accent-3/15 border-accent-3/30 text-accent-3',
  3: 'bg-accent-4/15 border-accent-4/30 text-accent-4',
};

function getSkillColor(skillName: string | null): string {
  if (!skillName) return 'bg-surface-hover border-border text-text-secondary';
  const idx = Math.abs(skillName.charCodeAt(0)) % 4;
  return skillColors[idx];
}

export function ShiftCard({
  shift,
  timezone,
  isManager,
  onAssign,
  onEdit,
  onDelete,
  onUnassign,
}: ShiftCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const startStr = formatInTimezone(shift.start_time, timezone);
  const endStr = formatInTimezone(shift.end_time, timezone);
  const duration = shiftDurationHours(shift.start_time, shift.end_time);
  const assigned = shift.assignments.length;
  const needed = shift.headcount_needed;
  const isFilled = assigned >= needed;

  return (
    <div className={`p-3 rounded-lg border card-hover text-sm
                     ${getSkillColor(shift.skill_name)}`}>
      {/* Time + skill */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-text text-xs">
            {startStr} – {endStr}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            {duration.toFixed(1)}h
            {shift.skill_name && (
              <span className="ml-1.5 capitalize">{shift.skill_name}</span>
            )}
          </p>
        </div>

        {isManager && (
          <div className={`relative ${showMenu ? 'z-50' : ''}`}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded hover:bg-bg/50 text-text-secondary"
            >
              <MoreVertical size={14} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-36 py-1 bg-surface border border-border
                                rounded-lg shadow-lg z-40 animate-in">
                  <button
                    onClick={() => { setShowMenu(false); onAssign?.(shift); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface-hover"
                  >
                    <UserPlus size={12} /> Assign staff
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); onEdit?.(shift); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface-hover"
                  >
                    <Edit size={12} /> Edit shift
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); onDelete?.(shift); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-error hover:bg-surface-hover"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Headcount */}
      <div className="mt-2 flex items-center gap-1.5">
        <Users size={12} className={isFilled ? 'text-success' : 'text-warning'} />
        <span className="text-xs font-medium text-text-secondary">
          {assigned}/{needed}
        </span>
      </div>

      {/* Assigned staff */}
      {shift.assignments.length > 0 && (
        <div className="mt-2 space-y-1">
          {shift.assignments.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between group"
            >
              <span className="text-xs text-text">
                {a.firstName} {a.lastName[0]}.
              </span>
              {isManager && onUnassign && (
                <button
                  onClick={() => onUnassign(shift.id, a.userId)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-error/60
                             hover:text-error transition-opacity"
                  title="Unassign"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      {shift.notes && (
        <p className="mt-2 text-xs text-text-secondary italic truncate">{shift.notes}</p>
      )}
    </div>
  );
}
