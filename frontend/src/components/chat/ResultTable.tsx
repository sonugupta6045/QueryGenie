import { ColumnMeta } from '../../types/query';
import { formatNumber, formatDate } from '../../utils/formatters';

interface ResultTableProps {
  columns?: ColumnMeta[];
  rows?: any[][];
}

export default function ResultTable({ columns, rows }: ResultTableProps) {
  if (!columns || !rows || columns.length === 0 || rows.length === 0) {
    return <div className="p-4 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">No data available to display.</div>;
  }

  // Simple formatter based on very basic type heuristics
  const formatCell = (val: any, type: string) => {
    if (val === null || val === undefined) return <span className="text-gray-400 italic">null</span>;
    
    const lowerType = type.toLowerCase();
    if (lowerType.includes('int') || lowerType.includes('numeric') || lowerType.includes('decimal') || lowerType.includes('float') || typeof val === 'number') {
      return formatNumber(Number(val));
    }
    
    if (lowerType.includes('date') || lowerType.includes('time') || (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val))) {
      return formatDate(val);
    }
    
    if (typeof val === 'boolean') {
      return val ? 'True' : 'False';
    }

    return String(val);
  };

  return (
    <div className="overflow-x-auto border border-border rounded-lg mt-4 bg-surface shadow-sm">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-secondary">
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider whitespace-nowrap"
              >
                {col.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-surface divide-y divide-border">
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-surface-secondary/60 transition-colors">
              {row.map((cell, cellIdx) => (
                <td 
                  key={cellIdx} 
                  className="px-6 py-4 text-sm text-text-primary whitespace-nowrap"
                >
                  {formatCell(cell, columns[cellIdx].type)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="bg-surface-secondary px-6 py-3 border-t border-border text-xs text-text-secondary flex justify-between">
        <span>Showing {rows.length} rows</span>
        {/* Pagination could go here */}
      </div>
    </div>
  );
}
