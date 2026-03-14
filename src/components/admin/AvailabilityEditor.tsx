import { useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import {
  useAvailability,
  useCreateAvailability,
  useDeleteAvailability,
  type AvailabilityRecord,
} from '../../hooks/api/useAvailability';

interface AvailabilityEditorProps {
  userId: string;
  locationId: string;
  locationName: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function AvailabilityEditor({ userId, locationId, locationName }: AvailabilityEditorProps) {
  const { data: records, isLoading } = useAvailability(userId, locationId);
  const createAvail = useCreateAvailability();
  const deleteAvail = useDeleteAvailability();

  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState<'recurring' | 'exception'>('recurring');
  const [newDay, setNewDay] = useState(1);
  const [newDate, setNewDate] = useState('');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('17:00');
  const [newAvailable, setNewAvailable] = useState(true);

  const recurring = records?.filter((r) => r.type === 'recurring') ?? [];
  const exceptions = records?.filter((r) => r.type === 'exception') ?? [];

  async function handleAdd() {
    await createAvail.mutateAsync({
      userId,
      locationId,
      type: newType,
      dayOfWeek: newType === 'recurring' ? newDay : undefined,
      specificDate: newType === 'exception' ? newDate : undefined,
      startTime: newStart,
      endTime: newEnd,
      isAvailable: newAvailable,
    });
    setShowAdd(false);
  }

  function RecordRow({ record }: { record: AvailabilityRecord }) {
    return (
      <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
        record.is_available ? 'border-success/20 bg-success/5' : 'border-error/20 bg-error/5'
      }`}>
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-text-secondary" />
          <span className="text-sm text-text">
            {record.type === 'recurring'
              ? DAY_NAMES[record.day_of_week ?? 0]
              : record.specific_date}
          </span>
          <span className="text-xs text-text-secondary">
            {record.start_time} – {record.end_time}
          </span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
            record.is_available
              ? 'bg-success/15 text-success'
              : 'bg-error/15 text-error'
          }`}>
            {record.is_available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <button
          onClick={() => deleteAvail.mutate({ userId, availabilityId: record.id })}
          className="p-1 text-text-secondary hover:text-error transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-text mb-3">
        Availability at {locationName}
      </h3>

      {/* Recurring */}
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Recurring Weekly</p>
      {recurring.length === 0 && (
        <p className="text-xs text-text-secondary mb-2">No recurring availability set</p>
      )}
      <div className="space-y-1.5 mb-4">
        {recurring.map((r) => <RecordRow key={r.id} record={r} />)}
      </div>

      {/* Exceptions */}
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Exceptions</p>
      {exceptions.length === 0 && (
        <p className="text-xs text-text-secondary mb-2">No exceptions set</p>
      )}
      <div className="space-y-1.5 mb-4">
        {exceptions.map((r) => <RecordRow key={r.id} record={r} />)}
      </div>

      {/* Add new */}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-text-secondary rounded-lg
                     text-xs font-medium hover:bg-surface-hover transition-colors press-effect"
        >
          <Plus size={12} />
          Add Availability
        </button>
      ) : (
        <div className="p-3 bg-surface-alt rounded-xl border border-border space-y-3">
          <div className="flex gap-2">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as 'recurring' | 'exception')}
              className="px-2 py-1.5 bg-surface border border-border rounded-lg text-xs text-text
                         focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="recurring">Recurring</option>
              <option value="exception">Exception</option>
            </select>

            {newType === 'recurring' ? (
              <select
                value={newDay}
                onChange={(e) => setNewDay(parseInt(e.target.value))}
                className="px-2 py-1.5 bg-surface border border-border rounded-lg text-xs text-text
                           focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {DAY_NAMES.map((name, i) => (
                  <option key={i} value={i}>{name}</option>
                ))}
              </select>
            ) : (
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="px-2 py-1.5 bg-surface border border-border rounded-lg text-xs text-text
                           focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            )}
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="time"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="px-2 py-1.5 bg-surface border border-border rounded-lg text-xs text-text
                         focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span className="text-xs text-text-secondary">to</span>
            <input
              type="time"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className="px-2 py-1.5 bg-surface border border-border rounded-lg text-xs text-text
                         focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <select
              value={newAvailable ? 'available' : 'unavailable'}
              onChange={(e) => setNewAvailable(e.target.value === 'available')}
              className="px-2 py-1.5 bg-surface border border-border rounded-lg text-xs text-text
                         focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={createAvail.isPending || (newType === 'exception' && !newDate)}
              className="px-3 py-1.5 bg-primary text-text-inverse rounded-lg text-xs font-semibold
                         hover:bg-primary-hover disabled:opacity-50 transition-colors press-effect"
            >
              {createAvail.isPending ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-3 py-1.5 text-text-secondary text-xs hover:text-text"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
