import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useRefreshSchema } from '../../hooks/useDataSources';

interface SchemaRefreshButtonProps {
  dataSourceId: number;
}

export default function SchemaRefreshButton({ dataSourceId }: SchemaRefreshButtonProps) {
  const { mutate: refreshSchema, isPending } = useRefreshSchema();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleRefresh = () => {
    setStatus('idle');
    refreshSchema(dataSourceId, {
      onSuccess: (data: any) => {
        setStatus('success');
        setMessage(`Found ${data.tablesFound} tables and ${data.columnsFound} columns.`);
        setTimeout(() => setStatus('idle'), 5000);
      },
      onError: (err: any) => {
        setStatus('error');
        setMessage(err.response?.data?.error?.message || 'Failed to refresh schema');
        setTimeout(() => setStatus('idle'), 5000);
      }
    });
  };

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={handleRefresh}
        disabled={isPending}
        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-main disabled:opacity-50"
      >
        <RefreshCw size={16} className={`mr-2 ${isPending ? 'animate-spin' : ''}`} />
        {isPending ? 'Refreshing...' : 'Refresh Schema'}
      </button>

      {status === 'success' && (
        <span className="inline-flex items-center text-sm text-green-600">
          <CheckCircle size={16} className="mr-1" />
          {message}
        </span>
      )}

      {status === 'error' && (
        <span className="inline-flex items-center text-sm text-red-600">
          <AlertCircle size={16} className="mr-1" />
          {message}
        </span>
      )}
    </div>
  );
}
