import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppStore } from '../../store/appStore';
import { Card } from '../ui/Card';

/** 体重趋势曲线（孕期/通用） */
export function WeightChart() {
  const records = useAppStore((s) => s.healthRecords);
  const data = records
    .filter((r) => r.type === 'weight' && typeof r.payload.value === 'number')
    .slice(0, 12)
    .reverse()
    .map((r) => ({
      date: new Date(r.recordedAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
      value: r.payload.value as number,
    }));

  if (data.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-[var(--color-ink-faint)]">
        还没有体重记录，点上方按钮开始记录吧
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <p className="mb-3 text-[13px] font-500 text-[var(--color-ink-soft)]">体重趋势 (kg)</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#a89a8a' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#a89a8a' }}
            axisLine={false}
            tickLine={false}
            domain={['dataMin - 1', 'dataMax + 1']}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e2d8c8',
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#c77b5a"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#c77b5a' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
