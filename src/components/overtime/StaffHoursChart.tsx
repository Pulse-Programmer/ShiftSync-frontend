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
import type { WeeklyOvertimeEntry } from '../../hooks/api/useOvertime';

interface StaffHoursChartProps {
  data: WeeklyOvertimeEntry[];
  onSelectUser: (userId: string) => void;
}

const barColors: Record<string, string> = {
  normal: '#22c55e',   // green
  warning: '#f59e0b',  // amber
  overtime: '#ef4444', // red
};

export function StaffHoursChart({ data, onSelectUser }: StaffHoursChartProps) {
  const chartData = data.map((entry) => ({
    id: entry.id,
    name: `${entry.first_name} ${entry.last_name[0]}.`,
    hours: entry.total_hours,
    status: entry.status,
  }));

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-text-secondary">No data to chart</p>
      </div>
    );
  }

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
            formatter={(value) => [`${Number(value).toFixed(1)}h`, 'Weekly Hours']}
            cursor={{ fill: 'var(--color-surface-hover)', opacity: 0.5 }}
          />
          <ReferenceLine
            y={40}
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: '40h limit',
              position: 'right',
              style: { fontSize: 10, fill: '#ef4444' },
            }}
          />
          <ReferenceLine
            y={35}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: '35h warning',
              position: 'right',
              style: { fontSize: 10, fill: '#f59e0b' },
            }}
          />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]} cursor="pointer">
            {chartData.map((entry, index) => (
              <Cell key={index} fill={barColors[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
