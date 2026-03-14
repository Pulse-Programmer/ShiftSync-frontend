import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, BarChart3, TrendingUp } from 'lucide-react';
import { DateTime } from 'luxon';
import { getWeekStart, prevWeek, nextWeek } from '../utils/date';
import { useWeeklyOvertime, useOvertimeProjections } from '../hooks/api/useOvertime';
import { OvertimeTable } from '../components/overtime/OvertimeTable';
import { StaffHoursChart } from '../components/overtime/StaffHoursChart';
import { StaffDetailModal } from '../components/overtime/StaffDetailModal';
import { ProjectionsView } from '../components/overtime/ProjectionsView';
import { ErrorState } from '../components/ui/ErrorState';

type View = 'table' | 'chart' | 'projections';

interface OutletCtx {
  selectedLocationId: string | null;
}

export function OvertimePage() {
  const { selectedLocationId } = useOutletContext<OutletCtx>();
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [view, setView] = useState<View>('table');
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: weeklyData, isLoading: weeklyLoading, error: weeklyError, refetch: refetchWeekly } = useWeeklyOvertime(
    selectedLocationId,
    weekStart,
  );
  const { data: projections, isLoading: projectionsLoading, error: projectionsError, refetch: refetchProjections } = useOvertimeProjections(
    view === 'projections' ? selectedLocationId : null,
    weekStart,
  );

  const weekLabel = `${DateTime.fromISO(weekStart).toFormat('MMM d')} – ${DateTime.fromISO(weekStart).plus({ days: 6 }).toFormat('MMM d, yyyy')}`;
  const isCurrentWeek = weekStart === getWeekStart();

  const handleSelectUser = (userId: string) => {
    const entry = weeklyData?.find((d) => d.id === userId);
    if (entry) {
      setSelectedUser({
        id: userId,
        name: `${entry.first_name} ${entry.last_name}`,
      });
    }
  };

  if (!selectedLocationId) {
    return (
      <div className="p-6 text-center">
        <p className="text-text-secondary">Select a location to view overtime data</p>
      </div>
    );
  }

  const views = [
    { id: 'table' as View, label: 'Table', icon: Clock },
    { id: 'chart' as View, label: 'Chart', icon: BarChart3 },
    { id: 'projections' as View, label: 'Projections', icon: TrendingUp },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header with week nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWeekStart(prevWeek(weekStart))}
              className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-text-secondary"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                <h1 className="text-lg font-display font-bold text-text">Overtime</h1>
              </div>
              <p className="text-sm text-text-secondary mt-0.5">
                {weekLabel}
                {isCurrentWeek && (
                  <span className="text-primary font-medium ml-2">This week</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setWeekStart(nextWeek(weekStart))}
              className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-text-secondary"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isCurrentWeek && (
            <button
              onClick={() => setWeekStart(getWeekStart())}
              className="px-3 py-1.5 text-xs font-medium text-text-secondary
                         border border-border rounded-lg hover:bg-surface-hover
                         transition-colors press-effect"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 p-1 bg-surface-alt rounded-xl mb-5">
        {views.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                       text-sm font-medium transition-colors duration-fast
                       ${view === v.id
                         ? 'bg-surface text-text shadow-sm'
                         : 'text-text-secondary hover:text-text'
                       }`}
          >
            <v.icon size={14} />
            {v.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {view === 'table' && (
        <>
          {weeklyLoading && (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!weeklyLoading && weeklyError && (
            <ErrorState message="Failed to load overtime data" onRetry={() => refetchWeekly()} />
          )}
          {!weeklyLoading && !weeklyError && weeklyData && (
            <OvertimeTable data={weeklyData} onSelectUser={handleSelectUser} />
          )}
        </>
      )}

      {view === 'chart' && (
        <>
          {weeklyLoading && (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!weeklyLoading && weeklyError && (
            <ErrorState message="Failed to load chart data" onRetry={() => refetchWeekly()} />
          )}
          {!weeklyLoading && !weeklyError && weeklyData && (
            <div className="bg-surface rounded-xl border border-border p-4">
              <h2 className="text-sm font-semibold text-text mb-3">Staff Hours Distribution</h2>
              <StaffHoursChart data={weeklyData} onSelectUser={handleSelectUser} />
            </div>
          )}
        </>
      )}

      {view === 'projections' && (
        projectionsError
          ? <ErrorState message="Failed to load projections" onRetry={() => refetchProjections()} />
          : <ProjectionsView data={projections ?? []} isLoading={projectionsLoading} />
      )}

      {/* Staff Detail Modal */}
      {selectedUser && (
        <StaffDetailModal
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          userId={selectedUser.id}
          weekStart={weekStart}
          staffName={selectedUser.name}
        />
      )}
    </div>
  );
}
