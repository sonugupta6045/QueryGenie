import { useState } from 'react';
import { useQueryHistory } from '../../hooks/useQueryHistory';
import { useDataSources } from '../../hooks/useDataSources';
import { Clock, Search, Filter, Database, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import PageSpinner from '../../components/common/PageSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import ExportCsvButton from '../../components/history/ExportCsvButton';
import { QueryLogResponse } from '../../types/queryLog';

function HistoryItem({ log }: { log: QueryLogResponse }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'CLARIFICATION_NEEDED': return 'bg-amber-100 text-amber-800';
      case 'REJECTED': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div 
        className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(log.executionStatus)}`}>
              {log.executionStatus.replace('_', ' ')}
            </span>
            <span className="text-xs text-text-secondary flex items-center">
              <Calendar size={12} className="mr-1" />
              {formatDate(log.createdAt)}
            </span>
          </div>
          <h3 className="text-base font-semibold text-text-primary truncate" title={log.questionText}>
            "{log.questionText}"
          </h3>
          <div className="mt-1.5 text-xs text-text-secondary flex items-center space-x-4">
            <span className="flex items-center text-primary-main font-semibold bg-primary-subtle px-2.5 py-0.5 rounded-full">
              <Database size={12} className="mr-1" /> 
              {log.dataSourceName || (log.dataSourceId ? `DS ID: ${log.dataSourceId}` : 'Unknown DB')}
            </span>
            {log.executionTimeMs && (
              <span className="flex items-center font-medium">
                <Clock size={12} className="mr-1" />
                {log.executionTimeMs}ms
              </span>
            )}
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="bg-surface-secondary p-4 border-t border-border">
          <div className="space-y-4">
            {log.generatedSql && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Generated SQL</h4>
                  {log.executionStatus === 'SUCCESS' && <ExportCsvButton logId={log.id} />}
                </div>
                <pre className="bg-slate-950 text-slate-100 p-3 rounded-xl overflow-x-auto text-sm font-mono shadow-inner border border-slate-800">
                  <code>{log.generatedSql}</code>
                </pre>
              </div>
            )}
            
            {log.errorMessage && (
              <div>
                <h4 className="text-xs font-semibold text-danger uppercase tracking-wider mb-2">Error / Rejection Reason</h4>
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-danger p-3 rounded-xl text-sm">
                  {log.errorMessage}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function QueryHistoryPage() {
  const [page, setPage] = useState(0);
  const [dataSourceId, setDataSourceId] = useState<number | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [search, setSearch] = useState(''); // Local state for search input
  const [appliedSearch, setAppliedSearch] = useState(''); // Sent to API

  const { data, isLoading, error } = useQueryHistory(
    page,
    20,
    dataSourceId,
    status,
    appliedSearch || undefined
  );

  const { data: dataSources } = useDataSources(0, 100);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search);
    setPage(0);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Query History</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Review past questions, generated SQL, and execution times.
          </p>
        </div>
      </div>

      <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary h-4 w-4" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border bg-surface rounded-lg text-sm font-medium text-text-primary focus:ring-1 focus:ring-primary-main focus:border-primary-main shadow-sm transition-colors"
          />
        </form>
        
        <div className="flex items-center gap-2">
          <Filter className="text-text-secondary h-4 w-4" />
          <select
            value={dataSourceId || ''}
            onChange={(e) => {
              setDataSourceId(e.target.value ? Number(e.target.value) : undefined);
              setPage(0);
            }}
            className="border border-border bg-surface rounded-lg text-sm font-medium text-text-primary py-2 pl-3 pr-8 focus:ring-1 focus:ring-primary-main focus:border-primary-main shadow-sm transition-colors"
          >
            <option value="">All Data Sources</option>
            {dataSources?.content.map(ds => (
              <option key={ds.id} value={ds.id}>{ds.name}</option>
            ))}
          </select>

          <select
            value={status || ''}
            onChange={(e) => {
              setStatus(e.target.value || undefined);
              setPage(0);
            }}
            className="border border-border bg-surface rounded-lg text-sm font-medium text-text-primary py-2 pl-3 pr-8 focus:ring-1 focus:ring-primary-main focus:border-primary-main shadow-sm transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="CLARIFICATION_NEEDED">Clarification Needed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {error && <ErrorBanner error={(error as any)?.response?.data?.error} />}

      {isLoading ? (
        <PageSpinner />
      ) : data?.content.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No history found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {appliedSearch || dataSourceId || status 
              ? "Try adjusting your filters." 
              : "Ask your first question in the Chat to see it here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.content.map((log) => (
            <HistoryItem key={log.id} log={log} />
          ))}

          {/* Pagination Controls */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg sm:px-6 mt-6">
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{data.number + 1}</span> of{' '}
                    <span className="font-medium">{data.totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={data.number === 0}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      &larr;
                    </button>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={data.number >= data.totalPages - 1}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      &rarr;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}