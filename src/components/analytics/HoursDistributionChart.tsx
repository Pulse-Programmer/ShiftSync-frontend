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
import type { FairnessEntry } from '../../hooks/api/useAnalytics';

interface HoursDistributionChartProps {
  data: FairnessEntry[];
  onSelectUser: (userId: string) => void;
}

const statusColors: Record<string, string> = {
  on_target: '#22c55e',
  over_scheduled: '#ef4444',
  under_scheduled: '#f59e0b',
  no_target: '#6b7280',
};

export function HoursDistributionChart({ data, onSelectUser }: HoursDistributionChartProps) {
  const chartData = data.map((entry) => ({
    id: entry.id,
    name: `${entry.first_name} ${entry.last_name[0]}.`,
    actual: entry.total_hours,
    target: entry.target_hours,
    status: entry.scheduling_status,
  }));

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-text-secondary">No data to chart</p>
      </div>
    );
  }

  // Average target for the reference line
  const targets = chartData.filter((d) => d.target != null).map((d) => d.target!);
  const avgTarget = targets.length > 0 ? targets.reduce((a, b) => a + b, 0) / targets.length : null;

  return (
    <div className="w-full h-[320px] sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          onClick={(state) => {
            const payload = (state as { activePayload?: { payload: { id: string } }[] })?.activePayload;
            if (payload?.[0]) {
              onSelectUser(payload[0].payload.id);
            }
          }}
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
            label={{
              value: 'Hours',
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
            formatter={(value, name) => [
              `${Number(value).toFixed(1)}h`,
              name === 'actual' ? 'Actual Hours' : 'Target Hours',
            ]}
            cursor={{ fill: 'var(--color-surface-hover)', opacity: 0.5 }}
          />
          {avgTarget && (
            <ReferenceLine
              y={avgTarget}
              stroke="#6b7280"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: `Avg target ${avgTarget.toFixed(0)}h`,
                position: 'right',
                style: { fontSize: 10, fill: '#6b7280' },
              }}
            />
          )}
          <Bar dataKey="actual" radius={[4, 4, 0, 0]} cursor="pointer">
            {chartData.map((entry, index) => (
              <Cell key={index} fill={statusColors[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
