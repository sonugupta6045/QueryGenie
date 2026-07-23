import { useUsageAnalytics } from '../../hooks/useUsageAnalytics';
import PageSpinner from '../../components/common/PageSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import UsageChart from '../../components/admin/UsageChart';
import TopQuestionsTable from '../../components/admin/TopQuestionsTable';

export default function UsageAnalyticsPage() {
  const { data, isLoading, error } = useUsageAnalytics();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usage Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor system usage and query volume.
          </p>
        </div>
      </div>

      {error && <ErrorBanner error={(error as any)?.response?.data?.error} />}

      {isLoading ? (
        <PageSpinner />
      ) : data ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Queries</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{data.totalQueries}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">{(data.successRate ?? 100).toFixed(1)}%</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
              <div className="p-5">
                <dt className="text-sm font-medium text-gray-500 truncate">Avg Latency</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{(data.avgLatencyMs ?? 0).toFixed(0)} ms</dd>
              </div>
            </div>
          </div>
          
          {/* Charts & Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Queries by Data Source</h3>
              <UsageChart data={data.byDataSource} />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Most Asked Questions</h3>
              <TopQuestionsTable />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}