import { useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Send, Undo2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSchedule, useCreateSchedule, usePublishSchedule, useUnpublishSchedule } from '../hooks/api/useSchedules';
import { useShifts, useDeleteShift, useUnassignStaff, type ShiftResponse } from '../hooks/api/useShifts';
import { WeekView } from '../components/schedule/WeekView';
import { CreateShiftModal } from '../components/schedule/CreateShiftModal';
import { AssignStaffModal } from '../components/schedule/AssignStaffModal';
import { PersonalSchedule } from '../components/schedule/PersonalSchedule';
import { getWeekStart, prevWeek, nextWeek } from '../utils/date';
import { ErrorState } from '../components/ui/ErrorState';
import { DateTime } from 'luxon';

interface OutletCtx {
  selectedLocationId: string | null;
  onLocationChange: (id: string) => void;
}

export function SchedulePage() {
  const { user } = useAuth();
  const { selectedLocationId } = useOutletContext<OutletCtx>();
  const [weekStart, setWeekStart] = useState(() => getWeekStart());

  // Staff sees personal schedule
  if (user?.role === 'staff') {
    return (
      <div className="p-4 sm:p-6 max-w-lg mx-auto">
        <PersonalSchedule weekStart={weekStart} onWeekChange={setWeekStart} />
      </div>
    );
  }

  return (
    <ManagerScheduleView
      locationId={selectedLocationId}
      weekStart={weekStart}
      onWeekChange={setWeekStart}
    />
  );
}

function ManagerScheduleView({
  locationId,
  weekStart,
  onWeekChange,
}: {
  locationId: string | null;
  weekStart: string;
  onWeekChange: (ws: string) => void;
}) {
  const { data: schedule, isLoading: scheduleLoading, error: scheduleError, refetch: refetchSchedule } = useSchedule(locationId, weekStart);
  const { data: shifts, isLoading: shiftsLoading, error: shiftsError } = useShifts(schedule?.id);
  const createSchedule = useCreateSchedule();
  const publishSchedule = usePublishSchedule();
  const unpublishSchedule = useUnpublishSchedule();
  const deleteShift = useDeleteShift();
  const unassignStaff = useUnassignStaff();

  const [shiftModal, setShiftModal] = useState<{
    open: boolean;
    date?: string;
    editShift?: ShiftResponse | null;
  }>({ open: false });
  const [assignModal, setAssignModal] = useState<{
    open: boolean;
    shift?: ShiftResponse;
  }>({ open: false });

  const timezone = schedule?.timezone ?? 'UTC';
  const isPublished = schedule?.status === 'published';
  const weekLabel = `${DateTime.fromISO(weekStart).toFormat('MMM d')} – ${DateTime.fromISO(weekStart).plus({ days: 6 }).toFormat('MMM d, yyyy')}`;
  const isCurrentWeek = weekStart === getWeekStart();

  const handleCreateSchedule = useCallback(async () => {
    if (!locationId) return;
    await createSchedule.mutateAsync({ locationId, weekStart });
  }, [locationId, weekStart, createSchedule]);

  const handlePublish = useCallback(async () => {
    if (!schedule || !locationId) return;
    await publishSchedule.mutateAsync({ scheduleId: schedule.id, locationId });
  }, [schedule, locationId, publishSchedule]);

  const handleUnpublish = useCallback(async () => {
    if (!schedule || !locationId) return;
    await unpublishSchedule.mutateAsync({ scheduleId: schedule.id, locationId });
  }, [schedule, locationId, unpublishSchedule]);

  const handleDeleteShift = useCallback(async (shift: ShiftResponse) => {
    if (!confirm('Delete this shift? This cannot be undone.')) return;
    await deleteShift.mutateAsync(shift.id);
  }, [deleteShift]);

  const handleUnassign = useCallback(async (shiftId: string, userId: string) => {
    if (!confirm('Remove this staff member from the shift?')) return;
    await unassignStaff.mutateAsync({ shiftId, userId });
  }, [unassignStaff]);

  if (!locationId) {
    return (
      <div className="p-6 text-center">
        <p className="text-text-secondary">Select a location to view the schedule</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onWeekChange(prevWeek(weekStart))}
              className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-text-secondary"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center sm:text-left">
              <h1 className="text-lg font-display font-bold text-text">{weekLabel}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                {isCurrentWeek && (
                  <span className="text-xs text-primary font-medium">This week</span>
                )}
                {schedule && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                   ${isPublished
                                     ? 'bg-success/15 text-success'
                                     : 'bg-warning/15 text-warning'}`}>
                    {isPublished ? 'Published' : 'Draft'}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onWeekChange(nextWeek(weekStart))}
              className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-text-secondary"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCurrentWeek && (
            <button
              onClick={() => onWeekChange(getWeekStart())}
              className="px-3 py-1.5 text-xs font-medium text-text-secondary
                         border border-border rounded-lg hover:bg-surface-hover
                         transition-colors press-effect"
            >
              Today
            </button>
          )}

          {schedule && !isPublished && (
            <button
              onClick={handlePublish}
              disabled={publishSchedule.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-success text-white
                         rounded-lg text-xs font-semibold hover:bg-success/90
                         transition-colors press-effect disabled:opacity-50"
            >
              <Send size={12} />
              Publish
            </button>
          )}

          {schedule && isPublished && (
            <button
              onClick={handleUnpublish}
              disabled={unpublishSchedule.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border
                         rounded-lg text-xs font-medium text-text-secondary
                         hover:bg-surface-hover transition-colors press-effect"
            >
              <Undo2 size={12} />
              Unpublish
            </button>
          )}

          {schedule && (
            <button
              onClick={() => setShiftModal({ open: true })}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-text-inverse
                         rounded-lg text-xs font-semibold hover:bg-primary-hover
                         transition-colors press-effect"
            >
              <Plus size={12} />
              Add Shift
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {(scheduleLoading || shiftsLoading) && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {(scheduleError || shiftsError) && !scheduleLoading && !shiftsLoading && (
        <ErrorState
          message="Failed to load schedule data"
          onRetry={() => refetchSchedule()}
        />
      )}

      {!scheduleLoading && !scheduleError && !schedule && (
        <div className="text-center py-16">
          <p className="text-text-secondary mb-4">No schedule for this week yet</p>
          <button
            onClick={handleCreateSchedule}
            disabled={createSchedule.isPending}
            className="px-4 py-2 bg-primary text-text-inverse rounded-lg text-sm font-semibold
                       hover:bg-primary-hover transition-colors press-effect disabled:opacity-50"
          >
            {createSchedule.isPending ? 'Creating...' : 'Create Schedule'}
          </button>
        </div>
      )}

      {schedule && shifts && !shiftsLoading && (
        <WeekView
          weekStart={weekStart}
          shifts={shifts}
          timezone={timezone}
          isManager={true}
          onAddShift={(date) => setShiftModal({ open: true, date })}
          onAssignShift={(shift) => setAssignModal({ open: true, shift })}
          onEditShift={(shift) => setShiftModal({ open: true, editShift: shift })}
          onDeleteShift={handleDeleteShift}
          onUnassign={handleUnassign}
        />
      )}

      {/* Create/Edit Shift Modal */}
      {shiftModal.open && schedule && locationId && (
        <CreateShiftModal
          open={shiftModal.open}
          onClose={() => setShiftModal({ open: false })}
          scheduleId={schedule.id}
          locationId={locationId}
          timezone={timezone}
          date={shiftModal.date}
          editShift={shiftModal.editShift}
        />
      )}

      {/* Assign Staff Modal */}
      {assignModal.open && assignModal.shift && locationId && (
        <AssignStaffModal
          open={assignModal.open}
          onClose={() => setAssignModal({ open: false })}
          shift={assignModal.shift}
          locationId={locationId}
          timezone={timezone}
        />
      )}
    </div>
  );
}
