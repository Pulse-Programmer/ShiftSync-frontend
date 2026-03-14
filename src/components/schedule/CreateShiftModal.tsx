import { useState, type FormEvent } from 'react';
import { DateTime } from 'luxon';
import { Modal } from '../ui/Modal';
import { useCreateShift, useUpdateShift, useSkills, type ShiftResponse } from '../../hooks/api/useShifts';
import { AlertCircle } from 'lucide-react';
import { ApiError } from '../../api/client';

interface CreateShiftModalProps {
  open: boolean;
  onClose: () => void;
  scheduleId: string;
  locationId: string;
  timezone: string;
  date?: string;
  editShift?: ShiftResponse | null;
}

function parseShiftTime(isoString: string | undefined, timezone: string, fallback: string): string {
  if (!isoString) return fallback;
  try {
    return DateTime.fromISO(isoString, { zone: 'utc' }).setZone(timezone).toFormat('HH:mm');
  } catch {
    return fallback;
  }
}

function parseShiftDate(isoString: string | undefined, timezone: string, fallbackDate?: string): string {
  if (!isoString) return fallbackDate ?? '';
  try {
    return DateTime.fromISO(isoString, { zone: 'utc' }).setZone(timezone).toISODate() ?? fallbackDate ?? '';
  } catch {
    return fallbackDate ?? '';
  }
}

export function CreateShiftModal({
  open,
  onClose,
  scheduleId,
  locationId,
  timezone,
  date,
  editShift,
}: CreateShiftModalProps) {
  const { data: skills } = useSkills();
  const createShift = useCreateShift();
  const updateShift = useUpdateShift();
  const [error, setError] = useState('');

  const isEdit = !!editShift;

  const [shiftDate, setShiftDate] = useState(parseShiftDate(editShift?.start_time, timezone, date));
  const [startTime, setStartTime] = useState(parseShiftTime(editShift?.start_time, timezone, '09:00'));
  const [endTime, setEndTime] = useState(parseShiftTime(editShift?.end_time, timezone, '17:00'));
  const [skillId, setSkillId] = useState(editShift?.required_skill_id ?? '');
  const [headcount, setHeadcount] = useState(editShift?.headcount_needed ?? 1);
  const [notes, setNotes] = useState(editShift?.notes ?? '');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const startTimeISO = `${shiftDate}T${startTime}:00`;
    const endTimeISO = `${shiftDate}T${endTime}:00`;

    try {
      if (isEdit && editShift) {
        await updateShift.mutateAsync({
          shiftId: editShift.id,
          startTime: startTimeISO,
          endTime: endTimeISO,
          requiredSkillId: skillId || null,
          headcountNeeded: headcount,
          notes: notes || undefined,
          timezone,
        });
      } else {
        await createShift.mutateAsync({
          scheduleId,
          locationId,
          startTime: startTimeISO,
          endTime: endTimeISO,
          requiredSkillId: skillId || undefined,
          headcountNeeded: headcount,
          notes: notes || undefined,
          timezone,
        });
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as Record<string, unknown> | null;
        setError(typeof data?.error === 'string' ? data.error : err.message);
      } else {
        setError('Failed to save shift');
      }
    }
  }

  const isPending = createShift.isPending || updateShift.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Shift' : 'Create Shift'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-lg">
            <AlertCircle size={14} className="text-error shrink-0 mt-0.5" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text mb-1">Date</label>
          <input
            type="date"
            value={shiftDate}
            onChange={(e) => setShiftDate(e.target.value)}
            required
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Required Skill</label>
          <select
            value={skillId}
            onChange={(e) => setSkillId(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="">Any skill</option>
            {skills?.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Headcount Needed</label>
          <input
            type="number"
            min={1}
            max={20}
            value={headcount}
            onChange={(e) => setHeadcount(Number(e.target.value))}
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Optional notes..."
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-text text-sm
                       resize-none placeholder:text-text-secondary/50
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <p className="text-xs text-text-secondary">
          Times are in {timezone}
        </p>

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
            type="submit"
            disabled={isPending}
            className="flex-1 py-2 px-4 bg-primary text-text-inverse rounded-lg text-sm font-semibold
                       hover:bg-primary-hover disabled:opacity-50 transition-colors press-effect"
          >
            {isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
