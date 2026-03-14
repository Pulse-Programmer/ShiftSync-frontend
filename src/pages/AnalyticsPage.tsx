import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart3, Star, Users } from 'lucide-react';
import { ErrorState } from '../components/ui/ErrorState';
import { DateTime } from 'luxon';
import {
  useFairnessReport,
  useFairnessScore,
} from '../hooks/api/useAnalytics';
import { FairnessScoreCard } from '../components/analytics/FairnessScoreCard';
import { HoursDistributionChart } from '../components/analytics/HoursDistributionChart';
import { PremiumShiftChart } from '../components/analytics/PremiumShiftChart';
import { SchedulingStatusPanel } from '../components/analytics/SchedulingStatusPanel';
import { StaffHistoryModal } from '../components/analytics/StaffHistoryModal';

type Tab = 'overview' | 'hours' | 'premium' | 'status';

interface OutletCtx {
  selectedLocationId: string | null;
}

type DateRange = '1w' | '2w' | '4w' | '8w';

const rangeLabels: Record<DateRange, string> = {
  '1w': '1 Week',
  '2w': '2 Weeks',
  '4w': '4 Weeks',
  '8w': '8 Weeks',
};

function getDateRange(range: DateRange): { startDate: string; endDate: string } {
  const now = DateTime.now();
  const end = now.plus({ days: 1 }).toISODate()!;
  const weeks = range === '1w' ? 1 : range === '2w' ? 2 : range === '4w' ? 4 : 8;
  const start = now.minus({ weeks }).toISODate()!;
  return { startDate: start, endDate: end };
}

export function AnalyticsPage() {
  const { selectedLocationId } = useOutletContext<OutletCtx>();
  const [tab, setTab] = useState<Tab>('overview');
  const [range, setRange] = useState<DateRange>('4w');
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { startDate, endDate } = getDateRange(range);

  const { data: report, isLoading: reportLoading, error: reportError, refetch: refetchReport } = useFairnessReport(
    selectedLocationId,
    startDate,
    endDate,
  );
  const { data: score, isLoading: scoreLoading, error: scoreError } = useFairnessScore(
    selectedLocationId,
    startDate,
    endDate,
  );

  const handleSelectUser = (userId: string) => {
    const entry = report?.find((d) => d.id === userId);
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
        <p className="text-text-secondary">Select a location to view analytics</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as Tab, label: 'Overview', icon: BarChart3 },
    { id: 'hours' as Tab, label: 'Hours', icon: Users },
    { id: 'premium' as Tab, label: 'Premium', icon: Star },
    { id: 'status' as Tab, label: 'Status', icon: Users },
  ];

  const isLoading = reportLoading || scoreLoading;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-primary" />
          <h1 className="text-xl font-display font-bold text-text">Fairness Analytics</h1>
        </div>

        {/* Date range selector */}
        <div className="flex gap-1 p-1 bg-surface-alt rounded-lg">
          {(Object.keys(rangeLabels) as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                         ${range === r
                           ? 'bg-surface text-text shadow-sm'
                           : 'text-text-secondary hover:text-text'
                         }`}
            >
              {rangeLabels[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-alt rounded-xl mb-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                       text-sm font-medium transition-colors duration-fast
                       ${tab === t.id
                         ? 'bg-surface text-text shadow-sm'
                         : 'text-text-secondary hover:text-text'
                       }`}
          >
            <t.icon size={14} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {!isLoading && (reportError || scoreError) && (
        <ErrorState message="Failed to load analytics data" onRetry={() => refetchReport()} />
      )}

      {/* Overview tab */}
      {!isLoading && !reportError && !scoreError && tab === 'overview' && (
        <div className="space-y-5">
          {score && <FairnessScoreCard score={score} />}

          {report && report.length > 0 && (
            <div className="bg-surface rounded-xl border border-border p-4">
              <h2 className="text-sm font-semibold text-text mb-3">Hours Distribution</h2>
              <HoursDistributionChart data={report} onSelectUser={handleSelectUser} />
            </div>
          )}
        </div>
      )}

      {/* Hours tab */}
      {!isLoading && tab === 'hours' && report && (
        <div className="bg-surface rounded-xl border border-border p-4">
          <h2 className="text-sm font-semibold text-text mb-1">Actual vs Target Hours</h2>
          <p className="text-xs text-text-secondary mb-3">
            Click a bar to view shift history
          </p>
          <HoursDistributionChart data={report} onSelectUser={handleSelectUser} />
        </div>
      )}

      {/* Premium tab */}
      {!isLoading && tab === 'premium' && score && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-surface rounded-xl border border-border">
              <p className="text-xs text-text-secondary">Total Premium Shifts</p>
              <p className="text-lg font-bold text-text">{score.totalPremiumShifts}</p>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-border">
              <p className="text-xs text-text-secondary">Distribution Spread</p>
              <p className={`text-lg font-bold ${
                score.premiumStdDev > 2 ? 'text-error' :
                score.premiumStdDev > 1 ? 'text-warning' : 'text-success'
              }`}>
                {score.premiumStdDev} std dev
              </p>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-4">
            <h2 className="text-sm font-semibold text-text mb-1">Premium Shift Distribution</h2>
            <p className="text-xs text-text-secondary mb-3">
              Fri/Sat evening shifts — equitable distribution matters
            </p>
            <PremiumShiftChart data={score} />
          </div>
        </div>
      )}

      {/* Status tab */}
      {!isLoading && tab === 'status' && report && (
        <div>
          <p className="text-xs text-text-secondary mb-3">
            Staff grouped by scheduling status relative to their desired hours
          </p>
          <SchedulingStatusPanel data={report} onSelectUser={handleSelectUser} />
        </div>
      )}

      {/* Staff History Modal */}
      {selectedUser && (
        <StaffHistoryModal
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          userId={selectedUser.id}
          staffName={selectedUser.name}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  );
}
