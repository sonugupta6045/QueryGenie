import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ChartConfig, ColumnMeta } from '../../types/query';
import ResultTable from './ResultTable';

interface ChartRendererProps {
  chart?: ChartConfig;
  columns?: ColumnMeta[];
  rows?: any[][];
}

const COLORS = ['#3f51b5', '#f50057', '#009688', '#ff9800', '#9c27b0', '#03a9f4'];

export default function ChartRenderer({ chart, columns, rows }: ChartRendererProps) {
  // If no chart config or fallback to table, just render the table
  if (!chart || chart.type === 'table') {
    return <ResultTable columns={columns} rows={rows} />;
  }

  // Transform array-of-arrays into array-of-objects for Recharts
  const data = useMemo(() => {
    if (!columns || !rows) return [];
    return rows.map(row => {
      const obj: any = {};
      columns.forEach((col, idx) => {
        obj[col.name] = row[idx];
      });
      return obj;
    });
  }, [columns, rows]);

  if (data.length === 0) return <ResultTable columns={columns} rows={rows} />;

  // Find actual keys if backend didn't specify
  const xKey = chart.xKey || columns?.[0]?.name || '';
  const yKey = chart.yKey || columns?.[1]?.name || '';

  const renderChart = () => {
    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={xKey} angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey={yKey} fill={COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={xKey} angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey={yKey} stroke={COLORS[0]} strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend />
              <Pie
                data={data}
                nameKey={xKey}
                dataKey={yKey}
                cx="50%"
                cy="50%"
                outerRadius={130}
                innerRadius={60}
                paddingAngle={2}
                label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return <ResultTable columns={columns} rows={rows} />;
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mt-4">
      {renderChart()}
    </div>
  );
}
