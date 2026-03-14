import { TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import type { OvertimeProjection } from '../../hooks/api/useOvertime';

interface ProjectionsViewProps {
  data: OvertimeProjection[];
  isLoading: boolean;
}

export function ProjectionsView({ data, isLoading }: ProjectionsViewProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp size={32} className="text-text-secondary/30 mx-auto mb-3" />
        <p className="text-sm text-text-secondary">No projection data available</p>
        <p className="text-xs text-text-secondary/70 mt-1">
          Assign staff to shifts to see overtime projections
        </p>
      </div>
    );
  }

  const totalProjectedOT = data.reduce((sum, d) => sum + d.overtime_hours, 0);
  const totalCost = data.reduce((sum, d) => sum + d.projected_overtime_cost, 0);
  const atRisk = data.filter((d) => d.overtime_hours > 0);

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <div className="p-3 bg-surface rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={12} className="text-warning" />
            <span className="text-xs text-text-secondary">At-Risk Staff</span>
          </div>
          <p className="text-lg font-bold text-text">{atRisk.length}</p>
        </div>
        <div className="p-3 bg-surface rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={12} className="text-error" />
            <span className="text-xs text-text-secondary">Projected OT</span>
          </div>
          <p className="text-lg font-bold text-error">{totalProjectedOT.toFixed(1)}h</p>
        </div>
        <div className="p-3 bg-surface rounded-xl border border-border col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={12} className="text-primary" />
            <span className="text-xs text-text-secondary">Est. OT Cost</span>
          </div>
          <p className="text-lg font-bold text-text">${totalCost.toFixed(2)}</p>
        </div>
      </div>

      {/* Projections list */}
      <div className="space-y-2">
        {data.map((proj) => {
          const hasOvertime = proj.overtime_hours > 0;
          const hasDraft = proj.draft_hours > 0;

          return (
            <div
              key={proj.id}
              className={`p-3 rounded-xl border ${
                hasOvertime ? 'border-error/20 bg-error/5' : 'border-border bg-surface'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-text">
                    {proj.first_name} {proj.last_name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-text-secondary">
                      Published: <span className="font-medium">{proj.published_hours.toFixed(1)}h</span>
                    </span>
                    {hasDraft && (
                      <span className="text-xs text-warning">
                        Draft: <span className="font-medium">+{proj.draft_hours.toFixed(1)}h</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${hasOvertime ? 'text-error' : 'text-text'}`}>
                    {proj.total_hours.toFixed(1)}h
                  </p>
                  {hasOvertime && (
                    <p className="text-xs text-error font-medium">
                      +{proj.overtime_hours.toFixed(1)}h OT
                    </p>
                  )}
                </div>
              </div>

              {/* Stacked bar */}
              <div className="mt-2 h-2 bg-surface-alt rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-success"
                  style={{ width: `${Math.min((proj.published_hours / 50) * 100, 100)}%` }}
                />
                {hasDraft && (
                  <div
                    className="h-full bg-warning"
                    style={{ width: `${Math.min((proj.draft_hours / 50) * 100, 100)}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
