import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UsageChartProps {
  data: { dataSourceId: number; dataSourceName: string; queryCount: number }[];
}

export default function UsageChart({ data }: UsageChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-secondary bg-surface-secondary rounded-lg border border-dashed border-border">
        No usage data available yet.
      </div>
    );
  }

  return (
    <div className="h-80 w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--color-border)" />
          <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
          <YAxis dataKey="dataSourceName" type="category" tick={{ fontSize: 12, fill: 'var(--color-text-primary)' }} width={120} />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
            contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)' }} 
          />
          <Bar dataKey="queryCount" name="Queries" fill="var(--color-primary-brand)" radius={[0, 4, 4, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
