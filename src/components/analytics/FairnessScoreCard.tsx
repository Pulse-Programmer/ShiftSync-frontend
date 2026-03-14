import { Award } from 'lucide-react';
import type { FairnessScore } from '../../hooks/api/useAnalytics';

interface FairnessScoreCardProps {
  score: FairnessScore;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-error';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

export function FairnessScoreCard({ score }: FairnessScoreCardProps) {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score.score / 100) * circumference;

  return (
    <div className="p-5 bg-surface rounded-xl border border-border">
      <div className="flex items-start gap-5">
        {/* Score ring */}
        <div className="relative shrink-0">
          <svg width="100" height="100" className="-rotate-90">
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="var(--color-surface-alt)"
              strokeWidth="8"
            />
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke={score.score >= 80 ? '#22c55e' : score.score >= 60 ? '#f59e0b' : '#ef4444'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${getScoreColor(score.score)}`}>
              {score.score}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className={getScoreColor(score.score)} />
            <h3 className="text-sm font-semibold text-text">
              Fairness Score: {getScoreLabel(score.score)}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-surface-alt rounded-lg">
              <p className="text-xs text-text-secondary">Staff</p>
              <p className="text-sm font-semibold text-text">{score.totalStaff}</p>
            </div>
            <div className="p-2 bg-surface-alt rounded-lg">
              <p className="text-xs text-text-secondary">Premium Shifts</p>
              <p className="text-sm font-semibold text-text">{score.totalPremiumShifts}</p>
            </div>
            <div className="p-2 bg-surface-alt rounded-lg">
              <p className="text-xs text-text-secondary">Avg Premium/Staff</p>
              <p className="text-sm font-semibold text-text">{score.avgPremiumPerStaff}</p>
            </div>
            <div className="p-2 bg-surface-alt rounded-lg">
              <p className="text-xs text-text-secondary">Avg Hours Deviation</p>
              <p className={`text-sm font-semibold ${
                score.avgHoursDeviation > 5 ? 'text-warning' : 'text-text'
              }`}>
                {score.avgHoursDeviation}h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
