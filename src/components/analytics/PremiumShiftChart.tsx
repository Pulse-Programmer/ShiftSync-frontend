import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { FairnessScore } from '../../hooks/api/useAnalytics';

interface PremiumShiftChartProps {
  data: FairnessScore;
}

export function PremiumShiftChart({ data }: PremiumShiftChartProps) {
  const chartData = data.staffBreakdown.map((s) => ({
    name: s.name.split(' ').map((n, i) => (i === 0 ? n : `${n[0]}.`)).join(' '),
    count: s.premiumShifts,
    deviation: s.premiumDeviation,
  }));

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-text-secondary">No premium shift data</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[320px] sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            label={{
              value: 'Premium Shifts',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 11, fill: 'var(--color-text-secondary)' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '0.5rem',
              fontSize: '12px',
              color: 'var(--color-text)',
            }}
            formatter={(value) => [`${Number(value)}`, 'Premium Shifts']}
            cursor={{ fill: 'var(--color-surface-hover)', opacity: 0.5 }}
          />
          <ReferenceLine
            y={data.avgPremiumPerStaff}
            stroke="#6b7280"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: `Avg ${data.avgPremiumPerStaff}`,
              position: 'right',
              style: { fontSize: 10, fill: '#6b7280' },
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  Math.abs(entry.deviation) > 2 ? '#ef4444' :
                  Math.abs(entry.deviation) > 1 ? '#f59e0b' : '#22c55e'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
