import { useState } from 'react';
import { Modal } from '../ui/Modal';
import {
  useLocationStaff,
  usePreviewAssignment,
  useAssignStaff,
  type ShiftResponse,
} from '../../hooks/api/useShifts';
import { formatInTimezone } from '../../utils/date';
import {
  Search,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Lightbulb,
  Loader2,
  Clock,
} from 'lucide-react';
import { ApiError } from '../../api/client';
import type { ValidationResult } from '../../api/types';

interface AssignStaffModalProps {
  open: boolean;
  onClose: () => void;
  shift: ShiftResponse;
  locationId: string;
  timezone: string;
}

export function AssignStaffModal({
  open,
  onClose,
  shift,
  locationId,
  timezone,
}: AssignStaffModalProps) {
  const { data: staff } = useLocationStaff(locationId);
  const preview = usePreviewAssignment();
  const assign = useAssignStaff();

  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [overrideReasons, setOverrideReasons] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  // Filter out already-assigned staff
  const assignedIds = new Set(shift.assignments.map((a) => a.userId));
  const filteredStaff = (staff ?? [])
    .filter((s) => !assignedIds.has(s.id))
    .filter((s) => {
      if (!search) return true;
      const name = `${s.first_name} ${s.last_name}`.toLowerCase();
      return name.includes(search.toLowerCase());
    });

  async function handleSelectStaff(userId: string) {
    setSelectedUserId(userId);
    setValidation(null);
    setError('');
    setOverrideReasons({});

    try {
      const result = await preview.mutateAsync({ shiftId: shift.id, userId });
      setValidation(result);
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as Record<string, unknown> | null;
        if (data && 'results' in data) {
          setValidation(data as unknown as ValidationResult);
        } else {
          setError(typeof data?.error === 'string' ? data.error : 'Preview failed');
        }
      }
    }
  }

  async function handleAssign() {
    if (!selectedUserId) return;
    setError('');

    const overrides = Object.entries(overrideReasons)
      .filter(([, reason]) => reason.trim())
      .map(([constraint, reason]) => ({ constraint, reason }));

    try {
      await assign.mutateAsync({
        shiftId: shift.id,
        userId: selectedUserId,
        overrides: overrides.length > 0 ? overrides : undefined,
      });
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as Record<string, unknown> | null;
        if (data && 'validation' in data) {
          setValidation((data as { validation: ValidationResult }).validation);
        }
        setError(typeof data?.error === 'string' ? data.error : 'Assignment failed');
      }
    }
  }

  const hasErrors = validation?.results.some((r) => !r.passed && r.severity === 'error') ?? false;
  const hasWarnings = validation?.results.some((r) => !r.passed && r.severity === 'warning') ?? false;
  const overridableErrors = validation?.results.filter(
    (r) => !r.passed && r.severity === 'error' && r.overridable,
  ) ?? [];
  const nonOverridableErrors = validation?.results.filter(
    (r) => !r.passed && r.severity === 'error' && !r.overridable,
  ) ?? [];
  const canAssign = validation && (
    validation.valid ||
    (!hasErrors && hasWarnings) ||
    (nonOverridableErrors.length === 0 && overridableErrors.every(
      (e) => overrideReasons[e.constraint]?.trim(),
    ))
  );

  const selectedStaff = staff?.find((s) => s.id === selectedUserId);

  return (
    <Modal open={open} onClose={onClose} title="Assign Staff" wide>
      <div className="space-y-4">
        {/* Shift info */}
        <div className="p-3 bg-surface-alt rounded-lg border border-border-light">
          <p className="text-sm font-medium text-text">
            {formatInTimezone(shift.start_time, timezone, 'EEE, MMM d')} &middot;{' '}
            {formatInTimezone(shift.start_time, timezone)} –{' '}
            {formatInTimezone(shift.end_time, timezone)}
          </p>
          {shift.skill_name && (
            <p className="text-xs text-text-secondary mt-0.5 capitalize">
              Requires: {shift.skill_name}
            </p>
          )}
        </div>

        {/* Staff search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff..."
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-text
                       placeholder:text-text-secondary/50
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* Staff list */}
        <div className="max-h-40 overflow-y-auto space-y-1">
          {filteredStaff.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectStaff(s.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
                         transition-colors duration-fast
                         ${selectedUserId === s.id
                           ? 'bg-primary/10 border border-primary/30 text-primary'
                           : 'hover:bg-surface-hover text-text'
                         }`}
            >
              <div className="text-left">
                <span className="font-medium">{s.first_name} {s.last_name}</span>
                <span className="text-xs text-text-secondary ml-2">
                  {s.skills.map((sk) => sk.name).join(', ')}
                </span>
              </div>
              {selectedUserId === s.id && preview.isPending && (
                <Loader2 size={14} className="animate-spin" />
              )}
            </button>
          ))}
          {filteredStaff.length === 0 && (
            <p className="text-sm text-text-secondary text-center py-4">No eligible staff found</p>
          )}
        </div>

        {/* Constraint results */}
        {validation && selectedStaff && (
          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-medium text-text">
              Constraint check for {selectedStaff.first_name} {selectedStaff.last_name}
            </p>

            {/* What-if overtime indicator */}
            {(() => {
              const weeklyResult = validation.results.find((r) => r.constraint === 'WEEKLY_HOURS');
              if (!weeklyResult?.details) return null;
              const details = weeklyResult.details as { currentHours?: number; projectedTotal?: number };
              if (details.projectedTotal == null) return null;
              const projected = details.projectedTotal;
              const current = details.currentHours ?? 0;
              return (
                <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                  projected >= 40 ? 'bg-error/10 border-error/20' :
                  projected >= 35 ? 'bg-warning/10 border-warning/20' :
                  'bg-surface-alt border-border'
                }`}>
                  <Clock size={14} className={
                    projected >= 40 ? 'text-error' :
                    projected >= 35 ? 'text-warning' : 'text-text-secondary'
                  } />
                  <div className="flex-1">
                    <p className="text-xs text-text-secondary">
                      Weekly hours: {current.toFixed(1)}h &rarr;{' '}
                      <span className={`font-semibold ${
                        projected >= 40 ? 'text-error' :
                        projected >= 35 ? 'text-warning' : 'text-success'
                      }`}>
                        {projected.toFixed(1)}h
                      </span>
                    </p>
                    <div className="mt-1.5 h-1.5 bg-bg rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          projected >= 40 ? 'bg-error' :
                          projected >= 35 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${Math.min((projected / 50) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {validation.valid && !hasWarnings && (
              <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
                <CheckCircle size={14} className="text-success" />
                <p className="text-sm text-success">All constraints pass</p>
              </div>
            )}

            {validation.results
              .filter((r) => !r.passed)
              .map((r) => (
                <div
                  key={r.constraint}
                  className={`p-3 rounded-lg border ${
                    r.severity === 'error'
                      ? 'bg-error/10 border-error/20'
                      : 'bg-warning/10 border-warning/20'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {r.severity === 'error' ? (
                      <XCircle size={14} className="text-error shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-sm ${r.severity === 'error' ? 'text-error' : 'text-warning'}`}>
                        {r.message}
                      </p>
                      {r.overridable && (
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Override reason (required)"
                            value={overrideReasons[r.constraint] ?? ''}
                            onChange={(e) =>
                              setOverrideReasons((prev) => ({
                                ...prev,
                                [r.constraint]: e.target.value,
                              }))
                            }
                            className="w-full px-2.5 py-1.5 bg-surface border border-border rounded text-xs text-text
                                       placeholder:text-text-secondary/50
                                       focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            {/* Suggestions */}
            {validation.suggestions && validation.suggestions.length > 0 && hasErrors && (
              <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={14} className="text-info" />
                  <p className="text-sm font-medium text-info">Suggested alternatives</p>
                </div>
                <div className="space-y-1">
                  {validation.suggestions.slice(0, 5).map((s) => (
                    <button
                      key={s.userId}
                      onClick={() => handleSelectStaff(s.userId)}
                      className="w-full text-left px-2 py-1.5 text-xs rounded
                                 hover:bg-info/10 transition-colors text-text"
                    >
                      <span className="font-medium">{s.userName}</span>
                      <span className="text-text-secondary ml-2">
                        {s.reason}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-lg">
            <XCircle size={14} className="text-error shrink-0 mt-0.5" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-border rounded-lg text-sm font-medium
                       text-text hover:bg-surface-hover transition-colors press-effect"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!canAssign || assign.isPending}
            className="flex-1 py-2 px-4 bg-primary text-text-inverse rounded-lg text-sm font-semibold
                       hover:bg-primary-hover disabled:opacity-50 transition-colors press-effect"
          >
            {assign.isPending ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
